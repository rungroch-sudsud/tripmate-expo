import React, { useState, useRef, useCallback, useEffect, useMemo } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from 'react-native';
import { Dropdown } from 'react-native-element-dropdown';

// JSX String Parser
const parseJSXString = (jsxString) => {
  if (!jsxString || typeof jsxString !== 'string') {
    return { text: '', formatting: {} };
  }

  // Check if it's a JSX-like string
  const jsxRegex = /<Text\s+style=\{\{([^}]+)\}\}>([^<]+)<\/Text>/;
  const match = jsxString.match(jsxRegex);
  
  if (match) {
    const styleString = match[1];
    const textContent = match[2];
    
    // Parse the style object
    const formatting = {
      isBold: false,
      isItalic: false,
      isUnderline: false,
      textAlign: 'left',
      selectedColor: '#000000',
      selectedFont: 'System',
      isNumberList: false,
      isBulletList: false
    };
    
    // Extract fontWeight
    const fontWeightMatch = styleString.match(/fontWeight:\s*['"]([^'"]+)['"]/);
    if (fontWeightMatch && fontWeightMatch[1] === 'bold') {
      formatting.isBold = true;
    }
    
    // Extract fontStyle
    const fontStyleMatch = styleString.match(/fontStyle:\s*['"]([^'"]+)['"]/);
    if (fontStyleMatch && fontStyleMatch[1] === 'italic') {
      formatting.isItalic = true;
    }
    
    // Extract textDecorationLine
    const textDecorationMatch = styleString.match(/textDecorationLine:\s*['"]([^'"]+)['"]/);
    if (textDecorationMatch && textDecorationMatch[1] === 'underline') {
      formatting.isUnderline = true;
    }
    
    // Extract color
    const colorMatch = styleString.match(/color:\s*['"]([^'"]+)['"]/);
    if (colorMatch) {
      formatting.selectedColor = colorMatch[1];
    }
    
    // Extract fontFamily
    const fontFamilyMatch = styleString.match(/fontFamily:\s*['"]([^'"]+)['"]/);
    if (fontFamilyMatch) {
      formatting.selectedFont = fontFamilyMatch[1];
    }
    
    // Extract textAlign
    const textAlignMatch = styleString.match(/textAlign:\s*['"]([^'"]+)['"]/);
    if (textAlignMatch) {
      formatting.textAlign = textAlignMatch[1];
    }
    
    return { text: textContent, formatting };
  }
  
  // If not JSX format, treat as plain string
  return { 
    text: jsxString, 
    formatting: {
      isBold: false,
      isItalic: false,
      isUnderline: false,
      textAlign: 'left',
      selectedColor: '#000000',
      selectedFont: 'System',
      isNumberList: false,
      isBulletList: false
    }
  };
};

// Convert formatting back to JSX string
const formatToJSXString = (text, formatting) => {
  if (!text) return '';
  
  // If no special formatting, return plain text
  if (!formatting || Object.values(formatting).every(val => 
    val === false || val === 'left' || val === '#000000' || val === 'System'
  )) {
    return text;
  }
  
  // Build style object
  const styles = [];
  
  if (formatting.isBold) styles.push("fontWeight: 'bold'");
  if (formatting.isItalic) styles.push("fontStyle: 'italic'");
  if (formatting.isUnderline) styles.push("textDecorationLine: 'underline'");
  if (formatting.selectedColor && formatting.selectedColor !== '#000000') {
    styles.push(`color: '${formatting.selectedColor}'`);
  }
  if (formatting.selectedFont && formatting.selectedFont !== 'System') {
    styles.push(`fontFamily: '${formatting.selectedFont}'`);
  }
  if (formatting.textAlign && formatting.textAlign !== 'left') {
    styles.push(`textAlign: '${formatting.textAlign}'`);
  }
  
  if (styles.length === 0) return text;
  
  return `<Text style={{${styles.join(', ')}}}>${text}</Text>`;
};

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
  onChange = () => {},
  onFormattingChange,
  error,
  clearError,
  styles: parentStyles,
  isEditMode = false
}) => {
  // Memoize the parsed initial value to avoid recalculating on every render
  const parsedInitialValue = useMemo(() => {
    if (typeof value === 'string') {
      return parseJSXString(value);
    }
    if (value && typeof value === 'object') {
      return value;
    }
    return { text: '', formatting: {} };
  }, []); // Empty dependency - only run once on mount

  // Initialize state with parsed values
  const [localValue, setLocalValue] = useState(parsedInitialValue.text);
  const [isBold, setIsBold] = useState(parsedInitialValue.formatting?.isBold || false);
  const [isItalic, setIsItalic] = useState(parsedInitialValue.formatting?.isItalic || false);
  const [isUnderline, setIsUnderline] = useState(parsedInitialValue.formatting?.isUnderline || false);
  const [textAlign, setTextAlign] = useState(parsedInitialValue.formatting?.textAlign || 'left');
  const [selectedColor, setSelectedColor] = useState(parsedInitialValue.formatting?.selectedColor || '#000000');
  const [selectedFont, setSelectedFont] = useState(parsedInitialValue.formatting?.selectedFont || 'System');
  const [isNumberList, setIsNumberList] = useState(parsedInitialValue.formatting?.isNumberList || false);
  const [isBulletList, setIsBulletList] = useState(parsedInitialValue.formatting?.isBulletList || false);
  
  const [isInitialized, setIsInitialized] = useState(false);
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

  // Create complete data object with text and formatting
  const createCompleteData = useCallback(() => {
    return {
      text: localValue,
      formatting: createFormattingData()
    };
  }, [localValue, createFormattingData]);

  // Debounced version of onChange
  const debouncedOnChange = useCallback(
    debounce((data) => {
      if (typeof onChange === 'function') {
        onChange(data);
      }
    }, 150),
    [onChange]
  );

  // Initialize formatting from the initial parsed value - only run once
  useEffect(() => {
    // Set all formatting state from the initially parsed value
    const formatting = parsedInitialValue.formatting;
    if (formatting && Object.keys(formatting).length > 0) {
      setIsBold(formatting.isBold || false);
      setIsItalic(formatting.isItalic || false);
      setIsUnderline(formatting.isUnderline || false);
      setTextAlign(formatting.textAlign || 'left');
      setSelectedColor(formatting.selectedColor || '#000000');
      setSelectedFont(formatting.selectedFont || 'System');
      setIsNumberList(formatting.isNumberList || false);
      setIsBulletList(formatting.isBulletList || false);
    }
    
    // Mark as initialized after a brief delay to avoid conflicts
    setTimeout(() => {
      setIsInitialized(true);
    }, 50);
  }, []); // Empty dependency - only run once

  // Only send updates to parent after initialization is complete
  useEffect(() => {
    if (isInitialized) {
      const completeData = createCompleteData();
      debouncedOnChange(completeData);
    }
  }, [isInitialized, localValue, isBold, isItalic, isUnderline, textAlign, selectedColor, selectedFont, isNumberList, isBulletList, createCompleteData, debouncedOnChange]);

  // Handle text changes
  const handleTextChange = (text) => {
    setLocalValue(text);
    if (clearError) {
      clearError();
    }
  };

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

// Add default styles
const styles = StyleSheet.create({
  container: {
    marginVertical: 10,
  },
  label: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  toolbar: {
    backgroundColor: '#f5f5f5',
    padding: 10,
    borderRadius: 5,
    marginBottom: 10,
  },
  toolbarRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 5,
  },
  dropdownContainer: {
    flex: 1,
    marginRight: 5,
  },
  dropdown: {
    height: 40,
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 5,
    paddingHorizontal: 10,
    backgroundColor: 'white',
  },
  colorPreview: {
    width: 16,
    height: 16,
    borderRadius: 8,
    marginRight: 5,
  },
  toolButton: {
    backgroundColor: '#fff',
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 5,
    paddingHorizontal: 15,
    paddingVertical: 8,
    marginRight: 5,
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
    color: '#fff',
  },
  textInput: {
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 5,
    padding: 10,
    minHeight: 100,
    fontSize: 16,
  },
  inputError: {
    borderColor: '#ff0000',
  },
  errorText: {
    color: '#ff0000',
    fontSize: 12,
    marginTop: 5,
  },
});