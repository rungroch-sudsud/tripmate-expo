import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Modal, StyleSheet } from 'react-native';
import { Calendar } from 'react-native-calendars';

// Your existing component
const YourComponent = () => {
  const [trip, setTrip] = useState({
    startDate: '2024-01-15', // Your existing trip data
    endDate: '2024-01-20'
  });
  
  const [showCalendar, setShowCalendar] = useState(false);
  const [selectedDates, setSelectedDates] = useState({});
  const [isSelectingRange, setIsSelectingRange] = useState(false);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  const formatDateRange = (startDate: string, endDate: string) => {
    const start = new Date(startDate).toLocaleDateString('th-TH', {
      day: 'numeric',
      month: 'short',
    });
    const end = new Date(endDate).toLocaleDateString('th-TH', {
      day: 'numeric',
      month: 'short',
    });
    return `${start} - ${end}`;
  };

  const handleDatePress = () => {
    setShowCalendar(true);
    // Reset selection state
    setSelectedDates({});
    setStartDate('');
    setEndDate('');
    setIsSelectingRange(false);
  };

  const handleDayPress = (day: any) => {
    const dateString = day.dateString;
    
    if (!isSelectingRange && !startDate) {
      // First date selection
      setStartDate(dateString);
      setSelectedDates({
        [dateString]: {
          selected: true,
          startingDay: true,
          color: '#007AFF',
          textColor: 'white'
        }
      });
      setIsSelectingRange(true);
    } else if (isSelectingRange && startDate && !endDate) {
      // Second date selection
      if (dateString < startDate) {
        // If selected date is before start date, make it the new start date
        setStartDate(dateString);
        setEndDate('');
        setSelectedDates({
          [dateString]: {
            selected: true,
            startingDay: true,
            color: '#007AFF',
            textColor: 'white'
          }
        });
      } else {
        // Valid end date
        setEndDate(dateString);
        const markedDates = createDateRange(startDate, dateString);
        setSelectedDates(markedDates);
      }
    } else {
      // Reset and start over
      setStartDate(dateString);
      setEndDate('');
      setSelectedDates({
        [dateString]: {
          selected: true,
          startingDay: true,
          color: '#007AFF',
          textColor: 'white'
        }
      });
      setIsSelectingRange(true);
    }
  };

  const createDateRange = (start: string, end: string) => {
    const startDate = new Date(start);
    const endDate = new Date(end);
    const dateRange: any = {};
    
    const currentDate = new Date(startDate);
    while (currentDate <= endDate) {
      const dateString = currentDate.toISOString().split('T')[0];
      
      if (dateString === start) {
        dateRange[dateString] = {
          selected: true,
          startingDay: true,
          color: '#007AFF',
          textColor: 'white'
        };
      } else if (dateString === end) {
        dateRange[dateString] = {
          selected: true,
          endingDay: true,
          color: '#007AFF',
          textColor: 'white'
        };
      } else {
        dateRange[dateString] = {
          selected: true,
          color: '#E3F2FD',
          textColor: '#007AFF'
        };
      }
      
      currentDate.setDate(currentDate.getDate() + 1);
    }
    
    return dateRange;
  };

  const handleConfirmDates = () => {
    if (startDate && endDate) {
      setTrip({
        ...trip,
        startDate: startDate,
        endDate: endDate
      });
    } else if (startDate) {
      // If only start date is selected, use it for both
      setTrip({
        ...trip,
        startDate: startDate,
        endDate: startDate
      });
    }
    setShowCalendar(false);
  };

  const handleCancel = () => {
    setShowCalendar(false);
    setSelectedDates({});
    setStartDate('');
    setEndDate('');
    setIsSelectingRange(false);
  };

  return (
    <View>
      {/* Your existing date badge - now clickable */}
      <TouchableOpacity style={styles.dateBadge} onPress={handleDatePress}>
        <Text style={styles.dateIcon}>📅</Text>
        <Text style={styles.dateText}>
          {formatDateRange(trip.startDate, trip.endDate)}
        </Text>
      </TouchableOpacity>
      <View style={styles.dateBadge}>
        <Text style={styles.dateIcon}>📅</Text>
        <Text style={styles.dateText}>
          {formatDateRange(trip.startDate, trip.endDate)}
        </Text>
      </View>

      {/* Calendar Modal */}
      <Modal
        visible={showCalendar}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={handleCancel}>
              <Text style={styles.cancelButton}>Cancel</Text>
            </TouchableOpacity>
            <Text style={styles.modalTitle}>Select Dates</Text>
            <TouchableOpacity onPress={handleConfirmDates}>
              <Text style={styles.confirmButton}>Done</Text>
            </TouchableOpacity>
          </View>
          
          <View style={styles.instructionContainer}>
            <Text style={styles.instructionText}>
              {!startDate 
                ? "Select start date" 
                : !endDate 
                ? "Select end date" 
                : `${formatDateRange(startDate, endDate)}`}
            </Text>
          </View>

          <Calendar
            onDayPress={handleDayPress}
            markingType="period"
            markedDates={selectedDates}
            theme={{
              selectedDayBackgroundColor: '#007AFF',
              selectedDayTextColor: '#ffffff',
              todayTextColor: '#007AFF',
              dayTextColor: '#2d4150',
              textDisabledColor: '#d9e1e8',
              dotColor: '#00adf5',
              selectedDotColor: '#ffffff',
              arrowColor: '#007AFF',
              disabledArrowColor: '#d9e1e8',
              monthTextColor: '#2d4150',
              indicatorColor: '#007AFF',
              textDayFontWeight: '500',
              textMonthFontWeight: 'bold',
              textDayHeaderFontWeight: '600',
              textDayFontSize: 16,
              textMonthFontSize: 18,
              textDayHeaderFontSize: 14
            }}
          />
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  // Your existing styles
  dateBadge: {
    position: 'absolute',
    top: 16,
    left: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    flexDirection: 'row',
    alignItems: 'center',
  },
  dateIcon: {
    fontSize: 14,
    marginRight: 4,
  },
  dateText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#333',
  },
  
  // New modal styles
  modalContainer: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
    paddingTop: 50, // Account for status bar
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#2d4150',
  },
  cancelButton: {
    fontSize: 16,
    color: '#007AFF',
  },
  confirmButton: {
    fontSize: 16,
    color: '#007AFF',
    fontWeight: '600',
  },
  instructionContainer: {
    padding: 20,
    backgroundColor: '#f8f9fa',
  },
  instructionText: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
  },
});

export default YourComponent;