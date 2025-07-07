import React, { useState } from 'react';
import { View, Text, TextInput } from 'react-native';


  const ErrorMessage = ({ error }: { error: string }) => {
    if (!error) return null;
    return (
      <Text style={{ color: 'red', fontSize: 12, marginTop: 4 }}>{error}</Text>
    );
  };

const TripNameInput = ({ 
  value, 
  onChangeText, 
  error, 
  clearError, 
  styles,
  showErrorMessage = true // Flag to control error message display
}) => {
  const [isFocused, setIsFocused] = useState(false);

  const handleFocus = () => {
    setIsFocused(true);
    if (clearError) {
      clearError('tripName');
    }
  };

  const handleBlur = () => {
    setIsFocused(false);
  };

  return (
    <View style={styles.fieldContainer}>
      <Text style={styles.label}>ชื่อทริป</Text>
      <TextInput
        style={[
          styles.textInput,
          isFocused && styles.textInputFocused,
          error && styles.inputError
        ]}
        onFocus={handleFocus}
        onBlur={handleBlur}
        value={value}
        onChangeText={onChangeText}
        placeholder="ตั้งชื่อทริปของคุณ"
        placeholderTextColor='gray'
        multiline
        maxLength={50}
      />
      
      {/* Conditional error message display */}
      {showErrorMessage && error && (
        <ErrorMessage error={error} />
      )}
      
      {/* Character count - only show if no error OR if showErrorMessage is false */}
      {(!error || !showErrorMessage) && (
        <Text style={[
          styles.wordCount,
          value.length > 45 && { color: 'red' }
        ]}>
          {value.length}/50
        </Text>
      )}
    </View>
  );
};

export default TripNameInput;