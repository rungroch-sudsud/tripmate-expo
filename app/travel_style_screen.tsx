import React, { useState,useEffect,useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  StatusBar,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { FontAwesome } from '@expo/vector-icons';
import { Animated } from 'react-native';

interface Category {
  id: string;
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
}

const TravelStyleScreen: React.FC = () => {
    const progressAnimation = useRef(new Animated.Value(33.33)).current;
  const [selectedItems, setSelectedItems] = useState<string[]>([]);

   useEffect(() => {
  
    
      
      const animateProgress = () => {
        Animated.timing(progressAnimation, {
         
          toValue: 66.66,
          duration: 300,
          useNativeDriver: false,
        }).start();
      };
  
      setTimeout(animateProgress, 300);
    }, []);

  const categories: Category[] = [
    { id: 'work', label: 'ความงาม', icon: 'briefcase-outline' },
    { id: 'health', label: 'สุขภาพ', icon: 'fitness-outline' },
    { id: 'food', label: 'อาหาร', icon: 'restaurant-outline' },
    { id: 'travel', label: 'ท่องเที่ยว', icon: 'airplane-outline' },
    { id: 'tech', label: 'เทคโนโลยี', icon: 'phone-portrait-outline' },
    { id: 'lifestyle', label: 'ไลฟ์สไตล์', icon: 'heart-outline' },
    { id: 'other', label: 'อื่นๆ', icon: 'grid-outline' },
  ];

  const toggleSelection = (id: string): void => {
    setSelectedItems(prev => 
      prev.includes(id) 
        ? prev.filter(item => item !== id)
        : [...prev, id]
    );
  };

  const handleContinue = (): void => {
    // Handle continue action
    console.log('Selected items:', selectedItems);
  };

  const handleGoBack = (): void => {
    // Handle back navigation
    console.log('Go back');
  };

  return (
    <SafeAreaView style={styles.container}>
     

      {/* Header */}
     <View style={styles.header}>
            <TouchableOpacity style={styles.backButton} onPress={handleGoBack}>
              <FontAwesome name="angle-left" size={24} color="#333" />
            </TouchableOpacity>
            <Text style={styles.headerText}>สร้างโปรไฟล์</Text>
            <View style={styles.placeholder} />
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

      {/* Content */}
      <View style={styles.content}>
        <Text style={styles.title}>
          เลือกกิจกรรมที่คุณชอบท่าเวลาเกียว
        </Text>

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
              <Ionicons 
                name={category.icon} 
                size={20} 
                color={selectedItems.includes(category.id) ? '#fff' : '#666'} 
              />
              <Text style={[
                styles.categoryText,
                selectedItems.includes(category.id) && styles.selectedText
              ]}>
                {category.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Bottom Button */}
      <View style={styles.bottomContainer}>
        <TouchableOpacity 
          style={[
            styles.continueButton,
            selectedItems.length === 0 && styles.disabledButton
          ]}
          disabled={selectedItems.length === 0}
          onPress={handleContinue}
        >
          <Text style={[
            styles.continueButtonText,
            selectedItems.length === 0 && styles.disabledButtonText
          ]}>
            ยืนยันและดำเนินการต่อ
          </Text>
          <Ionicons 
            name="arrow-forward" 
            size={20} 
            color={selectedItems.length === 0 ? '#ccc' : '#fff'} 
            style={styles.buttonIcon}
          />
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
      headerText: {
    fontSize: 18,
   
    color: '#333333',
    flex: 1,
    textAlign: 'center',
    fontFamily: 'Inter_600Regular',
  },
    placeholder: {
    width: 50,
    height: 50,
  },
  container: {
    flex: 1,
    backgroundColor: '#fff',
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
    backgroundColor: '#4285F4',
    borderRadius: 2,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 10,
    fontFamily: 'Inter_600SemiBold',
   
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
   backButton: {
    width: 30,
    height: 30,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: -5,
  },
  headerTitle: {
    fontSize: 18,
  
    color: '#333',
      fontFamily: 'Inter_600Regular',
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,

    
  },
  title: {
   fontSize: 18,
    fontWeight: '600',
    color: '#333333',
   
    textAlign: 'left',
    fontFamily: 'Inter_600SemiBold',
    marginBottom:20
    
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
    paddingVertical: 12,
    backgroundColor: '#f8f8f8',
    borderRadius: 20,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  selectedItem: {
    backgroundColor: '#6366f1',
    borderColor: '#6366f1',
  },
  categoryText: {
    marginLeft: 8,
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  selectedText: {
    color: '#fff',
  },
  bottomContainer: {
    paddingHorizontal: 20,
    paddingVertical: 20,
    paddingBottom: 34,
  },
  continueButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#6366f1',
    paddingVertical: 16,
    borderRadius: 12,
  },
  disabledButton: {
    backgroundColor: '#f0f0f0',
  },
  continueButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
    marginRight: 8,
  },
  disabledButtonText: {
    color: '#ccc',
  },
  buttonIcon: {
    marginLeft: 4,
  },
});

export default TravelStyleScreen;