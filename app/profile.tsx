import React, { useState,useEffect,useRef } from 'react';
import { FontAwesome } from '@expo/vector-icons';
import { Animated,Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as ImagePicker from 'expo-image-picker';
import {
    FlatList,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Image,
  StyleSheet,
  SafeAreaView,
  ActivityIndicator,
  StatusBar,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router,Stack } from 'expo-router';
import {axiosInstance} from '../lib/axios'

interface Category {
  id: string;
  title: string;
  iconImageUrl: string;
  activeIconImageUrl: string;
}

interface ApiResponse {
  data: {
    id: string;
    title: string;
    iconImageUrl: string;
    activeIconImageUrl: string;
  }[];
  message: string;
}

interface FormData {
  fullName: string;
  nickname: string;
  age: string;
  gender: string;
  customGender: string;
  email: string;
  facebookUrl: string;
  lineId: string;
  travelStyles: string[];          // only this, prefer this over travelInterests
  favouriteDestinations: string[];
}

interface ProfileFormData {
  fullName: string;
  nickname: string;
  age: string;
  gender: string;
  customGender: string;
  email: string;
  facebookUrl: string;
  lineId: string;
  travelInterests: string[];
  favouriteDestinations: string[];
  travelStyles?: string[];
}



interface ValidationErrors {
  nickname?:string;
  fullName?: string;
  age?: string;
  gender?: string;
  email?: string;
}

const ProfileForm: React.FC = () => {
  const [imageFile, setImageFile] = useState<{ uri: string; type: string; fileName: string } | null>(null);
    const [email, setEmail] = useState<string | null>(null);


    const [destinations, setDestinations] = useState<string[]>([]);
    const [loading, setLoading] = useState(false);
    const [selected, setSelected] = useState<string[]>([]);
    const [dropdownOpen, setDropdownOpen] = useState(false);
    const [selectedItems, setSelectedItems] = useState<string[]>([]);
    const [categories, setCategories] = useState<Category[]>([]);
    const [showGenderDropdown, setShowGenderDropdown] = useState(false);


    


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
        // Fallback to empty array or default categories
        setCategories([]);
      } finally {
        setLoading(false);
      }
    };

     const toggleSelection = (id: string): void => {
    setSelectedItems(prev => 
      prev.includes(id) 
        ? prev.filter(item => item !== id)
        : [...prev, id]
    );
  };

  
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
  
    function addDestination(dest: string) {
      if (!selected.includes(dest)) {
        setSelected([...selected, dest]);
      }
      setDropdownOpen(false);
    }
  
    function removeDestination(dest: string) {
      setSelected(selected.filter(d => d !== dest));
    }


    const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
    useEffect(() => {
        const fetchEmail = async () => {
          const storedID = await AsyncStorage.getItem('userID');
          console.log('User Id:', storedID);
          setEmail(storedID);
        };
      
        fetchEmail();
      }, []);
     // console.log('User ID:', email);

      useEffect(() => {
        const fetchCategories = async () => {
          try {
            const stored = await AsyncStorage.getItem('Catagories_id');
            if (stored) {
              setSelectedCategories(JSON.parse(stored));
            }
          } catch (error) {
            console.error('Error reading categories:', error);
          }
        };
    
        fetchCategories();
      }, []);

      console.log("Catagories IDDDDDD:  "+selectedCategories);
      

    const progressAnimation = useRef(new Animated.Value(66.66)).current;

  useEffect(() => {

 
    
    const animateProgress = () => {
      Animated.timing(progressAnimation, {
        toValue: 100,
        duration: 300,
        useNativeDriver: false,
      }).start();
    };

    setTimeout(animateProgress, 300);

    fetchTravelStyles();
  }, []);
  const [formData, setFormData] = useState<ProfileFormData>({
    fullName: '',
    nickname: '',
    age: '',
    gender: '',
    customGender: '',
    email: '',
    facebookUrl: '',
    lineId: '',
    travelInterests: [],
    favouriteDestinations: [],
    travelStyles: [],
  });
  
  
  

  const [errors, setErrors] = useState<ValidationErrors>({});
  const [selectedInterests, setSelectedInterests] = useState<string[]>([]);
  
  const genderOptions = ['ผู้ชาย', 'ผู้หญิง', 'อื่นๆ'] as const;

  




  const validateFullName = (name: string): string | null => {
    if (!name.trim()) {
      return 'กรุณากรอกชื่อ-นามสกุล';
    }

    

    // Check for special characters (allow only Thai, English letters and single space)
    const specialCharRegex = /[^a-zA-Zก-๙\s]/;
    if (specialCharRegex.test(name)) {
      return 'ชื่อ-นามสกุลไม่สามารถมีอักขระพิเศษได้';
    }

    // Check for multiple spaces
    if (name.includes('  ')) {
      return 'ชื่อ-นามสกุลไม่สามารถมีช่องว่างมากกว่า 1 ช่องได้';
    }

    // Split by space and check parts
    const parts = name.trim().split(' ');
    
    // Must have exactly 2 parts (first name and last name)
    if (parts.length !== 2) {
      return 'กรุณากรอกชื่อและนามสกุล คั่นด้วยช่องว่าง 1 ช่อง';
    }

    // Both parts must not be empty
    if (parts[0].length === 0 || parts[1].length === 0) {
      return 'กรุณากรอกชื่อและนามสกุลให้ครบถ้วน';
    }

    return null;
  };

  const validatenickName = (name: string): string | null => {
    const trimmed = name.trim();
  
    if (!trimmed) {
      return 'กรุณากรอกชื่อเล่น';
    }
  
    // Check for spaces (only one word allowed)
    if (trimmed.includes(' ')) {
      return 'ชื่อเล่นต้องเป็นคำเดียวโดยไม่มีช่องว่าง';
    }
  
    // Check for special characters (only Thai or English letters allowed)
    const specialCharRegex = /[^a-zA-Zก-๙]/;
    if (specialCharRegex.test(trimmed)) {
      return 'ชื่อเล่นสามารถประกอบด้วยตัวอักษรภาษาไทยหรืออังกฤษเท่านั้น';
    }
  
    return null;
  };
  



  const validateAge = (age: string): string | null => {
    if (!age.trim()) {
      return 'กรุณากรอกอายุ';
    }

    const ageNum = parseInt(age);
    if (isNaN(ageNum) || ageNum < 0) {
      return 'อายุต้องเป็นตัวเลขที่มากกว่าหรือเท่ากับ 0';
    }

    if (ageNum > 150) {
      return 'กรุณากรอกอายุที่ถูกต้อง';
    }

    return null;
  };

  const validateEmail = (email: string): string | null => {
    if (!email.trim()) {
      return 'กรุณากรอกอีเมล';
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return 'รูปแบบอีเมลไม่ถูกต้อง';
    }

    return null;
  };

  const validateForm = (): boolean => {
    const newErrors: ValidationErrors = {};

    // Validate full name
    const fullNameError = validateFullName(formData.fullName);
    if (fullNameError) newErrors.fullName = fullNameError;

    const nicknameError = validatenickName(formData.nickname);
    if (nicknameError) newErrors.nickname = nicknameError;

    // Validate age
    const ageError = validateAge(formData.age);
    if (ageError) newErrors.age = ageError;

    // Validate gender
    if (!formData.gender) {
      newErrors.gender = 'กรุณาเลือกเพศ';
    }

    // Validate email
    const emailError = validateEmail(formData.email);
    if (emailError) newErrors.email = emailError;

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const toggleInterest = (interest: string): void => {
    if (selectedInterests.includes(interest)) {
      setSelectedInterests(selectedInterests.filter(item => item !== interest));
    } else {
      setSelectedInterests([...selectedInterests, interest]);
    }
  };
  

  const removeSelectedInterest = (interest: string): void => {
    setSelectedInterests(selectedInterests.filter(item => item !== interest));
  };

  const handleBack = (): void => {
    router.push('/travel-style')
  };

  const handleSubmit = async (): Promise<void> => {
    if (!validateForm()) {
      console.log('ข้อผิดพลาด', 'กรุณาตรวจสอบข้อมูลที่กรอกให้ถูกต้อง');
      return;
    }
  
    const userId = await AsyncStorage.getItem('userID');
    if (!userId) {
      console.log('ข้อผิดพลาด', 'ไม่พบ userID');
      return;
    }
  
    const selectedStyleNames = categories
      .filter(cat => selectedItems.includes(cat.id))
      .map(cat => cat.title);
  
    const profileData = {
      id: userId,
      userId: userId,
      fullname: formData.fullName || '',
      nickname: formData.nickname || '',
      email: formData.email ?? '',
      gender: formData.gender || '',
      age: Number(formData.age) || 0,
      travelStyles: selectedStyleNames,
      destinations: Array.from(new Set(selected)),
      lineId: formData.lineId || '',
      facebookUrl: formData.facebookUrl || '',
      profileImageUrl: '',
    };
    console.log('📦 Sending profileData:', JSON.stringify(profileData, null, 2));
  
    try {
      const res = await fetch('http://143.198.83.179:8080/users/profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(profileData),
      });
  
      if (!res.ok) {
        const text = await res.text();
        throw new Error(`Failed to create profile: ${text}`);
      }
  
      const createdProfile = await res.json();
      console.log('Created profile response:', createdProfile);
      const profileId = createdProfile.data?.userId; 
  
      if (imageFile && profileId) {
        const isWeb = Platform.OS === 'web';
  
        const formDataObj = new FormData();
  
        if (isWeb) {
          formDataObj.append('file', imageFile as any);
        } else {
          formDataObj.append('file', {
            uri: imageFile.uri,
            name: imageFile.fileName || 'profile.jpg',
            type: imageFile.type || 'image/jpeg',
          } as any);
        }
  
        try {
        
          
          const uploadRes = await axiosInstance.patch(
            `/users/profile/image/${profileId}`, 
            formDataObj, 
            {
              headers: {
                'Accept': 'application/json',
                'Content-Type': 'multipart/form-data', // Important for uploading files
              },
            }
          );
        
          // Check for success (status code 2xx)
          if (uploadRes.status >= 200 && uploadRes.status < 300) {
            console.log('✅ Upload Success:', 'บันทึกรูปภาพเรียบร้อยแล้ว');
            Alert.alert('สำเร็จ', 'สร้างโปรไฟล์และอัปโหลดรูปภาพสำเร็จ');
          } else {
            throw new Error(`Failed to upload image: ${uploadRes.data.message || 'Unknown error'}`);
          }
        
        } catch (err: any) {
          console.log('❌ Upload Failed:', err.message);
          Alert.alert('ข้อผิดพลาด', 'เกิดข้อผิดพลาดในการอัปโหลดรูปภาพ');
        }
      } else if (imageFile && !profileId) {
        console.log('❌ Cannot upload image because profileId is missing');
        Alert.alert('ข้อผิดพลาด', 'ไม่พบรหัสโปรไฟล์สำหรับอัปโหลดรูปภาพ');
      }
  
    } catch (error: any) {
      console.log('ข้อผิดพลาด', error.message || 'เกิดข้อผิดพลาดในการสร้างโปรไฟล์');
    }
  };
  
  
  
  
  
  
  

  const handleImagePicker = async (): Promise<void> => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission denied', 'ต้องการสิทธิ์เข้าถึงรูปภาพ');
      return;
    }
  
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.7,
    });
  
    if (!result.canceled && result.assets && result.assets.length > 0) {
      const asset = result.assets[0];
      setImageFile({
        uri: asset.uri,
        type: 'image/jpeg', // or infer from asset info if available
        fileName: asset.uri.split('/').pop() || 'profile.jpg',
      });
    }
  };
  
  

  const renderError = (error?: string) => {
    if (!error) return null;
    return <Text style={styles.errorText}>{error}</Text>;
  };

  return (
    <SafeAreaView style={styles.container}>
      <Stack.Screen options={{ headerShown: false }} />
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={handleBack}>
          <FontAwesome name="angle-left" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerText}>สร้างโปรไฟล์</Text>
      </View>

      {/* Progress Bar */}
      <View style={styles.progressContainer}>
        <View style={styles.progressBar}>
          <Animated.View 
            style={[
              styles.progressFill,
              {
                width: progressAnimation.interpolate({
                  inputRange: [0, 33.33],
                  outputRange: ['0%', '33.33%'],
                }),
              },
            ]} 
          />
        </View>
      </View>

      <ScrollView 
        style={styles.scrollView} 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Profile Picture */}
        <View style={styles.profileSection}>
  <TouchableOpacity 
    style={styles.profileImageContainer}
    onPress={handleImagePicker}
  >
    <Image 
      source={
        imageFile ? { uri: imageFile.uri } : { uri: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face' }
      }
      style={styles.profileImage}
    />
    <View style={styles.cameraButton}>
    <Image
        source={require('../assets/images/images/image6.png')} 
        style={{height:16,width:16}}
        resizeMode="contain"
      />
    </View>
  </TouchableOpacity>
  <Text style={styles.uploadText}>อัพโหลดรูปโปรไฟล์ของคุณ</Text>
</View>


        {/* Form Fields */}
        <View style={styles.formSection}>
          {/* Full Name */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>ชื่อ </Text>
            <TextInput
              style={[styles.input, errors.fullName && styles.inputError]}
              placeholder="ชื่อจริง และ นามสกุล"
              value={formData.fullName}
              onChangeText={(text: string) => {
                setFormData({...formData, fullName: text});
                if (errors.fullName) {
                  setErrors({...errors, fullName: undefined});
                }
              }}
              placeholderTextColor="#999"
            />
            {renderError(errors.fullName)}
          </View>


          <View style={styles.inputGroup}>
  <Text style={styles.label}>ชื่อเล่น</Text>
  <TextInput
    style={[styles.input, errors.nickname && styles.inputError]}
    placeholder="ชื่อสำหรับแสดงในแอป"
    value={formData.nickname}
    onChangeText={(text: string) => {
      setFormData({ ...formData, nickname: text });
      if (errors.nickname) {
        setErrors({ ...errors, nickname: undefined });
      }
    }}
    placeholderTextColor="#999"
  />
  {renderError(errors.nickname)}
</View>


                {/* Email */}
                <View style={styles.inputGroup}>
            <Text style={styles.label}>อีเมล</Text>
            <TextInput
              style={[styles.input, errors.email && styles.inputError]}
              placeholder="example@email.com"
              value={formData.email}
              onChangeText={(text: string) => {
                setFormData({...formData, email: text});
                if (errors.email) {
                  setErrors({...errors, email: undefined});
                }
              }}
              keyboardType="email-address"
              autoCapitalize="none"
              placeholderTextColor="#999"
            />
            {renderError(errors.email)}
          </View>

          <View style={[{ flexDirection: 'row',gap:10 }, styles.inputGroup]}>

        {/* Age */}
        <View style={[{ flex: 1 }]}>

          <Text style={styles.label}>อายุ</Text>
          <TextInput
            value={formData.age}
            style={styles.input}
            onChangeText={(text) => {
              setFormData({ ...formData, age: text });
              if (errors.age) setErrors({ ...errors, age: undefined });
            }}
            keyboardType="numeric"
            placeholder="อายุของคุณ"
          
          />
          {renderError(errors.age)}
        </View>

        {/* Gender Dropdown */}
        <View style={{ flex: 1 }}>
          <Text style={styles.label}>เพศ</Text>

          <TouchableOpacity
            style={styles.input}
            onPress={() => setShowGenderDropdown(!showGenderDropdown)}
          >
            <Text>{formData.gender || 'เลือกเพศ'}</Text>
          </TouchableOpacity>

          {showGenderDropdown && (
            <View style={styles.dropdownList}>
              {genderOptions.map((option) => (
                <TouchableOpacity
                  key={option}
                  onPress={() => {
                    setFormData({ ...formData, gender: option, customGender: '' });
                    setShowGenderDropdown(false);
                    if (errors.gender) setErrors({ ...errors, gender: undefined });
                  }}
                  style={[
                    styles.dropdownItem,
                    formData.gender === option && styles.dropdownItemSelected,
                  ]}
                >
                  <Text>{option}</Text>
                </TouchableOpacity>
              ))}
            </View>
          )}

          {renderError(errors.gender)}

          {/* Custom Gender Input */}
          {formData.gender === 'อื่นๆ' && (
            <TextInput
              value={formData.customGender}
              onChangeText={(text) =>
                setFormData({ ...formData, customGender: text })
              }
              placeholder="โปรดระบุ"
              placeholderTextColor="#999"
              style={[styles.input, { marginTop: 6 }]}
            />
          )}
        </View>
      </View>
          {/* Additional Contacts */}
          
          <Text style={styles.label}>ช่องทางการติดต่อเพิ่มเติม (ไม่บังคับ)</Text>
            
            {/* Facebook */}
            <View style={styles.socialInputContainer}>
              <Ionicons name="logo-facebook" size={20} color="#1877F2" />
              <TextInput
                style={styles.socialInput}
                placeholder="Facebook URL หรือ Username"
                value={formData.facebookUrl}
                onChangeText={(text: string) => setFormData({...formData, facebookUrl: text})}
                placeholderTextColor="#999"
                autoCapitalize="none"
              />
            </View>

              {/* LINE */}
              <View style={styles.socialInputContainer}>
              <Image
        source={require('../assets/images/images/image7.png')} // Replace with your image path
        style={{height:16,width:16}}
        resizeMode="contain"
      />
              <TextInput
                style={styles.socialInput}
                placeholder="LINE ID"
                value={formData.lineId}
                onChangeText={(text: string) => setFormData({...formData, lineId: text})}
                placeholderTextColor="#999"
                autoCapitalize="none"
              />
            </View>

            <View style={styles.content}>
        <Text style={styles.title}>
        ความสนใจเที่ยว 
        </Text>
      
        <Text style={styles.subtitle}>
        เลือกกิจกรรมที่คุณชอบทำเวลาเที่ยว (เลือกได้หลายข้อ)
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
    width: 15.75,
    height: 14,
 
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
         <View style={styles.inputGroup}>
            <Text style={styles.title}>จุดหมายปลายทางที่อยากไป</Text>
            <Text style={styles.subtitle}>เลือกประเภทที่คุณสนใจ</Text>
            
            {/* Selected Interests */}
            {selectedInterests.length > 0 && (
              <View style={styles.tagsContainer}>
                {selectedInterests.map((interest: string, index: number) => (
                  <TouchableOpacity 
                    key={index}
                    style={styles.selectedTag}
                    onPress={() => removeSelectedInterest(interest)}
                  >
                    <Text style={styles.selectedTagText}>{interest}</Text>
                    <Ionicons name="close" size={16} color="#fff" />
                  </TouchableOpacity>
                ))}
              </View>
            )}

<View style={styles.container}>
      <TouchableOpacity
        
        onPress={() => setDropdownOpen(!dropdownOpen)}
      >
        <Text style={styles.input}>ค้นหาสถานที่</Text>
      </TouchableOpacity>

      {dropdownOpen && (
        <View style={styles.dropdown}>
          {loading ? (
            <ActivityIndicator size="small" />
          ) : (
            <FlatList
              data={destinations}
              keyExtractor={item => item}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={styles.dropdownItem}
                  onPress={() => addDestination(item)}
                >
                  <Text>{item}</Text>
                </TouchableOpacity>
              )}
            />
          )}
        </View>
      )}

<View style={styles.selectedContainer}>
  {selected.length === 0 && <Text>No destinations selected</Text>}
  <View style={styles.selectedGrid}>
    {selected.map(dest => (
      <TouchableOpacity
        key={dest}
        style={styles.selectedButton}
        onPress={() => removeDestination(dest)}
      >
        <Text style={styles.selectedButtonText}>{dest} <Text style={{fontSize:16}}>x</Text></Text>
      </TouchableOpacity>
    ))}
  </View>
</View>




       
          </View>
        </View>

    </View>

      

        {/* Submit Button */}
        <TouchableOpacity style={styles.submitButton} onPress={handleSubmit}>
          <Text style={styles.submitButtonText}>บันทึกและดำเนินการต่อ</Text>
          <Image
        source={require('../assets/images/images/image8.png')} // Replace with your image path
        style={{height:16,width:16}}
        resizeMode="contain"
      />
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    
    borderBottomWidth: 1,
    borderBottomColor: '#e5e5e5',
    backgroundColor: '#fff',
  },
  backButton: {
    marginRight: 12,
    padding: 4,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 30,
  },
  profileSection: {
    alignItems: 'center',
    paddingVertical: 24,
    backgroundColor: '#fff',
  },
  profileImageContainer: {
    position: 'relative',
    marginBottom: 8,
  },
  profileImage: {
    width: 112,
    height: 112,
    borderRadius: 9999,
    borderWidth: 2,
    borderColor: '#4F46E5', 
  },
  
  cameraButton: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: '#4F46E5',
    borderRadius: 9999,
    width: 36,
    height: 36,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#fff',
  },
  uploadText: {
    fontSize: 14,
    fontFamily:'Inter_400Regular',
    color: '#6B7280',
    textAlign: 'center',
    marginTop: 4,
    lineHeight:14
  },
  formSection: {
    paddingHorizontal: 16,
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontFamily:'Inter_500Medium',
    color: '#374151',
    marginBottom: 8,
  },
  subLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 12,
    lineHeight: 20,
  },
  input: {
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    fontSize: 16,
    fontFamily:'Inter_400Regular',
    lineHeight:24,
    color: '#333',
    height:50,
    backgroundColor: '#FFFFFF',
  },
  inputError: {
    borderColor: '#ef4444',
  },
  errorText: {
    color: '#ef4444',
    fontSize: 14,
    marginTop: 4,
  },
  textArea: {
    height: 80,
    textAlignVertical: 'top',
  },
  genderContainer: {
    gap: 12,
  },
  genderOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
  },
  genderOptionSelected: {
    // Additional styling for selected option if needed
  },
  radioButton: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#d1d5db',
    marginRight: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioButtonSelected: {
    borderColor: '#6B46C1',
  },
  radioButtonInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#6B46C1',
  },
  genderText: {
    fontSize: 16,
    color: '#333',
  },
  genderTextSelected: {
    color: '#6B46C1',
    fontWeight: '500',
  },
  customGenderInput: {
    marginTop: 12,
  },
  socialInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e5e5e5',
    borderRadius: 8,
    paddingHorizontal: 12,
    marginBottom: 12,
    backgroundColor: '#fff',
  },
  socialInput: {
    flex: 1,
    paddingVertical: 12,
    paddingLeft: 12,
    fontSize: 16,
    fontFamily:'Inter_400Regular',
    color: '#ADAEBC',
    lineHeight:24,
  },
  lineIcon: {
    backgroundColor: '#00B900',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  lineText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 12,
  },
  selectedTag: {
    backgroundColor: '#6B46C1',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    marginRight: 8,
    marginBottom: 8,
  },
  selectedTagText: {
    color: '#fff',
    fontSize: 14,
    marginRight: 4,
  },
  availableTag: {
    backgroundColor: '#f5f5f5',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    marginRight: 8,
    marginBottom: 8,
  },
  availableTagText: {
    color: '#666',
    fontSize: 14,
  },
  submitButton: {
    backgroundColor: '#4F46E5',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    marginHorizontal: 16,
    marginTop: 24,
    borderRadius: 8,
    shadowColor: '#6B46C1',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    marginRight: 8,
  },
  headerText: {
    fontSize: 18,
    fontFamily:'Inter_500Medium',
    color: '#1F2937',
    flex: 1,
    textAlign: 'center',
    marginBottom:12,
    marginTop:12,
    marginLeft:-25
  },
  placeholder: {
    width: 50,
    height: 50,
  },
  progressContainer: {
    paddingBottom: 15,
   },
   progressBar: {
     height: 4,
     backgroundColor: '#e0e0e0',
     borderRadius: 2,
     overflow: 'hidden',
   },
   progressFill: {
     height: '100%',
     backgroundColor: '#4F46E5',
     borderRadius: 2,
   },
 
   dropdownButton: {
     padding: 12,
     borderWidth: 1,
     borderColor: '#999',
     borderRadius: 6,
     backgroundColor: '#eee',
   },
   dropdownButtonText: { fontSize: 16 },
   dropdown: {
     marginTop: 5,
     borderWidth: 1,
     borderColor: '#999',
     borderRadius: 6,
     maxHeight: 200,
   },
   dropdownItem: {
     padding: 10,
     borderBottomWidth: 1,
     borderBottomColor: '#ddd',
   },
   selectedContainer: { marginTop: 20 },
   selectedItem: {
     flexDirection: 'row',
     padding: 8,
     marginBottom: 5,
     backgroundColor: '#4F46E51A',
     borderRadius: 9999,
     alignItems: 'center',
     justifyContent: 'space-between',
   },
   deleteButton: { marginLeft: 5 },
   selectedGrid: {
     flexDirection: 'row',
     flexWrap: 'wrap',
   },
   selectedButton: {
     backgroundColor: '#4F46E51A',
     borderWidth: 1,
     paddingHorizontal:8,
     paddingTop:7,
     borderRadius: 9999,
     margin: 5,
     borderColor:'#4F46E5',
     minWidth: 84.09,   
     height:38,
     alignItems: 'center',
   },
   selectedButtonText: {
     color: '#4F46E5',
     fontFamily:'Inter_400Regular',
     fontSize: 14,
   },


  dropdownTrigger: {
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 8,
    borderRadius: 6,
    marginTop: 4,
    backgroundColor: '#fff',
  },
  dropdownList: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 6,
    marginTop: 4,
    backgroundColor: '#f9f9f9',
  },
 
  dropdownItemSelected: {
    backgroundColor: '#d0c4f7',
  },
  content: {
    flex: 1,
    paddingTop: 10,
    marginBottom:24,
  },
  title: {
    fontSize: 14,
    color: '#374151',
    marginBottom: 6,
    fontFamily:'Inter_500Medium'
  },


  subtitle: {
    fontSize: 12,
    lineHeight:13,
    color: '#6B7280',
    marginBottom: 12,
    fontFamily:'Inter_400Regular'
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
    alignItems:'center'
    
  },
  categoryItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
    borderRadius: 30,
    marginBottom: 8,
    height:38,
    minWidth:87.61,
    borderWidth: 1,
    borderColor: '#D1D5DB',
    
  },
  categoryText: {
    marginLeft: 8,
    fontSize: 14,
    color: '#374151',
    textAlign:'center',
    verticalAlign:'middle',
    fontFamily:'Inter_400Regular',
  },
  selectedText: {
    color: '#6366f1',
  },
});

export default ProfileForm;