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
  Image,
  TextInput,
  Modal
} from 'react-native';
import {
  DatePickerComponent,
  TravelStylesComponent,
 } from '../../components/Edit_CreateTrip_jsx'
import { router,Stack } from 'expo-router';
import { launchImageLibrary } from 'react-native-image-picker';
import {axiosInstance} from '../../lib/axios'
import { FontAwesome } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import TripCard from '../../components/TripCard'
import styles from '../../css/create_EditTrip'
import {TravelSelectionDetails,PickedFile} from '../../features/trip/schemas/trip-form.schema'
import RichTextInputComponent from '../../components/richTextEditor'
import Icon from 'react-native-vector-icons/Feather';

const MAX_WORDS = 40;

 
const ThaiFormScreen = () => {
 const[p3Modal,setP3MOdal]=useState<boolean>(false)

  const [isFocused, setIsFocused] = useState(false);
  const [categories, setCategories] = useState<TravelSelectionDetails[]>([]);
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [services, setServices] = useState<TravelSelectionDetails[]>([]);
  const [selectedServices, setSelectedServices] = useState<string[]>([]);
  const [showStartDatePicker, setShowStartDatePicker] = useState(false);
  const [showEndDatePicker, setShowEndDatePicker] = useState(false);
    const [imageTextArray,setimageTextArray]=useState([])
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
    details: '',
    detailsFormatting: null, 
    travelPlans:'',
    includedInprice:'',
    notIncludedInprice:'',
    preparation:'',
    terms:'',
    meetingPoint:'',
    leaderDetails:''
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


  

const pickImageWithText = useCallback(() => {
 const options = {
      mediaType: 'photo' as const,
      includeBase64: false,
      maxWidth: 1024,
      maxHeight: 1024,
      quality: 0.8,
      storageOptions: {
        skipBackup: true,
        path: 'images',
      },
      presentationStyle: 'overFullScreen' as const,
    };

  launchImageLibrary(options, (response) => {
    if (response.didCancel || response.errorMessage) {
      if (response.errorMessage) {
        console.log('ImagePicker Error: ', response.errorMessage);
      }
      return;
    }
    

    const pickedImage = response.assets?.[0];
    if (!pickedImage?.uri) {
      console.log("No Image uri received, Please Try Again");
      return;
    }

    const uniqueId = `${Date.now()}-${Math.floor(Math.random() * 1000000)}`;

    const newImageItem = {
      id: uniqueId,
      uri: pickedImage.uri,
      type: pickedImage.type ?? 'image/jpeg',
      name: pickedImage.fileName ?? `image-${Date.now()}.jpg`
    };

    setimageTextArray(prev => {
  const updated = [...prev, newImageItem];
  console.log('Updated imageTextArray:', updated); // Add this line
  return updated;
});
    console.log('Image added successfully with ID:', uniqueId);
  });
}, []);

  const removeImageFromArray = (id) => {
  setimageTextArray(prev => prev.filter(item => item.id !== id));
  console.log('Image removed with ID:', id);
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
      const result: TravelSelectionDetails = response.data.data;
    setServices(result);
    } catch (error) {
      console.error('Failed to fetch services:', error);
      setServices([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchTravelStyles = async (): Promise<void> => {
    try {
      setLoading(true);
      const response = await axiosInstance.get('/travel-styles');
      const result: TravelSelectionDetails = response.data.data;
      setCategories(result);
    } catch (error) {
      console.error('Failed to fetch travel styles:', error);

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
      destinations: validateTravelStyles(),
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
      details: '',
      detailFormatting: formData.detailsFormatting,
    });
    
    setFormData2({ name: '' });
    setMaxParticipant('');
    setPricePerPerson('');
    setIsChecked(false);
    setDropdownOpen(false);
    setSearchText('');
  };

const UploadTripImages = async (tripId: string): Promise<void> => {
  console.log("Starting Upload Image Url");
  try {
    const formData = new FormData();

    for (const imageItem of imageTextArray) {
      const response = await fetch(imageItem.uri);
      const blob = await response.blob();

      formData.append('files', blob, imageItem.name); // Correct key: 'files' (plural), and blob with filename
      
    }

    const uploadUrlResponse = await axiosInstance.put(
      `/trips/${tripId}/cover-images`,
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    );

    console.log("Trip Image Urls Uploaded");
    console.log("Upload response:", uploadUrlResponse.data);

  } catch (error) {
    console.log("Error Uploading Images", error);
  }
};

  
  // Main create function
  type StatusType = 'published' | 'draft';

const create = async (status: StatusType): Promise<void> => {
  console.log(formData.terms);
  
  console.log(imageTextArray);
  
  setIsValidating(true);

  //const isValid = validateForm();

  //if (!isValid) {
    //setIsValidating(false);
   // const firstError = Object.values(errors).find(error => error !== '');
    //console.log('Error');
   // 
  //  return;
 // } 

  try {
    console.log("🚀 Starting trip creation...");
    
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

    const travelStyleIds: string[] = selectedItems;
    const requestFormData = new FormData();

    // Basic trip information
    requestFormData.append('name', formData2.name.trim());
    
    try {
      requestFormData.append('startDate', formatDate(formData.startDate));
      requestFormData.append('endDate', formatDate(formData.endDate));
    } catch (dateError) {
      Alert.alert('Error', 'Invalid date format. Please check your dates.');
      return;
    }
    
    
     requestFormData.append('destinations', JSON.stringify([]));
    
    
    requestFormData.append('maxParticipants', maxParticipant.toString());
    requestFormData.append('pricePerPerson', pricePerPerson.toString());
    
    if (formData.includedInprice) {
      requestFormData.append('includedServices', JSON.stringify([formData.includedInprice]));
    }
    
    requestFormData.append('detail', formData.details || '');
    requestFormData.append('itinerary', formData.details || '');
requestFormData.append('notIncludedServices', formData.notIncludedInprice || '');
requestFormData.append('prerequisites', formData.preparation || '');
requestFormData.append('rule', formData.terms || '');
requestFormData.append('venue', formData.meetingPoint || '');
requestFormData.append('tripCreatorIntroduction', formData.leaderDetails || '');

    if (travelStyleIds.length > 0) {
      requestFormData.append('travelStyles', travelStyleIds);
    }
    
    requestFormData.append('status', status);
    
    const userId = await AsyncStorage.getItem('userId');
    if (userId) {
      requestFormData.append('tripOwnerId', userId);
    }

    // Handle multiple cover images from imageTextArray
// Handle multiple cover images from imageTextArray - React Native version
if (imageTextArray.length > 0) {
  console.log(`📷 Adding ${imageTextArray.length} cover images to request...`);
  
  for (let i = 0; i < imageTextArray.length; i++) {
    const pickedFile = imageTextArray[i];
    
    console.log(`📷 Adding image ${i + 1}/${imageTextArray.length} to request...`, {
      name: pickedFile.name,
      type: pickedFile.type,
      size: pickedFile.size || 'unknown',
      hasBase64: !!pickedFile.base64Data,
      hasUri: !!pickedFile.uri
    });
    
    try {
      if (pickedFile.isBase64 && pickedFile.base64Data) {
        // For React Native: Create file object with base64 data
        const fileObj = {
          uri: `data:${pickedFile.type || 'image/jpeg'};base64,${pickedFile.base64Data}`,
          type: pickedFile.type || 'image/jpeg',
          name: pickedFile.name || `image-${i + 1}.jpg`,
        };
        requestFormData.append('tripCoverImageFiles', fileObj as any);
        
      } 
    } catch (imageError) {
      console.error(`Image processing error for image ${i + 1}:`, imageError);
      // Continue with other images even if one fails
    }
  }
  
} else {
  console.warn('⚠️ No images in imageTextArray');
  return;
}

    console.log("📤 Sending trip creation request...");
    
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
    UploadTripImages(response.data.data.id)

    const createdTrip = response.data.data; 
    const tripId = createdTrip.id;
    
    if (tripId && userId) {
      try {
        console.log("Creating Stream Chat channel for trip...");
        
        const streamClient = StreamChat.getInstance(requirements.stream_api_key);
        
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
        
        await streamClient.connectUser(streamUser, streamClient.devToken(userId));
        
        const channelId = `trip-${tripId}`;
        const channel = streamClient.channel('messaging', channelId, {
          name: `${formData2.name} - Group Chat`,
          members: [userId],
          created_by_id: userId,
          trip_id: tripId,
          trip_name: formData2.name,
        });
        
        await channel.create();
        console.log("✅ Stream Chat channel created successfully:", channelId);
        await streamClient.disconnectUser();
        
      } catch (chatError) {
        console.error('Stream Chat channel creation failed:', chatError);
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
      console.log('imageTextArray:', imageTextArray);
  const mappedUris = imageTextArray.map(item => item.uri);
  console.log('Mapped URIs:', mappedUris);
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
      detailFormatting: formData.detailsFormatting,
      groupAtmosphere: formData.description, 
      includedServices: services
        .filter(service => isServiceChecked(service.id))
        .map(service => service.title),
      travelStyles: categories
        .filter(category => selectedItems.includes(category.id))
        .map(category => category.title),
     tripCoverImageUrls: imageTextArray.map(item => item.uri),
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
        <TouchableOpacity style={styles.backButton} onPress={handleBack}
         hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
       <Image source={require('../assets/images/home-back.png')} style={{tintColor:'#374151',height:24,width:24}}/>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>สร้างทริปใหม่</Text>
      </View>
      <View></View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Form Fields */}
        <View style={styles.formSection}>
          {/* Image Upload Section with Error */}
           <View style={{ backgroundColor: '#F3F4F6', borderRadius: 15, paddingTop: 10, marginTop: 20 }}>
                <Text style={[ { marginLeft: 22, fontFamily: 'LineSeedSansTH_A_Bd', color: "#374151" ,fontSize:13,marginBottom:15}]}>
                  รูปภาพหน้าปกทริป
                </Text>
                {/* Image Grid */}
              <View 
            style={{ 
              paddingHorizontal: 22, 
              paddingBottom: 20,
              flexDirection: 'row',
              flexWrap: 'wrap',

            
            }}
          >
            {imageTextArray.map((item) => (
              <View key={item.id} style={{ 
                marginBottom: 15, 
                width: 90, // Takes roughly half the width with some spacing
                height:60,
                marginRight:10
              }}>
                <View style={{ position: 'relative', }}>
                  <Image
                    source={{ uri: item.uri }}
                    style={{
                      width: 90,
                      height: 60,
                      borderRadius: 10,
                      backgroundColor: '#E5E7EB',
                      paddingHorizontal:10
                    }}
                    resizeMode="cover"
                  />
                  
                  {/* Remove button */}
                  <TouchableOpacity
                    onPress={() => removeImageFromArray(item.id)}
                    style={{
                      position: 'absolute',
                      top: -8,
                      right: -8,
                      backgroundColor: 'red',
                      borderRadius: 10,
                      width: 20,
                      height: 20,
                      justifyContent: 'center',
                      alignItems: 'center',
                    }}
                  >
                    <Text style={{ color: 'white', fontSize: 12, fontWeight: 'bold' }}>×</Text>
                  </TouchableOpacity>
                </View>
                
               
              </View>
            ))}
            
            {/* Add new image button */}
            <TouchableOpacity
              onPress={pickImageWithText}
              style={{
                width: 90,
                height: 60,
                borderRadius: 10,
                backgroundColor: '#FFFFFF',
                justifyContent: 'center',
                alignItems: 'center',
                marginBottom: 15,
              }}
            >
             <Image source={require('../assets/images/plus.png')} style={{height:17.5,width:17.5,tintColor:'#D1D5DB'}} />
             
            </TouchableOpacity>
          </View>
              </View>

          {/* Trip Name Field with Character Count */}
          

          


<View style={[
  {
    backgroundColor: '#F3F4F6',
    borderRadius: 10,
    paddingHorizontal: 20,
    paddingVertical: 15,
    marginTop:20
  },
  !errors.tripName && { marginBottom: 20 }
]}>
  <Text style={{
    fontFamily: 'LineSeedSansTH_A_Bd',
    fontWeight: '700',
    color: '#374151',
    fontSize: 10
  }}>
    ชื่อทริป
  </Text>
  
  <TextInput
    value={formData2.name}
    onChangeText={(text) => {
      if (text.length <= 40) {
        setFormData2({...formData2, name: text});
        if (errors.tripName) {
          clearError('tripName');
        }
      }
    }}
    placeholder="ตั้งชื่อทริปของคุณ"
    style={{
      backgroundColor: '#F3F4F6',
      color: '#374151',
      outlineWidth: 0,
      paddingVertical: 2,
      fontFamily: 'LineSeedSansTH_A_Bd',
      fontSize: 13,
      fontWeight: '700',
      minHeight: 20 // Control the height
    }}
    placeholderTextColor="#9CA3AF"
    maxLength={40}
  />
  
  {/* Character count - only show if no error */}
  {!errors.tripName && (
    <Text style={{
      fontSize: 10,
      color: formData2.name.length > 35 ? 'red' : '#9CA3AF',
      textAlign: 'right',
      marginTop:-10,
      fontFamily:'LineSeedSansTH'
   
    }}>
      {formData2.name.length}/40
    </Text>
  )}
</View>

{/* Error message - outside the input container */}
{errors.tripName && (
  <Text style={{
    color: 'red',
    fontSize: 12,
    marginTop: 4,
    marginLeft: 20,
    marginBottom: 20,
    fontFamily: 'LineSeedSansTH_A_Bd',
    fontWeight: '700'
  }}>
    {errors.tripName}
  </Text>
)}

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

<View style={{flexDirection:'row',justifyContent:'space-between',paddingHorizontal:15}}>

  <View style={{flex:0.3,backgroundColor:"#F3F4F6",paddingHorizontal:20,paddingVertical:15,borderRadius:10,marginBottom:15}}>
     <Text style={{color:'#374151',fontFamily:'LineSeedSansTH_A_Bd',fontSize:10}}>จำนวนคน</Text>
     <View style={{flexDirection:'row',marginTop:10,justifyContent:'space-between'}}>
         <Image
                source={require('../assets/images/images/images/image11.png')}
                style={{ height: 16, width: 16,tintColor:'#FF956E'}}
                resizeMode="contain"
              />
          <TextInput
             style={{
            height: '100%',
            borderWidth:0,
            outlineWidth:0,
            backgroundColor: '#F3F4F6',
            width: '45%',
            textAlign:'center',
            fontFamily:'LineSeedSansTH_A_Bd',
            fontSize:12,
            color:'#374151'
            
          }}
          placeholder='1'
          placeholderTextColor="#9CA3AF"
          value={maxParticipant}
            onChangeText={(text) => {
    if (text && parseInt(text) <= 15) {
      handleMaxParticipant(text);
    } else if (text === '') {
      handleMaxParticipant(text); 
    }
    if (errors.maxParticipants) clearError('maxParticipants');
  }}
          keyboardType='numeric'
      
      />

      <Text style={{ fontFamily:'LineSeedSansTH_A_Bd',fontSize:12,color:'#9CA3AF'}}>คน</Text>
      <View style={{flexDirection:'row',marginTop:10,justifyContent:'space-between'}}>
         
      </View>
     </View>
    
  </View>
  <View style={{flex:0.65,backgroundColor:"#F3F4F6",paddingHorizontal:20,paddingVertical:15,borderRadius:10,marginBottom:15}}>
         <View style={{flexDirection:'row'}}>
          <Text style={{color:'#374151',fontFamily:'LineSeedSansTH_A_Bd',fontSize:10}}>ราคาต่อคน (รวม 20%)</Text>
          <TouchableOpacity onPress={()=>setP3MOdal(true)} style={{backgroundColor:'#FFFFFF',marginLeft:5}}>
            <Icon name="info" size={16} color="#374151" />
          </TouchableOpacity>
        <Modal
      visible={p3Modal}
      transparent
      animationType='none'
    >
      <View style={{
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.3)', // dim background
        justifyContent: 'center',
        alignItems: 'center',
      }}>
        <View style={{
          justifyContent:'center',
          padding: 16,
          backgroundColor: '#FFFFFF',
          borderRadius: 12,
          position: 'relative',
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.2,
          shadowRadius: 4,
          elevation: 5
          
        }}>
          {/* Close button */}
          <TouchableOpacity
            onPress={() => setP3MOdal(false)}
            style={{
              position: 'absolute',
              top: -12,
              right: -12,
              borderRadius:9999,
              padding: 4,
              zIndex: 10,
              backgroundColor:'#FF0000'
            }}
          >
            <Icon name="x" size={18} color="#FFFFFF" />
          </TouchableOpacity>

          {/* Modal content */}
          <Text style={{ color: '#374151', fontSize: 12, marginBottom: 5 ,fontFamily:'LineSeedSansTH_A_Bd',textAlign:'center'}}>
           แอพจะหักค่าบริการ 20% หลังทริปสำเร็จ
          </Text>
          <Text style={{ color: '#374151', fontSize: 12 ,fontFamily:"LineSeedSansTH_A_Bd",textAlign:'center'}}>
            เพื่อดูแลระบบ + การันตีการจองที่ปลอดภัยต่อหัวตี้ และผู้เข้าร่วม
          </Text>
        </View>
      </View>
    </Modal>
         </View>
            <View style={{flexDirection:'row',marginTop:10,justifyContent:'space-around'}}>
                <Image
                         source={require('../assets/images/images/images/image12.png')}
                         style={{ height: 16, width: 16, marginHorizontal: 3 }}
                         resizeMode="contain"
                       />
                            <TextInput
             style={{
            height: '100%',
            borderWidth:0,
            outlineWidth:0,
            backgroundColor: '#F3F4F6',
            width: '100%',
            textAlign:'left',
            fontFamily:'LineSeedSansTH_A_Bd',
            fontSize:12,
            color:'#374151',
            paddingHorizontal:10
          }}
          placeholder='ราคาต่อคน'
          placeholderTextColor="#9CA3AF"
          value={pricePerPerson}
         onChangeText={(text) => {
    handlePricePerPerson(text);
    if (errors.pricePerPerson) clearError('pricePerPerson');
  }}
      />

  <Text style={{ fontFamily:'LineSeedSansTH_A_Bd',fontSize:12,color:'#9CA3AF'}}>บาท</Text>
             </View>
  </View>

</View> 


        {/* Services with Error 
   <ServicesCheckboxComponent 
  services={services}
  selectedServices={selectedServices}
  onToggleService={toggleServiceCheckbox}
  error={errors.services}
  clearError={() => clearError('services')}
  styles={styles}
  isEditMode={false}
/>*/}


 <View>
         {/* Travel Styles with Error */}
  <TravelStylesComponent
  title='สไตล์เที่ยว'
  subtitle='เลือกกิจกรรมที่คุณสนใจ (เลือกได้หลายข้อ)'
  categories={categories}
  selectedItems={selectedItems}
  onToggleSelection={toggleSelection}
  loading={loading}
   highlightType="gradientcolor" 
  error={errors.travelStyles}
  clearError={() => clearError('travelStyles')}
  styles={styles}
  isEditMode={false}
/>
 </View>

<View style={{marginBottom:20,marginTop:-10,marginLeft:10}}>
          <Text style={{fontFamily:"LineSeedSansTH_A_Bd",fontSize:16,fontWeight:'700'}}>รายละเอียดทริป</Text>
        </View>



{/*<View style={{backgroundColor:'#F3F4F6',paddingTop:10,borderRadius:20,marginBottom:20}}>
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
</View>*/}

   {/**Travel Plans */}
  <View style={{backgroundColor:'#F3F4F6',paddingTop:10,borderRadius:20,marginBottom:20}}>
    <Text style={{color:'#374151',fontFamily:'LineSeedSansTH_A_Bd',fontWeight:'700',fontSize:13,marginLeft:20}}>🗓 แผนการเดินทาง</Text>
<RichTextInputComponent       
  value={formData.details}   
  onChangeText={(newData) => setFormData(prev => ({ ...prev, details: newData }))}   
  error={errors.details}   
  clearError={() => clearError('details')}   
  isEditMode={false}
  placeholder="เขียนรายละเอียดทริปของคุณ..."
/>
   </View>

     {/**Included in Price */}
  <View style={{backgroundColor:'#F3F4F6',paddingTop:10,borderRadius:20,marginBottom:20}}>
    <Text style={{color:'#374151',fontFamily:'LineSeedSansTH_A_Bd',fontWeight:'700',fontSize:13,marginLeft:20}}>✅ สิ่งที่รวมในราคา</Text>
<RichTextInputComponent       
  value={formData.includedInprice}   
  onChangeText={(newData) => setFormData(prev => ({ ...prev,includedInprice: newData }))}   
  error={errors.details}   
  clearError={() => clearError('details')}   
  isEditMode={false}
  placeholder="เขียนรายละเอียดทริปของคุณ..."
/>
   </View>

     {/**Not Included in Price */}
  <View style={{backgroundColor:'#F3F4F6',paddingTop:10,borderRadius:20,marginBottom:20}}>
    <Text style={{color:'#374151',fontFamily:'LineSeedSansTH_A_Bd',fontWeight:'700',fontSize:13,marginLeft:20}}>❌ สิ่งที่ไม่รวมในราคา</Text>
<RichTextInputComponent       
  value={formData.notIncludedInprice}   
  onChangeText={(newData) => setFormData(prev => ({ ...prev, notIncludedInprice: newData }))}   
  error={errors.details}   
  clearError={() => clearError('details')}   
  isEditMode={false}
  placeholder="เขียนรายละเอียดทริปของคุณ..."
/>
   </View>


        {/**THings to bring yourself */}
  <View style={{backgroundColor:'#F3F4F6',paddingTop:10,borderRadius:20,marginBottom:20}}>
    <Text style={{color:'#374151',fontFamily:'LineSeedSansTH_A_Bd',fontWeight:'700',fontSize:13,marginLeft:20}}>🎒 สิ่งที่ต้องเตรียมมาเอง</Text>
<RichTextInputComponent       
  value={formData.preparation}   
  onChangeText={(newData) => setFormData(prev => ({ ...prev, preparation: newData }))}   
  error={errors.details}   
  clearError={() => clearError('details')}   
  isEditMode={false}
  placeholder="เขียนรายละเอียดทริปของคุณ..."
/>
   </View>


           {/**Terms and conditions */}
  <View style={{backgroundColor:'#F3F4F6',paddingTop:10,borderRadius:20,marginBottom:20}}>
    <Text style={{color:'#374151',fontFamily:'LineSeedSansTH_A_Bd',fontWeight:'700',fontSize:13,marginLeft:20}}>⚠️ เงื่อนไข / กติกาทริป</Text>
<RichTextInputComponent       
  value={formData.terms}   
  onChangeText={(newData) => setFormData(prev => ({ ...prev, terms: newData }))}   
  error={errors.details}   
  clearError={() => clearError('details')}   
  isEditMode={false}
  placeholder="เขียนรายละเอียดทริปของคุณ..."
/>
   </View>


              {/**Meeting Point*/}
  <View style={{backgroundColor:'#F3F4F6',paddingTop:10,borderRadius:20,marginBottom:20}}>
    <Text style={{color:'#374151',fontFamily:'LineSeedSansTH_A_Bd',fontWeight:'700',fontSize:13,marginLeft:20}}>📍 จุดนัดพบ</Text>
<RichTextInputComponent       
  value={formData.meetingPoint}   
  onChangeText={(newData) => setFormData(prev => ({ ...prev, meetingPoint: newData }))}   
  error={errors.details}   
  clearError={() => clearError('details')}   
  isEditMode={false}
  placeholder="เขียนรายละเอียดทริปของคุณ..."
/>
   </View>


   <View>
    <Text style={{fontFamily:"LineSeedSansTH_A_Bd",fontSize:16,marginVertical:10}}>แนะนำตัวในฐานนะหัวตี้</Text>
<TextInput
  placeholderTextColor="#9CA3AF"
  value={formData.leaderDetails}
  onChangeText={(newData) =>
    setFormData((prev) => ({ ...prev, leaderDetails: newData }))
  }
  style={{
    borderColor: '#E5E7EB',
    borderWidth: 1,
    height: 231,
    borderRadius: 20,
    outlineWidth: 0,
    color: '#374151',
    padding: 20,
    textAlign: 'left',
    textAlignVertical: 'top', 
    marginBottom:10,
    fontFamily:'LineSeedSansTH_A_Bd'
  }}
  placeholder="เขียนแนะนำตัวได้ที่นี่..."
  multiline 
/>

   </View>


        
        {/* General Details with Error
<View style={{backgroundColor:'#F3F4F6',paddingTop:10,borderRadius:20,marginBottom:20}}>
  <Text></Text>
<RichTextInputComponent       
  value={formData.details}   
  onChangeText={(newData) => setFormData(prev => ({ ...prev, details: newData }))}   
  error={errors.details}   
  clearError={() => clearError('details')}   
  isEditMode={false}
  placeholder="Enter your details here..."
/>
</View> */}

    
        <Text style={{fontWeight:'700',fontFamily:'LineSeedSansTH_A_Bd',margin:20,marginBottom:5,color:'#374151'}}>
         ตัวอย่างโพสต์
        </Text>
        {userInfo && (
          <TripCard
            trip={createTripFromFormData()}
            isBookmarked={false} // Set based on your bookmark state
            onBookmarkToggle={handleBookmarkToggle}
            onTripPress={handleTripPress}
            onJoinTrip={handleJoinTrip}
            isCreateTrip={true}
            iscreateTrip={true}
          />
        )}

        <View style={{marginLeft:20,marginRight:20,marginTop:10}}>
          <View style={styles.checkboxContainer}>
           <TouchableOpacity onPress={() => setIsChecked(!isChecked)}>
       <View style={{
         width: 15,
         height: 15,
         marginHorizontal:5,
         borderWidth: 2,
         borderColor: isChecked ? '#585DDB' : '#9CA3AF',
         backgroundColor: isChecked ? '#585DDB' : 'transparent',
         borderRadius: 4,
         justifyContent: 'center',
         alignItems: 'center',
             }}>
  
  </View>
</TouchableOpacity>

            <Text style={{fontFamily:'LineSeedSansTH',fontSize:12,color:'#374151',marginBottom:5}}>
              ฉันได้อ่านและยอมรับ{' '}
              <Text style={styles.linkText}>นโยบายและข้อตกลง</Text>
              {' '}ของแอปพลิเคชัน
            </Text>
          </View>  
        </View>
      </ScrollView>

      {/* Updated Submit Buttons */}
      <View style={{ flexDirection: 'row' }}>
        <View style={styles.submitContainer}>
          <TouchableOpacity 
            style={[styles.draftButton, isValidating && { opacity: 0.7 }]} 
            onPress={() => create("draft")}
            disabled={isValidating}
          >
            <Text style={styles.draftText}>
          
            บันทึกแบบร่าง
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
            <Text style={[styles.submitText,{alignItems:'center'}]}>
               <Image source={require('../assets/images/createTrip-icon.png')} style={{width:17.79,height:17.79,tintColor:'#FFFFFF',marginRight:10,marginBottom:-3}}/>
              โพสต์ทริป
            </Text>
          </TouchableOpacity>
        </View>
      </View>
     
    </SafeAreaView>
  );
};



export default ThaiFormScreen;
