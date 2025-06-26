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

import { router,Stack } from 'expo-router';
import { launchImageLibrary } from 'react-native-image-picker';
import {axiosInstance} from '../lib/axios'
import '@expo-google-fonts/inter'
import {Calendar} from 'react-native-calendars'
import AsyncStorage from '@react-native-async-storage/async-storage';
import {useFonts} from 'expo-font'
import TripCard from './TripCard'
import styles from './css/create_EditTrip'
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
    'InterTight-Regular': require('../assets/fonts/InterTight-Regular.ttf')
  });

  // State declarations
  const [pickedFile2, setPickedFile2] = useState<PickedFile | null>(null);
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
    details: ''
  });

  const [formData2, setFormData2] = useState({ name: '' });
  const [maxParticipant, setMaxParticipant] = useState<number | ''>('');
  const [pricePerPerson, setPricePerPerson] = useState<number | ''>('');
  const [isChecked, setIsChecked] = useState(false);
  
  // Destination state
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [selected, setSelected] = useState<string[]>([]);
  const [searchText, setSearchText] = useState('');
  const [destinations, setDestinations] = useState<string[]>([]);
  const [uploading, setUploading] = useState(false);
  const [responseMessage, setResponseMessage] = useState<string | null>(null);
  const [userInfo, setUserInfo] = useState<any>(null);

  // Constants
  const MAX_WORDS = 20; // Define this constant

  // Helper functions
  const handleBack = async () => {
    resetForm();
    router.push('/(tabs)/findTrips');
  };

  const toggleServiceCheckbox = (id: string) => {
    setSelectedServices(prev =>
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
  };

  const isServiceChecked = (id: string) => selectedServices.includes(id);

  const convertBase64ToFile = (base64Uri: string, filename: string, mimeType: string) => {
    const base64Data = base64Uri.split(',')[1];
    return {
      uri: base64Uri,
      base64Data: base64Data,
      type: mimeType,
      name: filename,
      isBase64: true,
    };
  };

  const pickImage2 = () => {
    const options: any = {
      mediaType: 'photo',
      includeBase64: false,
      maxWidth: 1024,
      maxHeight: 1024,
      storageOptions: {
        skipBackup: true,
        path: 'images',
      },
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
          } as PickedFile);

          console.log('🟢 Base64 image processed successfully');
          return;
        }

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

  // Validation functions
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
    const dateErrors = { startDate: '', endDate: '' };
    
    if (!formData.startDate) {
      dateErrors.startDate = 'กรุณาเลือกวันที่เริ่มต้น';
    } else if (!validateDate(formData.startDate)) {
      dateErrors.startDate = 'รูปแบบวันที่ไม่ถูกต้อง';
    }
    
    if (!formData.endDate) {
      dateErrors.endDate = 'กรุณาเลือกวันที่สิ้นสุด';
    } else if (!validateDate(formData.endDate)) {
      dateErrors.endDate = 'รูปแบบวันที่ไม่ถูกต้อง';
    }
    
    if (formData.startDate && formData.endDate && validateDate(formData.startDate) && validateDate(formData.endDate)) {
      const startDateObj = new Date(formData.startDate.split('/').reverse().join('-'));
      const endDateObj = new Date(formData.endDate.split('/').reverse().join('-'));
      
      if (endDateObj <= startDateObj) {
        dateErrors.endDate = 'วันที่สิ้นสุดต้องหลังจากวันที่เริ่มต้น';
      }
    }
    
    return dateErrors;
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
    return '';
  };
  
  const validateDetails = () => {
    if (!formData.details.trim()) {
      return 'กรุณาใส่รายละเอียดทั่วไป';
    }
    return '';
  };
  
  const validateTerms = () => {
    if (!isChecked) {
      return 'กรุณายอมรับนโยบายและข้อตกลง';
    }
    return '';
  };

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
    
    const hasErrors = Object.values(newErrors).some(error => error !== '');
    return !hasErrors;
  };

  const clearError = (field: keyof typeof errors) => {
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
  };

  const formatDateToCalendar = (dateString: string): string => {
    if (!dateString || !validateDate(dateString)) return '';
    const [day, month, year] = dateString.split('/');
    return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
  };
  
  const formatDateFromCalendar = (dateString: string): string => {
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

  const pad = (n: number): string => (n < 10 ? `0${n}` : `${n}`);

  const wordCount = formData2.name.trim() === ''
    ? 0
    : formData2.name.trim().split(/\s+/).length;

  const handleMaxParticipant = (text: string) => {
    const filteredText = text.replace(/[^0-9]/g, '');
    const numberValue = filteredText ? parseInt(filteredText, 10) : '';
    setMaxParticipant(numberValue);
  };

  const handlePricePerPerson = (text: string) => {
    const filteredText = text.replace(/[^0-9]/g, '');
    const numberValue = filteredText ? parseInt(filteredText, 10) : '';
    setPricePerPerson(numberValue);
  };

  // Destination functions
  const addDestination = (dest: string) => {
    if (!selected.includes(dest)) {
      setSelected([...selected, dest]);
    }
    setDropdownOpen(false);
    setSearchText(''); 
  };

  const filteredDestinations = destinations.filter(dest =>
    dest.toLowerCase().includes(searchText.toLowerCase())
  );

  const removeDestination = (dest: string) => {
    setSelected(selected.filter(d => d !== dest));
  };

  const resetForm = () => {
    setPickedFile2(null);
    setIsFocused(false);
    setSelectedItems([]);
    setSelectedServices([]);
    setSelected([]);
    setShowStartDatePicker(false);
    setShowEndDatePicker(false);
    setIsValidating(false);
    setLoading(false);
    setUploading(false);
    setResponseMessage(null);
    
    setErrors({
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
    
    setFormData({
      name: '',
      startDate: '',
      endDate: '',
      description: '',
      selectedOptions: [],
      attachments: 0,
      details: ''
    });
    
    setFormData2({ name: '' });
    setMaxParticipant('');
    setPricePerPerson('');
    setIsChecked(false);
    setDropdownOpen(false);
    setSearchText('');
  };


  
  // Main create function
  type StatusType = 'published' | 'draft';

  const create = async (status: StatusType): Promise<void> => {
    setIsValidating(true);

    const isValid = validateForm();

    if (!isValid) {
      setIsValidating(false);
      const firstError = Object.values(errors).find(error => error !== '');
      Alert.alert('ข้อมูลไม่ถูกต้อง', firstError);
      return;
    }

    try {
      console.log("🚀 Starting trip creation...");
      
      if (!formData2.name || !formData.startDate || !formData.endDate || 
          selected.length === 0 || !maxParticipant || !pricePerPerson || 
          selectedItems.length === 0) { // Fixed: check selectedItems instead of categories
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
      
          const year = date.getFullYear();
          const month = String(date.getMonth() + 1).padStart(2, '0');
          const day = String(date.getDate()).padStart(2, '0');
      
          return `${year}-${month}-${day}`;
        } catch (error) {
          console.error('Date formatting error:', error);
          throw new Error(`Invalid date format: ${dateStr}`);
        }
      };

      // Fixed: Get travel style IDs from selectedItems, not categories
      const travelStyleIds: string[] = selectedItems;
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
        // Fixed: Append each destination separately
          requestFormData.append('destinations',selected);
      }
      
      requestFormData.append('maxParticipants', maxParticipant.toString());
      requestFormData.append('pricePerPerson', pricePerPerson.toString());
      
      if (selectedServices.length > 0) {
        // Fixed: Append each service separately
      
          requestFormData.append('includedServices', selectedServices);
    
      }
      
      requestFormData.append('detail', formData.details || '');

      if (travelStyleIds.length > 0) {
        // Fixed: Append each travel style separately
          requestFormData.append('travelStyles', travelStyleIds);
       
      }
      
      requestFormData.append('groupAtmosphere', formData.description || '');
      requestFormData.append('status', status);
      
      const userId = await AsyncStorage.getItem('userId');
      if (userId) {
        requestFormData.append('tripOwnerId', userId);
      }

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
        travelStyles: selectedItems.length, // Fixed
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
      
      resetForm();
      
       router.push('/findTrips');

    } catch (error: unknown) {
      console.error('🔴 Trip creation error:', error);
      
      let errorMessage = 'Failed to create trip';
      
      if (error && typeof error === 'object' && 'response' in error) {
        const axiosError = error as any;
        console.error('Server Error Response:', axiosError.response?.data);
        console.error('Server Error Status:', axiosError.response?.status);
        
        const serverMessage = axiosError.response?.data?.message;
        const statusCode = axiosError.response?.status;
        
        if (serverMessage) {
          errorMessage = serverMessage;
        } else {
          errorMessage = `Server Error (${statusCode})`;
        }
      } else if (error && typeof error === 'object' && 'request' in error) {
        console.error('Network Error:', (error as any).request);
        errorMessage = 'Network error. Please check your connection.';
      } else if (error instanceof Error) {
        console.error('General Error:', error.message);
        errorMessage = error.message || 'Unknown error occurred';
      }
      
      setResponseMessage(`Error: ${errorMessage}`);
      
    } finally {
      setIsValidating(false);
      setUploading(false);
    }
  };

  // Error component
  const ErrorMessage = ({ error }: { error: string }) => {
    if (!error) return null;
    return (
      <Text style={{ color: 'red', fontSize: 12, marginTop: 4 }}>{error}</Text>
    );
  };

  const getUserInfo = async () => {
    try {
      const userId = await AsyncStorage.getItem('userId');
      if (userId) {
        const response = await axiosInstance.get(`/users/profile/${userId}`);
        console.log(response.data.data);
        setUserInfo(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching user info:', error);
    }
  };

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
      maxParticipants: parseInt(maxParticipant.toString()) || 0,
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

  const handleBookmarkToggle = (trip: any) => {
    console.log('Bookmark toggled for trip:', trip.id);
  };

  const handleTripPress = (trip: any) => {
    console.log('Trip pressed:', trip.id);
  };

  const handleJoinTrip = (trip: any) => {
    console.log('Join trip pressed:', trip.id);
  };

  // Effects
  useEffect(() => {
    fetchServices();
  }, []);

  useEffect(() => {
    fetchTravelStyles();
  }, []);

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

  useEffect(() => {
    getUserInfo();
  }, []);

    
  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <Stack.Screen options={{ headerShown: false }} />
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={handleBack}>
         <Image source={require('../assets/images/images/images/image15.png')} style={{marginLeft:15,width:20,height:18}}/>
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
    }}
    placeholder="ตั้งชื่อทริปของคุณ"
    placeholderTextColor='gray'
    multiline
    maxLength={50} 
  />
   <ErrorMessage error={errors.tripName} /> 
    {
      !errors.tripName && (
        
  <Text style={[
    styles.wordCount,
   
    formData2.name.length > 45 && { color: 'red' }
  ]}>
    {formData2.name.length}/50
  </Text>
      )
    }
</View>



         {/* Date Fields with Errors */}
<Text style={{
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
  <Image 
    source={require('../assets/images/images/images/image25.png')} 
    style={{ width: 14, height: 16, marginHorizontal: 10 }} 
  />
  
  {/* Start Date Picker */}
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
      pointerEvents="none"  // Allows the calendar to appear on click
    />
  </TouchableOpacity>
  
  <Text style={{ marginRight: 40, marginLeft: -20, fontSize: 20, fontWeight: '500' }}>-</Text>
  
  {/* End Date Picker */}
  <TouchableOpacity 
    onPress={() => {
      if (formData.startDate) {
        clearError('endDate');
        setShowEndDatePicker(true);
      }
    }}
    disabled={!formData.startDate} // Disable until Start Date is set
  >
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
 
      placeholderTextColor={!formData.startDate ? '#B0B0B0' : undefined}
      keyboardType="numeric"
      maxLength={10}
      accessibilityLabel="วันที่สิ้นสุด"
      editable={true}
      pointerEvents="none" // Disables direct editing, use calendar picker
    />
  </TouchableOpacity>
</View>

<View style={styles.dateErrorContainer}>
  <Text style={styles.dateErrorText}>{errors.startDate || ''}</Text>
  <Text style={styles.dateErrorText}>{errors.endDate || ''}</Text>
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
    width: '40%',
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F9FAFBFF',
    height: 40,
    paddingHorizontal: 4,
    borderRadius: 8,
    marginHorizontal: 20,
    marginBottom: 30,
  },
  errors.maxParticipants && styles.inputError
]}>
  <Image
    source={require('../assets/images/images/images/image11.png')}
    style={{ height: 16, width: 16, marginHorizontal: 10 }}
    resizeMode="contain"
  />
<TextInput
  style={{
    
    height: '80%',
    paddingHorizontal: 5,
    outlineColor: 'white',
    backgroundColor: '#F9FAFBFF',
    width:'35%'
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

<View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
    <Text style={{ fontFamily: 'InterTight-Regular', textAlign: 'center' }}>คน</Text>
  </View>
</View>
<View style={{paddingLeft:20}}> <ErrorMessage error={errors.maxParticipants} /> </View>

    
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
    marginHorizontal: 20,
    width:'70%'
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
    width: '75%',
    fontWeight: '500',
    color: '#333',
    fontFamily: 'InterTight-Regular',
    fontSize: 16
  }}>ราคาต่อคน</Text>
  <TextInput
    style={{ width: '100%', height: '70%', paddingHorizontal: 5, outlineColor: '#e0e0e0',fontFamily:'InterTight-Regular' }}
    placeholder=''
    value={pricePerPerson != '' ? pricePerPerson.toString() : ''}
    onChangeText={(text) => {
      handlePricePerPerson(text);
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
<View style={{paddingLeft:20}}> <ErrorMessage error={errors.pricePerPerson} /> </View>


  {/* Services with Error */}
<View style={[styles.checkboxSection,errors.services && {marginBottom:0}]}>
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
<View style={{paddingLeft:20}}> <ErrorMessage error={errors.services} /> </View>

       {/* Travel Styles with Error */}
       <View style={styles.content}>
  <Text style={styles.label}>สไตล์การเที่ยว</Text>
  {loading ? (
    <View style={styles.loadingContainer}>
      <ActivityIndicator size="large" color="#6366f1" />
      <Text style={styles.loadingText}>กำลังโหลด...</Text>
    </View>
  ) : (
    <View style={styles.categoriesContainer}>
      {categories.map((category) => {
        const isSelected = selectedItems.includes(category.id);
        const iconUrl = isSelected && category.activeIconImageUrl 
          ? category.activeIconImageUrl 
          : category.iconImageUrl;
        
        return (
          <TouchableOpacity
            key={category.id}
            style={[
              styles.categoryItem,
              isSelected && styles.selectedItem
            ]}
            onPress={() => {
              toggleSelection(category.id);
              if (errors.travelStyles) clearError('travelStyles');
            }}
          >
            <Image
              source={{ 
                uri: iconUrl || 'https://via.placeholder.com/30x30/000000/FFFFFF?text=?' 
              }}
              style={{
                width: 14,
                height: 12,
                tintColor: isSelected ? '#29C4AF' : '#000',
              }}
              resizeMode="contain"
            />
            <Text style={[
              styles.categoryText,
              isSelected && styles.selectedText
            ]}>
              {category.title}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  )}
</View>
<View style={{paddingLeft:20}}> <ErrorMessage error={errors.travelStyles} /> </View>

  

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
            fontFamily: 'InterTight-Regular',
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
          fontFamily: 'InterTight-Regular',
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
  {errors.destinations && selected.length === 0 && (
    <ErrorMessage error={errors.destinations} />
  )}
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
                <Text style={{ fontSize: 14, color: '#374151',fontFamily:'InterTight-Regular' }}>{item}</Text>
              </TouchableOpacity>
            ))
          ) : (
            <Text style={{
              padding: 12,
              textAlign: 'center',
              color: '#9CA3AF',
              fontSize: 14,
              fontFamily:'InterTight-Regular'
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
            backgroundColor: 'rgba(41, 196, 175, 0.1)',
            borderWidth: 1,
            paddingHorizontal: 8,
            paddingTop: 7,
            borderRadius: 9999,
            margin: 5,
            borderColor: '#29C4AF',
            minWidth: 84.09,
            height: 38,
            alignItems: 'center',
          }}
          onPress={() => removeDestination(dest)}
        >
          <Text style={{
            color: '#29C4AF',
            fontFamily: 'InterTight-Regular',
            fontSize: 14,
          }}>
            {dest} <Text style={{ fontSize: 16 }}>×</Text>
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  </View>
</View>


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
      placeholderTextColor="#888"
      maxLength={100} // Prevents typing beyond 100 characters
    />

   {!errors.atmosphere && (
     <Text style={[
      styles.wordCountText,
      // Optional: Change color when approaching limit (90+ characters)
      formData.description.length > 90 && { color: 'red' }
    ]}>
      {formData.description.length}/100
    </Text>
   )}
    <ErrorMessage error={errors.atmosphere}/>
  </View>
</View>
      
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
    placeholderTextColor="#888"
  />
  <ErrorMessage error={errors.details} /> 
</View>

 
        
        
      
    
      <Text style={{fontWeight:600,fontFamily:'InterTight-Regular',marginHorizontal:20,marginBottom:5}}>ตัวอย่างโพสต์
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
  <Text style={styles.linkText}>นโยบายและข้อตกลง</Text> {/* Text nested correctly */}
  {' '} ของแอปพลิเคชัน {/* Ensure spaces or other strings are inside */}
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
      สร้างทริป
      </Text>
    </TouchableOpacity>
  </View>
</View>
    <Text style={styles.submitNote}>กรุณาตรวจสอบข้อมูลให้ถูกต้องก่อนส่ง</Text>
    
    </SafeAreaView>
  );
};



export default ThaiFormScreen;