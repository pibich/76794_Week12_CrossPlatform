import React, { useState, useEffect } from 'react';
import { View, Text, Button, Alert, Image, ActivityIndicator } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import * as Location from 'expo-location';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from './firebaseConfig';
import * as Notifications from 'expo-notifications';
import Constants from 'expo-constants';
import * as Device from 'expo-device';

// Configure notification handler with updated properties
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,
    shouldPlaySound: false,
    shouldSetBadge: false,
    shouldShowList: true
  }),
});

export default function PhotoUploader() {
  const [image, setImage] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [location, setLocation] = useState(null);
  const [expoPushToken, setExpoPushToken] = useState('');

  // Register for push notifications
  useEffect(() => {
    registerForPushNotificationsAsync()
      .then(token => setExpoPushToken(token ?? ''))
      .catch(error => console.error(error));
  }, []);

  async function registerForPushNotificationsAsync() {
    if (Device.isDevice) {
      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;
      if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }
      if (finalStatus !== 'granted') {
        alert('Failed to get push token for push notification!');
        return;
      }
      const projectId = Constants?.expoConfig?.extra?.eas?.projectId ?? Constants?.easConfig?.projectId;
      if (!projectId) {
        alert('Project ID not found');
      }
      try {
        const pushTokenString = (await Notifications.getExpoPushTokenAsync({ projectId })).data;
        return pushTokenString;
      } catch (e) {
        alert(`${e}`);
      }
    } else {
      alert('Must use physical device for push notifications');
    }
  }

  async function sendPushNotification(title, body, data = {}) {
    if (!expoPushToken) return;

    const message = {
      to: expoPushToken,
      sound: 'default',
      title,
      body,
      data,
    };

    await fetch('https://exp.host/--/api/v2/push/send', {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Accept-encoding': 'gzip, deflate',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(message),
    });
  }

  const takePicture = async () => {
    try {
      const { status: cameraStatus } = await ImagePicker.requestCameraPermissionsAsync();
      const { status: locationStatus } = await Location.requestForegroundPermissionsAsync();
      
      if (cameraStatus !== 'granted' || locationStatus !== 'granted') {
        Alert.alert('Permissions required', 'We need both camera and location permissions');
        return null;
      }

      const locationData = await Location.getCurrentPositionAsync({});
      setLocation(locationData);

      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images, // Updated mediaTypes
        quality: 0.5, // Reduced quality to reduce file size
        base64: false, // Don't use base64 to avoid Firestore size limits
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const { uri } = result.assets[0];
        setImage(uri);
        return { uri, location: locationData };
      }
      return null;
    } catch (error) {
      console.error('Error taking picture:', error);
      Alert.alert('Error', 'Failed to take picture');
      return null;
    }
  };

  const uploadPhoto = async () => {
    try {
      setUploading(true);
      const pictureData = await takePicture();
      if (!pictureData) return;

      const { uri, location } = pictureData;
      const { latitude, longitude } = location.coords;

      // Instead of storing the image, we'll just store the URI and location
      await addDoc(collection(db, 'photos'), {
        image_uri: uri, // Store URI instead of base64
        latitude,
        longitude,
        timestamp: serverTimestamp(),
      });

      // Success notification
      await sendPushNotification(
        'Photo Upload Success',
        `Photo saved with location: ${latitude.toFixed(4)}, ${longitude.toFixed(4)}`,
        { latitude, longitude }
      );
      
      Alert.alert('Success', 'Photo metadata saved to Firestore successfully!');
      setImage(null);
    } catch (error) {
      console.error('Upload error:', error);
      
      // Error notification
      await sendPushNotification(
        'Photo Upload Failed',
        `Failed to save photo. Error: ${error.message}`,
        { error: error.message }
      );
      
      Alert.alert('Error', error.message || 'Upload failed');
    } finally {
      setUploading(false);
    }
  };

  return (
    <View style={{ flex: 1, justifyContent: 'center', padding: 20 }}>
      <Button
        title="Take and Save Photo"
        onPress={uploadPhoto}
        disabled={uploading}
      />
      
      {uploading && <ActivityIndicator size="large" style={{ marginTop: 20 }} />}
      
      {image && (
        <Image 
          source={{ uri: image }} 
          style={{ width: 200, height: 200, alignSelf: 'center', marginTop: 20 }}
        />
      )}
      
      {location && (
        <Text style={{ marginTop: 20, textAlign: 'center' }}>
          Location: {location.coords.latitude.toFixed(4)}, {location.coords.longitude.toFixed(4)}
        </Text>
      )}
    </View>
  );
}