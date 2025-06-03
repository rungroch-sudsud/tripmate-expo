import React, { useState,useEffect } from 'react';
import {
  View,
  Text,
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

const ThaiFormScreen = () => {
    const [pickedFile2, setPickedFile2] = useState<PickedFile | null>(null);
    const [selfieError, setSelfieError] = useState(false);
     
    const [categories, setCategories] = useState<Category[]>([]);
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const [loading, setLoading] = useState<boolean>(false);

    
    
  const [formData, setFormData] = useState({
    name: '',
    startDate: '',
    endDate: '',
    description: '',
    selectedOptions: [] as string[],
    attachments: 0,
  });

  const handleCheckboxToggle = (option: string) => {
    setFormData(prev => ({
      ...prev,
      selectedOptions: prev.selectedOptions.includes(option)
        ? prev.selectedOptions.filter(item => item !== option)
        : [...prev.selectedOptions, option]
    }));
  };

  const isChecked = (option: string) => formData.selectedOptions.includes(option);

  
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

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <Stack.Screen options={{ headerShown: false }} />
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton}>
          <Ionicons name="chevron-back" size={24} color="#000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>สร้างรายไฟล์</Text>
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
                      style={{ height: 24, width: 24 }}
                      resizeMode="contain"
                    />
                  </View>
                  <Text style={styles.uploadText}>
                    ถ่ายรูปหน้าตรงกับบัตรประชาชน
                  </Text>
                  <Text style={styles.uploadSubtext}>
                    กรุณาถ่ายรูปให้ตรงกับบัตร เสื้อผ้าเรียบร้อย
                  </Text>
                </View>
              )}
            </TouchableOpacity>
          {/* Name Field */}
          <View style={styles.fieldContainer}>
            <Text style={styles.label}>ชื่อรายไฟล์</Text>
            <TextInput
              style={styles.textInput}
              value={formData.name}
              onChangeText={(text) => setFormData(prev => ({ ...prev, name: text }))}
              placeholder=""
            />
          </View>

          {/* Date Fields */}
          <View style={styles.dateContainer}>
            <View style={styles.dateField}>
              <Text style={styles.dateLabel}>วันที่เริ่มต้น</Text>
              <TextInput
                style={styles.dateInput}
                value={formData.startDate}
                onChangeText={(text) => setFormData(prev => ({ ...prev, startDate: text }))}
                placeholder="dd/mm/yyyy"
              />
            </View>
            <View style={styles.dateField}>
              <Text style={styles.dateLabel}>วันที่สิ้นสุด</Text>
              <TextInput
                style={styles.dateInput}
                value={formData.endDate}
                onChangeText={(text) => setFormData(prev => ({ ...prev, endDate: text }))}
                placeholder="dd/mm/yyyy"
              />
            </View>
          </View>

          {/* Travel-Style */}

          <View style={styles.content}>
        <Text style={styles.title}>
        เลือกกิจกรรมที่คุณชอบทำเวลาเที่ยว
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

          

          {/* Description Field */}
          <View style={styles.fieldContainer}>
            <Text style={styles.label}>รายละเอียดเพิ่มเติม</Text>
            <TextInput
              style={styles.textArea}
              multiline
              numberOfLines={4}
              value={formData.description}
              onChangeText={(text) => setFormData(prev => ({ ...prev, description: text }))}
              placeholder="เพิ่มรายละเอียดอื่นให้กับไฟล์ของคุณ..."
            />
          </View>

          {/* Attachments */}
          <View style={styles.attachmentSection}>
            <Text style={styles.attachmentText}>ไฟล้แนบเอกสาร</Text>
            <View style={styles.attachmentCount}>
              <Text style={styles.countNumber}>📎 0</Text>
            </View>
          </View>

          {/* Checkbox Options */}
          <View style={styles.checkboxSection}>
            <Text style={styles.label}>รายการได้รับพิธี</Text>
            <View style={styles.checkboxContainer}>
              <View style={styles.checkboxRow}>
                <TouchableOpacity 
                  style={styles.checkbox}
                  onPress={() => handleCheckboxToggle('กิจิกร')}
                >
                  <View style={[styles.checkboxInner, isChecked('กิจิกร') && styles.checked]} />
                </TouchableOpacity>
                <Text style={styles.checkboxText}>กิจิกร</Text>
              </View>
              <View style={styles.checkboxRow}>
                <TouchableOpacity 
                  style={styles.checkbox}
                  onPress={() => handleCheckboxToggle('ชล')}
                >
                  <View style={[styles.checkboxInner, isChecked('ชล') && styles.checked]} />
                </TouchableOpacity>
                <Text style={styles.checkboxText}>ชล</Text>
              </View>
            </View>
            <View style={styles.checkboxContainer}>
              <View style={styles.checkboxRow}>
                <TouchableOpacity 
                  style={styles.checkbox}
                  onPress={() => handleCheckboxToggle('ยาสูตร')}
                >
                  <View style={[styles.checkboxInner, isChecked('ยาสูตร') && styles.checked]} />
                </TouchableOpacity>
                <Text style={styles.checkboxText}>ยาสูตร</Text>
              </View>
              <View style={styles.checkboxRow}>
                <TouchableOpacity 
                  style={styles.checkbox}
                  onPress={() => handleCheckboxToggle('ดินสำคัญ')}
                >
                  <View style={[styles.checkboxInner, isChecked('ดินสำคัญ') && styles.checked]} />
                </TouchableOpacity>
                <Text style={styles.checkboxText}>ดินสำคัญ</Text>
              </View>
            </View>
          </View>

          {/* Bottom Section */}
          <View style={styles.bottomSection}>
            <TouchableOpacity style={styles.addButton}>
              <Ionicons name="add" size={20} color="#666" />
              <Text style={styles.addButtonText}>บันทึกและสร้าง</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>

      {/* Submit Button */}
      <View style={styles.submitContainer}>
        <TouchableOpacity style={styles.submitButton}>
          <Ionicons name="send" size={20} color="#fff" />
          <Text style={styles.submitText}>โอเคดีงาม</Text>
        </TouchableOpacity>
        <Text style={styles.submitNote}>กรุณาตรวจสอบข้อมูลให้ถูกต้องก่อนส่ง</Text>
      </View>
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
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
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
    paddingHorizontal: 16,
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
    marginBottom: 16,
  },
  fieldContainer: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',

  },
  requiredText: {
    fontSize: 12,
    color: '#666',
    marginBottom: 8,
  },
  textInput: {
    borderBottomWidth:1,
    borderColor: '#e0e0e0',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    fontSize: 16,
    backgroundColor: '#fff',
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
    marginBottom: 20,
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
    backgroundColor: '#fff',
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
  },
  submitButton: {
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
  submitNote: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
  },
  uploadBox: {
    borderWidth: 2,
    borderColor: '#E5E7EB',
    borderStyle: 'solid',
    borderRadius: 12,
    padding: 24,
    alignItems: 'center',
    minHeight: 270,
    backgroundColor:'',
    verticalAlign:'middle',
    marginBottom:12

  },
  uploadPlaceholder: {
    marginTop:46,
    alignItems: 'center',
    verticalAlign:'middle'
  },
  personIcon: {
    width: 64,
    height: 64,
    backgroundColor: '#E5E7EB',
    borderRadius: 9999,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
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
    marginBottom: 24,
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
});

export default ThaiFormScreen;