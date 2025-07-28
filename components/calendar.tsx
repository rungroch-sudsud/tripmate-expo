import { View, TouchableOpacity, Text, StyleSheet } from 'react-native'
import React, { useState, useEffect,useCallback } from 'react'
import { toThaiYear } from '../shared/utils/thaiYear'
import { CalendarProps } from '../features/trip/schemas/calendatProps'

export const Calendar = ({ startDate, endDate, onDateSelect }: CalendarProps) => {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedStart, setSelectedStart] = useState<Date | null>(null);
  const [selectedEnd, setSelectedEnd] = useState<Date | null>(null);
  
  useEffect(() => {
    setSelectedStart(startDate);
    setSelectedEnd(endDate);
  }, [startDate, endDate]);

  const monthNames = [
    'มกราคม', 'กุมภาพันธ์', 'มีนาคม', 'เมษายน', 'พฤษภาคม', 'มิถุนายน',
    'กรกฎาคม', 'สิงหาคม', 'กันยายน', 'ตุลาคม', 'พฤศจิกายน', 'ธันวาคม'
  ];

  const getDaysInMonth = (date: Date): { date: Date; isCurrentMonth: boolean }[] => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    const days = [];
    
    // Add days from previous month to fill empty cells
    const prevMonth = new Date(year, month - 1, 0); // Last day of previous month
    const prevMonthDays = prevMonth.getDate();
    
    for (let i = startingDayOfWeek - 1; i >= 0; i--) {
      const prevDate = new Date(year, month - 1, prevMonthDays - i);
      days.push({ date: prevDate, isCurrentMonth: false });
    }
    
    // Add all days of the current month
    for (let day = 1; day <= daysInMonth; day++) {
      days.push({ date: new Date(year, month, day), isCurrentMonth: true });
    }
    
    return days;
  };

  const isDateInRange = useCallback((date: Date): boolean => {
    if (!selectedStart || !selectedEnd) return false;
    return date >= selectedStart && date <= selectedEnd;
  }, [selectedStart, selectedEnd]);

  const isDateSelected = (date: Date): boolean => {
    if (!selectedStart && !selectedEnd) return false;
    return (
      Boolean(selectedStart && date.getTime() === selectedStart.getTime()) ||
      Boolean(selectedEnd && date.getTime() === selectedEnd.getTime())
    );
  };

  const handleDatePress = (dateObj: { date: Date; isCurrentMonth: boolean } | null) => {
    if (!dateObj) return;
    
    const { date, isCurrentMonth } = dateObj;
    
    if (!isCurrentMonth) return;

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
  
  const isRangeStart = (date: Date): boolean =>
    Boolean(selectedStart && selectedEnd && date.getTime() === selectedEnd.getTime());

  const isRangeEnd = (date: Date): boolean =>
    Boolean(selectedStart && selectedEnd && date.getTime() === selectedStart.getTime());

  const isSingleDaySelection = (date: Date): boolean =>
    Boolean(selectedStart && !selectedEnd && date.getTime() === selectedStart.getTime());

  const navigateMonth = (direction: number) => {
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

      <View style={styles.daysContainer}>
        {days.map((dateObj, index) => {
          const { date, isCurrentMonth } = dateObj;
          
          return (
            <TouchableOpacity
              accessible={true}
              accessibilityLabel={`${date.getDate()} ${monthNames[date.getMonth()]}`}
              accessibilityRole="button"
              key={index}
              onPress={() => handleDatePress(dateObj)}
              disabled={!isCurrentMonth}
              style={[
                styles.dayCell,
                !isCurrentMonth && styles.prevMonthDay,
                // Apply range styles only for current month dates
                isCurrentMonth && isDateInRange(date) && styles.rangeDay,
                isCurrentMonth && isRangeStart(date) && styles.rangeStart,
                isCurrentMonth && isRangeEnd(date) && styles.rangeEnd,
                // Selected styles should override range styles
                isCurrentMonth && isDateSelected(date) && styles.selectedDay,
                isCurrentMonth && isSingleDaySelection(date) && styles.singleDay,
              ]}
            >
              <Text
                style={[
                  styles.dayText,
                  !isCurrentMonth && styles.prevMonthDayText,
                  isCurrentMonth && isDateInRange(date) && styles.rangeDayText,
                  isCurrentMonth && isDateSelected(date) && styles.selectedDayText,
                ]}
              >
                {date.getDate()}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  calendarContainer: {
    backgroundColor: '#FFFFFF'
  },
  calendarHeader: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
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
    marginHorizontal: 10
  },
  weekDaysContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingBottom: 8,
  },
  navButton: {
    width: 32,
    height: 32,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 16,
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

  },
  emptyDay: {
    backgroundColor: 'transparent',
  },


  dayText: {
    fontSize: 14,
    color: '#374151',
    fontFamily: 'LineSeedSansTH_A_Bd',
  },
  selectedDayText: {
    color: 'white',
    fontWeight: '600',
  },
  rangeDayText: {
    color: '#585DDB',
    fontWeight: '500',
  },
  rangeDay: {
  backgroundColor: '#E0E7FF', // soft fill for middle dates
},

rangeStart: {
  backgroundColor: '#E0E7FF',
  borderTopLeftRadius: 999,
  borderBottomLeftRadius: 999,
},

rangeEnd: {
  backgroundColor: '#E0E7FF',
  borderTopRightRadius: 999,
  borderBottomRightRadius: 999,
},

selectedDay: {
  backgroundColor: '#585DDB',
  borderRadius: 9999, // full circle
},

singleDay: {
  backgroundColor: '#585DDB',
  borderRadius: 9999,
},
prevMonthDay: {
  opacity: 0.6,
},
prevMonthDayText: {
  color: '#ccc', 
}
})