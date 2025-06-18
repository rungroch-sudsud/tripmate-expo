import React,{useState,useEffect,useRef}  from  'react'
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
import { auth } from '../firebaseConfig';
import { Ionicons } from '@expo/vector-icons';
import { router,Stack,useLocalSearchParams } from 'expo-router';
import { launchImageLibrary } from 'react-native-image-picker';
import {axiosInstance} from '../lib/axios'
import '@expo-google-fonts/inter'
import {Calendar} from 'react-native-calendars'
import AsyncStorage from '@react-native-async-storage/async-storage';
import { CameraType } from 'expo-image-picker';
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



  



const EditTrip=()=>{
  const params = useLocalSearchParams();
  const tripId = params.tripId;
    const [pickedFile2, setPickedFile2] = useState<PickedFile | null>(null);
    const [selfieError, setSelfieError] = useState(false);
     
    const [categories, setCategories] = useState<Category[]>([]);
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [services, setServices] = useState<Service[]>([]);
const [selectedServices, setSelectedServices] = useState<string[]>([]);
const [showStartDatePicker, setShowStartDatePicker] = useState(false);
const [showEndDatePicker, setShowEndDatePicker] = useState(false);
const [trip, setTrip] = useState(null);
const [error, setError] = useState(null);
const [tripData,setTripData]=useState<Trip | null>(null)

  const [formData, setFormData] = useState({
    name: '',
    startDate: '',
    endDate: '',
    description: '',
    selectedOptions: [] as string[],
    attachments: 0,
  });

  const handleBack=async()=>{
    router.push('/findTrips')
  }
  

  const insertImage2=async()=>{
    console.log("Insert Image");
    
  }
  
   // For services
  const toggleServiceCheckbox = (id: string) => {
    setSelectedServices(prev =>
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
  };
  
  const isServiceChecked = (id: string) => selectedServices.includes(id);

  
  const toggleSelection = (id: string): void => {
    setSelectedItems(prev =>
      prev.includes(id)
        ? prev.filter(item => item !== id)
        : [...prev, id]
    );
  };

  const fetchTripById = async (): Promise<void> => {
    try {
      setLoading(true);
      const response = await axiosInstance.get(`trips/${tripId}`);
      console.log(response.data.data);
      setTrip(response.data.data);

      
    } catch (err) {
      console.error('Error fetching trip:', err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(()=>{
     console.log("Trip Updated: ",trip);
     
  },[trip])
  
  useEffect(() => {
    if (tripId) {
      fetchTripById();
    }
  }, [tripId]);
  //INitially Adding

  useEffect(() => {
    if (trip) {

      setFormData2(prev => ({ 
        ...prev, 
        name: trip.name,
        // add other fields too
      }));
      // Convert from "2025-06-13" to "13/06/2025" format
      const formatApiDateToDisplay = (apiDate: string) => {
        const date = new Date(apiDate);
        const day = date.getDate().toString().padStart(2, '0');
        const month = (date.getMonth() + 1).toString().padStart(2, '0');
        const year = date.getFullYear();
        return `${day}/${month}/${year}`;
      };
  
      setFormData(prev => ({
        ...prev,
        startDate: formatApiDateToDisplay(trip.startDate),
        endDate: formatApiDateToDisplay(trip.endDate),
        description: trip.groupAtmosphere,
      }));
      
       setmaxParticipant(trip.maxParticipants)
       setpricePerPerson(trip.pricePerPerson)


        if(services.length>0){
          const initialSelectedServices = services
      .filter(service => trip.includedServices.includes(service.title))
      .map(service => service.id);
    
    setSelectedServices(initialSelectedServices);
        }


        if(categories.length>0){
          const initialSelectedStyles = categories
      .filter(category => trip.travelStyles.includes(category.title))
      .map(category => category.id);
    
    setSelectedItems(initialSelectedStyles);
        }

      setSelected(trip.destinations);
      setEditorState(prev => ({
        ...prev,
        content: trip.detail
      }));
    }
  }, [trip,services,categories]);
  ////////////////////////////////////////////////////////////////////////////////////////////////////////////////

  const fetchServices = async (): Promise<void> => {
    try {
      setLoading(true);
  
      const response = await axiosInstance.get('/services');
      const result: ServicesResponse = response.data;
  
      const mappedServices: Service[] = result.data.map(item => ({
        id: item.id,
        title: item.title,
      }));
      console.log(response.data);
      
  
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
       console.log(response.data.data);
       
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


  //Rich Text Editor
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
  const changeFontFamily = (fontFamily: string) => {
    setEditorState(prev => ({
      ...prev,
      format: { ...prev.format, fontFamily }
    }));
    setShowFontDropdown(false);
  };  
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

  //////////////////////////////////////////////////////////////////////////////////////////////////
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
  const pad = (n: number): string => (n < 10 ? `0${n}` : `${n}`);
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

  const ensureFreshToken = async (): Promise<string> => {
    if (!auth.currentUser) {
      throw new Error('User not authenticated');
    }
  
    try {
      // Force refresh to get a fresh token
      const freshToken = await auth.currentUser.getIdToken(true);
      await AsyncStorage.setItem('googleIdToken', freshToken);
      console.log('✅ Fresh token generated and stored');
      return freshToken;
    } catch (error) {
      console.error('❌ Failed to generate fresh token:', error);
      throw new Error('Failed to refresh authentication token');
    }
  };
  
  // Helper function to validate token
  const validateStoredToken = async (): Promise<boolean> => {
    const googleIdToken = await AsyncStorage.getItem('googleIdToken');
    
    if (!googleIdToken) {
      console.log('❌ No stored token found');
      return false;
    }
  
    try {
      const tokenParts = googleIdToken.split('.');
      if (tokenParts.length !== 3) return false;
  
      const payload = JSON.parse(atob(tokenParts[1]));
      const currentTime = Math.floor(Date.now() / 1000);
      const isExpired = payload.exp <= currentTime;
      
      console.log('Token validation:', {
        userId: payload.user_id || payload.sub,
        expiresAt: new Date(payload.exp * 1000),
        isExpired
      });
      
      return !isExpired;
    } catch (error) {
      console.log('Could not decode token:', error);
      return false;
    }
  };
  
  // Helper function to debug authentication state
  const debugAuthState = async (): Promise<void> => {
    const userId = await AsyncStorage.getItem('userId');
    const googleIdToken = await AsyncStorage.getItem('googleIdToken');
    const googleAccessToken = await AsyncStorage.getItem('googleAccessToken');
    
    console.log('=== FRONTEND DEBUG ===');
    console.log('User ID from AsyncStorage:', userId);
    console.log('Google ID Token exists:', !!googleIdToken);
    console.log('Google Access Token exists:', !!googleAccessToken);
    console.log('Firebase currentUser:', auth.currentUser ? 'EXISTS' : 'NULL');
    console.log('Firebase currentUser UID:', auth.currentUser?.uid || 'N/A');
    console.log('Trip ID being updated:', tripId);
    console.log('Trip owner from trip object:', trip?.tripOwner || trip?.userId || 'Not found');
    console.log('====================');
  };
  
  // Helper function to prepare request body
  const prepareRequestBody = () => {
    // Helper function to safely map IDs to titles
    const mapIdsToTitles = <T extends { id: string; title: string }>(
      selectedIds: string[],
      sourceArray: T[]
    ): string[] => {
      return selectedIds
        .map(id => sourceArray.find(item => item.id === id)?.title)
        .filter((title): title is string => Boolean(title));
    };
  
    return {
      name: formData2.name.trim(),
      startDate: formatDisplayDateToApi(formData.startDate),
      endDate: formatDisplayDateToApi(formData.endDate),
      destinations: selected || [],
      maxParticipants: maxParticipant || 0,
      pricePerPerson: pricePerPerson || 0,
      includedServices: mapIdsToTitles(selectedServices || [], services || []),
      detail: editorState?.content || '',
      travelStyles: mapIdsToTitles(selectedItems || [], categories || []),
      groupAtmosphere: formData?.description || '',
      tripCoverImageFile: trip?.tripCoverImageUrl || '',
      status: "published"
    };
  };


  const [validationErrors, setValidationErrors] = useState({});

  const ErrorText = ({ error }) => {
    if (!error) return null;
    return (
      <Text style={styles.errorText}>
        {error}
      </Text>
    );
  };
  
  // 5. Complete validation function
  const validateForm = () => {
    const errors = {};
  
    // Trip cover image validation
    if (!trip?.tripCoverImageUrl) {
      errors.coverImage = 'กรุณาเลือกรูปภาพปก';
    }
  
    // Trip name validation
    if (!formData2.name || formData2.name.trim() === '') {
      errors.tripName = 'กรุณาใส่ชื่อทริป';
    }
  
    // Start date validation
    if (!formData.startDate) {
      errors.startDate = 'กรุณาเลือกวันที่เริ่มต้น';
    } else if (!validateDate(formData.startDate)) {
      errors.startDate = 'รูปแบบวันที่ไม่ถูกต้อง';
    }
  
    // End date validation
    if (!formData.endDate) {
      errors.endDate = 'กรุณาเลือกวันที่สิ้นสุด';
    } else if (!validateDate(formData.endDate)) {
      errors.endDate = 'รูปแบบวันที่ไม่ถูกต้อง';
    }
  
    // Date range validation
    if (formData.startDate && formData.endDate && validateDate(formData.startDate) && validateDate(formData.endDate)) {
      const startDateObj = parseDate(formData.startDate);
      const endDateObj = parseDate(formData.endDate);
      if (endDateObj <= startDateObj) {
        errors.dateRange = 'วันที่สิ้นสุดต้องมากกว่าวันที่เริ่มต้น';
      }
    }
  
    // Max participants validation
    if (!maxParticipant || maxParticipant === '' || parseInt(maxParticipant) <= 0) {
      errors.maxParticipant = 'กรุณาใส่จำนวนคนที่ต้องการ';
    }
  
    // Price per person validation
    if (!pricePerPerson || pricePerPerson === '' || parseFloat(pricePerPerson) <= 0) {
      errors.pricePerPerson = 'กรุณาใส่ราคาต่อคน';
    }
  
    // Services validation
    const hasSelectedService = services.some(service => isServiceChecked(service.id));
    if (!hasSelectedService) {
      errors.services = 'กรุณาเลือกสิ่งที่รวมในราคาอย่างน้อย 1 รายการ';
    }
  
    // Travel style validation
    if (selectedItems.length === 0) {
      errors.travelStyle = 'กรุณาเลือกสไตล์การเที่ยวอย่างน้อย 1 รายการ';
    }
  
    // Destination validation
    if (selected.length === 0) {
      errors.destinations = 'กรุณาเลือกสถานที่ท่องเที่ยวอย่างน้อย 1 แห่ง';
    }
  
    // Description validation
    if (!formData.description || formData.description.trim() === '') {
      errors.description = 'กรุณาใส่บรรยากาศ/โทนกลุ่ม';
    }
  
    // General details validation
    if (!editorState.content || editorState.content.trim() === '') {
      errors.generalDetails = 'กรุณาใส่รายละเอียดทั่วไป';
    }
  
    return errors;
  };
  
  // 6. Helper function
  const parseDate = (dateString) => {
    const [day, month, year] = dateString.split('/').map(num => parseInt(num));
    return new Date(year, month - 1, day);
  };
  

  const scrollViewRef = useRef(null);

  const editTrip = async (): Promise<void> => {


    const errors = validateForm();
  
  if (Object.keys(errors).length > 0) {
    setValidationErrors(errors);
    
   
    const firstError = Object.values(errors)[0];
    
    // Scroll to top to show errors
    if (scrollViewRef.current) {
      scrollViewRef.current.scrollTo({ y: 0, animated: true });
    }
    
    return;
  }

  // Clear validation errors if form is valid
  setValidationErrors({});
    try {
      console.log("Trip Editing...");
      
      // Debug current auth state
      await debugAuthState();
      
      // Validate user authentication
      const userId = await AsyncStorage.getItem('userId');
      if (!userId) {
        throw new Error('User ID not found in storage');
      }
  
      // Validate required form fields
      if (!formData2?.name || !formData?.startDate || !formData?.endDate) {
        throw new Error('Missing required trip information');
      }
  
      // Ensure we have a fresh, valid token
      const isTokenValid = await validateStoredToken();
      if (!isTokenValid) {
        console.log('🔄 Token invalid or expired, refreshing...');
        await ensureFreshToken();
      }
  
      // Prepare the request body
      const requestBody = prepareRequestBody();
      
      console.log('Updating trip with data:', requestBody);
      console.log('Axios headers:', axiosInstance.defaults.headers);
  
      // Make the API call
      const response = await axiosInstance.put(`/trips/${tripId}`, requestBody);
      
      console.log("✅ Trip updated successfully:", response.data);
      router.push('/findTrips')
      
      // Handle success
      // showSuccessMessage('Trip updated successfully!');
      // router.back(); 
      // or 
      // router.push(`/trips/${tripId}`);
      
    } catch (error) {
      console.error('❌ Error updating trip:', error);
      
      // Enhanced error handling
      if (error instanceof Error) {
        console.error('Error message:', error.message);
        
        // Handle specific authentication errors
        if (error.message.includes('authentication') || error.message.includes('token')) {
          // showErrorMessage('Authentication expired. Please log in again.');
          // Optionally redirect to login
        } else if (error.message.includes('Missing required')) {
          // showErrorMessage('Please fill in all required fields');
        } else {
          // showErrorMessage(error.message);
        }
      } else if (error?.response) {
        // Axios error with response
        console.error('API Error Status:', error.response.status);
        console.error('API Error Data:', error.response.data);
        
        const errorMessage = error.response.data?.message || 'Failed to update trip';
        
        // Handle specific HTTP status codes
        switch (error.response.status) {
          case 401:
            // showErrorMessage('Authentication expired. Please log in again.');
            // Redirect to login
            break;
          case 403:
            // showErrorMessage('You do not have permission to edit this trip.');
            break;
          case 404:
            // showErrorMessage('Trip not found.');
            break;
          case 422:
            // showErrorMessage('Invalid trip data. Please check your inputs.');
            break;
          default:
            // showErrorMessage(errorMessage);
        }
      } else {
        console.error('Unknown error occurred');
        // showErrorMessage('An unexpected error occurred. Please try again.');
      }
      
      // Optionally re-throw the error if you want calling code to handle it
      // throw error;
    }
  };
  // Helper function to convert display date back to API format
  const formatDisplayDateToApi = (displayDate: string) => {
    // Convert "13/06/2025" back to "2025-06-13"
    const [day, month, year] = displayDate.split('/');
    return `${year}-${month}-${day}`;
  };

  return(
   <SafeAreaView style={styles.container}>
    {/* HEader */}
    <Stack.Screen options={{ headerShown: false }} />
    <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={handleBack}>
          <Ionicons name="chevron-back" size={24} color="#000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>สร้างทริปใหม่</Text>
      </View>


      <ScrollView 
  ref={scrollViewRef}
  style={styles.content} 
  showsVerticalScrollIndicator={false}
>
      <View style={styles.formSection}>
         <TouchableOpacity style={[
                styles.uploadBox,
                selfieError && { borderColor: 'red', borderWidth: 1 }
              ]}>
           {trip && (
  <Image style={styles.uploadedImage} source={{uri: trip.tripCoverImageUrl}} />
)}
         </TouchableOpacity>


         <View style={styles.fieldContainer}>
         <Text style={styles.label}>ชื่อทริป</Text>
         <TextInput
  style={[
    styles.textInput, 
    isFocused && styles.textInputFocused,
    validationErrors.tripName && styles.errorBorder
  ]}
  onFocus={() => setIsFocused(true)}
  onBlur={() => setIsFocused(false)}
  value={formData2.name}
  onChangeText={(text) => {
    setFormData2(prev => ({ ...prev, name: text }));
    // Clear error when user starts typing
    if (validationErrors.tripName) {
      setValidationErrors(prev => ({ ...prev, tripName: null }));
    }
  }}
  placeholder="ตั้งชื่อทริปของคุณ"
  multiline
/>
<ErrorText error={validationErrors.tripName} />
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
        minDate={new Date().toISOString().split('T')[0]} // Disable past dates
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


{/* Max Participants */}
<Text style={{marginLeft:2,marginBottom:6}}>จํานวนคน
      </Text>
     <View style={styles.dateContainer}>

    
     <View style={{flex:0.40,flexDirection:'row',alignItems:'center',backgroundColor:'#F9FAFBFF',height:40,paddingHorizontal:4,borderRadius:8}}>
     <Image
        source={require('../assets/images/images/images/image11.png')} // Replace with your image path
        style={{height:16,width:16,marginHorizontal:3}}
        resizeMode="contain"
      />
     <TextInput 
  style={{width:100,height:'80%',paddingHorizontal:5,outlineColor:'white',backgroundColor:'#F9FAFBFF'}}
  placeholder=''
  value={maxParticipant!=''?maxParticipant.toString():''}
  onChangeText={(text) => {
    handleMaxParticipant(text);
    // Clear error when user starts typing
    if (validationErrors.maxParticipant) {
      setValidationErrors(prev => ({ ...prev, maxParticipant: null }));
    }
  }}
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
        source={require('../assets/images/images/images/image12.png')} // Replace with your image path
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


       {/* Checkbox Serives */}
       <View style={styles.checkboxSection}>
  <Text style={styles.label}>สิ่งที่รวมในราคา
  </Text>

  <View style={styles.checkboxContainer}>
  {services.map(service => (
  <View key={service.id} style={styles.checkboxRow}>
    <TouchableOpacity
  style={styles.checkbox}
  onPress={() => {
    toggleServiceCheckbox(service.id);
    // Clear error when user selects a service
    if (validationErrors.services) {
      setValidationErrors(prev => ({ ...prev, services: null }));
    }
  }}
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
                onPress={() => {
                  toggleSelection(category.id);
                  // Clear error when user selects a category
                  if (validationErrors.travelStyle) {
                    setValidationErrors(prev => ({ ...prev, travelStyle: null }));
                  }
                }}
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
            source={require('../assets/images/images/images/image9.png')}
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
  style={[
    styles.textArea,
    validationErrors.description && styles.errorBorder
  ]}
  multiline
  numberOfLines={4}
  value={formData.description}
  onChangeText={(text) => {
    setFormData(prev => ({ ...prev, description: text }));
    // Clear error when user starts typing
    if (validationErrors.description) {
      setValidationErrors(prev => ({ ...prev, description: null }));
    }
  }}
  placeholder="อธิบายบรรยากาศหรือโทนของกลุ่มที่ต้องการ...."
/>
<ErrorText error={validationErrors.description} />
          </View>





                {/*RIch Editor */}
      <View style={styles.container3}>
      {/* Header */}
    
        <Text style={styles.label}>รายละเอียดทั่วไป</Text>
       
      
     
      
      {/* Text Editor */}
      <ScrollView style={styles.editorContainer}>
      <TextInput
  ref={(ref) => setTextInputRef(ref)}
  style={[styles.textEditor, getTextStyle()]}
  multiline={true}
  placeholder="เขียนรายละเอียดทั่วไปของคุณ..."
  placeholderTextColor="#999"
  value={editorState.content}
  onChangeText={(text) => {
    handleContentChange(text);
    // Clear error when user starts typing
    if (validationErrors.generalDetails) {
      setValidationErrors(prev => ({ ...prev, generalDetails: null }));
    }
  }}
  onSelectionChange={handleSelectionChange}
  textAlignVertical="top"
/>

      </ScrollView>
      <ErrorText error={validationErrors.generalDetails} />
       {/*Link MOdal */}


    </View>
      </View>


{/* Review */}
 
<View style={{marginLeft:20,marginRight:20}}>
<Text style={{fontWeight:600,}}>ตัวอย่างโพสต์
      </Text>
      <View style={styles.card}>
      <View style={styles.imageContainer}>
      <Image style={styles.backgroundImage} source={{ uri: trip?.tripCoverImageUrl }} />

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
        <Image source={require('../assets/images/images/images/image14.png')} style={{width:15,height:12,marginRight:3}} />
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
  </View>


      </ScrollView>

      
      <View style={{ flexDirection: 'row', borderTopWidth: 1, borderTopColor: '#e0e0e0' }}>

      {/* Submit Button 2 */}
      <View style={styles.submitContainer}>
        <TouchableOpacity style={styles.submitButton} onPress={editTrip}>
        
          {/*   <Ionicons name="send" size={20} color="#fff" /> */}
          <Text style={styles.submitText}>Edit</Text>
        </TouchableOpacity>
        
      </View>
    </View>
   </SafeAreaView>
  )
}


const styles=StyleSheet.create({
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
      modalContent: {
        width: '80%',
        backgroundColor: '#ffffff',
        padding: 16,
        borderRadius: 8,
        elevation: 4,
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
      modalActions: {
        flexDirection: 'row',
        justifyContent: 'flex-end',
        marginTop: 8,
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

  modalSubmitButton: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    backgroundColor: '#007bff',
    flex: 1,
    marginLeft: 8,
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
  selectedFontItem: {
    backgroundColor: '#007AFF',
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

fontItemText: {
    fontSize: 16,
    color: '#333',
  },
  selectedFontText: {
    color: 'white',
    fontWeight: 'bold',
  },
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
  formSection: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 16,
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
  uploadedImage: {
    width: '100%',
    flex: 1,
    borderRadius: 8,
    resizeMode: 'cover',
    minHeight: 200,
  },
  fieldContainer: {
    marginBottom: 20,
  },
  label: {
    fontWeight: '500',
    color: '#333',
    marginBottom:4
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
  wordCount: {
    position: 'absolute',
    bottom: 8,
    right: 12,
    fontSize: 12,
    color: '#888',
  },
  dateInputError: {
    borderColor: '#FF6B6B',
    borderWidth: 1,
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
  container3: {
    flex: 4,
    backgroundColor: 'white',
    position: 'relative',         
    zIndex: 1000,               
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
  toolButton: {
    paddingHorizontal: 8,
    paddingVertical: 6,
    marginRight: 4,
  },
  fontButtonText: {
    fontSize: 12,
    color: '#333',
    fontWeight: '500',
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
  alignmentIcon: {
    fontSize: 16,
    color: '#333',
    fontWeight: 'bold',
  },
  toolButtonText: {
    fontSize: 14,
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
  submitContainer: {
    flex:1,
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
  submitText: {
    marginLeft: 8,
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
  errorText: {
    color: '#DC2626',
    fontSize: 12,
    marginTop: 4,
    marginLeft: 2,
    fontFamily: 'Inter_400Regular',
  },
  errorBorder: {
    borderColor: '#DC2626',
    borderWidth: 1,
  },
  errorContainer: {
    borderColor: '#DC2626',
    borderWidth: 1,
    backgroundColor: '#FEF2F2',
  }

})

export default EditTrip;
