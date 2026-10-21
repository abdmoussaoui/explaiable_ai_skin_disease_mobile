import React, { useEffect, useRef, useState } from "react";
import {
  Alert,
  Animated,
  Image,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { CameraView, useCameraPermissions } from "expo-camera";
import type { CameraCapturedPicture } from "expo-camera";
import * as ImagePicker from "expo-image-picker";
import { ImageManipulator, SaveFormat } from "expo-image-manipulator";
import { router, Stack } from "expo-router";

import { AppButton } from "../components/AppButton";
import { InfoCard } from "../components/InfoCard";
import { COLORS } from "../constants/dermalens";
import { runApiInference } from "../services/apiInference";
import { setLatestPrediction } from "../services/predictionStore";

const MODEL_IMAGE_SIZE = 224;

type ImageDimensions = {
  width?: number | null;
  height?: number | null;
};

function getErrorMessage(error: unknown) {
  if (error instanceof Error && error.message) {
    return error.message;
  }

  if (typeof error === "string") {
    return error;
  }

  try {
    return JSON.stringify(error);
  } catch {
    return "Unknown error";
  }
}

function getCameraPhotoUri(photo: CameraCapturedPicture) {
  if (Platform.OS === "web") {
    const imageData = photo.base64 || photo.uri;

    if (imageData.startsWith("data:") || imageData.startsWith("blob:")) {
      return imageData;
    }

    return `data:image/${photo.format === "png" ? "png" : "jpeg"};base64,${imageData}`;
  }

  return photo.uri;
}

function resolveImageSize(uri: string, dimensions?: ImageDimensions) {
  if (dimensions?.width && dimensions.height) {
    return Promise.resolve({
      width: dimensions.width,
      height: dimensions.height,
    });
  }

  return new Promise<{ width: number; height: number }>((resolve, reject) => {
    Image.getSize(
      uri,
      (width, height) => resolve({ width, height }),
      (error) => reject(error)
    );
  });
}

async function normalizeWebImageForModel(
  uri: string,
  dimensions?: ImageDimensions
) {
  const browserImage = await new Promise<HTMLImageElement>((resolve, reject) => {
    const img = new globalThis.Image();

    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error("Could not load captured image."));
    img.src = uri;
  });

  const width = dimensions?.width || browserImage.naturalWidth;
  const height = dimensions?.height || browserImage.naturalHeight;

  if (!width || !height) {
    throw new Error("Captured image has no readable size.");
  }

  const square = Math.min(width, height);
  const originX = Math.max(0, Math.round((width - square) / 2));
  const originY = Math.max(0, Math.round((height - square) / 2));
  const canvas = document.createElement("canvas");
  const context = canvas.getContext("2d");

  if (!context) {
    throw new Error("Could not prepare image canvas.");
  }

  canvas.width = MODEL_IMAGE_SIZE;
  canvas.height = MODEL_IMAGE_SIZE;
  context.drawImage(
    browserImage,
    originX,
    originY,
    square,
    square,
    0,
    0,
    MODEL_IMAGE_SIZE,
    MODEL_IMAGE_SIZE
  );

  return canvas.toDataURL("image/jpeg", 0.92);
}

async function normalizeImageForModel(
  uri: string,
  dimensions?: ImageDimensions
) {
  if (Platform.OS === "web") {
    return normalizeWebImageForModel(uri, dimensions);
  }

  const { width, height } = await resolveImageSize(uri, dimensions);
  const square = Math.min(width, height);
  const originX = Math.max(0, Math.round((width - square) / 2));
  const originY = Math.max(0, Math.round((height - square) / 2));

  const context = ImageManipulator.manipulate(uri)
    .crop({
      originX,
      originY,
      width: square,
      height: square,
    })
    .resize({
      width: MODEL_IMAGE_SIZE,
      height: MODEL_IMAGE_SIZE,
    });

  const imageRef = await context.renderAsync();
  const result = await imageRef.saveAsync({
    compress: 0.92,
    format: SaveFormat.JPEG,
  });

  return result.uri;
}

export default function ImageInputScreen() {
  const cameraRef = useRef<CameraView | null>(null);
  const [cameraPermission, requestCameraPermission] = useCameraPermissions();
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [showCamera, setShowCamera] = useState(false);
  const [cameraReady, setCameraReady] = useState(false);
  const [capturing, setCapturing] = useState(false);
  const [pulse] = useState(() => new Animated.Value(0));

  useEffect(() => {
    if (!loading) {
      pulse.stopAnimation();
      pulse.setValue(0);
      return;
    }

    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, {
          toValue: 1,
          duration: 760,
          useNativeDriver: true,
        }),
        Animated.timing(pulse, {
          toValue: 0,
          duration: 760,
          useNativeDriver: true,
        }),
      ])
    );

    animation.start();
    return () => animation.stop();
  }, [loading, pulse]);

  async function openCamera() {
    try {
      if (Platform.OS === "web") {
        const isAvailable = await CameraView.isAvailableAsync();

        if (!isAvailable) {
          Alert.alert("Camera unavailable", "No camera was found on this device.");
          return;
        }
      }

      const permission = cameraPermission?.granted
        ? cameraPermission
        : await requestCameraPermission();

      if (!permission?.granted) {
        Alert.alert(
          "Camera permission needed",
          "Allow camera access to capture a focused skin image."
        );
        return;
      }

      setCameraReady(false);
      setShowCamera(true);
    } catch (error) {
      const message = getErrorMessage(error);

      console.error("Camera open failed:", message, error);
      Alert.alert("Camera unavailable", message || "Please try the gallery option instead.");
    }
  }

  async function capturePhoto() {
    if (!cameraRef.current || !cameraReady || capturing) return;

    try {
      setCapturing(true);
      const photo = await cameraRef.current.takePictureAsync(
        Platform.OS === "web"
          ? {
              quality: 0.95,
              base64: true,
              imageType: "jpg",
            }
          : {
              quality: 0.95,
            }
      );

      const sourceUri = getCameraPhotoUri(photo);
      const normalizedUri = await normalizeImageForModel(sourceUri, {
        width: photo.width,
        height: photo.height,
      });

      setImageUri(normalizedUri);
      setShowCamera(false);
    } catch (error) {
      const message = getErrorMessage(error);

      console.error("Photo capture failed:", message, error);
      Alert.alert("Photo not captured", message || "Please steady the camera and try again.");
    } finally {
      setCapturing(false);
    }
  }

  async function chooseFromGallery() {
    const permissionResult =
      await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (!permissionResult.granted) {
      Alert.alert(
        "Photo permission needed",
        "Allow photo access to choose a skin image."
      );
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.95,
    });

    if (!result.canceled) {
      try {
        const asset = result.assets[0];
        const normalizedUri = await normalizeImageForModel(asset.uri, {
          width: asset.width,
          height: asset.height,
        });

        setImageUri(normalizedUri);
      } catch (error) {
        const message = getErrorMessage(error);

        console.error("Gallery image normalization failed:", message, error);
        Alert.alert("Image not ready", message || "Please choose another image.");
      }
    }
  }

  async function analyzeImage() {
    if (!imageUri) {
      Alert.alert("Image needed", "Please take or choose a skin image first.");
      return;
    }

    try {
      setLoading(true);
      const prediction = await runApiInference(imageUri);

      setLatestPrediction({
        imageUri,
        prediction,
      });

      router.push("/result" as any);
    } catch (error) {
      const message = getErrorMessage(error);

      console.error("Image analysis failed:", message, error);
      Alert.alert(
        "Unable to analyze image",
        message || "Please check your internet connection or try again."
      );
    } finally {
      setLoading(false);
    }
  }

  function goBack() {
    if (router.canGoBack()) {
      router.back();
      return;
    }

    router.replace("/" as any);
  }

  const pulseScale = pulse.interpolate({
    inputRange: [0, 1],
    outputRange: [1, 1.035],
  });

  if (showCamera) {
    return (
      <View style={styles.cameraPage}>
        <Stack.Screen options={{ headerShown: false }} />

        <View style={styles.cameraTopBar}>
          <TouchableOpacity
            activeOpacity={0.75}
            onPress={() => setShowCamera(false)}
            style={styles.cameraTextButton}
          >
            <Text style={styles.cameraTextButtonLabel}>Close</Text>
          </TouchableOpacity>
          <Text style={styles.cameraTitle}>Align skin area</Text>
          <View style={styles.cameraTextButton} />
        </View>

        <View style={styles.cameraFrame}>
          <CameraView
            ref={cameraRef}
            style={StyleSheet.absoluteFill}
            facing="back"
            mode="picture"
            ratio="1:1"
            active={showCamera}
            onCameraReady={() => setCameraReady(true)}
            onMountError={(event) => {
              console.error(event.message);
              Alert.alert("Camera unavailable", event.message);
              setShowCamera(false);
            }}
          />
          <View pointerEvents="none" style={styles.focusFrame}>
            <View style={[styles.corner, styles.topLeftCorner]} />
            <View style={[styles.corner, styles.topRightCorner]} />
            <View style={[styles.corner, styles.bottomLeftCorner]} />
            <View style={[styles.corner, styles.bottomRightCorner]} />
          </View>
        </View>

        <Text style={styles.cameraHint}>Square capture for 224 x 224 input</Text>

        <TouchableOpacity
          activeOpacity={0.84}
          onPress={capturePhoto}
          disabled={!cameraReady || capturing}
          style={[
            styles.shutterOuter,
            (!cameraReady || capturing) && styles.shutterDisabled,
          ]}
        >
          <View style={styles.shutterInner} />
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <TouchableOpacity
        activeOpacity={0.75}
        onPress={goBack}
        style={styles.backButton}
      >
        <Text style={styles.backIcon}>{"<"}</Text>
        <Text style={styles.backText}>Back</Text>
      </TouchableOpacity>

      <Text style={styles.title}>Start scan</Text>
      <Text style={styles.helper}>
        Capture or choose a clear, centered skin image.
      </Text>

      <View style={styles.actionRow}>
        <AppButton
          title="Open camera"
          variant="secondary"
          onPress={openCamera}
          disabled={loading}
          style={styles.actionButton}
        />
        <AppButton
          title="Gallery"
          variant="secondary"
          onPress={chooseFromGallery}
          disabled={loading}
          style={styles.actionButton}
        />
      </View>

      <InfoCard style={styles.previewCard}>
        {imageUri ? (
          <Image source={{ uri: imageUri }} style={styles.preview} />
        ) : (
          <View style={styles.emptyPreview}>
            <Text style={styles.emptyPreviewText}>224 x 224 preview</Text>
          </View>
        )}
      </InfoCard>

      {loading && (
        <Animated.View
          style={[
            styles.loadingCard,
            {
              transform: [{ scale: pulseScale }],
            },
          ]}
        >
          <Text style={styles.loadingText}>Analyzing...</Text>
        </Animated.View>
      )}

      <AppButton
        title="Analyze"
        onPress={analyzeImage}
        disabled={!imageUri || loading}
        loading={loading}
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.page,
  },
  content: {
    padding: 20,
    paddingTop: 18,
    gap: 16,
  },
  backButton: {
    alignSelf: "flex-start",
    minHeight: 40,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    borderRadius: 999,
    paddingHorizontal: 12,
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: "#D7E5EF",
  },
  backIcon: {
    color: COLORS.medicalBlue,
    fontSize: 22,
    lineHeight: 24,
    fontWeight: "900",
  },
  backText: {
    color: COLORS.medicalBlue,
    fontSize: 15,
    fontWeight: "900",
  },
  title: {
    color: COLORS.deepNavy,
    fontSize: 30,
    fontWeight: "900",
  },
  helper: {
    color: COLORS.muted,
    fontSize: 16,
    lineHeight: 23,
  },
  actionRow: {
    flexDirection: "row",
    gap: 12,
  },
  actionButton: {
    flex: 1,
  },
  previewCard: {
    padding: 10,
  },
  preview: {
    width: "100%",
    aspectRatio: 1,
    borderRadius: 8,
    resizeMode: "cover",
    backgroundColor: "#D5DFEA",
  },
  emptyPreview: {
    width: "100%",
    aspectRatio: 1,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: COLORS.softSky,
  },
  emptyPreviewText: {
    color: COLORS.muted,
    fontWeight: "800",
  },
  loadingCard: {
    borderRadius: 8,
    padding: 14,
    alignItems: "center",
    backgroundColor: COLORS.softMint,
    borderWidth: 1,
    borderColor: "#BFEFE0",
  },
  loadingText: {
    color: COLORS.deepNavy,
    fontWeight: "900",
  },
  cameraPage: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: COLORS.page,
    padding: 20,
    gap: 18,
  },
  cameraTopBar: {
    position: "absolute",
    top: 44,
    left: 20,
    right: 20,
    zIndex: 2,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  cameraTextButton: {
    width: 72,
    minHeight: 40,
    justifyContent: "center",
  },
  cameraTextButtonLabel: {
    color: COLORS.medicalBlue,
    fontSize: 16,
    fontWeight: "900",
  },
  cameraTitle: {
    color: COLORS.deepNavy,
    fontSize: 17,
    fontWeight: "900",
  },
  cameraFrame: {
    width: "100%",
    maxWidth: 430,
    aspectRatio: 1,
    overflow: "hidden",
    borderRadius: 8,
    backgroundColor: "#D5DFEA",
    borderWidth: 1,
    borderColor: "#CFE1EC",
  },
  focusFrame: {
    position: "absolute",
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.72)",
  },
  corner: {
    position: "absolute",
    width: 42,
    height: 42,
    borderColor: COLORS.cyan,
  },
  topLeftCorner: {
    top: 14,
    left: 14,
    borderTopWidth: 4,
    borderLeftWidth: 4,
  },
  topRightCorner: {
    top: 14,
    right: 14,
    borderTopWidth: 4,
    borderRightWidth: 4,
  },
  bottomLeftCorner: {
    bottom: 14,
    left: 14,
    borderBottomWidth: 4,
    borderLeftWidth: 4,
  },
  bottomRightCorner: {
    right: 14,
    bottom: 14,
    borderRightWidth: 4,
    borderBottomWidth: 4,
  },
  cameraHint: {
    color: COLORS.muted,
    fontSize: 14,
    fontWeight: "800",
  },
  shutterOuter: {
    width: 76,
    height: 76,
    borderRadius: 999,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 4,
    borderColor: COLORS.medicalBlue,
    backgroundColor: COLORS.white,
  },
  shutterInner: {
    width: 54,
    height: 54,
    borderRadius: 999,
    backgroundColor: COLORS.cyan,
  },
  shutterDisabled: {
    opacity: 0.55,
  },
});
