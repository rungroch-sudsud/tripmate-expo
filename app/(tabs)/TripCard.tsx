import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  StyleSheet,
  TextLayoutEventData,
  NativeSyntheticEvent,
} from 'react-native';
import {useFonts} from 'expo-font'
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
  tripCoverImageUrl?: string;
  tripOwner: TripOwner;
  fullname: string;
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
  const ownerInfo = getOwnerInfo(trip.tripOwner);
  const [isExpanded, setIsExpanded] = useState(false);
  const [isTruncated, setIsTruncated] = useState(false);

  // Function to handle the click and toggle the expanded state
  const toggleText = () => {
    setIsExpanded(!isExpanded);
  };
  const [fontsLoaded] = useFonts({
    'InterTight-Regular':require('../assets/fonts/InterTight-Regular.ttf')
  });

  // Function to check if text is truncated (overflow)
  const handleTextLayout = (e: NativeSyntheticEvent<TextLayoutEventData>) => {
    const { lines } = e.nativeEvent;
    if (lines.length > 1) {
      setIsTruncated(true);
    }
  };

  // Handle card press
  const handleCardPress = () => {
    onTripPress(trip);
  };

  // Handle bookmark press
  const handleBookmarkPress = () => {
    onBookmarkToggle(trip);
  };

  // Handle join trip press
  const handleJoinPress = () => {
    onJoinTrip(trip);
  };

  return (
    <TouchableOpacity
      style={styles.card}
      activeOpacity={0.7}
    >
      {/* Header Image Container */}
      <View style={styles.imageContainer}>
        {trip.tripCoverImageUrl ? (
          <Image
            source={{ uri: trip.tripCoverImageUrl }}
            style={styles.backgroundImage}
            resizeMode="cover"
          />
        ) : (
          <View style={styles.placeholderImage}>
            <Text style={styles.placeholderText}>📷</Text>
          </View>
        )}
        
        {/* Date Badge */}
        <View style={styles.dateBadge}>
           <Image source={require('../assets/images/images/images/image25.png')} style={{width:10.5,height:12,marginRight:5}}/>
          <Text style={styles.dateText}>
            {formatDateRange(trip.startDate, trip.endDate)}
          </Text>
        </View>
        
        {/* Max Participant Badge */}
        <View style={styles.participantBadge}>
         <Image source={require('../assets/images/images/images/image26.png')} style={{width:15,height:12,marginRight:5}}/>
          <Text style={styles.participantText}>
            ต้องการ {trip.maxParticipants} คน
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
                <Text style={styles.locationIcon}>📍</Text>
                <Text style={styles.destinationText} numberOfLines={1}>
                  {trip.destinations.join(', ')}
                </Text>
              </View>
            )}
          </View>

          <TouchableOpacity
            style={styles.bookmarkButton}
            onPress={handleBookmarkPress}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <View style={styles.bookmarkIcon}>
              {isBookmarked ? <Image source={require('../assets/images/images/images/image22.png')} style={{width:12,height:16,tintColor:'#29C4AF'}}/> : <Image source={require('../assets/images/images/images/image21.png')} style={{width:12,height:16}}  />}
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
          <Text style={styles.description} numberOfLines={2}>
            {trip.detail}
          </Text>
        )}

        {/* Price Container */}
        <View style={styles.priceContainer}>
          <Text style={styles.priceLabel}>ราคา:</Text>
          <Text style={styles.priceValue}>
            ฿{trip.pricePerPerson.toLocaleString()} /คน
          </Text>
        </View>

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
              <Text style={styles.ownerAge}>{ownerInfo.age}</Text>
            </View>
          </View>

          <TouchableOpacity
            style={styles.joinButton}
            onPress={handleJoinPress}
            activeOpacity={0.8}
          >
            <Text style={styles.joinButtonText}>สนใจเข้าร่วม</Text>
          </TouchableOpacity>
        </View>

        {/* Participants Info */}
        <View style={styles.participantsInfo}>
          <View style={styles.participantsProgressBar}>
            <View 
              style={[
                styles.participantsProgress, 
                { width: `${(trip.participants.length / trip.maxParticipants) * 100}%` }
              ]} 
            />
          </View>
          <Text style={styles.participantsText}>
            ผู้เข้าร่วม: {trip.participants.length}/{trip.maxParticipants} คน
          </Text>
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
    height: 200,
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
    fontSize: 12,
    fontWeight: '500',
    fontFamily:'InterTight-Regular'
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
    fontSize: 12,
    fontWeight: '500',
    fontFamily:'InterTight-Regular'
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
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
    fontFamily:'InterTight-Regular'
  },
  destinationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  locationIcon: {
    fontSize: 14,
    marginRight: 4,
    fontFamily:'InterTight-Regular'
  },
  destinationText: {
    fontSize: 14,
    color: '#666',
    flex: 1,
    fontFamily:'InterTight-Regular'
  },
  bookmarkButton: {
    padding: 4,
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
    fontSize: 14,
    color: '#555',
    lineHeight: 20,
    flex: 1,
      fontFamily:'InterTight-Regular',
      fontStyle:'italic'
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
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
    marginBottom: 12,
      fontFamily:'InterTight-Regular'
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  priceLabel: {
    fontSize: 14,
    color: '#666',
    marginRight: 8,
      fontFamily:'InterTight-Regular'
  },
  priceValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#29C4AF',
      fontFamily:'InterTight-Regular'
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 16,
  },
  serviceTag: {
    backgroundColor: '#E8F4FD',
    borderRadius: 16,
    paddingHorizontal: 8,
    paddingVertical: 4,
    marginRight: 6,
    marginBottom: 6,
  },
  serviceTagText: {
    fontSize: 12,
    color: '#1976D2',
    fontWeight: '500',
      fontFamily:'InterTight-Regular'
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
    fontWeight: '600',
    color: '#333',
      fontFamily:'InterTight-Regular'
  },
  ownerAge: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
      fontFamily:'InterTight-Regular'
  },
  joinButton: {
    backgroundColor: '#29C4AF',
    borderRadius:8,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  joinButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '500',
    fontFamily:'InterTight-Regular'
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
});

export default TripCard;