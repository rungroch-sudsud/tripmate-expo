import React, { useState } from 'react';
import {
  View,
  Text,
  Button,
  Image,
  ActivityIndicator,
  StyleSheet,
  Alert,
} from 'react-native';
import { launchImageLibrary } from 'react-native-image-picker';
import RNBlobUtil from 'react-native-blob-util';

const uploadUrl = 'http://143.198.83.179:8080/users/profile/id-card/image/93c1cb0c-c8a2-4743-b686-e3055f1e8092';

type PickedFile = {
  uri: string;
  type: string;
  name: string;
  size?: number;
  base64Data?: string;
  isBase64?: boolean;
};

const IDCardUpload: React.FC = () => {
  const [pickedFile, setPickedFile] = useState<PickedFile | null>(null);
  const [uploading, setUploading] = useState(false);
  const [responseMessage, setResponseMessage] = useState<string | null>(null);

  // Function to handle base64 data URIs
  const convertBase64ToFile = (base64Uri: string, filename: string, mimeType: string) => {
    // Extract base64 data
    const base64Data = base64Uri.split(',')[1];
    return {
      uri: base64Uri, // Keep original for display
      base64Data: base64Data,
      type: mimeType,
      name: filename,
      isBase64: true,
    };
  };

  const pickImage = () => {
    // Compatible options for different versions of react-native-image-picker
    const options: any = {
      mediaType: 'photo',
      includeBase64: false,
      maxWidth: 1024,
      maxHeight: 1024,
      storageOptions: {
        skipBackup: true,
        path: 'images',
      },
      // Force file URI instead of base64
      presentationStyle: 'overFullScreen',
    };

    launchImageLibrary(options, (response: any) => {
      if (response.didCancel) {
        console.log('User cancelled image picker');
        return;
      }

      if (response.errorMessage) {
        console.log('ImagePicker Error: ', response.errorMessage);
        Alert.alert('Error', response.errorMessage);
        return;
      }

      if (response.assets && response.assets.length > 0) {
        const pickedImage = response.assets[0];
        
        // Handle base64 data URIs (common in web environment)
        if (pickedImage.uri && pickedImage.uri.startsWith('data:')) {
          console.log('🟡 Base64 data detected, converting...');
          const convertedFile = convertBase64ToFile(
            pickedImage.uri,
            pickedImage.fileName ?? `id-card-${Date.now()}.jpg`,
            pickedImage.type ?? 'image/jpeg'
          );
          
          setPickedFile({
            uri: convertedFile.uri,
            type: convertedFile.type,
            name: convertedFile.name,
            base64Data: convertedFile.base64Data,
            isBase64: true,
          } as any);

          console.log('🟢 Base64 image processed successfully');
          return;
        }

        // Validate that we have a proper file URI
        if (!pickedImage.uri) {
          Alert.alert('Error', 'No image URI received. Please try again.');
          return;
        }

        setPickedFile({
          uri: pickedImage.uri,
          type: pickedImage.type ?? 'image/jpeg',
          name: pickedImage.fileName ?? `id-card-${Date.now()}.jpg`,
          size: pickedImage.fileSize,
        });

        console.log('🟢 Image picked successfully:', {
          uri: pickedImage.uri.substring(0, 50) + '...',
          type: pickedImage.type,
          name: pickedImage.fileName,
          size: pickedImage.fileSize,
        });
      }
    });
  };

  const uploadImageWithRNBlobUtil = async () => {
    if (!pickedFile) {
      setResponseMessage('No image selected to upload');
      return;
    }

    console.log('🟢 Starting RNBlobUtil upload...');

    setUploading(true);
    setResponseMessage(null);

    try {
      let uploadData;

      if (pickedFile.isBase64 && pickedFile.base64Data) {
        // Handle base64 data
        console.log('🟡 Uploading base64 data...');
        uploadData = [
          {
            name: 'file',
            filename: pickedFile.name,
            type: pickedFile.type,
            data: pickedFile.base64Data, // Use base64 data directly
          }
        ];
      } else {
        // Handle file URI
        console.log('🟢 Uploading file URI...');
        uploadData = [
          {
            name: 'file',
            filename: pickedFile.name,
            type: pickedFile.type,
            data: RNBlobUtil.wrap(pickedFile.uri),
          }
        ];
      }

      const response = await RNBlobUtil.fetch('PATCH', uploadUrl, {
        'Content-Type': 'multipart/form-data',
      }, uploadData);

      const statusCode = response.info()?.status;
      console.log('🔵 Response status:', statusCode);
      
      const responseText = await response.text();
      console.log('🔵 Response text:', responseText);

      let responseData;
      try {
        responseData = JSON.parse(responseText);
      } catch (parseError) {
        console.log('Response is not JSON:', responseText);
        responseData = { message: responseText };
      }

      if (statusCode >= 200 && statusCode < 300) {
        setResponseMessage(`Success: ${responseData.message || 'Upload completed'}`);
        Alert.alert('Success', 'ID Card uploaded successfully!');
      } else {
        setResponseMessage(`Error (${statusCode}): ${responseData.message || 'Upload failed'}`);
        Alert.alert('Upload Failed', `${responseData.message || 'Unknown error occurred'} (Status: ${statusCode})`);
      }

    } catch (error: any) {
      console.error('🔴 RNBlobUtil upload error:', error);
      setResponseMessage(`Error: ${error.message || 'Network error'}`);
      Alert.alert('Upload Error', error.message || 'Network error occurred');
    } finally {
      setUploading(false);
    }
  };


  const uploadImageWithFetch = async () => {
    if (!pickedFile) {
      setResponseMessage('No image selected to upload');
      return;
    }

    console.log('🟢 Starting FormData fetch upload...');

    const formData = new FormData();
    
    if (pickedFile.isBase64 && pickedFile.base64Data) {
      // Convert base64 to Blob for FormData
      console.log('🟡 Converting base64 to Blob...');
      
      const byteCharacters = atob(pickedFile.base64Data);
      const byteNumbers = new Array(byteCharacters.length);
      for (let i = 0; i < byteCharacters.length; i++) {
        byteNumbers[i] = byteCharacters.charCodeAt(i);
      }
      const byteArray = new Uint8Array(byteNumbers);
      const blob = new Blob([byteArray], { type: pickedFile.type });
      
      formData.append('file', blob, pickedFile.name);
    } else {
      // Create proper file object for FormData
      const fileObj = {
        uri: pickedFile.uri,
        type: pickedFile.type,
        name: pickedFile.name,
      } as any;

      formData.append('file', fileObj);
    }

    console.log('🟢 FormData upload with file:', {
      uri: pickedFile.uri.substring(0, 50) + '...',
      type: pickedFile.type,
      name: pickedFile.name,
      size: pickedFile.size,
    });

    setUploading(true);
    setResponseMessage(null);

    try {
      const response = await fetch(uploadUrl, {
        method: 'PATCH',
        // Don't set Content-Type header manually - let the browser handle it
        body: formData,
      });

      console.log('🔵 Fetch response status:', response.status);
      console.log('🔵 Fetch response headers:', response.headers);

      const data = await response.json();
      console.log('🔵 Fetch response data:', data);

      if (response.ok) {
        setResponseMessage(`Success: ${data.message || 'Upload completed'}`);
        Alert.alert('Success', 'ID Card uploaded successfully!');
      } else {
        setResponseMessage(`Error (${response.status}): ${data.message || 'Failed to upload'}`);
        Alert.alert('Upload Failed', `${data.message || 'Unknown error occurred'} (Status: ${response.status})`);
      }
    } catch (error: any) {
      console.error('🔴 Fetch upload error:', error);
      setResponseMessage(`Error: ${error.message}`);
      Alert.alert('Upload Error', error.message || 'Network error occurred');
    } finally {
      setUploading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Upload ID Card Image</Text>

      {pickedFile && (
        <View style={styles.imageContainer}>
          <Image source={{ uri: pickedFile.uri }} style={styles.imagePreview} />
          <Text style={styles.imageInfo}>
            {pickedFile.name}
          </Text>
          {pickedFile.size && (
            <Text style={styles.imageSize}>
              Size: {Math.round(pickedFile.size / 1024)}KB
            </Text>
          )}
        </View>
      )}

      <View style={styles.buttonContainer}>
        <Button title="📷 Pick Image" onPress={pickImage} />
      </View>

      {pickedFile && (
        <View style={styles.uploadContainer}>
          <Text style={styles.uploadTitle}>Choose upload method:</Text>
          
          <View style={styles.buttonContainer}>
            <Button
              title={uploading ? 'Uploading...' : '🚀 Upload (RNBlobUtil)'}
              onPress={uploadImageWithRNBlobUtil}
              disabled={uploading}
              color="#4CAF50"
            />
          </View>
          
          <View style={styles.buttonContainer}>
            <Button
              title={uploading ? 'Uploading...' : '📤 Upload (Fetch)'}
              onPress={uploadImageWithFetch}
              disabled={uploading}
              color="#2196F3"
            />
          </View>
        </View>
      )}

      {uploading && (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#0000ff" />
          <Text style={styles.loadingText}>Uploading your ID card...</Text>
        </View>
      )}

      {responseMessage && (
        <View style={styles.responseContainer}>
          <Text style={[
            styles.response,
            { color: responseMessage.startsWith('Success') ? 'green' : 'red' }
          ]}>
            {responseMessage}
          </Text>
        </View>
      )}

      <View style={styles.debugContainer}>
        <Text style={styles.debugTitle}>Debug Info:</Text>
        <Text style={styles.debugText}>
          File selected: {pickedFile ? 'Yes' : 'No'}
        </Text>
        {pickedFile && (
          <>
            <Text style={styles.debugText}>
              URI type: {pickedFile.uri.startsWith('file://') ? 'File URI' : 
                       pickedFile.uri.startsWith('content://') ? 'Content URI' : 
                       pickedFile.uri.startsWith('data:') ? 'Base64 Data' : 'Unknown'}
            </Text>
            <Text style={styles.debugText}>
              MIME type: {pickedFile.type}
            </Text>
          </>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
    backgroundColor: '#f5f5f5',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 32,
    color: '#333',
  },
  imageContainer: {
    alignItems: 'center',
    marginBottom: 24,
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  imagePreview: {
    width: 280,
    height: 180,
    borderRadius: 8,
    resizeMode: 'contain',
    borderWidth: 1,
    borderColor: '#ddd',
  },
  imageInfo: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginTop: 8,
    fontWeight: '500',
  },
  imageSize: {
    fontSize: 12,
    color: '#999',
    textAlign: 'center',
    marginTop: 4,
  },
  buttonContainer: {
    marginVertical: 8,
  },
  uploadContainer: {
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 12,
    marginVertical: 16,
  },
  uploadTitle: {
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 12,
    color: '#333',
  },
  loadingContainer: {
    alignItems: 'center',
    padding: 20,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#666',
  },
  responseContainer: {
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 12,
    marginVertical: 16,
  },
  response: {
    fontSize: 16,
    textAlign: 'center',
    fontWeight: '500',
  },
  debugContainer: {
    backgroundColor: '#f0f0f0',
    padding: 12,
    borderRadius: 8,
    marginTop: 16,
  },
  debugTitle: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
    color: '#333',
  },
  debugText: {
    fontSize: 12,
    color: '#666',
    marginBottom: 4,
  },
});

export default IDCardUpload;