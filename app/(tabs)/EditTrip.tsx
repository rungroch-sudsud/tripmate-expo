import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  Modal,
  TextInput,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  Image,
  ActivityIndicator
} from 'react-native';

import { router, Stack, useLocalSearchParams } from 'expo-router';
import { launchImageLibrary } from 'react-native-image-picker';
import { axiosInstance } from '../lib/axios';
import '@expo-google-fonts/inter';
import { Calendar } from 'react-native-calendars';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFonts } from 'expo-font';
import TripCard from './TripCard';
import styles from './css/create_EditTrip';

// Constants
const MAX_WORDS = 40;
const MAX_TRIP_NAME_LENGTH = 50;
const MAX_PARTICIPANTS = 15;
const MAX_DESCRIPTION_LENGTH = 100;

// Types
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

interface PickedFile {
  uri: string;
  type: string;
  name: string;
  size?: number;
  base64Data?: string;
  isBase64?: boolean;
}

interface TripData {
  name: string;
  destinations: string[];
  details: string;
  endDate: string;
  startDate: string;
  includedServices: string[];
  maxParticipants: number;
  pricePerPerson: number;
  travelStyles: string[];
  tripCoverImageUrl: string;
  groupAtmosphere?: string;
  detail?: string;
}

interface FormData {
  name: string;
  startDate: string;
  endDate: string;
  description: string;
  details: string;
}

interface ValidationErrors {
  coverImage: string;
  tripName: string;
  startDate: string;
  endDate: string;
  maxParticipants: string;
  pricePerPerson: string;
  services: string;
  travelStyles: string;
  destinations: string;
  atmosphere: string;
  details: string;
  terms: string;
}

// Custom hooks
const useAsyncData = <T,>(
  fetchFunction: () => Promise<T>,
  dependencies: any[] = []
) => {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;
    
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        const result = await fetchFunction();
        if (isMounted) {
          setData(result);
        }
      } catch (err) {
        if (isMounted) {
          setError(err instanceof Error ? err.message : 'An error occurred');
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchData();

    return () => {
      isMounted = false;
    };
  }, dependencies);

  return { data, loading, error, refetch: () => fetchData() };
};

// Validation utilities
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

const formatDateFromAPI = (dateString: string): string => {
  if (!dateString) return '';
  const [year, month, day] = dateString.split('-');
  return `${day}/${month}/${year}`;
};

const formatDateToAPI = (dateStr: string): string => {
  if (!dateStr) return '';
  
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

const formatDateToCalendar = (dateString: string): string => {
  if (!dateString || !validateDate(dateString)) return '';
  const [day, month, year] = dateString.split('/');
  return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
};

const formatDateFromCalendar = (dateString: string): string => {
  const [year, month, day] = dateString.split('-');
  return `${day}/${month}/${year}`;
};

// Form validation functions
const createValidationRules = () => ({
  validateCoverImage: (file: PickedFile | null) => 
    !file ? 'กรุณาเลือกรูปภาพหน้าปก' : '',
    
  validateTripName: (name: string) => {
    if (!name.trim()) return 'กรุณาใส่ชื่อทริป';
    return '';
  },
  
  validateDates: (startDate: string, endDate: string) => {
    const errors = { startDate: '', endDate: '' };
    
    if (!startDate) {
      errors.startDate = 'กรุณาเลือกวันที่เริ่มต้น';
    } else if (!validateDate(startDate)) {
      errors.startDate = 'รูปแบบวันที่ไม่ถูกต้อง';
    }
    
    if (!endDate) {
      errors.endDate = 'กรุณาเลือกวันที่สิ้นสุด';
    } else if (!validateDate(endDate)) {
      errors.endDate = 'รูปแบบวันที่ไม่ถูกต้อง';
    }
    
    if (startDate && endDate && validateDate(startDate) && validateDate(endDate)) {
      const startDateObj = new Date(startDate.split('/').reverse().join('-'));
      const endDateObj = new Date(endDate.split('/').reverse().join('-'));
      
      if (endDateObj <= startDateObj) {
        errors.endDate = 'วันที่สิ้นสุดต้องหลังจากวันที่เริ่มต้น';
      }
    }
    
    return errors;
  },
  
  validateMaxParticipants: (value: number | string) => {
    if (!value || value === '') return 'กรุณาใส่จำนวนคน';
    const num = parseInt(value.toString());
    if (isNaN(num) || num < 1) return 'จำนวนคนต้องเป็นตัวเลขและมากกว่า 0';
    if (num > MAX_PARTICIPANTS) return `จำนวนคนต้องไม่เกิน ${MAX_PARTICIPANTS} คน`;
    return '';
  },
  
  validatePricePerPerson: (value: number | string) => {
    if (!value || value === '') return 'กรุณาใส่ราคาต่อคน';
    const price = parseFloat(value.toString());
    if (isNaN(price) || price < 0) return 'ราคาต้องเป็นตัวเลขและมากกว่าหรือเท่ากับ 0';
    return '';
  },
  
  validateServices: (selectedServices: string[]) => 
    selectedServices.length === 0 ? 'กรุณาเลือกสิ่งที่รวมในราคาอย่างน้อย 1 รายการ' : '',
    
  validateTravelStyles: (selectedItems: string[]) => 
    selectedItems.length === 0 ? 'กรุณาเลือกสไตล์การเที่ยวอย่างน้อย 1 รายการ' : '',
    
  validateDestinations: (destinations: string[]) => 
    destinations.length === 0 ? 'กรุณาเลือกสถานที่ท่องเที่ยวอย่างน้อย 1 แห่ง' : '',
    
  validateAtmosphere: (description: string) => {
    if (!description.trim()) return 'กรุณาอธิบายบรรยากาศ/โทนกลุ่ม';
    return '';
  },
  
  validateDetails: (details: string) => {
    if (!details.trim()) return 'กรุณาใส่รายละเอียดทั่วไป';
    return '';
  }
});

// Main component
const ThaiFormScreen = () => {
  const params = useLocalSearchParams();
  const tripId = params.tripId as string;
  
  // Font loading
  const [fontsLoaded] = useFonts({
    'InterTight-Black': require('../assets/fonts/InterTight-Black.ttf'),
    'InterTight-SemiBold': require('../assets/fonts/InterTight-SemiBold.ttf'),
    'InterTight-Regular': require('../assets/fonts/InterTight-Regular.ttf')
  });

  // State management
  const [tripData, setTripData] = useState<TripData | null>(null);
  const [originalTripData, setOriginalTripData] = useState<TripData | null>(null);
  const [pickedFile, setPickedFile] = useState<PickedFile | null>(null);
  const [isFocused, setIsFocused] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [selectedServices, setSelectedServices] = useState<string[]>([]);
  const [destinations, setDestinations] = useState<string[]>([]);
  const [selectedDestinations, setSelectedDestinations] = useState<string[]>([]);
  const [maxParticipants, setMaxParticipants] = useState<number | ''>('');
  const [pricePerPerson, setPricePerPerson] = useState<number | ''>('');
  const [uploading, setUploading] = useState(false);
  const [userInfo, setUserInfo] = useState(null);
  
  // Date picker states
  const [showStartDatePicker, setShowStartDatePicker] = useState(false);
  const [showEndDatePicker, setShowEndDatePicker] = useState(false);
  
  // Dropdown states
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [searchText, setSearchText] = useState('');
  
  // Form data
  const [formData, setFormData] = useState<FormData>({
    name: '',
    startDate: '',
    endDate: '',
    description: '',
    details: ''
  });
  
  // Validation errors
  const [errors, setErrors] = useState<ValidationErrors>({
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

  // Validation rules
  const validationRules = useMemo(() => createValidationRules(), []);

  // API calls
  const fetchTripDetails = useCallback(async () => {
    try {
      const response = await axiosInstance.get(`/trips/${tripId}`);
      const result: TripData = response.data.data;
      setTripData(result);
      setOriginalTripData(result);
      return result;
    } catch (error) {
      console.error('Failed to fetch trip details:', error);
      throw error;
    }
  }, [tripId]);

  const fetchServices = useCallback(async () => {
    try {
      const response = await axiosInstance.get('/services');
      const result = response.data;
      const mappedServices: Service[] = result.data.map((item: any) => ({
        id: item.id,
        title: item.title,
      }));
      setServices(mappedServices);
      return mappedServices;
    } catch (error) {
      console.error('Failed to fetch services:', error);

      throw error;
    }
  }, []);

  const fetchTravelStyles = useCallback(async () => {
    try {
      const response = await axiosInstance.get('/travel-styles');
      const result = response.data;
      const mappedCategories: Category[] = result.data.map((item: any) => ({
        id: item.id,
        title: item.title,
        iconImageUrl: item.iconImageUrl,
        activeIconImageUrl: item.activeIconImageUrl || item.iconImageUrl,
      }));
      setCategories(mappedCategories);
      return mappedCategories;
    } catch (error) {
      console.error('Failed to fetch travel styles:', error);
   
      throw error;
    }
  }, []);

  const fetchDestinations = useCallback(async () => {
    try {
      const response = await axiosInstance.get('/destinations');
      const result = response.data.data || [];
      setDestinations(result);
      return result;
    } catch (error) {
      console.error('Failed to fetch destinations:', error);
      setDestinations([]);
      throw error;
    }
  }, []);

  const getUserInfo = useCallback(async () => {
    try {
      const userId = await AsyncStorage.getItem('userId');
      const response = await axiosInstance.get(`/users/profile/${userId}`);
      setUserInfo(response.data.data);
      return response.data.data;
    } catch (error) {
      console.error('Error fetching user info:', error);
      throw error;
    }
  }, []);

  // Use custom hook for data fetching
  const { loading: tripLoading } = useAsyncData(fetchTripDetails, [tripId]);
  const { loading: servicesLoading } = useAsyncData(fetchServices, []);
  const { loading: stylesLoading } = useAsyncData(fetchTravelStyles, []);
  const { loading: destinationsLoading } = useAsyncData(fetchDestinations, []);
  const { loading: userLoading } = useAsyncData(getUserInfo, []);

  // Initialize form data when trip data is loaded
  useEffect(() => {
    if (tripData && services.length > 0 && categories.length > 0) {
      setInitialFormData(tripData);
    }
  }, [tripData, services, categories]);

  const setInitialFormData = useCallback((data: TripData) => {
    setFormData({
      name: data.name || '',
      startDate: data.startDate ? formatDateFromAPI(data.startDate) : '',
      endDate: data.endDate ? formatDateFromAPI(data.endDate) : '',
      description: data.groupAtmosphere || '',
      details: data.detail || ''
    });

    setPricePerPerson(data.pricePerPerson || '');
    setMaxParticipants(data.maxParticipants || '');

    if (data.includedServices && data.includedServices.length > 0) {
      const selectedServiceIds = services
        .filter(service => data.includedServices.includes(service.title))
        .map(service => service.id);
      setSelectedServices(selectedServiceIds);
    }

    if (data.tripCoverImageUrl) {
      setPickedFile({
        uri: data.tripCoverImageUrl,
        type: 'image/jpeg',
        name: 'cover-image.jpg'
      });
    }

    if (data.travelStyles && data.travelStyles.length > 0 && categories.length > 0) {
      const selectedStyleIds = categories
        .filter(category => data.travelStyles.includes(category.title))
        .map(category => category.id);
      setSelectedItems(selectedStyleIds);
    }
    
    if (data.destinations && data.destinations.length > 0) {
      setSelectedDestinations(data.destinations);
    }
  }, [services, categories]);

  // Event handlers
  const handleBack = useCallback(() => {
    // Reset all form data to original values from database
    if (originalTripData) {
      setInitialFormData(originalTripData);
    }
    
    // Clear any draft data
    AsyncStorage.removeItem(`trip_draft_${tripId}`)
      .catch(error => console.error('Failed to clear draft:', error));
    
    // Clear any validation errors
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
    
    // Navigate back
    router.push('/(tabs)/findTrips');
  }, [originalTripData, setInitialFormData, tripId]);

  const clearError = useCallback((field: keyof ValidationErrors) => {
    setErrors(prev => ({ ...prev, [field]: '' }));
  }, []);

  const handleTextChange = useCallback((field: keyof FormData, value: string, maxLength?: number) => {
    if (maxLength && value.length > maxLength) return;
    
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Clear error when user starts typing
    const errorField = field === 'name' ? 'tripName' : 
                      field === 'description' ? 'atmosphere' : field as keyof ValidationErrors;
    if (errors[errorField]) {
      clearError(errorField);
    }
  }, [errors, clearError]);

  const handleNumberInput = useCallback((
    setter: React.Dispatch<React.SetStateAction<number | ''>>,
    value: string,
    errorField: keyof ValidationErrors,
    maxValue?: number
  ) => {
    const filteredText = value.replace(/[^0-9]/g, '');
    const numberValue = filteredText ? parseInt(filteredText, 10) : '';
    
    if (maxValue && numberValue && numberValue > maxValue) return;
    
    setter(numberValue);
    if (errors[errorField]) {
      clearError(errorField);
    }
  }, [errors, clearError]);

  const toggleSelection = useCallback((id: string, type: 'services' | 'styles') => {
    if (type === 'services') {
      setSelectedServices(prev =>
        prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
      );
      if (errors.services) clearError('services');
    } else {
      setSelectedItems(prev =>
        prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
      );
      if (errors.travelStyles) clearError('travelStyles');
    }
  }, [errors, clearError]);

  const handleDateSelect = useCallback((day: any, type: 'start' | 'end') => {
    const selectedDate = formatDateFromCalendar(day.dateString);
    
    setFormData(prev => ({ 
      ...prev, 
      [type === 'start' ? 'startDate' : 'endDate']: selectedDate 
    }));
    
    if (type === 'start') {
      setShowStartDatePicker(false);
      if (errors.startDate) clearError('startDate');
    } else {
      setShowEndDatePicker(false);
      if (errors.endDate) clearError('endDate');
    }
  }, [errors, clearError]);

  const addDestination = useCallback((dest: string) => {
    if (!selectedDestinations.includes(dest)) {
      setSelectedDestinations(prev => [...prev, dest]);
      if (errors.destinations) clearError('destinations');
    }
    setDropdownOpen(false);
    setSearchText('');
  }, [selectedDestinations, errors, clearError]);

  const removeDestination = useCallback((dest: string) => {
    setSelectedDestinations(prev => prev.filter(d => d !== dest));
  }, []);

  // Image picker
  const pickImage = useCallback(() => {
    const options = {
      mediaType: 'photo' as const,
      includeBase64: false,
      maxWidth: 1024,
      maxHeight: 1024,
      storageOptions: {
        skipBackup: true,
        path: 'images',
      },
      presentationStyle: 'overFullScreen' as const,
    };

    launchImageLibrary(options, (response: any) => {
      if (response.didCancel || response.errorMessage) {

        return;
      }

      if (response.assets && response.assets.length > 0) {
        const pickedImage = response.assets[0];
        
        if (!pickedImage.uri) {
  
          return;
        }

        const file: PickedFile = {
          uri: pickedImage.uri,
          type: pickedImage.type ?? 'image/jpeg',
          name: pickedImage.fileName ?? `cover-image-${Date.now()}.jpg`,
          size: pickedImage.fileSize,
        };

        // Handle base64 if needed
        if (pickedImage.uri.startsWith('data:')) {
          const base64Data = pickedImage.uri.split(',')[1];
          file.base64Data = base64Data;
          file.isBase64 = true;
        }

        setPickedFile(file);
        if (errors.coverImage) clearError('coverImage');
      }
    });
  }, [errors, clearError]);

  // Form validation
  const validateForm = useCallback((): boolean => {
    const newErrors: ValidationErrors = {
      coverImage: validationRules.validateCoverImage(pickedFile),
      tripName: validationRules.validateTripName(formData.name),
      ...validationRules.validateDates(formData.startDate, formData.endDate),
      maxParticipants: validationRules.validateMaxParticipants(maxParticipants),
      pricePerPerson: validationRules.validatePricePerPerson(pricePerPerson),
      services: validationRules.validateServices(selectedServices),
      travelStyles: validationRules.validateTravelStyles(selectedItems),
      destinations: validationRules.validateDestinations(selectedDestinations),
      atmosphere: validationRules.validateAtmosphere(formData.description),
      details: validationRules.validateDetails(formData.details),
      terms: '' // Not used in this form
    };

    setErrors(newErrors);
    
    return Object.values(newErrors).every(error => error === '');
  }, [
    validationRules,
    pickedFile,
    formData,
    maxParticipants,
    pricePerPerson,
    selectedServices,
    selectedItems,
    selectedDestinations
  ]);

  // Submit handler
  const handleSubmit = useCallback(async () => {
    if (!validateForm()) {
      return;
    }

    try {
      setUploading(true);

      const travelStyleIds = categories
        .filter(category => selectedItems.includes(category.id))
        .map(category => category.id);

      const updatePayload = {
        name: formData.name.trim(),
        startDate: formatDateToAPI(formData.startDate),
        endDate: formatDateToAPI(formData.endDate),
        destinations: selectedDestinations,
        maxParticipants: parseInt(maxParticipants.toString()),
        pricePerPerson: parseFloat(pricePerPerson.toString()),
        includedServices: selectedServices,
        detail: formData.details || '',
        travelStyles: travelStyleIds,
        groupAtmosphere: formData.description || '',
        status: 'published'
      };

      const idToken = await AsyncStorage.getItem('googleIdToken');

      // Update trip details
      await axiosInstance.put(`/trips/${tripId}`, updatePayload, {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${idToken}`
        },
        timeout: 60000,
      });

      // Update cover image if changed
      if (pickedFile && pickedFile.uri !== originalTripData?.tripCoverImageUrl) {
        try {
          const imageFormData = new FormData();
          
          if (pickedFile.isBase64 && pickedFile.base64Data) {
            const response = await fetch(`data:${pickedFile.type};base64,${pickedFile.base64Data}`);
            const blob = await response.blob();
            imageFormData.append('file', blob, pickedFile.name);
          } else {
            const fileObj = {
              uri: pickedFile.uri,
              type: pickedFile.type || 'image/jpeg',
              name: pickedFile.name || 'image.jpg',
            } as any;
            
            imageFormData.append('file', fileObj);
          }

          await axiosInstance.patch(`/trips/${tripId}/cover-image`, imageFormData, {
            headers: {
              'Content-Type': 'multipart/form-data',
              Authorization: `Bearer ${idToken}`
            },
            timeout: 60000,
          });
        } catch (imageError) {
          console.error('Image update error:', imageError);
        }
      }


    } catch (error) {
      console.error('Trip update error:', error);
      
      let errorMessage = 'ไม่สามารถอัปเดตทริปได้';
      
      if (error && typeof error === 'object' && 'response' in error) {
        const axiosError = error as any;
        const serverMessage = axiosError.response?.data?.message;
        if (serverMessage) {
          errorMessage = serverMessage;
        }
      }
      
   
    } finally {
      setUploading(false);
      router.push('/(tabs)/findTrips')
    }
  }, [
    validateForm,
    formData,
    selectedDestinations,
    maxParticipants,
    pricePerPerson,
    selectedServices,
    categories,
    selectedItems,
    tripId,
    pickedFile,
    originalTripData
  ]);

  // Computed values
  const filteredDestinations = useMemo(() => 
    destinations.filter(dest =>
      dest.toLowerCase().includes(searchText.toLowerCase())
    ), [destinations, searchText]
  );

  const isLoading = tripLoading || servicesLoading || stylesLoading || destinationsLoading || userLoading;

 // Continuation from the createTripFromFormData function
 const createTripFromFormData = useCallback(() => ({
  id: 'preview-trip',
  name: formData.name,
  destinations: selectedDestinations,
  startDate: formData.startDate ? new Date(formData.startDate.split('/').reverse().join('-')).toISOString() : new Date().toISOString(),
  endDate: formData.endDate ? new Date(formData.endDate.split('/').reverse().join('-')).toISOString() : new Date().toISOString(),
  maxParticipants: parseInt(maxParticipants.toString()) || 0,
  participants: [],
  pricePerPerson: pricePerPerson,
  detail: formData.details,
  groupAtmosphere: formData.description,
  includedServices: services
    .filter(service => selectedServices.includes(service.id))
    .map(service => service.title),
  travelStyles: categories
    .filter(category => selectedItems.includes(category.id))
    .map(category => category.title),
  tripCoverImageUrl: pickedFile?.uri,
  tripOwner: {
    id: userInfo?.userId || 'current-user',
    displayName: userInfo?.fullname || 'ผู้สร้างทริป',
    firstName: userInfo?.fullname?.split(' ')[0] || '',
    lastName: userInfo?.fullname?.split(' ').slice(1).join(' ') || '',
    profileImageUrl: userInfo?.profileImageUrl || 'https://via.placeholder.com/150',
    email: userInfo?.email || '',
    phoneNumber: userInfo?.phoneNumber || ''
  },
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  status: 'draft',
  isPublished: false,
  category: 'adventure',
  rating: 0,
  reviewCount: 0,
  bookingCount: 0,
  currency: 'THB',
  cancellationPolicy: 'flexible',
  difficulty: 'moderate',
  transportation: 'mixed',
  accommodation: 'hotel',
  meals: 'some_included',
  languages: ['th', 'en'],
  minAge: 18,
  maxAge: 65,
  tags: [],
  highlights: [],
  itinerary: [],
  whatToExpect: [],
  importantInfo: [],
  faq: [],
  cancellationRules: [],
  refundPolicy: {}
}), [
  formData,
  selectedDestinations,
  maxParticipants,
  pricePerPerson,
  services,
  selectedServices,
  categories,
  selectedItems,
  pickedFile,
  userInfo
]);



// Auto-save functionality
useEffect(() => {
  const autoSaveTimer = setTimeout(() => {
    if (tripData && formData.name.trim()) {
      // Auto-save draft to local storage
      const draftData = {
        formData,
        selectedDestinations,
        maxParticipants,
        pricePerPerson,
        selectedServices,
        selectedItems,
        pickedFile: pickedFile ? { uri: pickedFile.uri, type: pickedFile.type, name: pickedFile.name } : null,
        lastSaved: new Date().toISOString()
      };
      
      AsyncStorage.setItem(`trip_draft_${tripId}`, JSON.stringify(draftData))
        .catch(error => console.error('Auto-save failed:', error));
    }
  }, 3000); // Auto-save every 3 seconds

  return () => clearTimeout(autoSaveTimer);
}, [
  formData,
  selectedDestinations,
  maxParticipants,
  pricePerPerson,
  selectedServices,
  selectedItems,
  pickedFile,
  tripId,
  tripData
]);

// Load draft data on component mount
useEffect(() => {
  const loadDraft = async () => {
    try {
      const draftData = await AsyncStorage.getItem(`trip_draft_${tripId}`);
      if (draftData && !tripData) {
        const draft = JSON.parse(draftData);
        
        // Only load draft if it's newer than the server data
        if (originalTripData && new Date(draft.lastSaved) > new Date(originalTripData.updatedAt || '')) {
          setFormData(draft.formData);
          setSelectedDestinations(draft.selectedDestinations || []);
          setMaxParticipants(draft.maxParticipants || '');
          setPricePerPerson(draft.pricePerPerson || '');
          setSelectedServices(draft.selectedServices || []);
          setSelectedItems(draft.selectedItems || []);
          
          if (draft.pickedFile) {
            setPickedFile(draft.pickedFile);
          }
        }
      }
    } catch (error) {
      console.error('Failed to load draft:', error);
    }
  };

  loadDraft();
}, [tripId, tripData, originalTripData]);

// Loading state
if (!fontsLoaded || isLoading) {
  return (
    <View style={styles.loadingContainer}>
       <Stack.Screen options={{ headerShown: false }} />
      <ActivityIndicator size="large" color="#2196F3" />
      <Text style={styles.loadingText}>กำลังโหลด...</Text>
    </View>
  );
}



// Return the JSX
return (
  <SafeAreaView style={styles.container}>
    {/* Header */}
    <Stack.Screen options={{ headerShown: false }} />
    <View style={styles.header}>
      <TouchableOpacity style={styles.backButton} onPress={handleBack}>
        <Image source={require('../assets/images/images/images/image15.png')} style={{marginLeft:15,width:20,height:18}}/>
      </TouchableOpacity>
      <Text style={styles.headerTitle}>แก้ไขทริป</Text>
    </View>

    <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
      <View style={styles.formSection}>
      
        <TouchableOpacity
          style={[
            styles.uploadBox,
            errors.coverImage && styles.uploadBoxError
          ]}
          onPress={() => {
            clearError('coverImage');
            pickImage();
          }}
        >
          {pickedFile ? (
            <Image source={{ uri: pickedFile.uri }} style={styles.uploadedImage} />
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
            value={formData.name}
            onChangeText={(text) => handleTextChange('name', text, 50)}
            placeholder="ตั้งชื่อทริปของคุณ"
            placeholderTextColor='gray'
            multiline
            maxLength={50} 
          />
          <Text style={[
            styles.wordCount,
            formData.name.length > 45 && { color: 'red' }
          ]}>
            {formData.name.length}/50
          </Text>
        </View>
       

        <Text style={styles.dateFieldHeader}>วันที่เริ่มต้น</Text>

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
        <View style={styles.dateErrorContainer}>
          <Text style={styles.dateErrorText}>{errors.startDate || ''}</Text>
          <Text style={styles.dateErrorText}>{errors.endDate || ''}</Text>
        </View>
       
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
                onDayPress={(day) => handleDateSelect(day, 'start')}
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
                minDate={new Date().toISOString().split('T')[0]}
              />
            </View>
          </View>
        </Modal>

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
                onDayPress={(day) => handleDateSelect(day, 'end')}
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

      <Text style={styles.maxPHeader}>จำนวนคน</Text>

      <View style={[
       styles.maxPContainer,
        errors.maxParticipants && styles.inputError
      ]}>
        <Image
          source={require('../assets/images/images/images/image11.png')}
          style={{ height: 16, width: 16, marginHorizontal: 3 }}
          resizeMode="contain"
        />
        <TextInput
          style={styles.mParticipantsInput}
          placeholder=''
          value={maxParticipants !== '' ? maxParticipants.toString() : ''}
          onChangeText={(text) => handleNumberInput(setMaxParticipants, text, 'maxParticipants', 15)}
          keyboardType='numeric'
        />
        <Text style={{ marginLeft: 3, flex: 0.2, fontFamily: 'InterTight-Regular' }}>คน</Text>
      </View>
     

      <Text style={styles.pPersonHeader}>ราคาต่อคน</Text>

      <View style={[
       styles.pPerPersonErrorParentWrapper,
        errors.pricePerPerson && styles.inputError
      ]}>
        <Image
          source={require('../assets/images/images/images/image12.png')}
          style={{ height: 16, width: 16, marginHorizontal: 3 }}
          resizeMode="contain"
        />
        <Text style={styles.pPerPersonTextFront}>ราคาต่อคน</Text>
        <TextInput
          style={styles.pPerPersonText}
          placeholder=''
          value={pricePerPerson !== '' ? pricePerPerson.toString() : ''}
          onChangeText={(text) => handleNumberInput(setPricePerPerson, text, 'pricePerPerson')}
          keyboardType='numeric'
        />
        <Text style={styles.pPerPersonUnitText}>บาท</Text>
      </View>
     
      <View style={styles.checkboxSection}>
        <Text style={styles.label}>สิ่งที่รวมในราคา</Text>
        <View style={styles.checkboxContainer}>
          {services.map(service => (
            <TouchableOpacity
              key={service.id}
              style={styles.checkboxRow}
              onPress={() => toggleSelection(service.id, 'services')}
            >
              <TouchableOpacity
                style={styles.checkbox}
                onPress={() => toggleSelection(service.id, 'services')}
              >
                <View
                  style={[
                    styles.checkboxInner,
                    selectedServices.includes(service.id) && styles.checked,
                  ]}
                />
              </TouchableOpacity>
              <Text style={styles.checkboxText}>{service.title}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>
     
      
      <View style={styles.content}>
        <Text style={styles.label}>สไตล์การเที่ยว</Text>
        {stylesLoading ? (
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
                  onPress={() => toggleSelection(category.id, 'styles')}
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
      
      <View style={{
        backgroundColor: '#fff',
        position: 'relative',
        zIndex: 1000,
        marginBottom: dropdownOpen ? 220 : 30, 
        marginTop:10,
        marginHorizontal:20
      }}>
        <TouchableOpacity onPress={() => setDropdownOpen(!dropdownOpen)}>
          <View>
            {dropdownOpen ? (
              <TextInput
                style={styles.BeforedropDownOpenTextInput}
                placeholder="ค้นหาสถานที่"
                value={searchText}
                onChangeText={setSearchText}
                autoFocus={true}
              />
            ) : (
              <Text style={styles.dropDownOpenTextInput}>
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
          <View style={styles.dropDownOpen}>
            {destinationsLoading ? (
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
            {selectedDestinations.map((dest, index) => (
              <TouchableOpacity
                key={index}
                style={styles.selectedDestinations}
                onPress={() => removeDestination(dest)}
              >
                <Text style={styles.selectedDestinationsText}>
                  {dest} <Text style={{ fontSize: 16 }}>×</Text>
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </View>


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
            onChangeText={(text) => handleTextChange('description', text, 100)}
            placeholder="อธิบายบรรยากาศหรือโทนของกลุ่มที่ต้องการ...."
            placeholderTextColor="#888"
            maxLength={100} 
          />
          <Text style={[
            styles.wordCountText,
            formData.description.length > 90 && { color: 'red' }
          ]}>
            {formData.description.length}/100
          </Text>
        </View>
      </View>
 
            
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
          onChangeText={(text) => handleTextChange('details', text)}
          placeholder='เขียนรายละเอียดทริปของคุณ...'
          placeholderTextColor="#888"
        />
      </View>
     
      <Text style={{fontWeight:'600',fontFamily:'InterTight-Regular',marginHorizontal:20,marginBottom:5}}>ตัวอย่างโพสต์</Text>
      {userInfo && (
        <TripCard
          trip={createTripFromFormData()}
          isBookmarked={false} 
          onBookmarkToggle={() => {}}
          onTripPress={() => {}}
          onJoinTrip={() => {}}
        />
      )}

    </ScrollView>

   <View style={{ flexDirection: 'row', borderTopWidth: 1, borderTopColor: '#e0e0e0' }}>
     
   
     <View style={styles.submitContainer}>
       <TouchableOpacity 
         style={[
           styles.submitButton,
         ]} 
         onPress={handleSubmit } 
       
       >
         <Text style={styles.submitText}>
          Edit
         </Text>
       </TouchableOpacity>
     </View>
   </View>
    <Text style={styles.submitNote}>กรุณาตรวจสอบข้อมูลให้ถูกต้องก่อนบันทึก</Text>
    
  </SafeAreaView>
);
};


export default ThaiFormScreen;