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
import DateTimePicker from '@react-native-community/datetimepicker';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';


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
  interface TravelStyleResponse {
    data: Category[];
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

// Font Size Picker Component
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
    const [pickedFile2, setPickedFile2] = useState<PickedFile | null>(null);
    const [selfieError, setSelfieError] = useState(false);
     
    const [categories, setCategories] = useState<Category[]>([]);
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [services, setServices] = useState<Service[]>([]);
const [selectedServices, setSelectedServices] = useState<string[]>([]);

  const [formData, setFormData] = useState({
    name: '',
    startDate: '',
    endDate: '',
    description: '',
    selectedOptions: [] as string[],
    attachments: 0,
  });

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

   const handleSubmit=()=>{
    let hasError = false;
    if (!pickImage2) {
        setSelfieError(true);
        hasError = true;
      } else {
        setSelfieError(false);
      }
   }

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
      textAlign: 'left'
    },
    selectionStart: 0,
    selectionEnd: 0
  });

  const [showColorPicker, setShowColorPicker] = useState(false);
  const [showFontSizePicker, setShowFontSizePicker] = useState(false);
  const [textInputRef, setTextInputRef] = useState<TextInput | null>(null);
  const [listCounter, setListCounter] = useState(1);

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

  const insertCheckList = () => {
    const cursor = editorState.selectionStart;
    const beforeCursor = editorState.content.substring(0, cursor);
    const afterCursor = editorState.content.substring(cursor);
    const newContent = beforeCursor + '\n☐ ' + afterCursor;
    
    setEditorState(prev => ({
      ...prev,
      content: newContent
    }));
  };

  // Insert link function
  const insertLink = () => {
    Alert.prompt(
      'เพิ่มลิงก์',
      'กรุณาใส่ URL:',
      [
        { text: 'ยกเลิก', style: 'cancel' },
        {
          text: 'เพิ่ม',
          onPress: (url) => {
            if (url) {
              Alert.prompt(
                'ข้อความลิงก์',
                'กรุณาใส่ข้อความที่จะแสดง:',
                [
                  { text: 'ยกเลิก', style: 'cancel' },
                  {
                    text: 'เพิ่ม',
                    onPress: (linkText) => {
                      const displayText = linkText || url;
                      const cursor = editorState.selectionStart;
                      const beforeCursor = editorState.content.substring(0, cursor);
                      const afterCursor = editorState.content.substring(cursor);
                      const newContent = beforeCursor + `[${displayText}](${url})` + afterCursor;
                      
                      setEditorState(prev => ({
                        ...prev,
                        content: newContent
                      }));
                    }
                  }
                ]
              );
            }
          }
        }
      ]
    );
  };

  // Insert image placeholder
  const insertImage = () => {
    Alert.alert(
      'เพิ่มรูปภาพ',
      'เลือกวิธีการเพิ่มรูปภาพ:',
      [
        { text: 'ยกเลิก', style: 'cancel' },
        {
          text: 'URL รูปภาพ',
          onPress: () => {
            Alert.prompt(
              'URL รูปภาพ',
              'กรุณาใส่ URL ของรูปภาพ:',
              [
                { text: 'ยกเลิก', style: 'cancel' },
                {
                  text: 'เพิ่ม',
                  onPress: (imageUrl) => {
                    if (imageUrl) {
                      const cursor = editorState.selectionStart;
                      const beforeCursor = editorState.content.substring(0, cursor);
                      const afterCursor = editorState.content.substring(cursor);
                      const newContent = beforeCursor + `\n[รูปภาพ: ${imageUrl}]\n` + afterCursor;
                      
                      setEditorState(prev => ({
                        ...prev,
                        content: newContent
                      }));
                    }
                  }
                }
              ]
            );
          }
        },
        {
          text: 'Placeholder',
          onPress: () => {
            const cursor = editorState.selectionStart;
            const beforeCursor = editorState.content.substring(0, cursor);
            const afterCursor = editorState.content.substring(cursor);
            const newContent = beforeCursor + '\n[📷 รูปภาพ]\n' + afterCursor;
            
            setEditorState(prev => ({
              ...prev,
              content: newContent
            }));
          }
        }
      ]
    );
  };

  const handleContentChange = (text: string) => {
    setEditorState(prev => ({
      ...prev,
      content: text
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
    };
  };

  // Clear formatting
  const clearFormatting = () => {
    setEditorState(prev => ({
      ...prev,
      format: {
        bold: false,
        italic: false,
        underline: false,
        fontSize: 16,
        textColor: '#000000',
        backgroundColor: '#ffffff',
        textAlign: 'left'
      }
    }));
  };

  // Get word count
  const getWordCount = () => {
    return editorState.content.trim().split(/\s+/).filter(word => word.length > 0).length;
  };

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
  const CalendarIcon = ({ color = '#6366F1' }) => (
    <View style={[styles.calendarIcon, { backgroundColor: color }]}>
      <View style={styles.calendarTop}>
        <View style={styles.calendarHook} />
        <View style={styles.calendarHook} />
      </View>
      <View style={styles.calendarBody}>
        <View style={styles.calendarDot} />
        <View style={styles.calendarDot} />
        <View style={styles.calendarDot} />
        <View style={styles.calendarDot} />
      </View>
    </View>
  );

  
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
  
  const [formData2, setFormData2] = useState({ name: '' });

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
  
  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <Stack.Screen options={{ headerShown: false }} />
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton}>
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
        style={styles.textInput}
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
    />
  </View>
  <View style={styles.dateField}>
    <Text style={styles.dateLabel}>วันที่สิ้นสุด</Text>
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
    />
  </View>
</View> 
{/* Max Participants */}
      <Text style={{marginLeft:2,marginBottom:6}}>จํานวนคน
      </Text>
     <View style={styles.dateContainer}>

    
     <View style={{flex:0.40,flexDirection:'row',alignItems:'center',backgroundColor:'#E5E7EB',height:40,paddingHorizontal:4,borderRadius:8}}>
     <Image
        source={require('../assets/images/images/image11.png')} // Replace with your image path
        style={{height:16,width:16,marginHorizontal:3}}
        resizeMode="contain"
      />
      <TextInput style={{width:100,height:'80%',paddingHorizontal:5}}
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
     <View style={{flexDirection:'row',alignItems:'center',backgroundColor:'#E5E7EB',height:45,borderRadius:8,justifyContent:'space-between',marginBottom:30}}>
     <Image
        source={require('../assets/images/images/image12.png')} // Replace with your image path
        style={{height:16,width:16,marginHorizontal:3}}
        resizeMode="contain"
      />
      <Text style={{marginLeft:5,marginRight:10,width:100}}>ราคาต่อคน
      </Text>
       <TextInput style={{width:'100%',height:'70%',paddingHorizontal:5}}
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
      <View style={styles.container3}>
  <TouchableOpacity onPress={() => setDropdownOpen(!dropdownOpen)}>
    <View>
      {dropdownOpen ? (
    
        <TextInput
          style={styles.input}
          placeholder="ค้นหาสถานที่"
          value={searchText}
          onChangeText={setSearchText}
          autoFocus={true}
        />
      ) : (
        <Text style={styles.input}><Image source={require('../assets/images/images/image9.png')} style={{width:16,height:16,}}/>{' '} ค้นหาสถานที่</Text>
      )}
    </View>
  </TouchableOpacity>

  {dropdownOpen && (
    <View style={styles.dropdown}>
      {loading ? (
        <ActivityIndicator size="small" />
      ) : (
        <FlatList
          data={filteredDestinations} // Use filtered data
          keyExtractor={item => item}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={styles.dropdownItem}
              onPress={() => addDestination(item)}
            >
              <Text>{item}</Text>
            </TouchableOpacity>
          )}
          ListEmptyComponent={
            <Text style={styles.emptyText}>ไม่พบสถานที่ที่ค้นหา</Text>
          }
        />
      )}
    </View>
  )}

  <View style={styles.selectedContainer}>
    <View style={styles.selectedGrid}>
      {selected.map(dest => (
        <TouchableOpacity
          key={dest}
          style={styles.selectedButton}
          onPress={() => removeDestination(dest)}
        >
          <Text style={styles.selectedButtonText}>
            {dest} <Text style={{fontSize: 16}}>×</Text>
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  </View>
</View>


       {/* Description Field */}
       <View style={styles.fieldContainer}>
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
      <View style={styles.container2}>
             {/* Header */}
      <View style={styles.headerContainer}>
        <Text style={styles.header}>รายละเอียดทั่วไป</Text>
        <Text style={styles.wordCount}>จำนวนคำ: {getWordCount()}</Text>
      </View>
      
      {/* Toolbar - Only tools from image */}
      <View style={styles.toolbar}>
        {/* Font Size Dropdown */}
        <TouchableOpacity 
          style={styles.dropdown}
          onPress={() => setShowFontSizePicker(true)}
        >
          <Text style={styles.dropdownText}>Normal</Text>
          <Text style={styles.dropdownArrow}>▼</Text>
        </TouchableOpacity>
        
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
          onPress={insertImage}
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

      {/* Status Bar 
      <View style={styles.statusBar}>
        <Text style={styles.statusText}>
          ตำแหน่งเคอร์เซอร์: {editorState.selectionStart}
        </Text>
        <Text style={styles.statusText}>
          ตัวอักษร: {editorState.content.length}
        </Text>
      </View>*/}

      {/* Modals */}
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
     <View>
  {pickedFile2 ? (
    <Image source={{ uri: pickedFile2.uri }} style={styles.uploadedImage} />
  ) : (
    
    <view style={{height:270,backgroundColor:'#E5E7EB',borderRadius:12}}></view>
  )}

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
</View>


    
        <view>
        </view>
     </view>
   
      </ScrollView>

      <View style={{ flexDirection: 'row', borderTopWidth: 1, borderTopColor: '#e0e0e0' }}>
      {/* Submit Button 1 */}
      <View style={styles.submitContainer}>
        <TouchableOpacity style={styles.draftButton}>
           {/*   <Ionicons name="send" size={20} color="#fff" /> */}
          <Text style={styles.draftText}>บันทึกแบบร่าง
          </Text>
        </TouchableOpacity>
       
      </View>

      {/* Submit Button 2 */}
      <View style={styles.submitContainer}>
        <TouchableOpacity style={styles.submitButton}>
        
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
    backgroundColor:"#E5E7EB",
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
    padding: 24,
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
    height: 120,
    borderRadius: 8,
    resizeMode:'contain'
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
    borderColor: '#D1D5DB',      
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
    
    paddingBottom:120},
  selectedGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap:5
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
    flex: 1,
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
});

export default ThaiFormScreen;