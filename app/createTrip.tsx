import React, { useState,useEffect,useRef } from 'react';
import {
  View,
  Text,
  Modal,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  SafeAreaView,
  FlatList,
  Image,
  Alert,
  ActivityIndicator
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router,Stack } from 'expo-router';
import { launchImageLibrary } from 'react-native-image-picker';
import {axiosInstance} from '../lib/axios'
import '@expo-google-fonts/inter'
import DateTimePicker from '@react-native-community/datetimepicker';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import * as ImagePicker from 'expo-image-picker';
import * as DocumentPicker from 'expo-document-picker';
import {Calendar} from 'react-native-calendars'
import AsyncStorage from '@react-native-async-storage/async-storage';
import  'react-native-render-html'

const MAX_WORDS = 40;
interface Service {
  id: string;
  title: string;
}


interface Category {
    id: string;
    title: string;
    iconImageUrl: string;
    activeIconImageUrl?: string;
  }
type PickedFile = {
    uri: string;
    type: string;
    name: string;
    size?: number;
    base64Data?: string;
    isBase64?: boolean;
  };
  interface ApiResponse {
    data: {
      id: string;
      title: string;
      iconImageUrl: string;
      activeIconImageUrl?: string;
    }[];
  }
 
  
  interface ServicesResponse {
    data: {
      id: string;
      title: string;
    }[];
  }
 //RIch Editor
// TypeScript Interfaces
interface FormatState {
  bold: boolean;
  italic: boolean;
  underline: boolean;
  fontSize: number;
  textColor: string;
  backgroundColor: string;
  textAlign: 'left' | 'center' | 'right' | 'justify';
  fontFamily: string;
  
}

interface EditorState {
  content: string;
  format: FormatState;
  selectionStart: number;
  selectionEnd: number;
}

interface ToolbarButtonProps {
  title: string;
  isActive: boolean;
  onPress: () => void;
  style?: any;
  icon?: string;
}

interface ColorPickerProps {
  visible: boolean;
  onClose: () => void;
  onColorSelect: (color: string) => void;
  currentColor: string;
}

interface FontSizePickerProps {
  visible: boolean;
  onClose: () => void;
  onSizeSelect: (size: number) => void;
  currentSize: number;
}

interface InputModalProps {
  visible: boolean;
  title: string;
  placeholder: string;
  onClose: () => void;
  onSubmit: (text: string) => void;
}



// Color Picker Component
const ColorPicker: React.FC<ColorPickerProps> = ({ 
  visible, 
  onClose, 
  onColorSelect, 
  currentColor 
}) => {
  const colors = [
    '#000000', '#FF0000', '#00FF00', '#0000FF', '#FFFF00',
    '#FF00FF', '#00FFFF', '#FFA500', '#800080', '#008000',
    '#808080', '#FFC0CB', '#A52A2A', '#800000', '#008080'
  ];

  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={styles.modalOverlay}>
        <View style={styles.colorPickerContainer}>
          <Text style={styles.modalTitle}>เลือกสี</Text>
          <View style={styles.colorGrid}>
            {colors.map((color) => (
              <TouchableOpacity
                key={color}
                style={[
                  styles.colorOption,
                  { backgroundColor: color },
                  currentColor === color && styles.selectedColor
                ]}
                onPress={() => {
                  onColorSelect(color);
                  onClose();
                }}
              />
            ))}
          </View>
          <TouchableOpacity style={styles.modalCloseButton} onPress={onClose}>
            <Text style={styles.modalCloseText}>ปิด</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const LinkInputModal = ({
  visible,
  onClose,
  url,
  setUrl,
  linkText,
  setLinkText,
  onSubmit
}: {
  visible: boolean;
  onClose: () => void;
  url: string;
  setUrl: (url: string) => void;
  linkText: string;
  setLinkText: (text: string) => void;
  onSubmit: () => void;
}) => {
  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <Text style={styles.modalTitle}>Insert Link</Text>
          <TextInput
            placeholder="URL (https://example.com)"
            value={url}
            onChangeText={setUrl}
            style={styles.input}
          />
          <TextInput
            placeholder="Display Text (optional)"
            value={linkText}
            onChangeText={setLinkText}
            style={styles.input}
          />
          <View style={styles.modalActions}>
            <TouchableOpacity onPress={onClose}>
              <Text style={{ color: 'red' }}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={onSubmit}>
              <Text style={{ color: 'blue',}}>Insert</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

// Input Modal Component
const InputModal: React.FC<InputModalProps> = ({ 
  visible, 
  title, 
  placeholder, 
  onClose, 
  onSubmit 
}) => {
  const [inputText, setInputText] = useState('');

  const handleSubmit = () => {
    if (inputText.trim()) {
      onSubmit(inputText.trim());
      setInputText('');
      onClose();
    }
  };

  const handleClose = () => {
    setInputText('');
    onClose();
  };

  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={styles.modalOverlay}>
        <View style={styles.inputModalContainer}>
          <Text style={styles.modalTitle}>{title}</Text>
          <TextInput
            style={styles.modalInput}
            placeholder={placeholder}
            value={inputText}
            onChangeText={setInputText}
            autoFocus
            onSubmitEditing={handleSubmit}
          />
          <View style={styles.modalButtons}>
            <TouchableOpacity style={styles.modalCancelButton} onPress={handleClose}>
              <Text style={styles.modalCancelText}>ยกเลิก</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.modalSubmitButton} onPress={handleSubmit}>
              <Text style={styles.modalSubmitText}>ตกลง</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};
const FontSizePicker: React.FC<FontSizePickerProps> = ({ 
  visible, 
  onClose, 
  onSizeSelect, 
  currentSize 
}) => {
  const fontSizes = [
    { label: 'เล็ก', size: 12 },
    { label: 'ปกติ', size: 16 },
    { label: 'ใหญ่', size: 18 },
    { label: 'ใหญ่มาก', size: 24 },
    { label: 'หัวข้อ', size: 32 }
  ];

  return (
    <Modal visible={visible} transparent animationType="slide">
      <View style={styles.modalOverlay}>
        <View style={styles.fontSizeContainer}>
          <Text style={styles.modalTitle}>เลือกขนาดตัวอักษร</Text>
          {fontSizes.map((item) => (
            <TouchableOpacity
              key={item.size}
              style={[
                styles.fontSizeOption,
                currentSize === item.size && styles.selectedFontSize
              ]}
              onPress={() => {
                onSizeSelect(item.size);
                onClose();
              }}
            >
              <Text style={[styles.fontSizeText, { fontSize: item.size }]}>
                {item.label} ({item.size}px)
              </Text>
            </TouchableOpacity>
          ))}
          <TouchableOpacity style={styles.modalCloseButton} onPress={onClose}>
            <Text style={styles.modalCloseText}>ปิด</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

// Enhanced Toolbar Button Component
const ToolbarButton: React.FC<ToolbarButtonProps> = ({ 
  title, 
  isActive, 
  onPress, 
  style,
  icon 
}) => (
  <TouchableOpacity
    style={[
      styles.toolbarButton,
      isActive && styles.activeButton,
      style
    ]}
    onPress={onPress}
  >
    <Text style={[
      styles.toolbarButtonText,
      isActive && styles.activeButtonText
    ]}>
      {icon || title}
    </Text>
  </TouchableOpacity>
);


 //Rich Editor//

const ThaiFormScreen = () => {
 


// Available fonts array

    const [pickedFile2, setPickedFile2] = useState<PickedFile | null>(null);
    const [selfieError, setSelfieError] = useState(false);
     
    const [categories, setCategories] = useState<Category[]>([]);
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [services, setServices] = useState<Service[]>([]);
const [selectedServices, setSelectedServices] = useState<string[]>([]);
const [showStartDatePicker, setShowStartDatePicker] = useState(false);
const [showEndDatePicker, setShowEndDatePicker] = useState(false);
 
  const [formData, setFormData] = useState({
    name: '',
    startDate: '',
    endDate: '',
    description: '',
    selectedOptions: [] as string[],
    attachments: 0,
  });


const handleBack=async()=>{
  router.back()
}


 // For services
const toggleServiceCheckbox = (id: string) => {
  setSelectedServices(prev =>
    prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
  );
};

const isServiceChecked = (id: string) => selectedServices.includes(id);




  
  const convertBase64ToFile = (base64Uri: string, filename: string, mimeType: string) => {
    // Extract base64 data
    const base64Data = base64Uri.split(',')[1];
    return {
      uri: base64Uri, // Keep original for display
      base64Data: base64Data,
      type: mimeType,
      name: filename,
      isBase64: true,
    };
  };
  const pickImage2 = () => {
    // Compatible options for different versions of react-native-image-picker
    const options: any = {
      mediaType: 'photo',
      includeBase64: false,
      maxWidth: 1024,
      maxHeight: 1024,
      storageOptions: {
        skipBackup: true,
        path: 'images',
      },
      // Force file URI instead of base64
      presentationStyle: 'overFullScreen',
    };

    launchImageLibrary(options, (response: any) => {
      if (response.didCancel) {
        console.log('User cancelled image picker');
        return;
      }

      if (response.errorMessage) {
        console.log('ImagePicker Error: ', response.errorMessage);
        Alert.alert('Error', response.errorMessage);
        return;
      }

      if (response.assets && response.assets.length > 0) {
        const pickedImage = response.assets[0];
        
        // Handle base64 data URIs (common in web environment)
        if (pickedImage.uri && pickedImage.uri.startsWith('data:')) {
          console.log('🟡 Base64 data detected, converting...');
          const convertedFile = convertBase64ToFile(
            pickedImage.uri,
            pickedImage.fileName ?? `id-card-${Date.now()}.jpg`,
            pickedImage.type ?? 'image/jpeg'
          );
          
          setPickedFile2({
            uri: convertedFile.uri,
            type: convertedFile.type,
            name: convertedFile.name,
            base64Data: convertedFile.base64Data,
            isBase64: true,
          } as any);

          console.log('🟢 Base64 image processed successfully');
          return;
        }

        // Validate that we have a proper file URI
        if (!pickedImage.uri) {
          Alert.alert('Error', 'No image URI received. Please try again.');
          return;
        }

        setPickedFile2({
          uri: pickedImage.uri,
          type: pickedImage.type ?? 'image/jpeg',
          name: pickedImage.fileName ?? `id-card-${Date.now()}.jpg`,
          size: pickedImage.fileSize,
        });

        console.log('🟢 Image 2 picked successfully:', {
          uri: pickedImage.uri.substring(0, 50) + '...',
          type: pickedImage.type,
          name: pickedImage.fileName,
          size: pickedImage.fileSize,
        });
      }
    });
  };

  const toggleSelection = (id: string): void => {
    setSelectedItems(prev =>
      prev.includes(id)
        ? prev.filter(item => item !== id)
        : [...prev, id]
    );
  };
  const fetchServices = async (): Promise<void> => {
    try {
      setLoading(true);
  
      const response = await axiosInstance.get('/services');
      const result: ServicesResponse = response.data;
  
      const mappedServices: Service[] = result.data.map(item => ({
        id: item.id,
        title: item.title,
      }));
  
      setServices(mappedServices);
    } catch (error) {
      console.error('Failed to fetch services:', error);
      Alert.alert('Error', 'ไม่สามารถโหลดบริการได้ กรุณาลองใหม่', [{ text: 'OK' }]);
      setServices([]);
    } finally {
      setLoading(false);
    }
  };
  

  useEffect(() => {
    fetchServices();
  }, []);
  
  
  const fetchTravelStyles = async (): Promise<void> => {
    try {
      setLoading(true); 
    
 
      const response = await axiosInstance.get('/travel-styles'); 
    
      const result: ApiResponse = response.data; 
      
      
      const mappedCategories: Category[] = result.data.map(item => ({
        id: item.id,
        title: item.title,
        iconImageUrl: item.iconImageUrl,
        activeIconImageUrl: item.activeIconImageUrl || item.iconImageUrl,
      }));
    
      setCategories(mappedCategories); 
    } catch (error) {
      console.error('Failed to fetch travel styles:', error);
      Alert.alert(
        'Error',
        'Failed to load travel styles. Please try again.',
        [{ text: 'OK' }]
      );
    
      setCategories([]);
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    fetchTravelStyles();
  }, []);

  //Rich Editor
  const [editorState, setEditorState] = useState<EditorState>({
    content: '',
    format: {
      bold: false,
      italic: false,
      underline: false,
      fontSize: 16,
      textColor: '#000000',
      backgroundColor: '#ffffff',
      textAlign: 'left',
      fontFamily: 'System', 
    },
    selectionStart: 0,
    selectionEnd: 0,
    images: [] // Add this to store image data
  });
  const [isFocused, setIsFocused] = useState(false);

  const [showColorPicker, setShowColorPicker] = useState(false);
  const [showFontSizePicker, setShowFontSizePicker] = useState(false);
  const [showUrlInput, setShowUrlInput] = useState(false);
  const [showLinkTextInput, setShowLinkTextInput] = useState(false);
  const [showLinkInputModal, setShowLinkInputModal] = useState(false);
const [tempUrl, setTempUrl] = useState('');
const [tempLinkText, setTempLinkText] = useState('');

  const [showImageUrlInput, setShowImageUrlInput] = useState(false);
  
  const [textInputRef, setTextInputRef] = useState<TextInput | null>(null);
  const [listCounter, setListCounter] = useState(1);
  const [showFontDropdown, setShowFontDropdown] = useState(false);
  const FontDropdown = () => (
    <Modal
      visible={showFontDropdown}
      transparent={true}
      animationType="fade"
      onRequestClose={() => setShowFontDropdown(false)}
    >
      <TouchableOpacity 
        style={styles.modalOverlay}
        activeOpacity={1}
        onPress={() => setShowFontDropdown(false)}
      >
        <View style={styles.fontDropdownContainer}>
          <Text style={styles.dropdownTitle}>Select Font</Text>
          <ScrollView style={styles.fontList}>
            {fontFamilies.map((font) => (
              <TouchableOpacity
                key={font.value}
                style={[
                  styles.fontItem,
                  editorState.format.fontFamily === font.value && styles.selectedFontItem
                ]}
                onPress={() => changeFontFamily(font.value)}
              >
                <Text 
                  style={[
                    styles.fontItemText,
                    { fontFamily: font.value },
                    editorState.format.fontFamily === font.value && styles.selectedFontText
                  ]}
                >
                  {font.name}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      </TouchableOpacity>
    </Modal>
  );
  const fontFamilies = [
    { name: 'Default', value: 'System' },
    { name: 'Arial', value: 'Arial' },
    { name: 'Times New Roman', value: 'Times New Roman' },
    { name: 'Helvetica', value: 'Helvetica' },
    { name: 'Georgia', value: 'Georgia' },
    { name: 'Verdana', value: 'Verdana' },
    { name: 'Courier New', value: 'Courier New' },
    { name: 'Trebuchet MS', value: 'Trebuchet MS' },
    { name: 'Comic Sans MS', value: 'Comic Sans MS' },
    { name: 'Impact', value: 'Impact' },
  ];
  const changeFontFamily = (fontFamily: string) => {
    setEditorState(prev => ({
      ...prev,
      format: { ...prev.format, fontFamily }
    }));
    setShowFontDropdown(false);
  };  
  // Format toggle functions
  const toggleBold = () => {
    setEditorState(prev => ({
      ...prev,
      format: { ...prev.format, bold: !prev.format.bold }
    }));
  };

  const toggleItalic = () => {
    setEditorState(prev => ({
      ...prev,
      format: { ...prev.format, italic: !prev.format.italic }
    }));
  };

  const toggleUnderline = () => {
    setEditorState(prev => ({
      ...prev,
      format: { ...prev.format, underline: !prev.format.underline }
    }));
  };

  const changeTextAlign = () => {
    const alignments: Array<'left' | 'center' | 'right' | 'justify'> = ['left', 'center', 'right', 'justify'];
    const currentIndex = alignments.indexOf(editorState.format.textAlign);
    const nextIndex = (currentIndex + 1) % alignments.length;
    
    setEditorState(prev => ({
      ...prev,
      format: { ...prev.format, textAlign: alignments[nextIndex] }
    }));
  };

  // Enhanced list functions
  const insertBulletList = () => {
    const cursor = editorState.selectionStart;
    const beforeCursor = editorState.content.substring(0, cursor);
    const afterCursor = editorState.content.substring(cursor);
    const newContent = beforeCursor + '\n• ' + afterCursor;
    
    setEditorState(prev => ({
      ...prev,
      content: newContent
    }));
  };

  const insertNumberedList = () => {
    const cursor = editorState.selectionStart;
    const beforeCursor = editorState.content.substring(0, cursor);
    const afterCursor = editorState.content.substring(cursor);
    const newContent = beforeCursor + `\n${listCounter}. ` + afterCursor;
    
    setListCounter(prev => prev + 1);
    setEditorState(prev => ({
      ...prev,
      content: newContent
    }));
  };




  const handleLinkSubmit = () => {
    const url = tempUrl.trim();
    const linkText = tempLinkText.trim() || tempUrl;
  
    if (!url) {
      // You might show an alert/toast here: "URL is required"
      return;
    }
  
    const { selectionStart, content } = editorState;
    const beforeCursor = content.substring(0, selectionStart);
    const afterCursor = content.substring(selectionStart);
    const markdownLink = `[${linkText}](${url})`;
    const newContent = `${beforeCursor}${markdownLink}${afterCursor}`;
  
    setEditorState((prev) => ({
      ...prev,
      content: newContent,
      selectionStart: selectionStart + markdownLink.length,
      selectionEnd: selectionStart + markdownLink.length,
    }));
  
    // Reset modal fields and close modal
    setTempUrl('');
    setTempLinkText('');
    setShowLinkInputModal(false);
  };
  

  // Insert link function - Web compatible
  const insertLink = () => {
    setShowLinkInputModal(true);
  };

  const handleUrlSubmit = (url: string) => {
    setTempUrl(url);
    setShowLinkTextInput(true);
  };

  const handleLinkTextSubmit = (linkText: string) => {
    const displayText = linkText || tempUrl;
    const cursor = editorState.selectionStart;
    const beforeCursor = editorState.content.substring(0, cursor);
    const afterCursor = editorState.content.substring(cursor);
    const newContent = beforeCursor + `[${displayText}](${tempUrl})` + afterCursor;
    
    setEditorState(prev => ({
      ...prev,
      content: newContent
    }));
    setTempUrl('');
  };

  // Insert image function - Web compatible

  const handleImageUrlSubmit = (imageUrl: string) => {
    const cursor = editorState.selectionStart;
    const beforeCursor = editorState.content.substring(0, cursor);
    const afterCursor = editorState.content.substring(cursor);
    const newContent = beforeCursor + `\n[รูปภาพ: ${imageUrl}]\n` + afterCursor;
    
    setEditorState(prev => ({
      ...prev,
      content: newContent
    }));
  };

  const handleContentChange = (text: string) => {
    setEditorState(prev => ({
      ...prev,
      content: text,
    }));
  };

  const handleSelectionChange = (event: any) => {
    const { start, end } = event.nativeEvent.selection;
    setEditorState(prev => ({
      ...prev,
      selectionStart: start,
      selectionEnd: end
    }));
  };

  const onColorSelect = (color: string) => {
    setEditorState(prev => ({
      ...prev,
      format: { ...prev.format, textColor: color }
    }));
  };

  const onFontSizeSelect = (size: number) => {
    setEditorState(prev => ({
      ...prev,
      format: { ...prev.format, fontSize: size }
    }));
  };

  // Dynamic text style based on format state
  const getTextStyle = () => {
    return {
      fontWeight: editorState.format.bold ? 'bold' as 'bold' : 'normal' as 'normal',
      fontStyle: editorState.format.italic ? 'italic' as 'italic' : 'normal' as 'normal',
      textDecorationLine: editorState.format.underline ? 'underline' as 'underline' : 'none' as 'none',
      fontSize: editorState.format.fontSize,
      color: editorState.format.textColor,
      textAlign: editorState.format.textAlign,
      fontFamily: editorState.format.fontFamily === 'System' ? undefined : editorState.format.fontFamily,
    };
  };

  // Clear formatting
 



  useEffect(() => {
    console.log('Enhanced Thai Form Screen initialized');
  }, []);
//Rich Editor ///

  const formatDateInput = (text: string): string => {
    const cleaned = text.replace(/\D/g, '');
    
    if (cleaned.length <= 2) {
      return cleaned;
    } else if (cleaned.length <= 4) {
      return `${cleaned.slice(0, 2)}/${cleaned.slice(2)}`;
    } else {
      return `${cleaned.slice(0, 2)}/${cleaned.slice(2, 4)}/${cleaned.slice(4, 8)}`;
    }
  };


  
  const validateDate = (dateString: string): boolean => {
    const regex = /^(\d{2})\/(\d{2})\/(\d{4})$/;
    const match = dateString.match(regex);
    
    if (!match) return false;
    
    const day = parseInt(match[1], 10);
    const month = parseInt(match[2], 10);
    const year = parseInt(match[3], 10);
    
    const date = new Date(year, month - 1, day);
    return date.getDate() === day && 
           date.getMonth() === month - 1 && 
           date.getFullYear() === year;
  };

  const formatDateToCalendar = (dateString: string): string => {
    // Convert dd/mm/yyyy to yyyy-mm-dd format for calendar
    if (!dateString || !validateDate(dateString)) return '';
    const [day, month, year] = dateString.split('/');
    return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
  };
  
  const formatDateFromCalendar = (dateString: string): string => {
    // Convert yyyy-mm-dd to dd/mm/yyyy format
    const [year, month, day] = dateString.split('-');
    return `${day}/${month}/${year}`;
  };
  
  const handleStartDateSelect = (day: any) => {
    const selectedDate = formatDateFromCalendar(day.dateString);
    setFormData(prev => ({ ...prev, startDate: selectedDate }));
    setShowStartDatePicker(false);
  };
  
  const handleEndDateSelect = (day: any) => {
    const selectedDate = formatDateFromCalendar(day.dateString);
    setFormData(prev => ({ ...prev, endDate: selectedDate }));
    setShowEndDatePicker(false);
  };
  
  const [formData2, setFormData2] = useState({ name: '' });

  const formatDateRange = (start: string, end: string): string => {
    const [sd, sm, sy] = start.split('/').map(Number); // dd/mm/yyyy
    const [ed, em, ey] = end.split('/').map(Number);
  
    if (!sd || !sm || !sy || !ed || !em || !ey) return '';
  
    if (sy === ey && sm === em) {
      // Same month & year: 01-05/06/2025
      return `${sd}-${ed}/${pad(sm)}/${sy}`;
    } else if (sy === ey) {
      // Same year, different months: 29/05-02/06/2025
      return `${pad(sd)}/${pad(sm)}-${pad(ed)}/${pad(em)}/${sy}`;
    } else {
      // Different years: 29/12/2024-02/01/2025
      return `${pad(sd)}/${pad(sm)}/${sy}-${pad(ed)}/${pad(em)}/${ey}`;
    }
  };
  
  const pad = (n: number): string => (n < 10 ? `0${n}` : `${n}`);
  

  // Calculate word count from current text
  const wordCount = formData2.name.trim() === ''
    ? 0
    : formData2.name.trim().split(/\s+/).length;



    const [maxParticipant,setmaxParticipant]=useState<number | ''>('')
    const handleMaxParticipant=(text: String)=>{
      const filteredText = text.replace(/[^0-9]/g, '');
      const numberValue = filteredText ? parseInt(filteredText, 10) : '';
      setmaxParticipant(numberValue)
    }
    const [pricePerPerson,setpricePerPerson]=useState<number | ''>('')
    const handlepricePerPerson=(text: String)=>{
      const filteredText = text.replace(/[^0-9]/g, '');
      const numberValue = filteredText ? parseInt(filteredText, 10) : '';
      setpricePerPerson(numberValue)
    }

    const [isChecked, setIsChecked] = useState(false);
   //Destination
    const [dropdownOpen, setDropdownOpen] = useState(false);
    const [selected, setSelected] = useState<string[]>([]);
    const [searchText, setSearchText] = useState('');
    const [destinations, setDestinations] = useState<string[]>([]);
    const [uploading, setUploading] = useState(false);
    const [responseMessage, setResponseMessage] = useState<string | null>(null);
    function addDestination(dest: string) {
      if (!selected.includes(dest)) {
        setSelected([...selected, dest]);
      }
      setDropdownOpen(false);
      setSearchText(''); // Clear search when selecting
    }
    const filteredDestinations = destinations.filter(dest =>
      dest.toLowerCase().includes(searchText.toLowerCase())
    );
    function removeDestination(dest: string) {
      setSelected(selected.filter(d => d !== dest));
    }
    useEffect(() => {
      setLoading(true);
      axiosInstance.get('/destinations')
        .then(response => {
          setDestinations(response.data.data || []);
        })
        .catch(err => {
          console.error('Axios error:', err);
          setDestinations([]);
        })
        .finally(() => {
          setLoading(false);
        });
    }, []);
   

    type StatusType = 'published' | 'draft';
    //Submit
    const create = async (status:StatusType): Promise<void> => {
      try {
        console.log("🚀 Starting trip creation...");
        
        // Validation - check if required fields are filled
        if (!formData2.name || !formData.startDate || !formData.endDate || 
            selected.length === 0 || !maxParticipant || !pricePerPerson || 
            categories.length === 0) {
          Alert.alert('Error', 'Please fill in all required fields');
          return;
        }
    
        setUploading(true);
        setResponseMessage(null);
    
        // Improved date formatting with validation
        const formatDate = (dateStr: string): string => {
          try {
            let date: Date;
        
            if (dateStr.includes('/')) {
              const [day, month, year] = dateStr.split('/');
              date = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
            } else {
              date = new Date(dateStr);
            }
        
            if (isNaN(date.getTime())) {
              throw new Error(`Invalid date: ${dateStr}`);
            }
        
            // Return in YYYY-MM-DD format
            const year = date.getFullYear();
            const month = String(date.getMonth() + 1).padStart(2, '0'); // Months are 0-based
            const day = String(date.getDate()).padStart(2, '0');
        
            return `${year}-${month}-${day}`;
          } catch (error) {
            console.error('Date formatting error:', error);
            throw new Error(`Invalid date format: ${dateStr}`);
          }
        };
        
    
        // Extract IDs from category objects
        const travelStyleIds: string[] = categories.map((category: any) => category.id);
    
        // Create FormData for multipart request (renamed to avoid conflict)
        const requestFormData = new FormData();
    
        // Add all trip data to FormData
        requestFormData.append('name', formData2.name.trim());
        
        try {
          requestFormData.append('startDate', formatDate(formData.startDate));
          requestFormData.append('endDate', formatDate(formData.endDate));
        } catch (dateError) {
          Alert.alert('Error', 'Invalid date format. Please check your dates.');
          return;
        }
        
        // Add destinations - handle as JSON string or individual entries based on backend expectation
        if (selected.length > 0) {
          // Option 1: As JSON string (if backend expects JSON)
          requestFormData.append('destinations', selected);
          
          // Option 2: As individual entries (uncomment if backend expects this)
          // selected.forEach((destination: string, index: number) => {
          //   requestFormData.append(`destinations[${index}]`, destination);
          // });
        }
        
        requestFormData.append('maxParticipants', maxParticipant.toString());
        requestFormData.append('pricePerPerson', pricePerPerson.toString());
        
        // Add included services
        if (selectedServices.length > 0) {
          // Option 1: As JSON string
          requestFormData.append('includedServices', selectedServices);
          
          // Option 2: As individual entries (uncomment if needed)
          // selectedServices.forEach((service: string, index: number) => {
          //   requestFormData.append(`includedServices[${index}]`, service);
          // });
        }
        
        requestFormData.append('detail', editorState.content || '');
        
        // Add travel styles
        if (travelStyleIds.length > 0) {
          // Option 1: As JSON string
          requestFormData.append('travelStyles', travelStyleIds);
          
          // Option 2: As individual entries (uncomment if needed)
          // travelStyleIds.forEach((styleId: string, index: number) => {
          //   requestFormData.append(`travelStyles[${index}]`, styleId);
          // });
        }
        
        requestFormData.append('groupAtmosphere', formData.description || '');
        requestFormData.append('status', status);
        const userId=await AsyncStorage.getItem('userId')
        // TEMPORARY: Add tripOwnerId for testing
        requestFormData.append('tripOwnerId', userId);
    
        // Improved image file handling
        if (pickedFile2) {
          console.log("📷 Adding image to request...", {
            name: pickedFile2.name,
            type: pickedFile2.type,
            size: pickedFile2.size || 'unknown'
          });
          
          try {
            if (pickedFile2.isBase64 && pickedFile2.base64Data) {
              // Convert base64 to Blob
              const response = await fetch(`data:${pickedFile2.type};base64,${pickedFile2.base64Data}`);
              const blob = await response.blob();
              requestFormData.append('tripCoverImageFile', blob, pickedFile2.name);
            } else if (pickedFile2.uri) {
              // For React Native, create proper file object
              const fileObj = {
                uri: pickedFile2.uri,
                type: pickedFile2.type || 'image/jpeg',
                name: pickedFile2.name || 'image.jpg',
              } as any;
              
              requestFormData.append('tripCoverImageFile', fileObj);
            } else {
              console.warn('⚠️ No valid image data found');
            }
          } catch (imageError) {
            console.error('Image processing error:', imageError);
            Alert.alert('Warning', 'Image upload may have failed, but trip creation will continue.');
          }
        }
    
        console.log("📤 Sending trip creation request...");
        
        // Log FormData contents for debugging (remove in production)
        console.log("📋 Request data summary:", {
          name: formData2.name,
          startDate: formData.startDate,
          endDate: formData.endDate,
          destinations: selected.length,
          maxParticipants: maxParticipant,
          pricePerPerson: pricePerPerson,
          services: selectedServices.length,
          categories: categories.length,
          hasImage: !!pickedFile2
        });
        const accessToken = await AsyncStorage.getItem('googleAccessToken');
        const idToken = await AsyncStorage.getItem('googleIdToken');
        // Send request using axios
        const response = await axiosInstance.post('/trips', requestFormData, {
          headers: {
            'Content-Type': 'multipart/form-data',
             Authorization: `Bearer ${idToken}`
          },
          timeout: 60000, // Increased timeout to 60 seconds
          maxContentLength: Infinity,
          maxBodyLength: Infinity,
        });
    
        console.log("✅ Trip created successfully:", response.data);
        
        setResponseMessage(`Success: Trip "${response.data.name}" created successfully!`);
        Alert.alert(
          'Success', 
          `Trip "${response.data.name}" has been created successfully!`,
          [
            {
              text: 'OK',
              onPress: () => {
                // Reset form after user acknowledges success
                resetForm();
                // Optionally navigate back
                // navigation.goBack();
              }
            }
          ]
        );
    
      } catch (error: unknown) {
        console.error('🔴 Trip creation error:', error);
        
        let errorMessage = 'Failed to create trip';
        let debugInfo = '';
        
        if (error && typeof error === 'object' && 'response' in error) {
          const axiosError = error as any;
          console.error('Server Error Response:', axiosError.response?.data);
          console.error('Server Error Status:', axiosError.response?.status);
          console.error('Server Error Headers:', axiosError.response?.headers);
          
          const serverMessage = axiosError.response?.data?.message;
          const statusCode = axiosError.response?.status;
          
          if (serverMessage) {
            errorMessage = serverMessage;
          } else {
            errorMessage = `Server Error (${statusCode})`;
          }
          
          debugInfo = `Status: ${statusCode}`;
        } else if (error && typeof error === 'object' && 'request' in error) {
          console.error('Network Error:', (error as any).request);
          errorMessage = 'Network error. Please check your connection.';
        } else if (error instanceof Error) {
          console.error('General Error:', error.message);
          errorMessage = error.message || 'Unknown error occurred';
        }
        
        setResponseMessage(`Error: ${errorMessage}`);
        
        // Show more detailed error in development
        const isDevelopment = __DEV__ || process.env.NODE_ENV === 'development';
        const displayMessage = isDevelopment && debugInfo 
          ? `${errorMessage}\n\n${debugInfo}` 
          : errorMessage;
        
        Alert.alert('Trip Creation Failed', displayMessage);
      } finally {
        setUploading(false);
      }
    }
    const resetForm = () => {
      console.log("Resetted");
      
    };
    const insertImage2 = async () => {
      try {
        // For React Native CLI
        const options = {
          mediaType: 'photo',
          quality: 0.8,
          maxWidth: 1000,
          maxHeight: 1000,
        };
    
        launchImageLibrary(options, (response) => {
          if (response.assets && response.assets[0]) {
            const imageUri = response.assets[0].uri;
            insertImageIntoEditor(imageUri);
          }
        });
    
        // For Expo (alternative approach)
        /*
        const result = await ImagePicker.launchImageLibraryAsync({
          mediaTypes: ImagePicker.MediaTypeOptions.Images,
          allowsEditing: true,
          aspect: [4, 3],
          quality: 0.8,
        });
    
        if (!result.canceled) {
          insertImageIntoEditor(result.assets[0].uri);
        }
        */
      } catch (error) {
        console.error('Error picking image:', error);
      }
    };
    
    const insertImageIntoEditor = (imageUri) => {
      const { start, end } = editorState.selection;
      const content = editorState.content;
      
      // Create image placeholder/marker in text
      const imageMarker = `[IMAGE:${imageUri}]`;
      
      const newContent = 
        content.slice(0, start) + 
        imageMarker + 
        content.slice(end);
    
      setEditorState(prev => ({
        ...prev,
        content: newContent,
        images: [...(prev.images || []), { uri: imageUri, position: start }]
      }));
    
      // Move cursor after inserted image
      setTimeout(() => {
        if (textInputRef) {
          textInputRef.setNativeProps({
            selection: { start: start + imageMarker.length, end: start + imageMarker.length }
          });
        }
      }, 100);
    };

    
  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <Stack.Screen options={{ headerShown: false }} />
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={handleBack}>
          <Ionicons name="chevron-back" size={24} color="#000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>สร้างทริปใหม่</Text>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
      
        
           
        

        {/* Form Fields */}
        <View style={styles.formSection}>
              {/* Image Upload Section */}
        <TouchableOpacity
              style={[
                styles.uploadBox,
                selfieError && { borderColor: 'red', borderWidth: 1 }
              ]}
              onPress={pickImage2}
            >
              {pickedFile2 ? (
                <Image source={{ uri: pickedFile2.uri }} style={styles.uploadedImage} />
              ) : (
                <View style={styles.uploadPlaceholder}>
                  <View style={styles.personIcon}>
                    <Image
                      source={require('../assets/images/images/image3.png')}
                      style={{ height: 27, width: 27,tintColor:"#9CA3AF" }}
                      resizeMode="contain"
                    />
                  </View>
                 
                  <Text style={styles.uploadSubtext}>
                  เพิ่มรูปภาพหน้าปก
                  </Text>
                </View>
              )}
            </TouchableOpacity>



          {/* Name Field */}
          <View style={styles.fieldContainer}>
      <Text style={styles.label}>ชื่อทริป
      </Text>
      <TextInput
        style={[styles.textInput, isFocused && styles.textInputFocused]}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        value={formData2.name}
        onChangeText={(text) => setFormData2(prev => ({ ...prev, name: text }))}
        placeholder="ตั้งชื่อทริปของคุณ"
        multiline
      />
      <Text style={styles.wordCount}>
        {wordCount}/{MAX_WORDS}
      </Text>
    </View>



          {/* Date Fields */}
          <View style={styles.dateContainer}>
  <View style={styles.dateField}>
    <Text style={styles.dateLabel}>วันที่เริ่มต้น</Text>
    <TouchableOpacity onPress={() => setShowStartDatePicker(true)}>
      <TextInput
        style={[
          styles.dateInput,
          formData.startDate && !validateDate(formData.startDate) && styles.dateInputError
        ]}
        value={formData.startDate}
        onChangeText={(text) => {
          const formatted = formatDateInput(text);
          setFormData(prev => ({ ...prev, startDate: formatted }));
        }}
        placeholder="dd/mm/yyyy"
        keyboardType="numeric"
        maxLength={10}
        accessibilityLabel="วันที่เริ่มต้น"
        editable={true}
        pointerEvents="none"
      />
    </TouchableOpacity>
  </View>
  
  <View style={styles.dateField}>
    <Text style={styles.dateLabel}>วันที่สิ้นสุด</Text>
    <TouchableOpacity onPress={() => setShowEndDatePicker(true)}>
      <TextInput
        style={[
          styles.dateInput,
          formData.endDate && !validateDate(formData.endDate) && styles.dateInputError
        ]}
        value={formData.endDate}
        onChangeText={(text) => {
          const formatted = formatDateInput(text);
          setFormData(prev => ({ ...prev, endDate: formatted }));
        }}
        placeholder="dd/mm/yyyy"
        keyboardType="numeric"
        maxLength={10}
        accessibilityLabel="วันที่สิ้นสุด"
        editable={true}
        pointerEvents="none"
      />
    </TouchableOpacity>
  </View>

  {/* Start Date Calendar Modal */}
  <Modal
    visible={showStartDatePicker}
    transparent={true}
    animationType="fade"
    onRequestClose={() => setShowStartDatePicker(false)}
  >
    <View style={styles.modalOverlay}>
      <View style={styles.calendarContainer}>
        <View style={styles.calendarHeader}>
          <Text style={styles.calendarTitle}>เลือกวันที่เริ่มต้น</Text>
          <TouchableOpacity
            onPress={() => setShowStartDatePicker(false)}
            style={styles.closeButton}
          >
            <Text style={styles.closeButtonText}>✕</Text>
          </TouchableOpacity>
        </View>
        <Calendar
          onDayPress={handleStartDateSelect}
          markedDates={{
            [formatDateToCalendar(formData.startDate)]: {
              selected: true,
              selectedColor: '#007AFF'
            }
          }}
          theme={{
            selectedDayBackgroundColor: '#007AFF',
            todayTextColor: '#007AFF',
            arrowColor: '#007AFF',
          }}
        />
      </View>
    </View>
  </Modal>

  {/* End Date Calendar Modal */}
  <Modal
    visible={showEndDatePicker}
    transparent={true}
    animationType="fade"
    onRequestClose={() => setShowEndDatePicker(false)}
  >
    <View style={styles.modalOverlay}>
      <View style={styles.calendarContainer}>
        <View style={styles.calendarHeader}>
          <Text style={styles.calendarTitle}>เลือกวันที่สิ้นสุด</Text>
          <TouchableOpacity
            onPress={() => setShowEndDatePicker(false)}
            style={styles.closeButton}
          >
            <Text style={styles.closeButtonText}>✕</Text>
          </TouchableOpacity>
        </View>
        <Calendar
          onDayPress={handleEndDateSelect}
          markedDates={{
            [formatDateToCalendar(formData.endDate)]: {
              selected: true,
              selectedColor: '#007AFF'
            }
          }}
          theme={{
            selectedDayBackgroundColor: '#007AFF',
            todayTextColor: '#007AFF',
            arrowColor: '#007AFF',
          }}
          minDate={formData.startDate ? formatDateToCalendar(formData.startDate) : undefined}
        />
      </View>
    </View>
  </Modal>
</View>
{/* Max Participants */}
      <Text style={{marginLeft:2,marginBottom:6}}>จํานวนคน
      </Text>
     <View style={styles.dateContainer}>

    
     <View style={{flex:0.40,flexDirection:'row',alignItems:'center',backgroundColor:'#F9FAFBFF',height:40,paddingHorizontal:4,borderRadius:8}}>
     <Image
        source={require('../assets/images/images/image11.png')} // Replace with your image path
        style={{height:16,width:16,marginHorizontal:3}}
        resizeMode="contain"
      />
      <TextInput style={{width:100,height:'80%',paddingHorizontal:5,outlineColor:'white',backgroundColor:'#F9FAFBFF'}}
      placeholder=''
      value={maxParticipant!=''?maxParticipant.toString():''}
      onChangeText={handleMaxParticipant}
      keyboardType='numeric'
      />
      <Text style={{marginLeft:3}}>คน</Text>
     </View>
     </View>
    {/* Price Per Person */}
    <Text style={{marginLeft:2,marginBottom:6}}>ราคาต่อคน
    </Text>
     <View style={{flexDirection:'row',alignItems:'center',backgroundColor:'#F9FAFBFF',height:45,borderRadius:8,justifyContent:'space-between',marginBottom:30}}>
     <Image
        source={require('../assets/images/images/image12.png')} // Replace with your image path
        style={{height:16,width:16,marginHorizontal:3}}
        resizeMode="contain"
      />
      <Text style={{marginLeft:5,marginRight:10,width:100}}>ราคาต่อคน
      </Text>
       <TextInput style={{width:'100%',height:'70%',paddingHorizontal:5,outlineColor:'#e0e0e0'}}
      placeholder=''
      value={pricePerPerson!=''?pricePerPerson.toString():''}
      onChangeText={handlepricePerPerson}
      keyboardType='numeric'
      />
      <Text style={{marginHorizontal:5}}>คน</Text>
     </View>


  {/* Checkbox Options */}
          <View style={styles.checkboxSection}>
  <Text style={styles.label}>สิ่งที่รวมในราคา
  </Text>

  <View style={styles.checkboxContainer}>
  {services.map(service => (
  <View key={service.id} style={styles.checkboxRow}>
    <TouchableOpacity
      style={styles.checkbox}
      onPress={() => toggleServiceCheckbox(service.id)}
    >
      <View
        style={[
          styles.checkboxInner,
          isServiceChecked(service.id) && styles.checked,
        ]}
      />
    </TouchableOpacity>
    <Text style={styles.checkboxText}>{service.title}</Text>
  </View>
))}

  </View>
</View>

          {/* Travel-Style */}
      
          <View style={styles.content}>
        <Text style={styles.label}>
        สไตล์การเที่ยว

        </Text>

        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#6366f1" />
            <Text style={styles.loadingText}>กำลังโหลด...</Text>
          </View>
        ) : (
          <View style={styles.categoriesContainer}>
            {categories.map((category: Category) => (
              <TouchableOpacity
                key={category.id}
                style={[
                  styles.categoryItem,
                  selectedItems.includes(category.id) && styles.selectedItem
                ]}
                onPress={() => toggleSelection(category.id)}
              >
  <Image
  source={{ uri: category.iconImageUrl || 'https://via.placeholder.com/30x30/000000/FFFFFF?text=?' }}
  style={{
    width: 14,
    height: 12,
   
    tintColor: selectedItems.includes(category.id) ? '#6366f1' : '#000',
    
  }}
  resizeMode="contain"
/>

                <Text style={[
                  styles.categoryText,
                  selectedItems.includes(category.id) && styles.selectedText
                ]}>
                  {category.title}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        )}
      </View>

  

{/* Destination */}
<View style={{
  backgroundColor: '#fff',
  position: 'relative',
  zIndex: 1000,
  marginBottom: dropdownOpen ? 220 : 20, // Dynamic margin based on dropdown state
  marginTop:10
}}>
  <TouchableOpacity onPress={() => setDropdownOpen(!dropdownOpen)}>
    <View>
      {dropdownOpen ? (
        <TextInput
          style={{
            borderWidth: 1,
            borderColor: '#D1D5DB',
            borderRadius: 8,
            paddingHorizontal: 12,
            paddingVertical: 12,
            fontSize: 16,
            fontFamily: 'Inter_400Regular',
            lineHeight: 24,
            color: '#374151',
            height: 50,
            backgroundColor: '#FFFFFF',
          }}
          placeholder="ค้นหาสถานที่"
          value={searchText}
          onChangeText={setSearchText}
          autoFocus={true}
        />
      ) : (
        <Text style={{
          borderWidth: 1,
          borderColor: '#D1D5DB',
          borderRadius: 8,
          paddingHorizontal: 12,
          paddingVertical: 12,
          fontSize: 16,
          fontFamily: 'Inter_400Regular',
          lineHeight: 24,
          color: '#374151',
          height: 50,
          backgroundColor: '#FFFFFF',
        }}>
          <Image
            source={require('../assets/images/images/image9.png')}
            style={{ width: 16, height: 16 }}
          />
          {' '} ค้นหาสถานที่
        </Text>
      )}
    </View>
  </TouchableOpacity>

  {dropdownOpen && (
    <View style={{
      position: 'absolute', // Position absolutely to avoid pushing content down
      top: 55, // Position just below the input (50px height + 5px margin)
      left: 0,
      right: 0,
      backgroundColor: '#FFFFFF',
      borderWidth: 1,
      borderColor: '#999',
      borderRadius: 6,
      maxHeight: 200,
      zIndex: 1001, // Higher z-index than parent
      shadowColor: '#000', // Add shadow for better visibility
      shadowOffset: {
        width: 0,
        height: 2,
      },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 5, // For Android shadow
    }}>
      {loading ? (
        <View style={{ padding: 20, alignItems: 'center' }}>
          <ActivityIndicator size="small" />
        </View>
      ) : (
        <ScrollView style={{ maxHeight: 200 }}>
          {filteredDestinations.length > 0 ? (
            filteredDestinations.map((item, index) => (
              <TouchableOpacity
                key={index}
                style={{
                  padding: 12,
                  borderBottomWidth: index < filteredDestinations.length - 1 ? 1 : 0,
                  borderBottomColor: '#f0f0f0',
                }}
                onPress={() => addDestination(item)}
              >
                <Text style={{ fontSize: 14, color: '#374151' }}>{item}</Text>
              </TouchableOpacity>
            ))
          ) : (
            <Text style={{
              padding: 12,
              textAlign: 'center',
              color: '#9CA3AF',
              fontSize: 14,
            }}>
              ไม่พบสถานที่ที่ค้นหา
            </Text>
          )}
        </ScrollView>
      )}
    </View>
  )}

  {/* Selected destinations */}
  <View style={{ 
    marginTop: 20,
    marginBottom: 10,
  }}>
    <View style={{
      flexDirection: 'row',
      flexWrap: 'wrap',
    }}>
      {selected.map((dest, index) => (
        <TouchableOpacity
          key={index}
          style={{
            backgroundColor: '#4F46E51A',
            borderWidth: 1,
            paddingHorizontal: 8,
            paddingTop: 7,
            borderRadius: 9999,
            margin: 5,
            borderColor: '#4F46E5',
            minWidth: 84.09,
            height: 38,
            alignItems: 'center',
          }}
          onPress={() => removeDestination(dest)}
        >
          <Text style={{
            color: '#4F46E5',
            fontFamily: 'Inter_400Regular',
            fontSize: 14,
          }}>
            {dest} <Text style={{ fontSize: 16 }}>×</Text>
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  </View>
</View>


       {/* Description Field */}
       <View style={{marginBottom:20,marginTop:-20}}>
            <Text style={styles.label}>บรรยากาศ/โทนกลุ่ม</Text>
            <TextInput
              style={styles.textArea}
              multiline
              numberOfLines={4}
              value={formData.description}
              onChangeText={(text) => setFormData(prev => ({ ...prev, description: text }))}
              placeholder="อธิบายบรรยากาศหรือโทนของกลุ่มที่ต้องการ...."
            />
          </View>
      {/*RIch Editor */}
      <View style={styles.container3}>
      {/* Header */}
    
        <Text style={styles.label}>รายละเอียดทั่วไป</Text>
       
      
      {/* Toolbar - Only tools from image */}
      <View style={styles.toolbar}>
        {/* Font Size Dropdown */}
        <TouchableOpacity
  style={styles.toolButton}
  onPress={() => setShowFontDropdown(true)}
>
  <Text style={styles.fontButtonText}>Font</Text>
</TouchableOpacity>

<FontDropdown />
        {/* Format Buttons */}
        <ToolbarButton
          title="B"
          isActive={editorState.format.bold}
          onPress={toggleBold}
          style={styles.formatButton}
        />
        
        <ToolbarButton
          title="I"
          isActive={editorState.format.italic}
          onPress={toggleItalic}
          style={[styles.formatButton, styles.italicButton]}
        />
        
        <ToolbarButton
          title="U"
          isActive={editorState.format.underline}
          onPress={toggleUnderline}
          style={[styles.formatButton, styles.underlineButton]}
        />
        
        {/* Numbered List */}
        <ToolbarButton
          title="1."
          isActive={false}
          onPress={insertNumberedList}
          style={styles.listButton}
        />
        
        {/* Bullet List */}
        <ToolbarButton
          title="•"
          isActive={false}
          onPress={insertBulletList}
          style={styles.listButton}
        />
        
        {/* Text Alignment */}
        <TouchableOpacity
          style={styles.toolButton}
          onPress={changeTextAlign}
        >
          <Text style={styles.alignmentIcon}>≡</Text>
        </TouchableOpacity>
        
        {/* Link Button */}
        <TouchableOpacity
          style={styles.toolButton}
          onPress={insertLink}
        >
          <Text style={styles.toolButtonText}>🔗</Text>
        </TouchableOpacity>
        
        {/* Image Button */}
        <TouchableOpacity
          style={styles.toolButton}
          onPress={insertImage2}
        >
          <Text style={styles.toolButtonText}>🖼️</Text>
        </TouchableOpacity>
        
        {/* Text Format (Tx) */}
        <TouchableOpacity
          style={styles.toolButton}
          onPress={() => setShowColorPicker(true)}
        >
          <Text style={styles.textFormatIcon}>T</Text>
          <Text style={styles.textFormatX}>×</Text>
        </TouchableOpacity>
        
      </View>
      
      {/* Text Editor */}
      <ScrollView style={styles.editorContainer}>
        <TextInput
          ref={(ref) => setTextInputRef(ref)}
          style={[styles.textEditor, getTextStyle()]}
          multiline={true}
          placeholder="เขียนรายละเอียดทั่วไปของคุณ..."
          placeholderTextColor="#999"
          value={editorState.content}
          onChangeText={handleContentChange}
          onSelectionChange={handleSelectionChange}
          textAlignVertical="top"
        />
      </ScrollView>

       {/*Link MOdal */}

       <LinkInputModal
    visible={showLinkInputModal}
    onClose={() => {
      setShowLinkInputModal(false);
      setTempUrl('');
      setTempLinkText('');
    }}
    url={tempUrl}
    setUrl={setTempUrl}
    linkText={tempLinkText}
    setLinkText={setTempLinkText}
    onSubmit={handleLinkSubmit}
  />

      {/* Input Modals */}
      <InputModal
        visible={showUrlInput}
        title="เพิ่มลิงก์"
        placeholder="กรุณาใส่ URL (เช่น https://example.com)"
        onClose={() => setShowUrlInput(false)}
        onSubmit={handleUrlSubmit}
      />

      <InputModal
        visible={showLinkTextInput}
        title="ข้อความลิงก์"
        placeholder="กรุณาใส่ข้อความที่จะแสดง"
        onClose={() => {
          setShowLinkTextInput(false);
          setTempUrl('');
        }}
        onSubmit={handleLinkTextSubmit}
      />

      <InputModal
        visible={showImageUrlInput}
        title="เพิ่มรูปภาพ"
        placeholder="กรุณาใส่ URL ของรูปภาพ"
        onClose={() => setShowImageUrlInput(false)}
        onSubmit={handleImageUrlSubmit}
      />

      {/* Color and Font Size Modals */}
      <ColorPicker
        visible={showColorPicker}
        onClose={() => setShowColorPicker(false)}
        onColorSelect={onColorSelect}
        currentColor={editorState.format.textColor}
      />

      <FontSizePicker
        visible={showFontSizePicker}
        onClose={() => setShowFontSizePicker(false)}
        onSizeSelect={onFontSizeSelect}
        currentSize={editorState.format.fontSize}
      />
    </View>
         </View>
        
      
     <view style={{marginLeft:20,marginRight:20}}>
      <Text style={{fontWeight:600,}}>ตัวอย่างโพสต์
      </Text>
     <View style={styles.card}>
  {/* Header Image Container */}
  <View style={styles.imageContainer}>
    {pickedFile2 ? (
      <Image source={{ uri: pickedFile2.uri }} style={styles.backgroundImage} />
    ) : (
      <View style={styles.placeholderImage} />
    )}
    
    {/* Date Badge - Top Left */}
    {formData.startDate && formData.endDate && (
      <View style={styles.dateBadge}>
        <Text style={styles.dateIcon}>📅</Text>
        <Text style={styles.dateText}>
          {formatDateRange(formData.startDate, formData.endDate)}
        </Text>
      </View>
    )}
    
    {/* Max Participant Badge - Top Right */}
    {maxParticipant && (
      <View style={styles.participantBadge}>
        <Image source={require('../assets/images/images/image14.png')} style={{width:15,height:12,marginRight:3}} />
        <Text style={styles.participantText}>ต้องการ {maxParticipant} คน</Text>
      </View>
    )}
  </View>

  {/* Content Below Image */}
  <View style={styles.content2}>
    {/* Trip Name */}
    {formData2.name && (
      <Text style={styles.tripName}>{formData2.name}</Text>
    )}

    {/* Destinations */}
    {selected.length > 0 && (
      <View style={styles.destinationRow}>
       

        <View style={styles.destinationContainer}>
          {selected.map((dest, index) => (
            <Text key={dest} style={styles.destinationText}>
              {dest}{index < selected.length - 1 ? ', ' : ''}
            </Text>
          ))}
        </View>
      </View>
    )}

    {/* Description */}
    {formData.description && (
      <Text style={styles.description}>{formData.description}</Text>
    )}

    {/* Editor Content */}
    {editorState.content && (
      <Text style={styles.description}>{editorState.content}</Text>
    )}

    {/* Services Tags */}
    <View style={styles.tagsContainer2}>
      {services.map(service =>
        isServiceChecked(service.id) ? (
          <View key={service.id} style={styles.serviceTag}>
            <Text style={styles.serviceTagText}>#{service.title}</Text>
          </View>
        ) : null
      )}
    </View>

    {/* Travel Styles */}
    <View style={styles.travelStylesContainer}>
      {categories
        .filter(category => selectedItems.includes(category.id))
        .map(category => (
          <View key={category.id} style={styles.categoryItem2}>
            <Image
              source={{ uri: category.iconImageUrl || 'https://via.placeholder.com/30x30' }}
              style={styles.categoryIcon}
            />
            <Text style={styles.categoryText2}>{category.title}</Text>
          </View>
        ))}
    </View>

    {/* Action Button */}
    <TouchableOpacity style={styles.joinButton}>
      <Text style={styles.joinButtonText}>สนใจเข้าร่วม</Text>
    </TouchableOpacity>
  </View>
</View>


    
        <view>
        </view>
        <View style={styles.checkboxContainer}>
        <TouchableOpacity onPress={() => setIsChecked(!isChecked)}>
          <View style={[styles.checkbox, isChecked && styles.checked]}>
            {isChecked && <Text></Text>}
          </View>
        </TouchableOpacity>
        <Text style={styles.text}>
          ฉันได้อ่านและยอมรับ{' '}
          <Text style={styles.linkText}>นโยบายและข้อตกลง</Text>
          ของแอปพลิเคชัน
        </Text>
      </View>  {/* New line */}
     </view>

      </ScrollView>

      <View style={{ flexDirection: 'row', borderTopWidth: 1, borderTopColor: '#e0e0e0' }}>
      {/* Submit Button 1 */}
      <View style={styles.submitContainer}>
        <TouchableOpacity style={styles.draftButton} onPress={()=>create("draft")}>
           {/*   <Ionicons name="send" size={20} color="#fff" /> */}
          <Text style={styles.draftText}>บันทึกแบบร่าง
          </Text>
        </TouchableOpacity>
       
      </View>

      {/* Submit Button 2 */}
      <View style={styles.submitContainer}>
        <TouchableOpacity style={styles.submitButton} onPress={()=>create("published")}>
        
          {/*   <Ionicons name="send" size={20} color="#fff" /> */}
          <Text style={styles.submitText}>โอเคดีงาม</Text>
        </TouchableOpacity>
        
      </View>
    </View>
    <Text style={styles.submitNote}>กรุณาตรวจสอบข้อมูลให้ถูกต้องก่อนส่ง</Text>
    
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
 
    paddingVertical: 12,
    borderBottomColor: '#e0e0e0',
  },
  backButton: {
    marginRight: 10,
  },
  headerTitle: {
    fontSize: 18,
    fontFamily:'Inter_500Medium',
    color: '#1F2937',
    flex: 1,
    textAlign: 'center',

    marginLeft:-20
  },
  content: {
    flex: 1,
    marginBottom:10
  },
  imageSection: {
    alignItems: 'center',
    marginVertical: 20,
  },
  imagePlaceholder: {
    width: 120,
    height: 120,
    backgroundColor: '#f0f0f0',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#e0e0e0',
    borderStyle: 'dashed',
  },
  imageText: {
    marginTop: 8,
    fontSize: 12,
    color: '#666',
  },
  formSection: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 16,
  },
  fieldContainer: {
    marginBottom: 20,
  },
  label: {
    fontWeight: '500',
    color: '#333',
    marginBottom:4
  },
  requiredText: {
    fontSize: 12,
    color: '#666',
    marginBottom: 8,
  },
  textInput: {
    borderWidth:1,
    borderColor: '#e0e0e0',
   
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    fontSize: 16,
    backgroundColor: '#fff',
    fontWeight:"600"
  },
  textInputFocused: {
    borderColor: 'transparent',
    outlineColor:'#e0e0e0',
    outlineWidth:1,
  },
  dateContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  dateField: {
    flex: 0.48,
  },
  dateLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#333',
    marginBottom: 8,
  },
  dateInput: {
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    fontSize: 14,
    backgroundColor: '#fff',
  },
  alignmentIcon: {
    fontSize: 16,
    color: '#333',
    fontWeight: 'bold',
  },
  tagsContainer: {
    marginBottom: 20,
  },
  tagButtons: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 8,
  },
  tagButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#f0f0f0',
    marginRight: 8,
    marginBottom: 8,
  },
  activeTag: {
    backgroundColor: '#4285f4',
  },
  tagText: {
    fontSize: 14,
    color: '#666',
  },
  activeTagText: {
    fontSize: 14,
    color: '#fff',
  },
  textArea: {
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    fontSize: 14,
    backgroundColor: '#fff',
    minHeight: 80,
    textAlignVertical: 'top',
    outlineColor:'#e0e0e0'
  },
  attachmentSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  attachmentText: {
    fontSize: 14,
    color: '#333',
  },
  attachmentCount: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  countNumber: {
    fontSize: 14,
    color: '#666',
  },
  checkboxSection: {
    marginBottom: 30,
  },
  checkboxContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 12,
    
  },
  checkboxRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 0.48,
    borderRadius:5,
    height:30,
    paddingHorizontal:4,
    backgroundColor:"#F9FAFBFF",
    marginHorizontal:5
    
  },
  checkbox: {
    width: 20,
    height: 20,
    borderWidth: 2,
    borderColor: '#ddd',
    borderRadius: 4,
    marginRight: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxInner: {
    width: 12,
    height: 12,
    borderRadius: 2,
  },
  checked: {
    backgroundColor: '#4285f4',
  },
  checkboxText: {
    fontSize: 14,
    color: '#333',
  },
  bottomSection: {
    alignItems: 'center',
    marginTop: 20,
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: '#f0f0f0',
    borderRadius: 8,
  },
  addButtonText: {
    marginLeft: 8,
    fontSize: 14,
    color: '#666',
  },
  submitContainer: {
    flex:0.5,
    backgroundColor: '#fff',
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  drafContainer: {
    flex:0.5,
    backgroundColor: '#fff',
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  submitButton: {
    flex:0.5,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#4285f4',
    paddingVertical: 16,
    borderRadius: 8,
    marginBottom: 8,
  },
  draftButton:{
    flex:0.5,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#E5E7EB',
    paddingVertical: 16,
    borderRadius: 8,
    marginBottom: 8,
  },
  draftText:{
    marginLeft: 8,
    fontSize: 16,
    fontWeight: '600',
  },
  submitText: {
    marginLeft: 8,
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
  submitNote: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
    marginTop:-25,
    marginBottom:20
  },
  uploadBox: {
    borderWidth: 2,
    borderColor: '#E5E7EB',
    borderStyle: 'solid',
    borderRadius: 12,
    alignItems: 'center',
    minHeight: 270,
    backgroundColor:'#E5E7EB',
    verticalAlign:'middle',
    marginBottom:12

  },
  uploadPlaceholder: {
    marginTop:46,
    alignItems: 'center',
    verticalAlign:'middle'
  },
  container2:{
  
     
  },
  personIcon: {
    width: 64,
    height: 64,
    backgroundColor: '#E5E7EB',
    borderRadius: 9999,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 5,
  },
  uploadText: {
    fontSize: 14,
    fontFamily:"Inter_500Medium",
    color: '#374151',
    marginBottom: 4,
    lineHeight: 14,
  },
  uploadedImage: {
    width: '100%',
    flex: 1,
    borderRadius: 8,
    resizeMode: 'cover',
    minHeight: 200,
  },
  uploadSubtext: {
    fontSize: 12,
    fontFamily:'Inter_400Regular',
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 12,
  },
  title: {
    fontSize: 16,
    color: '#333',
    fontWeight: '800',
    marginBottom: 14,
    lineHeight: 24,
    fontFamily:'Inter_900Black'
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666',
  },
  categoriesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  categoryItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
    height:38,
    borderRadius: 30,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  selectedItem: {
    backgroundColor: 'rgba(99, 102, 241, 0.1)', // 10% opacity of #6366f1
    borderColor: '#6366f1',
  },
  selectedText: {
    color: '#6366f1',
  },
  categoryText: {
    marginLeft: 8,
    fontSize: 14,
    color: '#666',
    fontWeight: '700',
  },
  toolbarButton: {
    paddingHorizontal: 8,
    paddingVertical: 6,
    borderRadius: 4,
    marginRight: 4,
  },
  activeButton: {
    backgroundColor: '#007bff',
  },
  toolbarButtonText: {
    fontSize: 14,
    color: '#333',
    fontWeight: '500',
  },
  activeButtonText: {
    color: '#fff',
  },

  toolbar: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 8,
    marginBottom: 8,
    elevation: 2,
    shadowColor: '#000',
    shadowRadius: 2,
    flexWrap: 'wrap',
    alignItems: 'center',
  }, 
   dropdown: {
    position: 'absolute',         
    top: 52,                     
    left: 0,                    
    right: 0,                    
    backgroundColor: '#FFFFFF',  
    borderWidth: 1,
    borderColor: 'black',      
    borderTopWidth: 0,         
    borderBottomLeftRadius: 8,   
    borderBottomRightRadius: 8,
    maxHeight: 200,              
    zIndex: 1002,                
    elevation: 5,              
    shadowColor: '#000',        
    shadowOffset: {
      width: 0,
      height: 2,
    },shadowOpacity: 0.1,
    shadowRadius: 4,
    
  },
  
  dropdownText: {
    fontSize: 14,
    color: '#333',
    marginRight: 4,
  },
  dropdownArrow: {
    fontSize: 10,
    color: '#666',
  },

  formatButton: {
    minWidth: 32,
    alignItems: 'center',
  },
  italicButton: {
    fontStyle: 'italic',
  },
  underlineButton: {
    textDecorationLine: 'underline',
  },
  listButton: {
    minWidth: 32,
    alignItems: 'center',
  },
  toolButton: {
    paddingHorizontal: 8,
    paddingVertical: 6,
    marginRight: 4,
  },
  toolButtonText: {
    fontSize: 14,
    color: '#666',
  },

  editorContainer: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 8,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    borderWidth:0.1
  },
  textEditor: {
    flex: 1,
    padding: 16,
    fontSize: 16,
    lineHeight: 24,
    borderRadius:8,
    color: '#333',
    fontFamily: 'System', // Supports Thai characters
    minHeight: 200,
    outlineColor:'#e0e0e0'
  },
  dateInputError: {
    borderColor: '#FF6B6B',
    borderWidth: 1,
  },
  calendarIcon: {
    width: 20,
    height: 20,
    borderRadius: 3,
    position: 'relative',
  },
  calendarTop: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingTop: 2,
    paddingHorizontal: 3,
  },
  calendarHook: {
    width: 2,
    height: 3,
    backgroundColor: 'white',
    borderRadius: 1,
  },
  calendarBody: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingHorizontal: 3,
    paddingTop: 2,
    flex: 1,
  },
  calendarDot: {
    width: 2,
    height: 2,
    backgroundColor: 'white',
    borderRadius: 1,
    margin: 1,
  },
  wordCount: {
    position: 'absolute',
    bottom: 8,
    right: 12,
    fontSize: 12,
    color: '#888',
  },
  text: {
    flex: 1,
    fontSize: 16,
    lineHeight: 22,
  },
  linkText: {
    color: 'blue',
    textDecorationLine: 'underline',
  },
  input: {
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    fontSize: 16,
    fontFamily: 'Inter_400Regular',
    lineHeight: 24,
    color: '#374151',
    height: 50,
    backgroundColor: '#FFFFFF',
    outlineColor:'#e0e0e0'
  },
  dropdownItem: {
    paddingHorizontal: 12,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
    backgroundColor: '#FFFFFF',
  },
  emptyText: {
    padding: 10,
    textAlign: 'center',
    color: '#999',
    fontStyle: 'italic'
  },
  selectedContainer: { 
    marginTop: 10,
   
    },
  selectedGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap:5,
    
  },
  container4: {
    flex: 4,
    backgroundColor: 'white',
    position: 'relative',         
    zIndex: 1000,
    maxHeight:120,
    overflowY:'auto',
    marginTop:20,
  },
  selectedButton: {
    backgroundColor: '#4F46E51A',
    borderWidth: 1,
    paddingHorizontal:8,
    paddingVertical:7,
    borderRadius: 9999,
    borderColor:'#4F46E5',
    minWidth: 84.09,   
    height:38,
    alignItems: 'center',
    justifyContent:'center'
  },
  selectedButtonText: {
    color: '#4F46E5',
    fontFamily:'Inter_400Regular',
    fontSize: 14,
  },
  container3: {
    flex: 4,
    backgroundColor: 'white',
    position: 'relative',         
    zIndex: 1000,               
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  colorPickerContainer: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    margin: 20,
    maxWidth: 300,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 16,
    color: '#333',
  },
  colorGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    marginBottom: 16,
  },
  colorOption: {
    width: 40,
    height: 40,
    borderRadius: 20,
    margin: 4,
    borderWidth: 2,
    borderColor: '#ddd',
  },
  selectedColor: {
    borderColor: '#007bff',
    borderWidth: 3,
  },
  modalCloseButton: {
    backgroundColor: '#007bff',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 8,
  },
  modalCloseText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '500',
  },
  fontSizeContainer: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    margin: 20,
    maxWidth: 250,
  },
  fontSizeOption: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  selectedFontSize: {
    backgroundColor: '#f0f8ff',
  },
  fontSizeText: {
    color: '#333',
  },
  headerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  colorButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 4,
    borderWidth: 2,
    borderColor: '#ddd',
  },
  colorButtonText: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  statusBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: '#f8f9fa',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 4,
    marginTop: 8,
  },
  statusText: {
    fontSize: 12,
    color: '#666',
  },
  textFormatIcon: {
    fontSize: 14,
    color: '#333',
    fontWeight: 'bold',
    fontStyle: 'italic',
  },
  textFormatX: {
    fontSize: 10,
    color: '#666',
    position: 'absolute',
    right: 2,
    bottom: 2,
  },
  selectedTravelStylesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginVertical: 10,
    gap: 8, 
  },
  inputModalContainer: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 24,
    margin: 20,
    minWidth: 300,
  },
  modalInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
    marginBottom: 20,
    backgroundColor: '#f9f9f9',
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  modalCancelButton: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    backgroundColor: '#f5f5f5',
    flex: 1,
    marginRight: 8,
  },
  modalSubmitButton: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    backgroundColor: '#007bff',
    flex: 1,
    marginLeft: 8,
  },
  modalCancelText: {
    color: '#666',
    fontSize: 16,
    fontWeight: '500',
    textAlign: 'center',
  },
  modalSubmitText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '500',
    textAlign: 'center',
  },
  
  card: {
    backgroundColor: 'white',
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 8,
    margin: 16,
  },
  imageContainer: {
    height: 270,
    position: 'relative',
  },
  backgroundImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  placeholderImage: {
    width: '100%',
    height: '100%',
    backgroundColor: '#E5E7EB',
    borderRadius: 12,
  },
  dateBadge: {
    position: 'absolute',
    top: 16,
    left: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    flexDirection: 'row',
    alignItems: 'center',
  },
  dateIcon: {
    fontSize: 14,
    marginRight: 4,
  },
  dateText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#333',
  },
  participantBadge: {
    position: 'absolute',
    top: 16,
    right: 16,
    backgroundColor: '#6366f1',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    flexDirection: 'row',
    alignItems: 'center',
  },
  participantIcon: {
    fontSize: 14,
    marginRight: 4,
  },
  participantText: {
    fontSize: 12,
    fontWeight: '500',
    color: 'white',
  },
  content2: {
    padding: 16,
  },
  tripName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 8,
  },
  destinationRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginBottom: 8,
  },
  locationIcon: {
    fontSize: 14,
    marginRight: 6,
  },
  destinationContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    flex: 1,
  },
  destinationText: {
    fontSize: 14,
    color: '#6b7280',
  },
  description: {
    fontSize: 14,
    color: '#4b5563',
    lineHeight: 20,
    marginBottom: 12,
  },
  tagsContainer2: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 12,
  },
  serviceTag: {
    backgroundColor: '#dbeafe',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginRight: 8,
    marginBottom: 4,
  },
  serviceTagText: {
    color: '#2563eb',
    fontSize: 12,
    fontWeight: '500',
  },
  travelStylesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 16,
  },
  categoryItem2: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f3f4f6',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginRight: 8,
    marginBottom: 4,
  },
  categoryIcon: {
    width: 14,
    height: 12,
    tintColor: '#6366f1',
    marginRight: 6,
  },
  categoryText2: {
    fontSize: 12,
    color: '#6366f1',
    fontWeight: '500',
  },
  joinButton: {
    backgroundColor: '#6366f1',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 9,
    alignSelf: 'flex-end',
  },
  joinButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '400',
    textAlign: 'center',
  },

  calendarContainer: {
    backgroundColor: 'white',
    borderRadius: 10,
    margin: 20,
    maxHeight: '80%',
    width: '90%',
  },
  calendarHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5E5',
  },
  calendarTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  closeButton: {
    width: 30,
    height: 30,
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeButtonText: {
    fontSize: 18,
    color: '#666',
  },

  fontDropdownContainer: {
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 16,
    margin: 20,
    maxHeight: 400,
    minWidth: 200,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  dropdownTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
    textAlign: 'center',
    color: '#333',
  },
  fontList: {
    maxHeight: 300,
  },
  fontItem: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    borderRadius: 4,
    marginBottom: 2,
  },
  selectedFontItem: {
    backgroundColor: '#007AFF',
  },
  fontItemText: {
    fontSize: 16,
    color: '#333',
  },
  selectedFontText: {
    color: 'white',
    fontWeight: 'bold',
  },
  fontButtonText: {
    fontSize: 12,
    color: '#333',
    fontWeight: '500',
  },

  modalContent: {
    width: '80%',
    backgroundColor: '#ffffff',
    padding: 16,
    borderRadius: 8,
    elevation: 4,
  },

  modalActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 8,
  },
  
});

export default ThaiFormScreen;