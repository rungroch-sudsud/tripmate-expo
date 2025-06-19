import React, { useState,useEffect} from 'react';
import {
  View,
  Text,
  Modal,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  SafeAreaView,
  Image,
  Alert,
  ActivityIndicator
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router,Stack } from 'expo-router';
import { launchImageLibrary } from 'react-native-image-picker';
import {axiosInstance} from '../lib/axios'
import '@expo-google-fonts/inter'
import {Calendar} from 'react-native-calendars'
import AsyncStorage from '@react-native-async-storage/async-storage';
import {useFonts} from 'expo-font'
import TripCard from './TripCard'
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



const ThaiFormScreen = () => {
 
      

  const [fontsLoaded] = useFonts({
    'InterTight-Black': require('../assets/fonts/InterTight-Black.ttf'),
    'InterTight-SemiBold': require('../assets/fonts/InterTight-SemiBold.ttf'),
    'InterTight-Regular':require('../assets/fonts/InterTight-Regular.ttf')
  });

    const [pickedFile2, setPickedFile2] = useState<PickedFile | null>(null);
    const [selfieError, setSelfieError] = useState(false);
    const [isFocused, setIsFocused] = useState(false);
    const [categories, setCategories] = useState<Category[]>([]);
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [services, setServices] = useState<Service[]>([]);
const [selectedServices, setSelectedServices] = useState<string[]>([]);
const [showStartDatePicker, setShowStartDatePicker] = useState(false);
const [showEndDatePicker, setShowEndDatePicker] = useState(false);
const [errors, setErrors] = useState({
  coverImage: '',
  tripName: '',
  startDate: '',
  endDate: '',
  maxParticipants: '',
  pricePerPerson: '',
  services: '',
  travelStyles: '',
  destinations: '',
  atmosphere: '',
  details: '',
  terms: ''
});

const [isValidating, setIsValidating] = useState(false);
 
  const [formData, setFormData] = useState({
    name: '',
    startDate: '',
    endDate: '',
    description: '',
    selectedOptions: [] as string[],
    attachments: 0,
    details:''
  });


const handleBack=async()=>{
  router.push('/(tabs)/findTrips')
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


  const validateCoverImage = () => {
    if (!pickedFile2) {
      return 'กรุณาเลือกรูปภาพหน้าปก';
    }
    return '';
  };
  
  const validateTripName = () => {
    if (!formData2.name.trim()) {
      return 'กรุณาใส่ชื่อทริป';
    }
    if (wordCount > MAX_WORDS) {
      return `ชื่อทริปต้องไม่เกิน ${MAX_WORDS} คำ`;
    }
    return '';
  };

  const validateDates = () => {
    const errors = { startDate: '', endDate: '' };
    
    if (!formData.startDate) {
      errors.startDate = 'กรุณาเลือกวันที่เริ่มต้น';
    } else if (!validateDate(formData.startDate)) {
      errors.startDate = 'รูปแบบวันที่ไม่ถูกต้อง';
    }
    
    if (!formData.endDate) {
      errors.endDate = 'กรุณาเลือกวันที่สิ้นสุด';
    } else if (!validateDate(formData.endDate)) {
      errors.endDate = 'รูปแบบวันที่ไม่ถูกต้อง';
    }
    
    // Check if end date is after start date
    if (formData.startDate && formData.endDate && validateDate(formData.startDate) && validateDate(formData.endDate)) {
      const startDateObj = new Date(formData.startDate.split('/').reverse().join('-'));
      const endDateObj = new Date(formData.endDate.split('/').reverse().join('-'));
      
      if (endDateObj <= startDateObj) {
        errors.endDate = 'วันที่สิ้นสุดต้องหลังจากวันที่เริ่มต้น';
      }
    }
    
    return errors;
  };
  
  const validateMaxParticipants = () => {
    if (!maxParticipant || maxParticipant === '') {
      return 'กรุณาใส่จำนวนคน';
    }
    const num = parseInt(maxParticipant.toString());
    if (isNaN(num) || num < 1) {
      return 'จำนวนคนต้องเป็นตัวเลขและมากกว่า 0';
    }
    if (num > 50) {
      return 'จำนวนคนต้องไม่เกิน 50 คน';
    }
    return '';
  };
  
  const validatePricePerPerson = () => {
    if (!pricePerPerson || pricePerPerson === '') {
      return 'กรุณาใส่ราคาต่อคน';
    }
    const price = parseFloat(pricePerPerson.toString());
    if (isNaN(price) || price < 0) {
      return 'ราคาต้องเป็นตัวเลขและมากกว่าหรือเท่ากับ 0';
    }
    if (price > 100000) {
      return 'ราคาต้องไม่เกิน 100,000 บาท';
    }
    return '';
  };
  
  const validateServices = () => {
    const checkedServices = services.filter(service => isServiceChecked(service.id));
    if (checkedServices.length === 0) {
      return 'กรุณาเลือกสิ่งที่รวมในราคาอย่างน้อย 1 รายการ';
    }
    return '';
  };
  
  const validateTravelStyles = () => {
    if (selectedItems.length === 0) {
      return 'กรุณาเลือกสไตล์การเที่ยวอย่างน้อย 1 รายการ';
    }
    return '';
  };
  
  const validateDestinations = () => {
    if (selected.length === 0) {
      return 'กรุณาเลือกสถานที่ท่องเที่ยวอย่างน้อย 1 แห่ง';
    }
    return '';
  };
  
  const validateAtmosphere = () => {
    if (!formData.description.trim()) {
      return 'กรุณาอธิบายบรรยากาศ/โทนกลุ่ม';
    }
    const words = formData.description.trim().split(/\s+/).filter(word => word.length > 0);
    if (words.length < 5) {
      return 'คำอธิบายต้องมีอย่างน้อย 5 คำ';
    }
    if (words.length > 100) {
      return 'คำอธิบายต้องไม่เกิน 100 คำ';
    }
    return '';
  };
  
  const validateDetails = () => {
    if (!formData.details.trim()) {
      return 'กรุณาใส่รายละเอียดทั่วไป';
    }
    if (formData.details.trim().length < 20) {
      return 'รายละเอียดต้องมีอย่างน้อย 20 ตัวอักษร';
    }
    return '';
  };
  
  const validateTerms = () => {
    if (!isChecked) {
      return 'กรุณายอมรับนโยบายและข้อตกลง';
    }
    return '';
  };
  
  // Main validation function
  const validateForm = () => {
    const dateErrors = validateDates();
    
    const newErrors = {
      coverImage: validateCoverImage(),
      tripName: validateTripName(),
      startDate: dateErrors.startDate,
      endDate: dateErrors.endDate,
      maxParticipants: validateMaxParticipants(),
      pricePerPerson: validatePricePerPerson(),
      services: validateServices(),
      travelStyles: validateTravelStyles(),
      destinations: validateDestinations(),
      atmosphere: validateAtmosphere(),
      details: validateDetails(),
      terms: validateTerms()
    };
  
    setErrors(newErrors);
    
    // Check if there are any errors
    const hasErrors = Object.values(newErrors).some(error => error !== '');
    return !hasErrors;
  };
  
  // Clear specific error when user starts typing/selecting
  const clearError = (field) => {
    setErrors(prev => ({ ...prev, [field]: '' }));
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
  }
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
      setSearchText(''); 
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
      setIsValidating(true);
  
  // Validate form
  const isValid = validateForm();
  
  if (!isValid) {
    setIsValidating(false);
    
    // Find first error and scroll to it (optional)
    const firstErrorField = Object.keys(errors).find(key => errors[key] !== '');
    
    // Show alert with first error
    const firstError = Object.values(errors).find(error => error !== '');
    Alert.alert('ข้อมูลไม่ถูกต้อง', firstError);
    
    return;
  }
      try {
        console.log("🚀 Starting trip creation...");
        
        // Validation - check if required fields are filled
        if (!formData2.name || !formData.startDate || !formData.endDate || 
            selected.length === 0 || !maxParticipant || !pricePerPerson || 
            categories.length === 0) {
          return;
        }
    
        setUploading(true);
        setResponseMessage(null);
  
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
        
    
     
        const travelStyleIds: string[] = categories.map((category: any) => category.id);
    
 
        const requestFormData = new FormData();
    
      
        requestFormData.append('name', formData2.name.trim());
        
        try {
          requestFormData.append('startDate', formatDate(formData.startDate));
          requestFormData.append('endDate', formatDate(formData.endDate));
        } catch (dateError) {
          Alert.alert('Error', 'Invalid date format. Please check your dates.');
          return;
        }
        
     
        if (selected.length > 0) {
          
          requestFormData.append('destinations', selected);
         
        }
        
        requestFormData.append('maxParticipants', maxParticipant.toString());
        requestFormData.append('pricePerPerson', pricePerPerson.toString());
        
      
        if (selectedServices.length > 0) {
   
          requestFormData.append('includedServices', selectedServices);
          
     
          
        }
        
        requestFormData.append('detail', formData.details || '');
     
        if (travelStyleIds.length > 0) {
         
          requestFormData.append('travelStyles', travelStyleIds);
          
        
        }
        
        requestFormData.append('groupAtmosphere', formData.description || '');
        requestFormData.append('status', status);
        const userId=await AsyncStorage.getItem('userId')
     
        requestFormData.append('tripOwnerId', userId);
    
    
        if (pickedFile2) {
          console.log("📷 Adding image to request...", {
            name: pickedFile2.name,
            type: pickedFile2.type,
            size: pickedFile2.size || 'unknown'
          });
          
          try {
            if (pickedFile2.isBase64 && pickedFile2.base64Data) {
          
              const response = await fetch(`data:${pickedFile2.type};base64,${pickedFile2.base64Data}`);
              const blob = await response.blob();
              requestFormData.append('tripCoverImageFile', blob, pickedFile2.name);
            } else if (pickedFile2.uri) {
          
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

        const response = await axiosInstance.post('/trips', requestFormData, {
          headers: {
            'Content-Type': 'multipart/form-data',
             Authorization: `Bearer ${idToken}`
          },
          timeout: 60000,
          maxContentLength: Infinity,
          maxBodyLength: Infinity,
        });
    
        console.log("✅ Trip created successfully:", response.data);
        router.push('/findTrips')
    
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
        
       
        const isDevelopment = __DEV__ || process.env.NODE_ENV === 'development';
        const displayMessage = isDevelopment && debugInfo 
          ? `${errorMessage}\n\n${debugInfo}` 
          : errorMessage;
        
        Alert.alert('Trip Creation Failed', displayMessage);
      } finally {
        setIsValidating(false);
        setUploading(false);
      }
    }
 
    const ErrorMessage = ({ error }) => {
      if (!error) return null;
      return (
        <Text style={styles.errorText}>{error}</Text>
      );
    };
    
    const [userInfo, setUserInfo] = useState(null);
    const getUserInfo = async () => {
      try {
        const userId = await AsyncStorage.getItem('userId');
        const response = await axiosInstance.get(`/users/profile/${userId}`);
        console.log(response.data.data);
        setUserInfo(response.data.data);
      } catch (error) {
        console.error('Error fetching user info:', error);
      }
    };
  
    useEffect(() => {
      getUserInfo();
    }, []);

    const convertDate = (dateStr: string) => {
      if (!dateStr) return new Date().toISOString();
      const [day, month, year] = dateStr.split('/');
      const date = new Date(`${month}/${day}/${year}`);
      return isNaN(date.getTime()) ? new Date().toISOString() : date.toISOString();
    };

    const createTripFromFormData = () => {
      const trip = {
        id: 'preview-trip', 
        name: formData2.name,
        destinations: selected, 
        startDate: convertDate(formData.startDate),
        endDate: convertDate(formData.endDate),
        maxParticipants: parseInt(maxParticipant) || 0,
        participants: [], 
        pricePerPerson: pricePerPerson, 
        detail: formData.details,
        groupAtmosphere: formData.description, 
        includedServices: services
          .filter(service => isServiceChecked(service.id))
          .map(service => service.title),
        travelStyles: categories
          .filter(category => selectedItems.includes(category.id))
          .map(category => category.title),
        tripCoverImageUrl: pickedFile2?.uri,
        tripOwner: {
          id: userInfo?.userId || 'current-user',
          displayName: userInfo?.fullname || 'ผู้สร้างทริป',
          firstName: userInfo?.fullname?.split(' ')[0] || '',
          lastName: userInfo?.fullname?.split(' ').slice(1).join(' ') || '',
          profileImageUrl: userInfo?.profileImageUrl || 'https://via.placeholder.com/40',
          age: userInfo?.age,
          travelStyles: userInfo?.travelStyles || [],
          fullname: userInfo?.fullname || 'ผู้สร้างทริป'
        },
        fullname: formData2.name || 'ชื่อทริป'
      };
      
      return trip;
    };
 
    const handleBookmarkToggle = (trip) => {
    
      console.log('Bookmark toggled for trip:', trip.id);
    };
  
    const handleTripPress = (trip) => {
   
      console.log('Trip pressed:', trip.id);
    };
  
    const handleJoinTrip = (trip) => {
  
      console.log('Join trip pressed:', trip.id);
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
              {/* Image Upload Section with Error */}
<TouchableOpacity
  style={[
    styles.uploadBox,
    errors.coverImage && styles.uploadBoxError
  ]}
  onPress={() => {
    clearError('coverImage');
    pickImage2();
  }}
>
  {pickedFile2 ? (
    <Image source={{ uri: pickedFile2.uri }} style={styles.uploadedImage} />
  ) : (
    <View style={styles.uploadPlaceholder}>
      <View style={styles.personIcon}>
        <Image
          source={require('../assets/images/images/images/image3.png')}
          style={{ height: 27, width: 27, tintColor: "#9CA3AF" }}
          resizeMode="contain"
        />
      </View>
      <Text style={styles.uploadSubtext}>เพิ่มรูปภาพหน้าปก</Text>
    </View>
  )}
</TouchableOpacity>
 <ErrorMessage error={errors.coverImage} /> 


{/* Trip Name Field with Character Count */}
<View style={styles.fieldContainer}>
  <Text style={styles.label}>ชื่อทริป</Text>
  <TextInput
    style={[
      styles.textInput,
      isFocused && styles.textInputFocused,
      errors.tripName && styles.inputError
    ]}
    onFocus={() => {
      setIsFocused(true);
      clearError('tripName');
    }}
    onBlur={() => setIsFocused(false)}
    value={formData2.name}
    onChangeText={(text) => {
      // Character limit for trip name
      const characterLimit = 50; // Adjust this to your desired limit
      
      if (text.length <= characterLimit) {
        setFormData2(prev => ({ ...prev, name: text }));
        if (errors.tripName) clearError('tripName');
      }
      // If character limit is exceeded, the text won't update (user can't type more)
    }}
    placeholder="ตั้งชื่อทริปของคุณ"
    multiline
    maxLength={50} // Additional protection against exceeding limit
  />
  <Text style={[
    styles.wordCount,
    // Optional: Change color when approaching limit
    formData2.name.length > 45 && { color: 'red' }
  ]}>
    {formData2.name.length}/50
  </Text>
</View>
 <ErrorMessage error={errors.tripName} /> 



         {/* Date Fields with Errors */}
<Text style={{
  marginHorizontal: 20,
  marginBottom: 10,
  fontWeight: '500',
  color: '#333',
  fontFamily: 'InterTight-Regular',
  fontSize: 16
}}>วันที่เริ่มต้น</Text>

<View style={[
  styles.dateContainer,
  (errors.startDate || errors.endDate) && styles.inputError
]}>
  <Image source={require('../assets/images/images/images/image25.png')} 
         style={{width: 14, height: 16, marginHorizontal: 10}} />
  
  <TouchableOpacity onPress={() => {
    clearError('startDate');
    setShowStartDatePicker(true);
  }}>
    <TextInput
      style={[
        formData.startDate && !validateDate(formData.startDate) && styles.dateInputError
      ]}
      value={formData.startDate}
      onChangeText={(text) => {
        const formatted = formatDateInput(text);
        setFormData(prev => ({ ...prev, startDate: formatted }));
        if (errors.startDate) clearError('startDate');
      }}
      placeholder="dd/mm/yyyy"
      keyboardType="numeric"
      maxLength={10}
      accessibilityLabel="วันที่เริ่มต้น"
      editable={true}
      pointerEvents="none"
    />
  </TouchableOpacity>
  
  <Text style={{marginRight: 40, marginLeft: -20, fontSize: 20, fontWeight: '500'}}>-</Text>
  
  <TouchableOpacity onPress={() => {
    clearError('endDate');
    setShowEndDatePicker(true);
  }}>
    <TextInput
      style={[
        formData.endDate && !validateDate(formData.endDate) && styles.dateInputError
      ]}
      value={formData.endDate}
      onChangeText={(text) => {
        const formatted = formatDateInput(text);
        setFormData(prev => ({ ...prev, endDate: formatted }));
        if (errors.endDate) clearError('endDate');
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
<View style={{display:'flex',flexDirection:'row',justifyContent:'space-between'}}>
<ErrorMessage error={errors.startDate} />
<ErrorMessage error={errors.endDate} /> 
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
        // Set the minimum date for end date based on the selected start date
        minDate={formData.startDate ? formatDateToCalendar(formData.startDate) : undefined}
      />
    </View>
  </View>
</Modal>

</View>

{/* Max Participants with Error */}
<Text style={{
  marginHorizontal: 20,
  marginBottom: 6,
  fontWeight: '500',
  color: '#333',
  fontFamily: 'InterTight-Regular',
  fontSize: 16
}}>จำนวนคน</Text>

<View style={[
  {
    width: '45%',
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F9FAFBFF',
    height: 40,
    paddingHorizontal: 4,
    borderRadius: 8,
    marginHorizontal: 20,
    marginBottom: 30
  },
  errors.maxParticipants && styles.inputError
]}>
  <Image
    source={require('../assets/images/images/images/image11.png')}
    style={{ height: 16, width: 16, marginHorizontal: 3 }}
    resizeMode="contain"
  />
<TextInput
  style={{
    width: 100,
    height: '80%',
    paddingHorizontal: 5,
    outlineColor: 'white',
    backgroundColor: '#F9FAFBFF',
    flex: 0.45
  }}
  placeholder=''
  value={maxParticipant !== '' ? maxParticipant.toString() : ''}
  onChangeText={(text) => {
    if (text && parseInt(text) <= 15) {
      handleMaxParticipant(text);
    } else if (text === '') {
      handleMaxParticipant(text); // Allow clearing the input
    }
    if (errors.maxParticipants) clearError('maxParticipants');
  }}
  keyboardType='numeric'
/>

  <Text style={{ marginLeft: 3, flex: 0.2, fontFamily: 'InterTight-Regular' }}>คน</Text>
</View>
 <ErrorMessage error={errors.maxParticipants} /> 

    
    {/* Price Per Person with Error */}
<Text style={{
  marginHorizontal: 20,
  marginBottom: 6,
  fontWeight: '500',
  color: '#333',
  fontFamily: 'InterTight-Regular',
  fontSize: 16
}}>ราคาต่อคน</Text>

<View style={[
  {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F9FAFBFF',
    height: 45,
    borderRadius: 8,
    justifyContent: 'space-between',
    marginBottom: 30,
    marginHorizontal: 20
  },
  errors.pricePerPerson && styles.inputError
]}>
  <Image
    source={require('../assets/images/images/images/image12.png')}
    style={{ height: 16, width: 16, marginHorizontal: 3 }}
    resizeMode="contain"
  />
  <Text style={{
    marginLeft: 5,
    marginRight: 10,
    width: '100%',
    fontWeight: '500',
    color: '#333',
    fontFamily: 'InterTight-Regular',
    fontSize: 16
  }}>ราคาต่อคน</Text>
  <TextInput
    style={{ width: '100%', height: '70%', paddingHorizontal: 5, outlineColor: '#e0e0e0' }}
    placeholder=''
    value={pricePerPerson != '' ? pricePerPerson.toString() : ''}
    onChangeText={(text) => {
      handlepricePerPerson(text);
      if (errors.pricePerPerson) clearError('pricePerPerson');
    }}
    keyboardType='numeric'
  />
  <Text style={{
    marginHorizontal: 5,
    fontWeight: '500',
    color: '#333',
    fontFamily: 'InterTight-Regular',
    fontSize: 16
  }}>บาท</Text>
</View>
 <ErrorMessage error={errors.pricePerPerson} /> 


  {/* Services with Error */}
<View style={styles.checkboxSection}>
  <Text style={styles.label}>สิ่งที่รวมในราคา</Text>
  <View style={styles.checkboxContainer}>
    {services.map(service => (
      <TouchableOpacity
        key={service.id}
        style={styles.checkboxRow}
        onPress={() => {
          toggleServiceCheckbox(service.id);
          if (errors.services) clearError('services');
        }}
      >
        <TouchableOpacity
          style={styles.checkbox}
          onPress={() => {
            toggleServiceCheckbox(service.id);
            if (errors.services) clearError('services');
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
      </TouchableOpacity>
    ))}
  </View>
</View>
 <ErrorMessage error={errors.services} /> 

       {/* Travel Styles with Error */}
<View style={styles.content}>
  <Text style={styles.label}>สไตล์การเที่ยว</Text>
  <ErrorMessage error={errors.travelStyles} />
  {loading ? (
    <View style={styles.loadingContainer}>
      <ActivityIndicator size="large" color="#6366f1" />
      <Text style={styles.loadingText}>กำลังโหลด...</Text>
    </View>
  ) : (
    <View style={styles.categoriesContainer}>
      {categories.map((category) => (
        <TouchableOpacity
          key={category.id}
          style={[
            styles.categoryItem,
            selectedItems.includes(category.id) && styles.selectedItem
          ]}
          onPress={() => {
            toggleSelection(category.id);
            if (errors.travelStyles) clearError('travelStyles');
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
{/* <ErrorMessage error={errors.travelStyles} /> */}

  

{/* Destination */}
<View style={{
  backgroundColor: '#fff',
  position: 'relative',
  zIndex: 1000,
  marginBottom: dropdownOpen ? 220 : 30, // Dynamic margin based on dropdown state
  marginTop:10,
  marginHorizontal:20
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
      position: 'absolute', 
      top: 55, 
      left: 0,
      right: 0,
      backgroundColor: '#FFFFFF',
      borderWidth: 1,
      borderColor: '#999',
      borderRadius: 6,
      maxHeight: 200,
      zIndex: 1001, 
      shadowColor: '#000',
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
 <ErrorMessage error={errors.destinations} /> 


{/* Group Atmosphere with Character Count */}
<View style={{ marginBottom: 30, marginTop: -20, marginHorizontal: 20 }}>
  <Text style={styles.label}>บรรยากาศ/โทนกลุ่ม</Text>
  <View style={{ position: 'relative' }}>
    <TextInput
      style={[
        styles.textArea,
        errors.atmosphere && styles.inputError
      ]}
      multiline
      numberOfLines={4}
      value={formData.description}
      onChangeText={(text) => {
        // Character limit set to 100
        const characterLimit = 100;
        
        if (text.length <= characterLimit) {
          setFormData(prev => ({ ...prev, description: text }));
          if (errors.atmosphere) clearError('atmosphere');
        }
        // If character limit is exceeded, the text won't update (user can't type more)
      }}
      placeholder="อธิบายบรรยากาศหรือโทนของกลุ่มที่ต้องการ...."
      maxLength={100} // Prevents typing beyond 100 characters
    />
    <Text style={[
      styles.wordCountText,
      // Optional: Change color when approaching limit (90+ characters)
      formData.description.length > 90 && { color: 'red' }
    ]}>
      {formData.description.length}/100
    </Text>
  </View>
</View><ErrorMessage error={errors.atmosphere}/>
      
      {/* General Details with Error */}
<View style={styles.container3}>
  <Text style={styles.label}>รายละเอียดทั่วไป</Text>
  <TextInput
    style={[
      styles.textArea,
      errors.details && styles.inputError
    ]}
    multiline
    numberOfLines={4}
    value={formData.details}
    onChangeText={(text) => {
      setFormData(prev => ({ ...prev, details: text }));
      if (errors.details) clearError('details');
    }}
    placeholder='เขียนรายละเอียดทริปของคุณ...'
  />
</View>
<ErrorMessage error={errors.details} /> 
 
        
        
      
    
      <Text style={{fontWeight:600,}}>ตัวอย่างโพสต์
      </Text>
      {userInfo && (
        <TripCard
          trip={createTripFromFormData()}
          isBookmarked={false} // Set based on your bookmark state
          onBookmarkToggle={handleBookmarkToggle}
          onTripPress={handleTripPress}
          onJoinTrip={handleJoinTrip}
        />
      )}


<View style={{marginLeft:20,marginRight:20}}>
     
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
      </View>  
     </View>

      </ScrollView>

{/* Updated Submit Buttons */}
<View style={{ flexDirection: 'row', borderTopWidth: 1, borderTopColor: '#e0e0e0' }}>
  <View style={styles.submitContainer}>
    <TouchableOpacity 
      style={[styles.draftButton, isValidating && { opacity: 0.7 }]} 
      onPress={() => create("draft")}
      disabled={isValidating}
    >
      <Text style={styles.draftText}>
        {isValidating ? 'กำลังบันทึก...' : 'บันทึกแบบร่าง'}
      </Text>
    </TouchableOpacity>
  </View>

  <View style={styles.submitContainer}>
    <TouchableOpacity 
      style={[
        styles.submitButton,
        (!isChecked || isValidating) && styles.disabledButton
      ]} 
      onPress={isChecked && !isValidating ? () => create("published") : undefined} 
      disabled={!isChecked || isValidating}
    >
      <Text style={styles.submitText}>
        {isValidating ? 'กำลังสร้าง...' : 'โอเคดีงาม'}
      </Text>
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
    color: '#1F2937',
    flex: 1,
    textAlign: 'center',
    fontWeight:700,
    fontFamily:'InterTight-Black',
    marginLeft:-20
  },
  content: {
    flex: 1,
    marginBottom:30,
    marginHorizontal:20,
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
    marginBottom: 30,
    marginHorizontal:20
  },
  label: {
    fontWeight: '500',
    color: '#333',
    marginBottom:4,
    fontFamily:'InterTight-Regular',
    fontSize:16
  },
  requiredText: {
    fontSize: 12,
    color: '#666',
    marginBottom: 8,
  },
  disabledButton: {
    opacity: 0.5, 
    backgroundColor: '#4285f4', 
  },
  textInput: {
    borderWidth:1,
    borderColor: '#e0e0e0',
    marginTop:5,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    fontSize: 16,
    backgroundColor: '#fff',
    fontWeight:500,
    fontFamily:'InterTight-SemiBold'
  },
  textInputFocused: {
    borderColor: 'transparent',
    outlineColor:'#e0e0e0',
    outlineWidth:1,
  },
  dateContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 30,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 8,
    height:50,
    marginHorizontal:20,
    alignItems:'center'
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
    marginHorizontal:20
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
    marginBottom:30,
    justifyContent:'center',
    marginHorizontal:20

  },
  uploadPlaceholder: {
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
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 12,
    fontFamily:'InterTight-Regular',
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
    marginBottom: 20,
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
    marginHorizontal:20,         
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
    marginHorizontal:20
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
  wordCountText: {
    position: 'absolute',
    bottom: 8,
    right: 12,
    fontSize: 12,
    color: '#666',
    backgroundColor: 'rgba(255, 255, 255, 0.8)', 
    paddingHorizontal: 4,
    paddingVertical: 2,
    borderRadius: 4,
  },
  errorText: {
    color: '#EF4444',
    fontSize: 12,
    marginTop: -30,
    marginHorizontal: 20,
    fontFamily: 'InterTight-Regular',
    marginBottom:30
  },
  inputError: {
    borderColor: '#EF4444',
    borderWidth: 1,
  },
  uploadBoxError: {
    borderColor: '#EF4444',
    borderWidth: 2,
  }
});

export default ThaiFormScreen;