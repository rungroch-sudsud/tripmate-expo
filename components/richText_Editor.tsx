import React, { useState, useRef, useCallback, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from 'react-native';
import { Dropdown } from 'react-native-element-dropdown';

// Error Message Component
const ErrorMessage = ({ error }) => {
  if (!error) return null;
  return <Text style={styles.errorText}>{error}</Text>;
};

// Rich Text Renderer Component for previews
export const RichTextRenderer = ({ text, formatting, style }) => {
  if (!text) return null;
  
  const getTextStyle = () => {
    if (!formatting) return style;
    
    return {
      ...style,
      fontWeight: formatting.isBold ? 'bold' : 'normal',
      fontStyle: formatting.isItalic ? 'italic' : 'normal',
      textDecorationLine: formatting.isUnderline ? 'underline' : 'none',
      textAlign: formatting.textAlign || 'left',
      color: formatting.selectedColor || '#000000',
      fontFamily: formatting.selectedFont === 'System' ? undefined : formatting.selectedFont,
    };
  };

  const formatText = (inputText) => {
    if (!inputText || !formatting) return inputText;
    
    if (formatting.isNumberList || formatting.isBulletList) {
      const lines = inputText.split('\n');
      return lines.map((line, index) => {
        if (line.trim()) {
          if (formatting.isNumberList) {
            return `${index + 1}. ${line}`;
          } else if (formatting.isBulletList) {
            return `• ${line}`;
          }
        }
        return line;
      }).join('\n');
    }
    return inputText;
  };

  return (
    <Text style={getTextStyle()}>
      {formatText(text) || ''}
    </Text>
  );
};

// Main Rich Text Editor Component
export const DetailsInputComponent = ({
  value,
  onChangeText = () => {}, // Default fallback function
  onFormattingChange,
  error,
  clearError,
  styles: parentStyles,
  isEditMode = false
}) => {
  // Parse initial value
  const parseInitialValue = (val) => {
    if (typeof val === 'string') {
      return { text: val, formatting: {} };
    }
    if (val && typeof val === 'object') {
      return val;
    }
    return { text: '', formatting: {} };
  };

  const initialData = parseInitialValue(value);
  const [localValue, setLocalValue] = useState(initialData.text);
  
  // Formatting states
  const [isBold, setIsBold] = useState(initialData.formatting?.isBold || false);
  const [isItalic, setIsItalic] = useState(initialData.formatting?.isItalic || false);
  const [isUnderline, setIsUnderline] = useState(initialData.formatting?.isUnderline || false);
  const [textAlign, setTextAlign] = useState(initialData.formatting?.textAlign || 'left');
  const [selectedColor, setSelectedColor] = useState(initialData.formatting?.selectedColor || '#000000');
  const [selectedFont, setSelectedFont] = useState(initialData.formatting?.selectedFont || 'System');
  const [isNumberList, setIsNumberList] = useState(initialData.formatting?.isNumberList || false);
  const [isBulletList, setIsBulletList] = useState(initialData.formatting?.isBulletList || false);
  
  // Add a ref to track if we're updating from parent to prevent loops
  const isUpdatingFromParent = useRef(false);
  
  const textInputRef = useRef(null);

  // Font family options
  const fontFamilies = [
    { label: 'System', value: 'System' },
    { label: 'Arial', value: 'Arial' },
    { label: 'Helvetica', value: 'Helvetica' },
    { label: 'Times New Roman', value: 'Times New Roman' },
    { label: 'Courier New', value: 'Courier New' },
    { label: 'Georgia', value: 'Georgia' },
    { label: 'Trebuchet MS', value: 'Trebuchet MS' },
    { label: 'Verdana', value: 'Verdana' },
  ];

  // Color options
  const colors = [
    { label: 'Black', value: '#000000' },
    { label: 'Red', value: '#FF0000' },
    { label: 'Blue', value: '#0000FF' },
    { label: 'Green', value: '#008000' },
    { label: 'Purple', value: '#800080' },
    { label: 'Orange', value: '#FFA500' },
    { label: 'Brown', value: '#A52A2A' },
    { label: 'Gray', value: '#808080' },
  ];

  // Link options
  const linkOptions = [
    { label: 'Insert Web Link', value: 'web' },
    { label: 'Insert Email Link', value: 'email' },
    { label: 'Insert Phone Link', value: 'phone' },
  ];

  // Debounce function
  const debounce = useCallback((func, delay) => {
    let timeoutId;
    return (...args) => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => func(...args), delay);
    };
  }, []);

  // Create rich text data object
  const createFormattingData = useCallback(() => {
    return {
      isBold,
      isItalic,
      isUnderline,
      textAlign,
      selectedColor,
      selectedFont,
      isNumberList,
      isBulletList,
    };
  }, [isBold, isItalic, isUnderline, textAlign, selectedColor, selectedFont, isNumberList, isBulletList]);

  // Debounced version of onChangeText
  const debouncedOnChangeText = useCallback(
    debounce((text) => {
      if (typeof onChangeText === 'function') {
        onChangeText(text);
      }
    }, 150),
    [onChangeText]
  );

  // Debounced version of onFormattingChange
  const debouncedOnFormattingChange = useCallback(
    debounce((formattingData) => {
      if (onFormattingChange && !isUpdatingFromParent.current) {
        onFormattingChange(formattingData);
      }
    }, 150),
    [onFormattingChange]
  );

  // FIXED: Only update local state when text actually changes from parent
  useEffect(() => {
    const newData = parseInitialValue(value);
    
    // Only update text if it's different from our local value
    if (newData.text !== localValue && !isUpdatingFromParent.current) {
      setLocalValue(newData.text);
    }
    
    // REMOVED: Don't reset formatting states here - they should only be controlled by toolbar
  }, [value]); // Remove localValue from dependency to prevent loops

  // Handle formatting changes and notify parent
  useEffect(() => {
    if (!isUpdatingFromParent.current) {
      const formattingData = createFormattingData();
      debouncedOnFormattingChange(formattingData);
    }
  }, [isBold, isItalic, isUnderline, textAlign, selectedColor, selectedFont, isNumberList, isBulletList, createFormattingData, debouncedOnFormattingChange]);

  // FIXED: Handle text changes without resetting formatting
  const handleTextChange = (text) => {
    setLocalValue(text);
    debouncedOnChangeText(text);
    if (clearError) {
      clearError();
    }
  };

  // FIXED: Initialize formatting from parent only once or when explicitly needed
  useEffect(() => {
    const newData = parseInitialValue(value);
    if (newData.formatting && Object.keys(newData.formatting).length > 0) {
      isUpdatingFromParent.current = true;
      
      // Only update if formatting is actually different
      const currentFormatting = createFormattingData();
      const newFormatting = newData.formatting;
      
      if (JSON.stringify(currentFormatting) !== JSON.stringify(newFormatting)) {
        setIsBold(newFormatting.isBold || false);
        setIsItalic(newFormatting.isItalic || false);
        setIsUnderline(newFormatting.isUnderline || false);
        setTextAlign(newFormatting.textAlign || 'left');
        setSelectedColor(newFormatting.selectedColor || '#000000');
        setSelectedFont(newFormatting.selectedFont || 'System');
        setIsNumberList(newFormatting.isNumberList || false);
        setIsBulletList(newFormatting.isBulletList || false);
      }
      
      // Reset the flag after a small delay
      setTimeout(() => {
        isUpdatingFromParent.current = false;
      }, 100);
    }
  }, []); // Only run once on mount

  const toggleBold = () => setIsBold(!isBold);
  const toggleItalic = () => setIsItalic(!isItalic);
  const toggleUnderline = () => setIsUnderline(!isUnderline);

  const setAlignment = (alignment) => {
    setTextAlign(alignment);
  };

  const toggleNumberList = () => {
    setIsNumberList(!isNumberList);
    if (!isNumberList) setIsBulletList(false);
  };

  const toggleBulletList = () => {
    setIsBulletList(!isBulletList);
    if (!isBulletList) setIsNumberList(false);
  };

  const handleLinkInsert = (linkType) => {
    if (linkType.value === 'web') {
      Alert.prompt(
        'Insert Web Link',
        'Enter URL:',
        (url) => {
          if (url) {
            const linkText = `[Link](${url})`;
            const newText = localValue + linkText;
            setLocalValue(newText);
            debouncedOnChangeText(newText);
          }
        }
      );
    } else if (linkType.value === 'email') {
      Alert.prompt(
        'Insert Email Link',
        'Enter email address:',
        (email) => {
          if (email) {
            const linkText = `[${email}](mailto:${email})`;
            const newText = localValue + linkText;
            setLocalValue(newText);
            debouncedOnChangeText(newText);
          }
        }
      );
    } else if (linkType.value === 'phone') {
      Alert.prompt(
        'Insert Phone Link',
        'Enter phone number:',
        (phone) => {
          if (phone) {
            const linkText = `[${phone}](tel:${phone})`;
            const newText = localValue + linkText;
            setLocalValue(newText);
            debouncedOnChangeText(newText);
          }
        }
      );
    }
  };

  const getTextStyle = () => {
    return {
      fontWeight: isBold ? 'bold' : 'normal',
      fontStyle: isItalic ? 'italic' : 'normal',
      textDecorationLine: isUnderline ? 'underline' : 'none',
      textAlign: textAlign,
      color: selectedColor,
      fontFamily: selectedFont === 'System' ? undefined : selectedFont,
    };
  };

  return (
    <View style={parentStyles?.container3 || styles.container}>
      <Text style={[parentStyles?.label || styles.label,{margin:10}]}>รายละเอียดทริป</Text>
      
      {/* Toolbar */}
      <View style={styles.toolbar}>
        {/* First Row - Dropdowns */}
        <View style={styles.toolbarRow}>
          <View style={styles.dropdownContainer}>
            <Dropdown
              style={styles.dropdown}
              data={fontFamilies}
              labelField="label"
              valueField="value"
              placeholder="Font"
              value={selectedFont}
              onChange={(item) => setSelectedFont(item.value)}
            />
          </View>
          
          <View style={styles.dropdownContainer}>
            <Dropdown
              style={styles.dropdown}
              data={colors}
              labelField="label"
              valueField="value"
              placeholder="Color"
              value={selectedColor}
              onChange={(item) => setSelectedColor(item.value)}
              renderLeftIcon={() => (
                <View style={[styles.colorPreview, { backgroundColor: selectedColor }]} />
              )}
            />
          </View>

          <View style={styles.dropdownContainer}>
            <Dropdown
              style={styles.dropdown}
              data={linkOptions}
              labelField="label"
              valueField="value"
              placeholder="Insert Link"
              onChange={handleLinkInsert}
            />
          </View>
        </View>

        {/* Second Row - Formatting Buttons */}
        <View style={styles.toolbarRow}>
          <TouchableOpacity
            style={[styles.toolButton, isBold && styles.activeButton]}
            onPress={toggleBold}
          >
            <Text style={[styles.toolButtonText, isBold && styles.activeButtonText]}>B</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.toolButton, isItalic && styles.activeButton]}
            onPress={toggleItalic}
          >
            <Text style={[styles.toolButtonText, isItalic && styles.activeButtonText, { fontStyle: 'italic' }]}>I</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.toolButton, isUnderline && styles.activeButton]}
            onPress={toggleUnderline}
          >
            <Text style={[styles.toolButtonText, isUnderline && styles.activeButtonText, { textDecorationLine: 'underline' }]}>U</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.toolButton, isNumberList && styles.activeButton]}
            onPress={toggleNumberList}
          >
            <Text style={[styles.toolButtonText, isNumberList && styles.activeButtonText]}>1.</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.toolButton, isBulletList && styles.activeButton]}
            onPress={toggleBulletList}
          >
            <Text style={[styles.toolButtonText, isBulletList && styles.activeButtonText]}>•</Text>
          </TouchableOpacity>
        </View>

        {/* Third Row - Alignment */}
        <View style={styles.toolbarRow}>
          <TouchableOpacity
            style={[styles.toolButton, textAlign === 'left' && styles.activeButton]}
            onPress={() => setAlignment('left')}
          >
            <Text style={[styles.toolButtonText, textAlign === 'left' && styles.activeButtonText]}>←</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.toolButton, textAlign === 'center' && styles.activeButton]}
            onPress={() => setAlignment('center')}
          >
            <Text style={[styles.toolButtonText, textAlign === 'center' && styles.activeButtonText]}>↔</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.toolButton, textAlign === 'right' && styles.activeButton]}
            onPress={() => setAlignment('right')}
          >
            <Text style={[styles.toolButtonText, textAlign === 'right' && styles.activeButtonText]}>→</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Text Input */}
      <TextInput
        ref={textInputRef}
        style={[
          parentStyles?.textArea || styles.textInput,
          getTextStyle(),
          error && (parentStyles?.inputError || styles.inputError)
        ]}
        multiline
        numberOfLines={4}
        placeholder="เขียนรายละเอียดทริปของคุณ..."
        placeholderTextColor="#888"
        value={localValue}
        onChangeText={handleTextChange}
        textAlignVertical="top"
      />
      
      {!isEditMode && <ErrorMessage error={error} />}
    </View>
  );
};

// Default styles (you should define these)
const styles = StyleSheet.create({
  container: {
    marginVertical: 10,
  },
  label: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  toolbar: {
    backgroundColor: '#f5f5f5',
    padding: 8,
    borderRadius: 8,
    marginBottom: 8,
  },
  toolbarRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    flexWrap: 'wrap',
  },
  dropdownContainer: {
    flex: 1,
    marginRight: 8,
    minWidth: 100,
  },
  dropdown: {
    height: 40,
    borderColor: '#ddd',
    borderWidth: 1,
    borderRadius: 4,
    paddingHorizontal: 8,
    backgroundColor: 'white',
  },
  colorPreview: {
    width: 16,
    height: 16,
    borderRadius: 8,
    marginRight: 8,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  toolButton: {
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 4,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginRight: 8,
    marginBottom: 4,
  },
  activeButton: {
    backgroundColor: '#007AFF',
    borderColor: '#007AFF',
  },
  toolButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  activeButtonText: {
    color: 'white',
  },
  textInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    minHeight: 100,
    backgroundColor: 'white',
  },
  inputError: {
    borderColor: '#FF3B30',
  },
  errorText: {
    color: '#FF3B30',
    fontSize: 14,
    marginTop: 4,
  },
});