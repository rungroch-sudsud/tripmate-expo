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
  Image
} from 'react-native';
import {Dropdown} from 'react-native-element-dropdown'
const { height: SCREEN_HEIGHT } = Dimensions.get('window');
const MODAL_HEIGHT = SCREEN_HEIGHT * 0.8;

// Helper function to convert Gregorian year to Thai Buddhist year
const toThaiYear = (gregorianYear) => {
  return gregorianYear + 543;
};

// Calendar Component
const Calendar = ({ startDate, endDate, onDateSelect }) => {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedStart, setSelectedStart] = useState(startDate);
  const [selectedEnd, setSelectedEnd] = useState(endDate);

  // Update internal state when props change (for clear functionality)
  useEffect(() => {
    setSelectedStart(startDate);
    setSelectedEnd(endDate);
  }, [startDate, endDate]);

  const monthNames = [
    'มกราคม', 'กุมภาพันธ์', 'มีนาคม', 'เมษายน', 'พฤษภาคม', 'มิถุนายน',
    'กรกฎาคม', 'สิงหาคม', 'กันยายน', 'ตุลาคม', 'พฤศจิกายน', 'ธันวาคม'
  ];

  const getDaysInMonth = (date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    const days = [];
    
    // Add empty cells for days before the first day of the month
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null);
    }
    
    // Add all days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      days.push(new Date(year, month, day));
    }
    
    return days;
  };

  const isDateInRange = (date) => {
    if (!selectedStart || !selectedEnd) return false;
    return date >= selectedStart && date <= selectedEnd;
  };

  const isDateSelected = (date) => {
    if (!selectedStart && !selectedEnd) return false;
    return (selectedStart && date.getTime() === selectedStart.getTime()) ||
           (selectedEnd && date.getTime() === selectedEnd.getTime());
  };

  const handleDatePress = (date) => {
    if (!date) return;

    if (!selectedStart || (selectedStart && selectedEnd)) {
      // Starting new selection
      setSelectedStart(date);
      setSelectedEnd(null);
      onDateSelect(date, null);
    } else if (selectedStart && !selectedEnd) {
      // Completing the range
      if (date < selectedStart) {
        setSelectedStart(date);
        setSelectedEnd(selectedStart);
        onDateSelect(date, selectedStart);
      } else {
        setSelectedEnd(date);
        onDateSelect(selectedStart, date);
      }
    }
  };

  const navigateMonth = (direction) => {
    const newMonth = new Date(currentMonth);
    newMonth.setMonth(currentMonth.getMonth() + direction);
    setCurrentMonth(newMonth);
  };

  const days = getDaysInMonth(currentMonth);

  return (
    <View style={styles.calendarContainer}>
      <View style={styles.calendarHeader}>
        <TouchableOpacity onPress={() => navigateMonth(-1)} style={styles.navButton}>
          <Text style={styles.navButtonText}>‹</Text>
        </TouchableOpacity>
        <Text style={styles.monthYear}>
          {monthNames[currentMonth.getMonth()]} {toThaiYear(currentMonth.getFullYear())}
        </Text>
        <TouchableOpacity onPress={() => navigateMonth(1)} style={styles.navButton}>
          <Text style={styles.navButtonText}>›</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.weekDaysContainer}>
        {['อา', 'จ', 'อ', 'พ', 'พฤ', 'ศ', 'ส'].map((day, index) => (
          <Text key={index} style={styles.weekDay}>{day}</Text>
        ))}
      </View>

      <View style={styles.daysContainer}>
        {days.map((date, index) => (
          <TouchableOpacity
            key={index}
            onPress={() => handleDatePress(date)}
            style={[
              styles.dayCell,
              !date && styles.emptyDay,
              date && isDateSelected(date) && styles.selectedDay,
              date && isDateInRange(date) && !isDateSelected(date) && styles.rangeDay,
            ]}
            disabled={!date}
          >
            <Text style={[
              styles.dayText,
              date && isDateSelected(date) && styles.selectedDayText,
              date && isDateInRange(date) && !isDateSelected(date) && styles.rangeDayText,
            ]}>
              {date ? date.getDate() : ''}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
};

// Updated Price Range Dropdown Component (removed buttons)
const PriceRangeDropdown = ({ selectedPriceRange, onPriceRangeSelect }) => {
  const priceRanges = [
    { id: 'all', label: 'มากไปน้อย', min: 0, max: Infinity },
    { id: 'under-1000', label: 'ต่ำกว่า 1,000 บาท', min: 0, max: 999 },
    { id: '1000-2000', label: '1,000 - 2,000 บาท', min: 1000, max: 2000 },
    { id: '2000-3000', label: '2,000 - 3,000 บาท', min: 2000, max: 3000 },
    { id: '3000-5000', label: '3,000 - 5,000 บาท', min: 3000, max: 5000 },
    { id: 'over-5000', label: 'มากกว่า 5,000 บาท', min: 5000, max: Infinity }
  ];

  return (
    <View style={styles.priceContainer}>
      <Text style={styles.sectionTitle}>ราคาทริปต่อคน</Text>

     <Dropdown
  style={styles.dropdownTrigger}
  placeholderStyle={styles.dropdownTriggerText}
  selectedTextStyle={styles.dropdownTriggerText}
  itemTextStyle={styles.dropdownItemText}
  data={priceRanges}
  labelField="label"
  valueField="id"
  placeholder="มากไปน้อย"
  value={selectedPriceRange?.id}
  onChange={(item) => onPriceRangeSelect(item)}
  containerStyle={{marginBottom:10,borderBottomLeftRadius:5,borderBottomRightRadius:5}}
  renderRightIcon={() => (
    <Image
      source={require('../app/assets/images/dropdown-icon.png')}
      style={styles.dropdownIcon}
      resizeMode="contain"
    />
  )}
  iconStyle={styles.dropdownIcon}
/>

    </View>
  );
};
// Main Filter Modal Component
const FilterModal = ({ 
  visible, 
  onClose, 
  onApplyFilters,
  initialStartDate = null,
  initialEndDate = null,
  initialPriceRange = null
}) => {
  const [startDate, setStartDate] = useState(initialStartDate);
  const [endDate, setEndDate] = useState(initialEndDate);
  const [selectedPriceRange, setSelectedPriceRange] = useState(
    initialPriceRange || { id: 'all', label: 'ทุกราคา', min: 0, max: Infinity }
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
          duration: 300,
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

  const handleDateSelect = (start, end) => {
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
          <ScrollView style={styles.scrollContent} showsVerticalScrollIndicator={false}>
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

const styles = StyleSheet.create({
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
  header: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#374151',
    textAlign: 'center',
    fontFamily: 'LineSeedSansTH_A_Bd',
  },
  scrollContent: {
    flex: 1,
  },
  section: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: 'bold',
    fontFamily: 'LineSeedSansTH_A_Bd',
    color: '#374151',
    flex: 0.5,
  },
  dateRangeDisplay: {
    backgroundColor: '#F9FAFB',
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
  },
  dateRangeText: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
    fontFamily: 'InterTight-Regular',
  },
  calendarContainer: {
    backgroundColor: 'white',
  },
  calendarHeader: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  navButton: {
    width: 32,
    height: 32,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 16,
  
  },
  navButtonText: {
    fontSize: 24,
    color: '#000000',
    fontWeight: 'bold',
  },
  monthYear: {
    fontSize: 12,
    fontWeight: '700',
    color: '#374151',
    fontFamily: 'LineSeedSansTH_A_Bd',
    marginHorizontal:10
  },
  weekDaysContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingBottom: 8,
  },
  weekDay: {
    flex: 1,
    textAlign: 'center',
    fontSize: 12,
    color: '#6B7280',
    fontWeight: '500',
    fontFamily: 'LineSeedSansTH',
  },
  daysContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 16,
  },
  dayCell: {
    width: '14.28%',
    aspectRatio: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 4,
    borderRadius: 8,
  },
  emptyDay: {
    backgroundColor: 'transparent',
  },
  selectedDay: {
    backgroundColor: '#585DDB',
    borderRadius:9999
    
  },
  rangeDay: {
    backgroundColor: '#E0E7FF',
  },
  dayText: {
    fontSize: 14,
    color: '#374151',
    fontFamily: 'InterTight-Regular',
  },
  selectedDayText: {
    color: 'white',
    fontWeight: '600',
  },
  rangeDayText: {
    color: '#585DDB',
    fontWeight: '500',
  },
  // Price Range Dropdown Styles
  priceContainer: {
    padding: 20,
    paddingHorizontal:50,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    flex: 1,
  },
dropdownTrigger: {
  flex: 0.5,
  flexDirection: 'row',
  justifyContent: 'space-between',
  alignItems: 'center',
  paddingVertical: 12,
  paddingHorizontal: 16,
  backgroundColor: '#F9FAFB',
  borderRadius: 8,
  borderWidth: 1,
  borderColor: '#585DDB',
  marginBottom: 8,
},
dropdownTriggerText: {
  fontSize: 12,
  color: '#374151',
  fontFamily: 'LineSeedSansTH_A_Bd',
  flex: 1,
},

dropdownIcon: {
  width: 12,
  height: 8,
  marginLeft: 8,
  tintColor: '#6B7280', // Optional: Match theme
},
  dropdownList: {
    backgroundColor: 'white',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    overflow: 'hidden',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  dropdownScrollView: {
    maxHeight: 250,
  },
  dropdownItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
    
  },
  selectedDropdownItem: {
    backgroundColor: '#EEF2FF',
  },
  dropdownItemText: {
     fontSize: 12,
    color: '#374151',
    fontWeight:'700',
    fontFamily: 'LineSeedSansTH_A_Bd',
    flex: 1,
  },
  selectedDropdownItemText: {
    color: '#585DDB',
    fontWeight: '500',
  },
  checkmark: {
    fontSize: 16,
    color: '#585DDB',
    fontWeight: 'bold',
  },
  // Main Footer Styles (consolidated buttons)
  footer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
    gap: 12,
  },
  clearButton: {
    flex: 0.1,
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#D1D5DB',
    alignItems: 'center',
  },
  clearButtonText: {
    fontSize: 12,
    color: '#374151',
    fontWeight: '700',
    fontFamily: 'LineSeedSansTH_A_Bd',
  },
  applyButton: {
    flex: 0.1,
    paddingVertical: 12,
    borderRadius: 8,
    backgroundColor: '#585DDB',
    alignItems: 'center',
  },
  applyButtonText: {
    fontSize: 12,
    color: '#585DDB',
    fontWeight: '700',
    fontFamily: 'LineSeedSansTH_A_Bd',
  },
});

export default FilterModal;