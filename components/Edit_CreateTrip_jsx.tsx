import React, { useState,useCallback,useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, Image, Modal, ScrollView, ActivityIndicator,StyleSheet } from 'react-native';
import { Calendar } from 'react-native-calendars';
import {Category,TravelStylesComponentProps,TravelInterestComponentProps} from '../shared/schemas/api.schema'
import { LinearGradient } from 'expo-linear-gradient';

 const ErrorMessage = ({ error }: { error: string }) => {
    if (!error) return null;
    return (
      <Text style={{ color: 'red', fontSize: 12, marginTop: 4 }}>{error}</Text>
    );
  };
// 1. Image Upload Component
export const ImageUploadComponent = ({ 
  pickedFile, 
  onPickImage, 
  styles 
}) => {
  return (
    <TouchableOpacity
      style={[styles.uploadBox]}
      onPress={onPickImage}
    >
      {pickedFile ? (
        <Image source={{ uri: pickedFile.uri }} style={styles.uploadedImage} />
      ) : (
        <View style={styles.uploadPlaceholder}>
          <View style={styles.personIcon}>
            <Image
             source={require('../app/assets/images/images/images/image3.png')}
              style={{ height: 27, width: 27, tintColor: "#9CA3AF" }}
              resizeMode="contain"
            />
          </View>
          <Text style={styles.uploadSubtext}>เพิ่มรูปภาพหน้าปก</Text>
        </View>
      )}
    </TouchableOpacity>
  );
};

// 2. Date Picker Component
export const DatePickerComponent = ({ 
  formData, 
  setFormData,
  errors, 
  clearError,
  styles,
  showStartDatePicker,
  setShowStartDatePicker,
  showEndDatePicker,
  setShowEndDatePicker,
  handleStartDateSelect, // For Create Trip
  handleEndDateSelect,   // For Create Trip
  handleDateSelect,      // For Edit Trip (takes day, type)
  formatDateInput,
  validateDate,
  formatDateToCalendar,
  isEditMode = false
}) => {
  const handleStartDatePress = () => {
    clearError('startDate');
    setShowStartDatePicker(true);
  };

  const handleEndDatePress = () => {
    if (isEditMode) {
      clearError('endDate');
      setShowEndDatePicker(true);
    } else {
      if (formData.startDate) {
        clearError('endDate');
        setShowEndDatePicker(true);
      }
    }
  };

  const onStartDateSelect = (day) => {
    if (isEditMode) {
      handleDateSelect(day, 'start');
    } else {
      handleStartDateSelect(day);
    }
  };

  const onEndDateSelect = (day) => {
    if (isEditMode) {
      handleDateSelect(day, 'end');
    } else {
      handleEndDateSelect(day);
    }
  };

  return (
    <>
      <Text style={isEditMode ? styles.dateFieldHeader : {
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
           source={require('../app/assets/images/images/images/image25.png')}
          style={{ width: 14, height: 16, marginHorizontal: 10 }} 
        />
        
        <TouchableOpacity onPress={handleStartDatePress}>
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
        
        <Text style={{ marginRight: 40, marginLeft: -20, fontSize: 20, fontWeight: '500' }}>-</Text>
        
        <TouchableOpacity 
          onPress={handleEndDatePress}
          disabled={!isEditMode && !formData.startDate}
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
            placeholderTextColor={!isEditMode && !formData.startDate ? '#B0B0B0' : undefined}
            keyboardType="numeric"
            maxLength={10}
            accessibilityLabel="วันที่สิ้นสุด"
            editable={true}
            pointerEvents="none"
          />
        </TouchableOpacity>
      </View>
     {(errors.startDate || errors.endDate) && (
  <View style={styles.dateErrorContainer}>
    <Text style={styles.dateErrorText}>{errors.startDate}</Text>
    <Text style={styles.dateErrorText}>{errors.endDate}</Text>
  </View>
)}

      {/* Start Date Modal */}
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
              onDayPress={onStartDateSelect}
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

      {/* End Date Modal */}
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
              onDayPress={onEndDateSelect}
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
    </>
  );
};

// 3. Max Participants Component
export const MaxParticipantsComponent = ({ 
  value, 
  onChangeText, 
  error, 
  clearError,
  styles,
  isEditMode = false
}) => {
  return (
    <>
      <Text style={isEditMode ? styles.maxPHeader : {
        marginHorizontal: 20,
        marginBottom: 6,
        fontWeight: '500',
        color: '#333',
        fontFamily: 'InterTight-Regular',
        fontSize: 16
      }}>จำนวนคน</Text>

      <View style={[
        isEditMode ? styles.maxPContainer : {
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
        error && styles.inputError
      ]}>
        <Image
          source={require('../app/assets/images/images/images/image11.png')}
          style={{ height: 16, width: 16, marginHorizontal: isEditMode ? 3 : 10 }}
          resizeMode="contain"
        />
        <TextInput
          style={isEditMode ? styles.mParticipantsInput : {
            height: '80%',
            paddingHorizontal: 5,
            outlineColor: 'white',
            backgroundColor: '#F9FAFBFF',
            width: '35%'
          }}
          placeholder=''
          value={value !== '' ? value.toString() : ''}
          onChangeText={onChangeText}
          keyboardType='numeric'
        />
        
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <Text style={{ fontFamily: 'InterTight-Regular', textAlign: 'center' }}>คน</Text>
        </View>
      </View>

      {!isEditMode && (
        <View style={{paddingLeft: 20,marginBottom:20}}>
          <ErrorMessage error={error} />
        </View>
      )}
    </>
  );
};

// 4. Price Per Person Component
export const PricePerPersonComponent = ({ 
  value, 
  onChangeText, 
  error, 
  clearError,
  styles,
  isEditMode = false
}) => {
  return (
    <>
      <Text style={isEditMode ? styles.pPersonHeader : {
        marginHorizontal: 20,
        marginBottom: 6,
        fontWeight: '500',
        color: '#333',
        fontFamily: 'InterTight-Regular',
        fontSize: 16
      }}>ราคาต่อคน</Text>

      <View style={[
        isEditMode ? styles.pPerPersonErrorParentWrapper : {
          flexDirection: 'row',
          alignItems: 'center',
          backgroundColor: '#F9FAFBFF',
          height: 45,
          borderRadius: 8,
          justifyContent: 'space-between',
          marginBottom: 30,
          marginHorizontal: 20,
          width: '70%'
        },
        error && styles.inputError
      ]}>
        <Image
          source={require('../app/assets/images/images/images/image12.png')}
          style={{ height: 16, width: 16, marginHorizontal: 3 }}
          resizeMode="contain"
        />
        
        {!isEditMode && (
          <Text style={{
            marginLeft: 5,
            marginRight: 10,
            width: '75%',
            fontWeight: '500',
            color: '#333',
            fontFamily: 'InterTight-Regular',
            fontSize: 16
          }}>ราคาต่อคน</Text>
        )}
        
        {isEditMode && (
          <Text style={styles.pPerPersonTextFront}>ราคาต่อคน</Text>
        )}
        
        <TextInput 
          style={styles.pPerPersonText}
          placeholder={''}
          value={value}
          onChangeText={onChangeText}
        />
        
        <Text style={isEditMode ? styles.pPerPersonUnitText : {
          marginHorizontal: 5,
          fontWeight: '500',
          color: '#333',
          fontFamily: 'InterTight-Regular',
          fontSize: 16
        }}>บาท</Text>
      </View>

      {!isEditMode && (
        <View style={{paddingLeft: 20,marginBottom:25}}>
          <ErrorMessage error={error} />
        </View>
      )}
    </>
  );
};

// 5. Services Checkbox Component
export const ServicesCheckboxComponent = ({ 
  services, 
  selectedServices, 
  onToggleService, 
  error, 
  clearError,
  styles,
  isEditMode = false
}) => {
  return (
    <>
      <View style={[
        styles.checkboxSection,
        !isEditMode && error && {marginBottom: 0}
      ]}>
        <Text style={styles.label}>สิ่งที่รวมในราคา</Text>
        <View style={styles.checkboxContainer}>
          {services.map(service => (
            <TouchableOpacity
              key={service.id}
              style={styles.checkboxRow}
              onPress={() => {
                onToggleService(service.id);
                if (error) clearError('services');
              }}
            >
              <TouchableOpacity
                style={styles.checkbox}
                onPress={() => {
                  onToggleService(service.id);
                  if (error) clearError('services');
                }}
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
      
      {!isEditMode && (
        <View style={{paddingLeft: 20,marginBottom:25}}>
          <ErrorMessage error={error} />
        </View>
      )}
    </>
  );
};

// 6. Travel Styles Component
export const TravelStylesComponent: React.FC<TravelInterestComponentProps> = ({
  categories,
  selectedItems,
  onToggleSelection,
  loading,
  error,
  clearError,
  styles,
  isEditMode = false,
  title = "สไตล์การเที่ยว",
  subtitle,
  selectedColor = "#29C4AF",
  unselectedColor = "#000",
}) => {
  
  const handleToggleSelection = (id: string) => {
    onToggleSelection(id);
    if (error && clearError) {
      clearError();
    }
  };

  const ErrorMessage = ({ error }: { error?: string | null }) => {
    if (!error) return null;
    return <Text style={styles.errorText}>{error}</Text>;
  };

  return (
    <>
      <View style={styles.content}>
        <Text style={styles.title || styles.label}>{title}</Text>
        
        {subtitle && (
          <Text style={styles.subtitle}>
            {subtitle}
          </Text>
        )}
        
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={selectedColor} />
            <Text style={styles.loadingText}>กำลังโหลด...</Text>
          </View>
        ) : (
          <View style={styles.categoriesContainer}>
            {categories.map((category) => {
              const isSelected = selectedItems.includes(category.id);
              
              return (
             <TouchableOpacity
  key={category.id}
  style={[
    styles.categoryItem,
    isSelected && styles.selectedItem
  ]}
  onPress={() => handleToggleSelection(category.id)}
>
  {isSelected && (
<LinearGradient
  colors={['#C7CAF4', '#FFD1C2']}  // Pale blue and pale peach
  locations={[0, 1]}
  start={{ x: 0.25, y: 0.5 }}
  end={{ x: 0.75, y: 0.5 }}
  style={[StyleSheet.absoluteFillObject, { borderRadius: 30 }]}
/>


  )}
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
      
      {(isEditMode) && (
        <View style={{marginTop: 20}}>
        </View>
      )}
      
      {/* Error handling - only show if not in edit mode or if explicitly requested */}
      {(error) && (
        <View style={{ paddingLeft: 20, marginBottom: 20 }}>
          <ErrorMessage error={error} />
        </View>
      )}
    </>
  );
};

// 7. Destinations Component
export const DestinationsComponent = ({ 
  dropdownOpen, 
  setDropdownOpen,
  searchText, 
  setSearchText,
  filteredDestinations, 
  selectedDestinations, 
  onAddDestination, 
  onRemoveDestination,
  loading, 
  error, 
  clearError,
  styles,
  isEditMode = false
}) => {
  return (
    <View style={{
      backgroundColor: '#F3F4F6',
      position: 'relative',
      zIndex: 1000,
      marginBottom: dropdownOpen ? 220 : 30,
      marginTop: 10,
      marginHorizontal: 20,
    }}>
      <TouchableOpacity onPress={() => setDropdownOpen(!dropdownOpen)}>
        <View>
          {dropdownOpen ? (
            <TextInput
              style={isEditMode ? styles.BeforedropDownOpenTextInput : {
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
            <Text style={isEditMode ? styles.dropDownOpenTextInput : {
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
              source={require('../app/assets/images/images/images/image9.png')}
                style={{ width: 16, height: 16 }}
              />
              {' '} ค้นหาสถานที่
            </Text>
          )}
        </View>
      </TouchableOpacity>

      {!isEditMode && error && selectedDestinations.length === 0 && (
        <ErrorMessage error={error} />
      )}

      {dropdownOpen && (
        <View style={isEditMode ? styles.dropDownOpen : {
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
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.1,
          shadowRadius: 4,
          elevation: 5,
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
                    onPress={() => onAddDestination(item)}
                  >
                    <Text style={{ fontSize: 14, color: '#374151', fontFamily: 'InterTight-Regular' }}>
                      {item}
                    </Text>
                  </TouchableOpacity>
                ))
              ) : (
                <Text style={{
                  padding: 12,
                  textAlign: 'center',
                  color: '#9CA3AF',
                  fontSize: 14,
                  fontFamily: 'InterTight-Regular'
                }}>
                  ไม่พบสถานที่ที่ค้นหา
                </Text>
              )}
            </ScrollView>
          )}
        </View>
      )}

      {/* Selected destinations */}
      <View style={{ marginTop: 20, marginBottom: 10 }}>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
          {selectedDestinations.map((dest, index) => (
            <TouchableOpacity
              key={index}
              style={isEditMode ? styles.selectedDestinations : {
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
              onPress={() => onRemoveDestination(dest)}
            >
              <Text style={isEditMode ? styles.selectedDestinationsText : {
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
  );
};

// 8. Atmosphere Input Component
export const AtmosphereInputComponent = ({
  value,
  onChangeText,
  error,
  clearError,
  styles,
  isEditMode = false
}) => {
  const [localValue, setLocalValue] = useState(value);

  // Debounce function
  const debounce = useCallback((func, delay) => {
    let timeoutId;
    return (...args) => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => func(...args), delay);
    };
  }, []);

  // Debounced version of onChangeText
  const debouncedOnChangeText = useCallback(
    debounce((text) => {
      onChangeText(text);
    }, 150), // 150ms delay
    [onChangeText]
  );

  // Update local value when prop changes (for external updates)
  useEffect(() => {
    setLocalValue(value);
  }, [value]);

  const handleTextChange = (text) => {
    if (text.length <= 100) {
      setLocalValue(text); // Update local state immediately
      debouncedOnChangeText(text); // Update parent state with debounce
      if (error) clearError('atmosphere');
    }
  };

  return (
    <View style={{ marginBottom: 30, marginTop: -20, marginHorizontal: 20 }}>
      <Text style={styles.label}>บรรยากาศ/โทนกลุ่ม</Text>
      <View style={{ position: 'relative' }}>
        <TextInput
          style={[
            styles.textArea,
            error && styles.inputError
          ]}
          multiline
          numberOfLines={4}
          value={localValue} // Use local state for immediate updates
          onChangeText={handleTextChange}
          placeholder="อธิบายบรรยากาศหรือโทนของกลุ่มที่ต้องการ...."
          placeholderTextColor="#888"
          maxLength={100}
        />
        
        {(!isEditMode ? !error : true) && (
          <Text style={[
            styles.wordCountText,
            localValue.length > 90 && { color: 'red' }
          ]}>
            {localValue.length}/100
          </Text>
        )}
        
        {!isEditMode && <ErrorMessage error={error} />}
      </View>
    </View>
  );
};

// 9. Details Input Component
export const DetailsInputComponent = ({
  value,
  onChangeText,
  error,
  clearError,
  styles,
  isEditMode = false
}) => {
  const [localValue, setLocalValue] = useState(value);

  // Debounce function
  const debounce = useCallback((func, delay) => {
    let timeoutId;
    return (...args) => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => func(...args), delay);
    };
  }, []);

  // Debounced version of onChangeText
  const debouncedOnChangeText = useCallback(
    debounce((text) => {
      onChangeText(text);
    }, 150), // 150ms delay
    [onChangeText]
  );

  // Update local value when prop changes (for external updates)
  useEffect(() => {
    setLocalValue(value);
  }, [value]);

  const handleTextChange = (text) => {
    setLocalValue(text); // Update local state immediately
    debouncedOnChangeText(text); // Update parent state with debounce
    // Error clearing is handled in parent component's onChangeText
  };

  return (
    <View style={styles.container3}>
      <Text style={styles.label}>รายละเอียดทั่วไป</Text>
      <TextInput
        style={[
          styles.textArea,
          error && styles.inputError
        ]}
        multiline
        numberOfLines={4}
        value={localValue} // Use local state for immediate updates
        onChangeText={handleTextChange}
        placeholder='เขียนรายละเอียดทริปของคุณ...'
        placeholderTextColor="#888"
      />
      {!isEditMode && <ErrorMessage error={error} />}
    </View>
  );
};