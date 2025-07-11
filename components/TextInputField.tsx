import React from 'react';
import { View, Text, TextInput } from 'react-native';

interface TextInputFieldProps {
  field: string;
  label: string;
  placeholder: string;
  value: string;
  error: boolean;
  errorMessage: string;
  onChangeText: (text: string) => void;
  keyboardType?: any;
  autoCapitalize?: 'none' | 'sentences' | 'words' | 'characters';
  style?: any;
  styles?:any
}

const TextInputField: React.FC<TextInputFieldProps> = ({
  field,
  label,
  placeholder,
  value,
  error,
  errorMessage,
  onChangeText,
  keyboardType = 'default',
  style,
  styles
}) => {
  return (
    <View style={styles.inputGroup}>
      {label && <Text style={styles.inputLabel}>{label}</Text>}
      <TextInput
        style={[
          style,
          error && { borderColor: 'red', borderWidth: 1 }
        ]}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={field === 'fullName' ? "#888" : "#C0C0C0"}
        keyboardType={keyboardType}
       
      />
      {error && (
        <Text style={{ color: 'red', fontSize: 12, marginTop: 4 }}>
          {errorMessage}
        </Text>
      )}
    </View>
  );
};

export default TextInputField;