// FilterModal.js
import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  Animated,
  PanResponder,
  Dimensions,
  ScrollView,
  StyleSheet,
} from 'react-native';

import {PriceRangeDropdown,priceRange}  from './priceRangeDropDown'
const { height: SCREEN_HEIGHT } = Dimensions.get('window');
import {Calendar} from './calendar'
const MODAL_HEIGHT = SCREEN_HEIGHT * 0.8;

type FilterModalProps = {
  visible: boolean;
  onClose: () => void;
  onApplyFilters: (filters: {
    startDate: Date | null;
    endDate: Date | null;
    priceRange: priceRange;
  }) => void;
  initialStartDate?: Date | null;
  initialEndDate?: Date | null;
  initialPriceRange?: priceRange | null;
};

const FilterModal:React.FC<FilterModalProps> = ({ 
  visible, 
  onClose, 
  onApplyFilters,
  initialStartDate = null,
  initialEndDate = null,
  initialPriceRange = null
}) => {
  const [startDate, setStartDate] = useState<Date | null>(initialStartDate);
  const [endDate, setEndDate] = useState<Date | null>(initialEndDate);
  const [selectedPriceRange, setSelectedPriceRange] = useState<priceRange>(
    initialPriceRange || { id: 'all', label: 'มากไปน้อย', min: 0, max: Infinity }
  );
  
  const slideAnim = useRef(new Animated.Value(MODAL_HEIGHT)).current;
  const overlayOpacity = useRef(new Animated.Value(0)).current;

  const panResponder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: (evt, gestureState) => {
        return gestureState.dy > 10; // Only respond to downward swipes
      },
      onPanResponderMove: (evt, gestureState) => {
        if (gestureState.dy > 0) {
          slideAnim.setValue(gestureState.dy);
        }
      },
      onPanResponderRelease: (evt, gestureState) => {
        if (gestureState.dy > 100 || gestureState.vy > 0.5) {
          onClose();
        } else {
          Animated.spring(slideAnim, {
            toValue: 0,
            useNativeDriver: true,
          }).start();
        }
      },
    })
  ).current;

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.spring(slideAnim, {
          toValue: 0,
          useNativeDriver: true,
        }),
        Animated.timing(overlayOpacity, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(slideAnim, {
          toValue: MODAL_HEIGHT,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(overlayOpacity, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [visible]);

  const handleDateSelect = (start:Date| null, end:Date| null) => {
    setStartDate(start);
    setEndDate(end);
  };

  // Consolidated apply function
  const handleApplyFilters = () => {
    onApplyFilters({
      startDate,
      endDate,
      priceRange: selectedPriceRange
    });
    onClose();
  };

  // Consolidated clear function
  const handleClearFilters = () => {
    setStartDate(null);
    setEndDate(null);
    setSelectedPriceRange({ id: 'all', label: 'ทุกราคา', min: 0, max: Infinity });
    
  };

  if (!visible) return null;

  return (
    <Modal
      transparent
      visible={visible}
      onRequestClose={onClose}
      animationType="none"
    >
      <View style={styles.modalContainer}>
        <Animated.View 
          style={[styles.overlay, { opacity: overlayOpacity }]}
        >
          <TouchableOpacity 
            style={styles.overlayTouch} 
            onPress={onClose} 
            activeOpacity={1}
          />
        </Animated.View>
        
        <Animated.View
          style={[
            styles.modalContent,
            {
              transform: [{ translateY: slideAnim }]
            }
          ]}
          {...panResponder.panHandlers}
        >
          <View style={styles.dragHandle} />
            <View style={{flexDirection:'row',justifyContent:'space-around',marginHorizontal:-100}}>
                  <TouchableOpacity 
             
              onPress={handleClearFilters}
            >
              <Text style={styles.clearButtonText}>ยกเลิก</Text>
            </TouchableOpacity>

                 <TouchableOpacity 
             
              onPress={handleApplyFilters}
            >
              <Text style={styles.applyButtonText}>บันทึก</Text>
            </TouchableOpacity>
            </View>
          <ScrollView style={{flex:1}} showsVerticalScrollIndicator={false}>
            <View style={styles.section}>
           
            <Calendar
  startDate={startDate}
  endDate={endDate}
  onDateSelect={handleDateSelect}
/>

            </View>

            <PriceRangeDropdown
              selectedPriceRange={selectedPriceRange}
              onPriceRangeSelect={setSelectedPriceRange}
            />
          </ScrollView>

    
        </Animated.View>
      </View>
    </Modal>
  );
};

const styles=StyleSheet.create({
     modalContainer: {
    flex: 1,
    justifyContent: 'flex-end',
  },
    overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
    overlayTouch: {
    flex: 1,
  },
    modalContent: {
    height: MODAL_HEIGHT,
    backgroundColor: 'white',
    borderTopLeftRadius: 50,
    borderTopRightRadius: 50,
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
  },
    dragHandle: {
    width: 40,
    height: 4,
    backgroundColor: '#E5E7EB',
    borderRadius: 2,
    alignSelf: 'center',
    marginTop: 12,
    marginBottom: 8,
  },
   clearButtonText: {
    fontSize: 12,
    color: '#374151',
    fontWeight: '700',
    fontFamily: 'LineSeedSansTH_A_Bd',
  },
    applyButtonText: {
    fontSize: 12,
    color: '#585DDB',
    fontWeight: '700',
    fontFamily: 'LineSeedSansTH_A_Bd',
  },
    section: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
})

export default FilterModal;