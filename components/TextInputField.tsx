import React from 'react';
import { View, Text, TextInput, StyleSheet } from 'react-native';

interface TextInputFieldProps {
  field: string;
  label?: string;
  placeholder: string;
  value: string;
  error?: boolean;
  errorMessage?: string;
  onChangeText: (text: string) => void;
  keyboardType?: any;
  autoCapitalize?: 'none' | 'sentences' | 'words' | 'characters';
  maxLength?: number;
  multiline?: boolean;
  numberOfLines?: number;
  secureTextEntry?: boolean;
  editable?: boolean;
  autoFocus?: boolean;
  returnKeyType?: 'done' | 'go' | 'next' | 'search' | 'send';
  onSubmitEditing?: () => void;
  onFocus?: () => void;
  onBlur?: () => void;
  
  // Style props
  containerStyle?: any;
  inputStyle?: any;
  labelStyle?: any;
  errorStyle?: any;
  
  // Custom placeholder color
  placeholderTextColor?: string;
  
  // Primary placeholder styling
  primaryPlaceholderStyle?: any;
  
  // Input filtering/validation
  allowOnlyNumbers?: boolean;
  allowOnlyEmail?: boolean;
  customFilter?: (text: string) => string;
  
  // Custom error rendering
  renderError?: (error: string) => React.ReactNode;
  
  // Left/Right components
  leftComponent?: React.ReactNode;
  rightComponent?: React.ReactNode;
  
  // Two-line placeholder support
  secondaryPlaceholder?: string;
  secondaryPlaceholderColor?: string;
  secondaryPlaceholderStyle?: any;
  placeholderContainerStyle?: any;
  
  // NEW: Force show primary placeholder
  alwaysShowPrimaryPlaceholder?: boolean;
}

const TextInputField: React.FC<TextInputFieldProps> = ({
  field,
  label,
  placeholder,
  value,
  error = false,
  errorMessage = '',
  onChangeText,
  keyboardType = 'default',
  autoCapitalize = 'sentences',
  maxLength,
  multiline = false,
  numberOfLines = 1,
  secureTextEntry = false,
  editable = true,
  autoFocus = false,
  returnKeyType = 'done',
  onSubmitEditing,
  onFocus,
  onBlur,
  
  // Style props
  containerStyle,
  inputStyle,
  labelStyle,
  errorStyle,
  
  placeholderTextColor,
  
  // Primary placeholder styling
  primaryPlaceholderStyle,
  
  // Input filtering
  allowOnlyNumbers = false,
  allowOnlyEmail = false,
  customFilter,
  
  renderError,
  
  // Components
  leftComponent,
  rightComponent,
  
  // Two-line placeholder props
  secondaryPlaceholder,
  secondaryPlaceholderColor,
  secondaryPlaceholderStyle,
  placeholderContainerStyle,
  
  // NEW: Force show primary placeholder
  alwaysShowPrimaryPlaceholder = false,
}) => {
  
  // Handle text change with filtering
  const handleTextChange = (text: string) => {
    let filteredText = text;
    
    // Apply custom filter first
    if (customFilter) {
      filteredText = customFilter(filteredText);
    }
    // Apply number filter
    else if (allowOnlyNumbers) {
      filteredText = text.replace(/[^0-9]/g, '');
    }
    // Apply email filter (basic)
    else if (allowOnlyEmail) {
      filteredText = text.toLowerCase().replace(/[^a-z0-9@._-]/g, '');
    }
    
    onChangeText(filteredText);
  };
  
  // Default placeholder color logic
  const getPlaceholderColor = () => {
    if (placeholderTextColor) return placeholderTextColor;
    if (field === 'fullName') return "#888";
    return "#C0C0C0";
  };
  
  // Default secondary placeholder color
  const getSecondaryPlaceholderColor = () => {
    if (secondaryPlaceholderColor) return secondaryPlaceholderColor;
    return "#999"; // Slightly different from primary
  };
  
  const defaultErrorRenderer = (errorMsg: string) => (
    <Text style={[defaultStyles.errorText, errorStyle]}>
      {errorMsg}
    </Text>
  );

  // Enhanced logic for showing custom placeholder
  const shouldShowCustomPlaceholder = !value && (secondaryPlaceholder || alwaysShowPrimaryPlaceholder);
  
  // Determine what placeholder to show in TextInput
  const getTextInputPlaceholder = () => {
    if (shouldShowCustomPlaceholder) {
      return ''; // Hide native placeholder when showing custom overlay
    }
    return placeholder;
  };

  return (
    <View style={[defaultStyles.container, containerStyle]}>
      {label && (
        <Text style={[defaultStyles.label, labelStyle]}>
          {label}
        </Text>
      )}
      
      <View style={defaultStyles.inputContainer}>
        {leftComponent}
        
        <View style={{ flex: 1, position: 'relative' }}>
          <TextInput
            style={[
              defaultStyles.input,
              inputStyle,
              error && defaultStyles.inputError,
              multiline && { textAlignVertical: 'top' },
              leftComponent && { paddingLeft: 0 },
              rightComponent && { paddingRight: 0 },
            ]}
            value={value}
            onChangeText={handleTextChange}
            placeholder={getTextInputPlaceholder()}
            placeholderTextColor={getPlaceholderColor()}
            keyboardType={keyboardType}
            autoCapitalize={autoCapitalize}
            maxLength={maxLength}
            multiline={multiline}
            numberOfLines={numberOfLines}
            secureTextEntry={secureTextEntry}
            editable={editable}
            autoFocus={autoFocus}
            returnKeyType={returnKeyType}
            onSubmitEditing={onSubmitEditing}
            onFocus={onFocus}
            onBlur={onBlur}
          />
          
          {/* Custom placeholder overlay - always shows primary when needed */}
          {shouldShowCustomPlaceholder && (
            <View 
              style={[
                defaultStyles.placeholderOverlay,
                placeholderContainerStyle
              ]}
              pointerEvents="none"
            >
              <Text style={[
                defaultStyles.primaryPlaceholder,
                { color: getPlaceholderColor() },
                primaryPlaceholderStyle
              ]}>
                {placeholder}
              </Text>
              {secondaryPlaceholder && (
                <Text style={[
                  defaultStyles.secondaryPlaceholder,
                  { color: getSecondaryPlaceholderColor() },
                  secondaryPlaceholderStyle
                ]}>
                  {secondaryPlaceholder}
                </Text>
              )}
            </View>
          )}
        </View>
        
        {rightComponent}
      </View>
      
      {error && errorMessage && (
        renderError ? renderError(errorMessage) : defaultErrorRenderer(errorMessage)
      )}
    </View>
  );
};

const defaultStyles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
    color: '#333',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  input: {
    flex: 1,
    outlineColor: 'white',
    borderRadius: 8,
    fontSize: 16,
    backgroundColor: '#E5E7EB',
    paddingHorizontal: 12,
    paddingVertical: 18,
  },
  inputError: {
    borderColor: 'red',
    borderWidth: 1,
  },
  errorText: {
    color: 'red',
    fontSize: 12,
    marginTop: 4,
  },
  // Custom placeholder overlay styles
  placeholderOverlay: {
    position: 'absolute',
    left: 12,
    top: 8,
    right: 12,
    justifyContent: 'center',
    // Ensure overlay doesn't interfere with touch events
    zIndex: 1,
  },
  primaryPlaceholder: {
    fontSize: 16,
    lineHeight: 20,
    // Better support for Thai fonts
    includeFontPadding: false,
  },
  secondaryPlaceholder: {
    fontSize: 14,
    lineHeight: 18,
    marginTop: 2,
    // Better support for Thai fonts
    includeFontPadding: false,
  },
});

export default TextInputField;