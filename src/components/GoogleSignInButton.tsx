import React from 'react';
import { TouchableOpacity, Text, View, ActivityIndicator } from 'react-native';

const GoogleSignInButton = ({ onPress, isLoading, disabled, style, textStyle }) => {
  return (
    <TouchableOpacity
      style={[
        {
          backgroundColor: '#ffffff',
          borderWidth: 1,
          borderColor: '#d1d5db',
          borderRadius: 8,
          paddingVertical: 12,
          paddingHorizontal: 16,
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'center',
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 1 },
          shadowOpacity: 0.1,
          shadowRadius: 2,
          elevation: 2,
        },
        disabled && { opacity: 0.6 },
        style,
      ]}
      onPress={onPress}
      disabled={disabled || isLoading}
    >
      {isLoading ? (
        <ActivityIndicator size="small" color="#374151" />
      ) : (
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <View
            style={{
              width: 20,
              height: 20,
              borderRadius: 10,
              backgroundColor: '#4285f4',
              marginRight: 12,
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Text style={{ color: '#ffffff', fontWeight: 'bold', fontSize: 12 }}>G</Text>
          </View>
          <Text
            style={[
              {
                color: '#374151',
                fontSize: 16,
                fontWeight: '500',
              },
              textStyle,
            ]}
          >
            เข้าสู่ระบบด้วย Google
          </Text>
        </View>
      )}
    </TouchableOpacity>
  );
};

export default GoogleSignInButton;