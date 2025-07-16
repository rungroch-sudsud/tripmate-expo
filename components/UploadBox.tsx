import React from 'react';
import { View, Text, TouchableOpacity, Image } from 'react-native';
import { PickedFile } from '../shared/schemas/file_type';

interface UploadBoxProps {
  index: number;
  label: string;
  placeholder: string;
  subtitle: string;
  iconSource: any;
  pickedFile: PickedFile | null;
  onPress: () => void;
  error: boolean;
  errorMessage: string;
  styles?:any
}

const UploadBox: React.FC<UploadBoxProps> = ({
  index,
  label,
  placeholder,
  subtitle,
  iconSource,
  pickedFile,
  onPress,
  error,
  errorMessage,
  styles
}) => {
  return (
    <View style={styles.uploadSection}>
     
      <TouchableOpacity
        style={[
          styles.uploadBox,
          error && { borderColor: 'red', borderWidth: 1 }
        ]}
        onPress={onPress}
      >
         <Text style={styles.uploadLabel}>{label}</Text>
        {pickedFile ? (
          <Image source={{ uri: pickedFile.uri }} style={styles.uploadedImage} />
        ) : (
      
          
          <View style={styles.uploadPlaceholder}>
          
            <View style={styles.cameraIcon}>
              <Image source={iconSource} style={{ height: 24, width: 24 }} resizeMode="contain" />
            </View>
            <Text style={styles.uploadText}>{placeholder}</Text>
            <Text style={styles.uploadSubtext}>{subtitle}</Text>
          </View>
       
        )}
      </TouchableOpacity>
      {error && (
        <Text style={{ color: 'red', fontSize: 12, marginTop: 4 }}>
          {errorMessage}
        </Text>
      )}
    </View>
  );
};

export default UploadBox;