import React, { useState, memo, useCallback, useEffect } from 'react';
import { View, Text, TextInput } from 'react-native';

const ErrorMessage = ({ error }) => {
  if (!error) return null;
  return (
    <Text style={{ color: 'red', fontSize: 12, marginTop: 4 }}>{error}</Text>
  );
};

const TripNameInput = memo(({
  value,
  onChangeText,
  error,
  clearError,
  styles,
  showErrorMessage = true
}) => {
  const [isFocused, setIsFocused] = useState(false);
  const [localValue, setLocalValue] = useState(value);

  // Debounce function
  const debounce = useCallback((func, delay) => {
    let timeoutId;
    return (...args) => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => func(...args), delay);
    };
  }, []);

  // Debounced version of onChangeText
  const debouncedOnChangeText = useCallback(
    debounce((text) => {
      onChangeText(text);
    }, 150), // 150ms delay
    [onChangeText]
  );

  // Update local value when prop changes (for external updates)
  useEffect(() => {
    setLocalValue(value);
  }, [value]);

  const handleFocus = useCallback(() => {
    setIsFocused(true);
    if (clearError) {
      clearError('tripName');
    }
  }, [clearError]);

  const handleBlur = useCallback(() => {
    setIsFocused(false);
  }, []);

  // Optimized change handler with debouncing
  const handleTextChange = useCallback((text) => {
    if (text.length <= 50) {
      setLocalValue(text); // Update local state immediately
      debouncedOnChangeText(text); // Update parent state with debounce
      if (error) clearError('tripName');
    }
  }, [debouncedOnChangeText, error, clearError]);

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
        value={localValue} // Use local state for immediate updates
        onChangeText={handleTextChange}
        placeholder="ตั้งชื่อทริปของคุณ"
        placeholderTextColor='gray'
        multiline
        maxLength={50}
      />
      
      {/* Conditional error message display */}
      {showErrorMessage && error && (
      <View  style={{marginBottom:10}}
      >  <ErrorMessage error={error} /></View>
      )}
      
      {/* Character count - only show if no error OR if showErrorMessage is false */}
      {(!error || !showErrorMessage) && (
        <Text style={[
          styles.wordCount,
          localValue.length > 45 && { color: 'red' }
        ]}>
          {localValue.length}/50
        </Text>
      )}
    </View>
  );
});

TripNameInput.displayName = 'TripNameInput';

export default TripNameInput;