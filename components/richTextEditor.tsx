import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  Modal,
  Image
} from 'react-native';
import { Dropdown } from 'react-native-element-dropdown';

const RichTextInputComponent = ({ 
  value, 
  onChangeText, 
  error, 
  clearError, 
  isEditMode = false,
  placeholder = "Start typing your rich text here..."
}) => {
  const [isBold, setIsBold] = useState(false);
  const [isItalic, setIsItalic] = useState(false);
  const [isUnderline, setIsUnderline] = useState(false);
  const [textAlign, setTextAlign] = useState('left');
  const [selectedColor, setSelectedColor] = useState('#000000');
  const [selectedFont, setSelectedFont] = useState('System');
  const [isNumberList, setIsNumberList] = useState(false);
  const [isBulletList, setIsBulletList] = useState(false);
  const [listCounters, setListCounters] = useState({});
  const [isLinkModalVisible, setIsLinkModalVisible] = useState(false);
  const [linkName, setLinkName] = useState('');
  const [linkUrl, setLinkUrl] = useState('');
  const [plainText, setPlainText] = useState(''); // Store plain text for editing
  const textInputRef = useRef(null);

  // Font family options
  const fontFamilies = [
    { label: 'Normal', value: 'System' },
    { label: 'Arial', value: 'Arial' },
    { label: 'Helvetica', value: 'Helvetica' },
    { label: 'Times New Roman', value: 'Times New Roman' },
    { label: 'Courier New', value: 'Courier New' },
    { label: 'Georgia', value: 'Georgia' },
    { label: 'Trebuchet MS', value: 'Trebuchet MS' },
    { label: 'Verdana', value: 'Verdana' },
  ];

  // Generate JSX string from plain text and current formatting
  const generateJSXString = (text) => {
    if (!text) return '';

    const lines = text.split('\n');
    let jsxString = '';

    lines.forEach((line, index) => {
      if (line.trim() === '') {
        jsxString += '<br />';
        return;
      }

      // Handle links in markdown format [text](url)
      let processedLine = line.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" style="color: #007AFF; textDecorationLine: \'underline\'">$1</a>');

      // Apply current formatting styles
      let styleString = '';
      const styles = [];
      
      if (isBold) styles.push('fontWeight: \'bold\'');
      if (isItalic) styles.push('fontStyle: \'italic\'');
      if (isUnderline) styles.push('textDecorationLine: \'underline\'');
      if (textAlign !== 'left') styles.push(`textAlign: '${textAlign}'`);
      if (selectedColor !== '#000000') styles.push(`color: '${selectedColor}'`);
      if (selectedFont !== 'System') styles.push(`fontFamily: '${selectedFont}'`);
      
      if (styles.length > 0) {
        styleString = ` style={{${styles.join(', ')}}}`;
      }

      // Wrap in appropriate JSX tags
      if (isNumberList || isBulletList) {
        const listStyle = `{{${styles.join(', ')}, marginBottom: 4}}`;
        jsxString += `<Text${styleString}>${processedLine}</Text>`;
      } else {
        jsxString += `<Text${styleString}>${processedLine}</Text>`;
      }

      if (index < lines.length - 1) {
        jsxString += '\n';
      }
    });

    return jsxString;
  };

  // Clear styles function
  const clearStyles = () => {
    setIsBold(false);
    setIsItalic(false);
    setIsUnderline(false);
    setTextAlign('left');
    setSelectedColor('#000000');
    setSelectedFont('System');
    setIsNumberList(false);
    setIsBulletList(false);
    setListCounters({});
  };

  // Link modal functions
  const openLinkModal = () => {
    setIsLinkModalVisible(true);
  };

  const closeLinkModal = () => {
    setIsLinkModalVisible(false);
    setLinkName('');
    setLinkUrl('');
  };

  const insertLink = () => {
    if (linkUrl.trim() && linkName.trim()) {
      const linkText = `[${linkName.trim()}](${linkUrl.trim()})`;
      const newText = plainText + linkText;
      setPlainText(newText);
      
      // Generate JSX and update parent
      const jsxString = generateJSXString(newText);
      onChangeText(jsxString);
      
      if (clearError) clearError();
      closeLinkModal();
    } else {
      Alert.alert('Error', 'Please enter both link name and URL');
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

  const handleTextChange = (newText) => {
    if (clearError) clearError();
    
    setPlainText(newText);
    
    const lines = newText.split('\n');
    const oldLines = plainText.split('\n');
    
    // Check if user pressed Enter (new line added)
    if (lines.length > oldLines.length) {
      const lastLineIndex = lines.length - 2; // Previous line before the new empty one
      const lastLine = lines[lastLineIndex];
      
      if (isNumberList && lastLine && !lastLine.match(/^\d+\.\s/)) {
        // Add number to the previous line if it doesn't have one
        const currentNumber = lastLineIndex + 1;
        lines[lastLineIndex] = `${currentNumber}. ${lastLine}`;
        
        // Add number to the new line if user continues typing
        if (lines[lines.length - 1] === '') {
          lines[lines.length - 1] = `${lines.length}. `;
        }
      } else if (isBulletList && lastLine && !lastLine.match(/^•\s/)) {
        // Add bullet to the previous line if it doesn't have one
        lines[lastLineIndex] = `• ${lastLine}`;
        
        // Add bullet to the new line
        if (lines[lines.length - 1] === '') {
          lines[lines.length - 1] = '• ';
        }
      } else if (isNumberList && lines[lines.length - 1] === '') {
        // Continue numbering for new line
        lines[lines.length - 1] = `${lines.length}. `;
      } else if (isBulletList && lines[lines.length - 1] === '') {
        // Continue bullets for new line
        lines[lines.length - 1] = '• ';
      }
      
      const processedText = lines.join('\n');
      setPlainText(processedText);
      
      // Generate JSX and update parent
      const jsxString = generateJSXString(processedText);
      onChangeText(jsxString);
    } else {
      // Generate JSX and update parent
      const jsxString = generateJSXString(newText);
      onChangeText(jsxString);
    }
  };

  // Update JSX when formatting changes
  useEffect(() => {
    if (plainText) {
      const jsxString = generateJSXString(plainText);
      onChangeText(jsxString);
    }
  }, [isBold, isItalic, isUnderline, textAlign, selectedColor, selectedFont, isNumberList, isBulletList]);

  return (
    <View style={styles.container}>
      {/* Toolbar */}
      <View style={styles.toolbar}>
        <View style={styles.toolbarRow}>
          {/* Font Dropdown */}
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


             {/* Bold Button */}
          <TouchableOpacity
            style={[styles.toolButton, isBold && styles.activeButton]}
            onPress={toggleBold}
          >
            <Text style={[styles.toolButtonText, isBold && styles.activeButtonText]}>B</Text>
          </TouchableOpacity>

            {/* Italic Button */}
          <TouchableOpacity
            style={[styles.toolButton, isItalic && styles.activeButton]}
            onPress={toggleItalic}
          >
            <Text style={[styles.toolButtonText, isItalic && styles.activeButtonText, { fontStyle: 'italic' }]}>I</Text>
          </TouchableOpacity>

          {/* Underline Button */}
          <TouchableOpacity
            style={[styles.toolButton, isUnderline && styles.activeButton]}
            onPress={toggleUnderline}
          >
            <Text style={[styles.toolButtonText, isUnderline && styles.activeButtonText, { textDecorationLine: 'underline' }]}>U</Text>
          </TouchableOpacity>

              {/* Number List Button */}
          <TouchableOpacity
            style={[styles.toolButton, isNumberList && styles.activeButton]}
            onPress={toggleNumberList}
          >
            <Image source={require('../app/assets/images/numberList.png')} style={{width:18,height:18}}/>
           
          </TouchableOpacity>

          {/* Bullet List Button */}
          <TouchableOpacity
            style={[styles.toolButton, isBulletList && styles.activeButton]}
            onPress={toggleBulletList}
          >
            <Image source={require('../app/assets/images/bulletList.png')} style={{width:18,height:18}}/>
        
          </TouchableOpacity>

             {/* Left Align Button */}
          <TouchableOpacity
            style={[styles.toolButton, textAlign === 'left' && styles.activeButton]}
            onPress={() => setAlignment('left')}
          >
            <Text style={[styles.toolButtonText, textAlign === 'left' && styles.activeButtonText]}>←</Text>
          </TouchableOpacity>

          {/* Center Align Button */}
          <TouchableOpacity
            style={[styles.toolButton, textAlign === 'center' && styles.activeButton]}
            onPress={() => setAlignment('center')}
          >
            <Text style={[styles.toolButtonText, textAlign === 'center' && styles.activeButtonText]}>↔</Text>
          </TouchableOpacity>

          {/* Right Align Button */}
          <TouchableOpacity
            style={[styles.toolButton, textAlign === 'right' && styles.activeButton]}
            onPress={() => setAlignment('right')}
          >
            <Text style={[styles.toolButtonText, textAlign === 'right' && styles.activeButtonText]}>→</Text>
          </TouchableOpacity>
          
  

          {/* Insert Link Button */}
          <TouchableOpacity
            style={styles.toolButton}
            onPress={openLinkModal}
          >
            <Text style={styles.toolButtonText}>🔗</Text>
          </TouchableOpacity>

        {/* Clear Styles Button */}
          <TouchableOpacity
            style={styles.clearButton}
            onPress={clearStyles}
          >
            <Text style={styles.clearButtonText}>Tx</Text>
          </TouchableOpacity>
       
        </View>
      </View>

      {/* Link Modal */}
      <Modal
        visible={isLinkModalVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={closeLinkModal}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <Text style={styles.modalTitle}>Insert Link</Text>
            
            <Text style={styles.inputLabel}>Link Name:</Text>
            <TextInput
              style={styles.modalInput}
              placeholder="Enter link display name"
              value={linkName}
              onChangeText={setLinkName}
            />
            
            <Text style={styles.inputLabel}>URL:</Text>
            <TextInput
              style={styles.modalInput}
              placeholder="Enter URL (e.g., https://example.com)"
              value={linkUrl}
              onChangeText={setLinkUrl}
              keyboardType="url"
              autoCapitalize="none"
            />
            
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={closeLinkModal}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[styles.modalButton, styles.insertButton]}
                onPress={insertLink}
              >
                <Text style={styles.insertButtonText}>Insert</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Text Input */}
      <TextInput
        ref={textInputRef}
        style={[
          styles.textInput, 
          getTextStyle(),
          error && styles.errorInput
        ]}
        multiline
        placeholderTextColor='#9CA3AF'
        placeholder={placeholder}
        value={plainText}
        onChangeText={handleTextChange}
        textAlignVertical="top"
        editable={!isEditMode}
      />

      {/* Error Message */}
      {error && (
        <Text style={styles.errorText}>{error}</Text>
      )}

      {/* Preview showing JSX output */}
  
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    padding: 12,
  },
  toolbar: {
    backgroundColor: '#fff',
    borderRadius: 5,
    padding: 12,
    marginBottom: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
  toolbarRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    gap: 6,
    padding:0
  },
  dropdownContainer: {
    minWidth: 100,
    maxWidth: 180,
  },
  dropdown: {
    height: 36,
    borderRadius: 6,
    paddingHorizontal: 8,
    backgroundColor: '#fff',
    fontFamily:'LineSeedSansTH'
  },
  clearButton: {
    borderRadius: 6,
    paddingVertical: 8,
    paddingHorizontal: 12,
    alignItems: 'center',
    justifyContent: 'center',
    height: 36,
    minWidth: 40,
  },
  clearButtonText: {
    fontWeight: 'bold',
    fontSize: 12,
  },
  toolButton: {
    borderRadius: 6,
    paddingVertical: 6,
    paddingHorizontal: 10,
    minWidth: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
  activeButton: {
    backgroundColor: '#F3F4F6',
    borderColor: '#F3F4F6',
  },
  toolButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
  activeButtonText: {
    color: '#374151',
  },
  textInput: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 16,
    fontSize: 16,
    minHeight: 150,
    borderWidth: 1,
    borderColor: '#ddd',
    marginBottom: 8,
    outlineWidth:0,
    fontFamily:'LineSeedSansTH',
    color:'#374151'
  },
  errorInput: {
    borderColor: '#ff6b6b',
    borderWidth: 2,
  },
  errorText: {
    color: '#ff6b6b',
    fontSize: 14,
    marginBottom: 12,
    marginLeft: 4,
    fontFamily:'LineSeedSansTH'
  },
  previewContainer: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 16,
    borderWidth: 1,
    borderColor: '#ddd',
    maxHeight: 200,
  },
  previewTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 12,
    color: '#333',
  },
  previewScroll: {
    flex: 1,
  },
  jsxPreviewText: {
    fontSize: 12,
    lineHeight: 18,
    fontFamily: 'monospace',
    color: '#666',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 24,
    width: '90%',
    maxWidth: 400,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 20,
    color: '#333',
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
    marginTop: 12,
  },
  modalInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: '#f9f9f9',
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 24,
    gap: 12,
  },
  modalButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: '#f0f0f0',
    borderWidth: 1,
    borderColor: '#ddd',
  },
  insertButton: {
    backgroundColor: '#007AFF',
  },
  cancelButtonText: {
    color: '#666',
    fontWeight: '600',
    fontSize: 16,
  },
  insertButtonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 16,
  },
});

export default RichTextInputComponent;