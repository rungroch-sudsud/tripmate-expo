import React, { useState ,useRef} from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  StyleSheet,
  TextLayoutEventData,
  NativeSyntheticEvent,
  ScrollView,
} from 'react-native';
import {RichTextRenderer} from  './richText_Editor'
// Types
interface Trip {
  id: string;
  name: string;
  destinations: string[];
  startDate: string;
  endDate: string;
  maxParticipants: number;
  participants: any[];
  pricePerPerson: number;
  detail?: string;
  groupAtmosphere?: string;
  includedServices: string[];
  travelStyles?: string[];
  tripCoverImageUrls?: string[];
  tripOwner: TripOwner;
  fullname: string;
  tripOwnerId: string; // Added this field that you're checking in handleTripPress
}

interface TripOwner {
  id: string;
  displayName?: string;
  firstName?: string;
  lastName?: string;
  profileImageUrl?: string;
  age?: number;
  travelStyles?: string[];
  fullname: string;
}

interface TripCardProps {
  trip: Trip;
  isBookmarked: boolean;
  onBookmarkToggle: (trip: Trip) => void;
  onTripPress: (trip: Trip) => void;
  onJoinTrip: (trip: Trip) => void;
}

// Utility functions
const getOwnerInfo = (tripOwner: TripOwner) => ({
  displayName: tripOwner.fullname || 
    `${tripOwner.firstName || ''} ${tripOwner.lastName || ''}`.trim() || 
    'ไม่ระบุชื่อ',
  profileImageUrl: tripOwner.profileImageUrl || 'https://via.placeholder.com/40',
  age: tripOwner.age ? `${tripOwner.age} ปี` : 'ไม่ระบุอายุ'
});

const formatDateRange = (startDate: string, endDate: string): string => {
  try {
    const start = new Date(startDate).toLocaleDateString('th-TH', {
      day: 'numeric',
      month: 'short',
    });
    const end = new Date(endDate).toLocaleDateString('th-TH', {
      day: 'numeric',
      month: 'short',
    });
    return `${start} - ${end}`;
  } catch (error) {
    return 'วันที่ไม่ถูกต้อง';
  }
};

const TripCard: React.FC<TripCardProps> = ({ 
  trip, 
  isBookmarked, 
  onBookmarkToggle, 
  onTripPress, 
  onJoinTrip 
}) => {
  // Add null/undefined check for trip
  if (!trip) {
    return (
      <View style={styles.card}>
        <Text style={styles.errorText}>ข้อมูลทริปไม่พร้อมใช้งาน</Text>
      </View>
    );
  }
const scrollViewRef = useRef(null);


  // Add null/undefined check for tripOwner
  const ownerInfo = trip.tripOwner ? getOwnerInfo(trip.tripOwner) : {
    displayName: 'ไม่ระบุชื่อ',
    profileImageUrl: 'https://via.placeholder.com/40',
    age: 'ไม่ระบุอายุ'
  };
  
  const [isExpanded, setIsExpanded] = useState(false);
  const [isTruncated, setIsTruncated] = useState(false);

  // Function to handle the click and toggle the expanded state
  const toggleText = () => {
    setIsExpanded(!isExpanded);
  };
  
 

  // Function to check if text is truncated (overflow)
  const handleTextLayout = (e: NativeSyntheticEvent<TextLayoutEventData>) => {
    const { lines } = e.nativeEvent;
    if (lines.length > 1) {
      setIsTruncated(true);
    }
  };

  // Handle card press - This is the main change
  const handleCardPress = () => {
    onTripPress(trip);
  };

  // Handle bookmark press
  const handleBookmarkPress = (e: any) => {
    e.stopPropagation(); // Prevent card press when bookmark is pressed
    onBookmarkToggle(trip);
  };

  // Handle join trip press
  const handleJoinPress = (e: any) => {
    e.stopPropagation(); // Prevent card press when join button is pressed
    onJoinTrip(trip);
  };

   

  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  return (
    <TouchableOpacity
      style={styles.card}
      activeOpacity={0.7}
      onPress={handleCardPress} // Added this line
    >
    {/* Header Image Container */}
<View style={styles.imageContainer}>
  {trip.tripCoverImageUrls && trip.tripCoverImageUrls.length > 0 ? (
    <>
     <ScrollView
  ref={scrollViewRef}
  horizontal
  pagingEnabled
  showsHorizontalScrollIndicator={false}
  onMomentumScrollEnd={(event) => {
    const { contentOffset, layoutMeasurement } = event.nativeEvent;
    const index = Math.round(contentOffset.x / layoutMeasurement.width);
    console.log('Scroll index calculated:', index); // Debug log
    setCurrentImageIndex(index);
  }}
  style={styles.imageSlider}
>
  {trip.tripCoverImageUrls.map((imageUrl, index) => (
    <View key={index} style={styles.slideContainer}>
      <Image
        source={{ uri: imageUrl }}
        style={styles.backgroundImage}
        resizeMode="cover"
        onError={(error) => {
          console.warn(`Failed to load image at ${imageUrl}`);
        }}
      />
    </View>
  ))}
</ScrollView>
      
      {/* Page Indicators */}
      {trip.tripCoverImageUrls.length > 1 && (
        <View style={styles.indicatorContainer}>
          {trip.tripCoverImageUrls.map((_, index) => (
         <TouchableOpacity
  key={index}
  style={[
    styles.indicator,
    index === currentImageIndex ? styles.activeIndicator : styles.inactiveIndicator
  ]}
  onPress={() => {
    setCurrentImageIndex(index);
    // Actually scroll to the selected image
    scrollViewRef.current?.scrollTo({
      x: index * 350, // Use your slide width here
      animated: true
    });
  }}
/>
          ))}
        </View>
      )}
    </>
  ) : (
    <View style={styles.placeholderImage}>
      <Text style={styles.placeholderText}>📷</Text>
    </View>
  )}
  
  {/* Your existing badges remain the same */}
  <View style={styles.dateBadge}>
    <Image source={require('../app/assets/images/calendar.png')} style={{width:10.5,height:12,marginRight:5}}/>
    <Text style={styles.dateText}>
      {formatDateRange(trip.startDate, trip.endDate)}
    </Text>
  </View>
  
      {/* Price Badge - New position below date */}
                <View style={styles.priceBadge}>
                  <Image source={require('../app/assets/images/coin.png')} style={{width:10.5,height:12,marginRight:5}}/>
                  <Text style={styles.priceBadgeText}>
                    {trip.pricePerPerson.toLocaleString()} บาท/คน
                  </Text>
                </View>
                
                {/* Max Participant Badge */}
                <View style={styles.participantBadge}>
                 <Image source={require('../app/assets/images/images/images/image26.png')} style={{width:15,height:12,marginRight:5}}/>
                  <Text style={styles.participantText}>
                    {trip.participants.length}/{trip.maxParticipants} คน
                  </Text>
                </View>
</View>

      {/* Content */}
      <View style={styles.content}>
        <View style={styles.headerRow}>
          <View style={styles.tripInfo}>
            <Text style={styles.tripName} numberOfLines={2}>
              {trip.name}
            </Text>
            
            {trip.destinations.length > 0 && (
              <View style={styles.destinationRow}>
                <Image source={require('../app/assets/images/destination.png')} style={{width:15,height:12,marginRight:5}}/>
                <Text style={styles.destinationText}>
                  {trip.destinations.join(', ')}
                </Text>
              </View>
            )}
          </View>

          <TouchableOpacity
            style={styles.bookmarkButton}
            onPress={handleBookmarkPress} // Updated to use the new handler
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <View style={styles.bookmarkIcon}>
              {isBookmarked ? <Image source={require('../app/assets/images/images/images/image22.png')} style={{width:12,height:20,tintColor:'#FACC15'}}/> : <Image source={require('../app/assets/images/saved.png')} style={{width:12,height:20}}  />}
            </View>
          </TouchableOpacity>
        </View>

        {/* Group Atmosphere with expand/collapse */}
        {trip.groupAtmosphere && (
          <View style={styles.atmosphereContainer}>
            {!isExpanded ? (
              <View style={styles.atmosphereRowContainer}>
                <Text
                  style={styles.atmosphere}
                  numberOfLines={1}
                  onTextLayout={handleTextLayout}
                >
                  {trip.groupAtmosphere}
                </Text>
                {isTruncated && (
                  <TouchableOpacity onPress={toggleText} style={styles.expandButton}>
                    <Text style={styles.expandText}>...</Text>
                  </TouchableOpacity>
                )}
              </View>
            ) : (
              <TouchableOpacity onPress={toggleText}>
                <Text style={styles.atmosphere}>
                  {trip.groupAtmosphere}
                </Text>
              </TouchableOpacity>
            )}
          </View>
        )}

        {/* Trip Detail */}
        {trip.detail && (
        <RichTextRenderer 
  text={trip.detail} 
  formatting={trip.detailFormatting}
  style={styles.description}
/>
        )}

        {/* Included Services Tags */}
        {trip.includedServices.length > 0 && (
          <View style={styles.tagsContainer}>
            {trip.includedServices.slice(0, 3).map((service, index) => (
              <View key={`${service}-${index}`} style={styles.serviceTag}>
                <Text style={styles.serviceTagText}>#{service}</Text>
              </View>
            ))}
            {trip.includedServices.length > 3 && (
              <View style={styles.serviceTag}>
                <Text style={styles.serviceTagText}>
                  +{trip.includedServices.length - 3}
                </Text>
              </View>
            )}
          </View>
        )}

        {/* Bottom Row with Owner Info and Join Button */}
        <View style={styles.bottomRow}>
          <View style={styles.ownerInfo}>
            <Image
              source={{ uri: ownerInfo.profileImageUrl }}
              style={styles.ownerAvatar}
              defaultSource={{ uri: 'https://via.placeholder.com/40' }}
            />
            <View style={styles.ownerDetails}>
              <Text style={styles.ownerName} numberOfLines={1}>
                {ownerInfo.displayName}
              </Text>
             {/*  <Text style={styles.ownerAge}>{ownerInfo.age}</Text>*/}
            </View>
          </View>

          <TouchableOpacity
            style={styles.joinButton}
            onPress={handleJoinPress} // Updated to use the new handler
            activeOpacity={0.8}
          >
            <Text style={styles.joinButtonText}>ดูรายละเอียด</Text>
          </TouchableOpacity>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    marginHorizontal: 16,
    marginVertical: 8,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
    overflow: 'hidden',
  },
  imageContainer: {
    height: 150,
    position: 'relative',
  },
  backgroundImage: {
    width: '100%',
    height: '100%',
  },
  placeholderImage: {
    width: '100%',
    height: '100%',
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholderText: {
    fontSize: 40,
    opacity: 0.5,
  },
  dateBadge: {
    position: 'absolute',
    top: 12,
    left: 12,
    backgroundColor: '#FFFFFFE5',
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
    flexDirection: 'row',
    alignItems: 'center',
  },
  dateText: {
    color: '#1F2937',
    fontSize: 10,
    fontWeight: '400',
    fontFamily:'LineSeedSansTH'
  },
  priceBadge: {
    flexDirection:'row',
    position: 'absolute',
    top: 48, // Position below the date badge
    left: 12,
    backgroundColor: '#FFFFFFE5',
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  priceBadgeText: {
    color: '#374151',
    fontSize: 10,
    fontWeight: '400',
    fontFamily:'LineSeedSansTH'
  },
  participantBadge: {
    position: 'absolute',
    top: 12,
    right: 12,
    backgroundColor: '#4F46E5E5',
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
    flexDirection: 'row',
    alignItems: 'center',
  },
  participantText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '700',
    fontFamily:'LineSeedSansTH_A_Bd'
  },
  content: {
    padding: 16,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  tripInfo: {
    flex: 1,
    marginRight: 12,
  },
  tripName: {
    fontSize: 14,
    fontWeight: '700',
    color: '#374151',
    marginBottom: 4,
    fontFamily:'LineSeedSansTH_A_Bd'
  },
destinationRow: {
  flexDirection: 'row',
  alignItems: 'center',
  backgroundColor: '#FFF7ED',
  paddingVertical: 10,
  paddingHorizontal: 10,
  borderRadius: 10,
  alignSelf: 'flex-start',
}
,
  locationIcon: {
    fontSize: 14,
    marginRight: 4,
    fontFamily:'InterTight-Regular'
  },
  destinationText: {
    fontSize: 12,
    color: '#374151',
    flex: 1,
    fontWeight:'400',
    fontFamily:'LineSeedSansTH',
    
  },
bookmarkButton: {
  height: 24,
  width: 24,
  backgroundColor: '#FFFFFF',
  justifyContent: 'center',
  alignItems: 'center',
  borderRadius: 12, // half of width/height for circle
  overflow: 'hidden', // ensures nothing bleeds out
},

  bookmarkIcon: {
    backgroundColor:'#E5E7EB',
    borderRadius:9999,
    alignItems:'center',
    justifyContent:'center'
  },
  atmosphereContainer: {
    marginBottom: 12,
  },
  atmosphereRowContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  atmosphere: {
    fontSize: 11,
    color: '#374151',
    lineHeight: 17,
    fontWeight:'400',
    flex: 1,
    fontFamily:'LineSeedSansTH',
  },
  expandButton: {
    marginLeft: 4,
    paddingHorizontal: 4,
  },
  expandText: {
    fontSize: 14,
    color: '#007AFF',
    fontWeight: '500',
      fontFamily:'InterTight-Regular'
  },
  description: {
    fontSize: 11,
    color: '#374151',
    lineHeight: 17,
    marginBottom: 12,
    fontWeight:'400',
    fontFamily:'LineSeedSansTH'
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 16,
  },
  serviceTag: {
    backgroundColor: '#E8F4FD',
    borderRadius: 7,
    paddingHorizontal: 8,
    paddingVertical: 4,
    marginRight: 6,
    marginBottom: 6,
  },
  serviceTagText: {
    fontSize: 10,
    color: '#1976D2',
    fontWeight: '400',
      fontFamily:'LineSeedSansTH'
  },
  bottomRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  ownerInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: 12,
  },
  ownerAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 8,
  },
  ownerDetails: {
    flex: 1,
  },
  ownerName: {
    fontSize: 14,
    fontWeight: '500',
    color: '#374151',
    fontFamily:'InterTight-SemiBold'
  },
  ownerAge: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
      fontFamily:'InterTight-Regular'
  },
  joinButton: {
    backgroundColor: '#FF956E',
    borderRadius:10,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  joinButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
    fontFamily:'LineSeedSansTH_A_Bd'
  },
  participantsInfo: {
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
    paddingTop: 12,
  },
  participantsProgressBar: {
    height: 4,
    backgroundColor: '#f0f0f0',
    borderRadius: 2,
    marginBottom: 6,
  },
  participantsProgress: {
    height: '100%',
    backgroundColor: '#4CAF50',
    borderRadius: 2,
  },
  participantsText: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
      fontFamily:'InterTight-Regular'
  },
  errorText: {
    fontSize: 16,
    color: '#FF0000',
    textAlign: 'center',
    paddingVertical: 20,
    fontFamily:'InterTight-Regular'
  },
  imageSlider: {
  width: '100%',
  height: '100%',
},
slideContainer: {
  width: 400, // This should match your card width or use Dimensions
  height: '100%',
},
indicatorContainer: {
  position: 'absolute',
  bottom: 3,
  alignSelf: 'center',
  flexDirection: 'row',
  alignItems: 'center',
  backgroundColor: 'transparent',
  borderRadius: 12,
  paddingHorizontal: -16,
  paddingVertical: 4,
  width:350
},
indicator: {
  flex: 1, // This will make each indicator take equal space
  height: 4,
  borderRadius: 4,
  marginHorizontal: 5, // Reduce margin for better fit
},
activeIndicator: {
  backgroundColor: '#FFFFFF',
},
inactiveIndicator: {
  backgroundColor: '#D1D5DB',
},
});

export default TripCard;