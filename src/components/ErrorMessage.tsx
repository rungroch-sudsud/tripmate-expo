import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';

const ErrorMessage = ({ message, onRetry, canRetry = true, style }) => {
  if (!message) return null;

  return (
    <View
      style={[
        {
          backgroundColor: '#fef2f2',
          borderColor: '#fecaca',
          borderWidth: 1,
          borderRadius: 8,
          padding: 12,
          marginVertical: 8,
        },
        style,
      ]}
    >
      <Text style={{ color: '#dc2626', fontSize: 14, marginBottom: canRetry ? 8 : 0 }}>
        {message}
      </Text>
      {canRetry && onRetry && (
        <TouchableOpacity
          onPress={onRetry}
          style={{
            backgroundColor: '#dc2626',
            paddingVertical: 6,
            paddingHorizontal: 12,
            borderRadius: 4,
            alignSelf: 'flex-start',
          }}
        >
          <Text style={{ color: '#ffffff', fontSize: 12, fontWeight: '500' }}>
            ลองใหม่
          </Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

export default ErrorMessage;