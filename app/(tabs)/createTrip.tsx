import React, { useState,useEffect, useCallback} from 'react';
import {requirements} from '../../requirement'
import {StreamChat} from 'stream-chat'
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  Alert,
} from 'react-native';
import {ImageUploadComponent,
  DatePickerComponent,
  MaxParticipantsComponent,
  PricePerPersonComponent,
  ServicesCheckboxComponent,
  TravelStylesComponent,
  DestinationsComponent,
  AtmosphereInputComponent,
  DetailsInputComponent} from '../../src/shared/components/Edit_CreateTrip_jsx'
import TripNameInput from '../../src/components/tripNameInput'
import { router,Stack } from 'expo-router';
import { launchImageLibrary } from 'react-native-image-picker';
import {axiosInstance} from '../../src/lib/axios'
import '@expo-google-fonts/inter'
import AsyncStorage from '@react-native-async-storage/async-storage';
import TripCard from '../../src/shared/components/TripCard'
import styles from '../../src/css/create_EditTrip'
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
  const [pricePerPerson, setPricePerPerson] = useState<string>('');
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



  const wordCount = formData2.name.trim() === ''
    ? 0
    : formData2.name.trim().split(/\s+/).length;

  const handleMaxParticipant = (text: string) => {
    const filteredText = text.replace(/[^0-9]/g, '');
    const numberValue = filteredText ? parseInt(filteredText, 10) : '';
    setMaxParticipant(numberValue);
  };


const handlePricePerPerson = (text: string) => {
  // Keep numbers and decimal point ONLY
  const filteredText = text.replace(/[^0-9.]/g, '');
  
  // Handle multiple decimal points - keep only the first one
  const parts = filteredText.split('.');
  const cleanedText = parts.length > 2 
    ? parts[0] + '.' + parts.slice(1).join('') 
    : filteredText;
  
  setPricePerPerson(cleanedText);
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

       const createdTrip = response.data.data; 
    const tripId = createdTrip.id;
    
    if (tripId && userId) {
      try {
        console.log("Creating Stream Chat channel for trip...");
        
        // Get or create Stream Chat client
       
        const streamClient = StreamChat.getInstance(requirements.stream_api_key);
        
        // Get current user profile for Stream Chat
        const userProfileResponse = await axiosInstance.get(`/users/profile/${userId}`);
        const userProfile = userProfileResponse.data.data;
        
        const streamUser = {
          id: userId,
          name: userProfile.nickname || userProfile.fullname,
          image: userProfile.profileImageUrl !== 'N/A' 
            ? userProfile.profileImageUrl 
            : 'https://via.placeholder.com/40x40/cccccc/666666?text=👤',
          email: userProfile.email,
          fullname: userProfile.fullname,
          nickname: userProfile.nickname
        };
        
        // Connect as trip owner
        await streamClient.connectUser(streamUser, streamClient.devToken(userId));
        
        // Create channel
        const channelId = `trip-${tripId}`;
        const channel = streamClient.channel('messaging', channelId, {
          name: `${formData2.name} - Group Chat`,
          members: [userId], // Start with just the owner
          created_by_id: userId,
          trip_id: tripId,
          trip_name: formData2.name,
        });
        
        await channel.create();
        
        console.log("✅ Stream Chat channel created successfully:", channelId);
        
        // Disconnect after creation (optional - depends on your app flow)
        await streamClient.disconnectUser();
        
      } catch (chatError) {
        console.error('Stream Chat channel creation failed:', chatError);
        // Don't throw error here - trip creation was successful
        // You might want to show a warning to the user
        console.warn('Trip created successfully, but chat channel creation failed. Users can still join the chat later.');
      }
    }       
      
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
        id: userInfo?.userId,
        displayName: userInfo?.fullname,
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

const handleChangeText = useCallback((text) => {
  setFormData2(prev => ({ ...prev, name: text }));
}, []);

    
 return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <Stack.Screen options={{ headerShown: false }} />
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={handleBack}>
          <Text style={styles.backButtonText}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>สร้างทริปใหม่</Text>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Form Fields */}
        <View style={styles.formSection}>
          {/* Image Upload Section with Error */}
          <ImageUploadComponent 
            pickedFile={pickedFile2} 
            onPickImage={pickImage2} 
            styles={styles} 
          />

          {/* Trip Name Field with Character Count */}
        <TripNameInput
         value={formData2.name}
         onChangeText={handleChangeText}
         error={errors.tripName}
         clearError={clearError}
          styles={styles}
         showErrorMessage={true}
/>

          {/* Date Fields with Errors */}
          <DatePickerComponent 
            formData={formData}
            setFormData={setFormData}
            errors={errors}
            clearError={clearError}
            styles={styles}
            showStartDatePicker={showStartDatePicker}
            setShowStartDatePicker={setShowStartDatePicker}
            showEndDatePicker={showEndDatePicker}
            setShowEndDatePicker={setShowEndDatePicker}
            handleStartDateSelect={handleStartDateSelect} 
            handleEndDateSelect={handleEndDateSelect}     
            handleDateSelect={()=>{console.log("DDDDDD");}}      
            formatDateInput={formatDateInput}
            validateDate={validateDate}
            formatDateToCalendar={formatDateToCalendar}
            isEditMode={false} 
          />
        </View>

        {/* Max Participants with Error */}
        <MaxParticipantsComponent 
  value={maxParticipant}
  onChangeText={(text) => {
    if (text && parseInt(text) <= 15) {
      handleMaxParticipant(text);
    } else if (text === '') {
      handleMaxParticipant(text); 
    }
    if (errors.maxParticipants) clearError('maxParticipants');
  }}
  error={errors.maxParticipants}
  clearError={() => clearError('maxParticipants')}
  styles={styles}
  isEditMode={false}
/>


        {/* Price Per Person with Error */}
      <PricePerPersonComponent 
  value={pricePerPerson}
  onChangeText={(text) => {
    handlePricePerPerson(text);
    if (errors.pricePerPerson) clearError('pricePerPerson');
  }}
  error={errors.pricePerPerson}
  clearError={() => clearError('pricePerPerson')}
  styles={styles}
  isEditMode={false}
/>


        {/* Services with Error */}
   <ServicesCheckboxComponent 
  services={services}
  selectedServices={selectedServices}
  onToggleService={toggleServiceCheckbox}
  error={errors.services}
  clearError={() => clearError('services')}
  styles={styles}
  isEditMode={false}
/>


        {/* Travel Styles with Error */}
       <TravelStylesComponent 
  categories={categories}
  selectedItems={selectedItems}
  onToggleSelection={toggleSelection}
  loading={loading}
  error={errors.travelStyles}
  clearError={() => clearError('travelStyles')}
  styles={styles}
  isEditMode={false}
/>


        {/* Destination */}
 <DestinationsComponent 
  dropdownOpen={dropdownOpen}
  setDropdownOpen={setDropdownOpen}
  searchText={searchText}
  setSearchText={setSearchText}
  filteredDestinations={filteredDestinations}
  selectedDestinations={selected}
  onAddDestination={addDestination}
  onRemoveDestination={removeDestination}
  loading={loading}
  error={errors.destinations}
  clearError={() => clearError('destinations')}
  styles={styles}
  isEditMode={false}
/>


  <AtmosphereInputComponent
  value={formData.description}
  onChangeText={(text) => {
    if (text.length <= 100) {
      setFormData(prev => ({ ...prev, description: text }));
      if (errors.atmosphere) clearError('atmosphere');
    }
  }}
  error={errors.atmosphere}
  clearError={() => clearError('atmosphere')}
  styles={styles}
  isEditMode={false}
/>

        
        {/* General Details with Error */}
  <DetailsInputComponent
  value={formData.details}
  onChangeText={(text) => {
    setFormData(prev => ({ ...prev, details: text }));
    if (errors.details) clearError('details');
  }}
  error={errors.details}
  clearError={() => clearError('details')}
  styles={styles}
  isEditMode={false}
/>

    
        <Text style={{fontWeight:600,fontFamily:'InterTight-Regular',marginHorizontal:20,marginBottom:5}}>
          ตัวอย่างโพสต์
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
              {' '}ของแอปพลิเคชัน
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
