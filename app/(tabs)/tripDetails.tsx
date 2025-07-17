import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  ScrollView,
  ActivityIndicator,
  Alert
} from 'react-native';
import { useRouter,useLocalSearchParams,Stack } from 'expo-router';
import { axiosInstance } from '../../lib/axios';
import { Ionicons } from '@expo/vector-icons';

const { width } = Dimensions.get('window');

interface TripOwner {
  id: string;
  name: string;
  // Add other trip owner properties as needed
}

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
  tripOwnerId: string;
}


const TripDetails: React.FC = () => {
      const params = useLocalSearchParams();
      const tripId = params.tripId as string;

  const [trip, setTrip] = useState<Trip | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  // Mock sub-images for the gallery
  const mockSubImages = [
    'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&h=300&fit=crop',
    'https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=400&h=300&fit=crop',
    'https://images.unsplash.com/photo-1571501679680-de32f1e7aad4?w=400&h=300&fit=crop',
    'https://images.unsplash.com/photo-1587474260584-136574528ed5?w=400&h=300&fit=crop',
    'https://images.unsplash.com/photo-1540979388789-6cee28a1cdc9?w=400&h=300&fit=crop',
  ];

  useEffect(() => {
    fetchTripDetails();
  }, [tripId]);

  const fetchTripDetails = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await axiosInstance.get(`/trips/${tripId}`);
      setTrip(response.data);
    } catch (err) {
      setError('Failed to load trip details');
      console.error('Error fetching trip:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleTripPress = () => {
    if (trip) {
    //  router.push(`/tripDetails?tripId=${trip.id}`);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('th-TH', {
      day: '2-digit',
      month: 'short',
      year: '2-digit'
    });
  };

  const calculateDuration = (startDate: string, endDate: string) => {
    const start = new Date(startDate);
    const end = new Date(endDate);
    const diffTime = Math.abs(end.getTime() - start.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return `${diffDays + 1} วัน ${diffDays} คืน`;
  };

const getRemainingParticipants = () => {
  if (!trip || !trip.participants) return 0;
  return trip.maxParticipants - trip.participants.length;
};

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('th-TH').format(price);
  };

  const getStyleColor = (style: string) => {
    const colors: { [key: string]: string } = {
      'ธรรมชาติ': '#4CAF50',
      'ผจญภัย': '#FF9800',
      'วัฒนธรรม': '#9C27B0',
      'ผ่อนคลาย': '#2196F3',
      'ชายหาด': '#00BCD4',
      'ภูเขา': '#795548',
    };
    return colors[style] || '#666666';
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
          <Stack.Screen options={{ headerShown: false }} />
        <ActivityIndicator size="large" color="#6366F1" />
        <Text style={styles.loadingText}>กำลังโหลด...</Text>
      </View>
    );
  }

  if (error || !trip) {
    return (
      <View style={styles.errorContainer}>
        <Ionicons name="alert-circle-outline" size={48} color="#EF4444" />
        <Text style={styles.errorText}>{error || 'ไม่พบข้อมูลทริป'}</Text>
        <TouchableOpacity style={styles.retryButton} onPress={fetchTripDetails}>
          <Text style={styles.retryButtonText}>ลองอีกครั้ง</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
        <Stack.Screen options={{ headerShown: false }} />
      <View style={styles.card}>
        {/* Header Icons */}
        <View style={styles.headerIcons}>
          <TouchableOpacity style={styles.iconButton} onPress={()=>router.push('/findTrips')}>
            <Ionicons name="chevron-back" size={24} color="#000" />
          </TouchableOpacity>
          <View style={styles.rightIcons}>
            <TouchableOpacity style={styles.iconButton}>
              <Ionicons name="bookmark-outline" size={24} color="#000" />
            </TouchableOpacity>
            <TouchableOpacity style={styles.iconButton}>
              <Ionicons name="share-outline" size={24} color="#000" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Main Image */}
        <Image
          source={{
            uri: trip.tripCoverImageUrl || 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&h=600&fit=crop'
          }}
          style={styles.mainImage}
          resizeMode="cover"
        />

        {/* Sub Images Gallery */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.subImagesContainer}>
          {mockSubImages.map((imageUrl, index) => (
            <TouchableOpacity key={index} style={styles.subImageWrapper}>
              <Image
                source={{ uri: imageUrl }}
                style={styles.subImage}
                resizeMode="cover"
              />
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Trip Info */}
        <View style={styles.tripInfo}>
          <View style={styles.titleRow}>
            <Text style={styles.tripTitle}>{trip.name}</Text>
            <View style={styles.participantsInfo}>
              <Text style={styles.participantsCount}>
                Ramining Participants
              </Text>
            </View>
          </View>

          <View style={styles.locationRow}>
            <Ionicons name="location-outline" size={16} color="#EF4444" />
            <Text style={styles.locationText}>
            Destinations
            </Text>
          </View>

          <Text style={styles.tripDescription}>
           Trip Name
          </Text>

          <Text style={styles.loremText}>
            Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nullam lacus ligula, lobortis ut consequat dapibus, condimentum rhoncus metus.
          </Text>

          {/* Travel Styles Tags */}
          {trip.travelStyles && trip.travelStyles.length > 0 && (
            <View style={styles.tagsContainer}>
              {trip.travelStyles.map((style, index) => (
                <View key={index} style={[styles.tag, { backgroundColor: getStyleColor(style) + '20' }]}>
                  <Text style={[styles.tagText, { color: getStyleColor(style) }]}>
                    #{style}
                  </Text>
                </View>
              ))}
            </View>
          )}

          {/* Trip Details */}
          <View style={styles.detailsContainer}>
            <Text style={styles.sectionTitle}>รายละเอียดทริป</Text>
            
            <View style={styles.detailRow}>
              <View style={styles.detailItem}>
                <View style={styles.detailIcon}>
                  <Ionicons name="calendar-outline" size={20} color="#FF9800" />
                </View>
                <View>
                  <Text style={styles.detailLabel}>Start Date-End Date</Text>
                  <Text style={styles.detailValue}>
                  Date
                  </Text>
                </View>
              </View>

              <View style={styles.detailItem}>
                <View style={styles.detailIcon}>
                  <Ionicons name="wallet-outline" size={20} color="#4CAF50" />
                </View>
                <View>
                  <Text style={styles.detailLabel}>ราคาต่อคน</Text>
                  <Text style={styles.detailValue}>
                  pPPerson
                  </Text>
                </View>
              </View>
            </View>
          </View>

          {/* Book Button */}
          <TouchableOpacity style={styles.bookButton} onPress={handleTripPress}>
            <Text style={styles.bookButtonText}>เข้าร่วมทริป</Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#666',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
    padding: 20,
  },
  errorText: {
    fontSize: 16,
    color: '#EF4444',
    textAlign: 'center',
    marginVertical: 10,
  },
  retryButton: {
    backgroundColor: '#6366F1',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  retryButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '600',
  },
  card: {
    backgroundColor: '#FFF',
    marginHorizontal: 16,
    marginVertical: 8,
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  headerIcons: {
    position: 'absolute',
    top: 50,
    left: 16,
    right: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    zIndex: 1,
  },
  rightIcons: {
    flexDirection: 'row',
    gap: 8,
  },
  iconButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 2,
  },
  mainImage: {
    width: '100%',
    height: 250,
  },
  subImagesContainer: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  subImageWrapper: {
    marginRight: 8,
  },
  subImage: {
    width: 60,
    height: 60,
    borderRadius: 8,
  },
  tripInfo: {
    padding: 16,
  },
  titleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  tripTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#1F2937',
    flex: 1,
    marginRight: 12,
  },
  participantsInfo: {
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  participantsCount: {
    fontSize: 12,
    color: '#D97706',
    fontWeight: '600',
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  locationText: {
    fontSize: 14,
    color: '#6B7280',
    marginLeft: 4,
  },
  tripDescription: {
    fontSize: 14,
    color: '#374151',
    lineHeight: 20,
    marginBottom: 8,
  },
  loremText: {
    fontSize: 14,
    color: '#6B7280',
    lineHeight: 20,
    marginBottom: 16,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 20,
  },
  tag: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  tagText: {
    fontSize: 12,
    fontWeight: '600',
  },
  detailsContainer: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 16,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  detailIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  detailLabel: {
    fontSize: 12,
    color: '#6B7280',
    marginBottom: 2,
  },
  detailValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1F2937',
  },
  bookButton: {
    backgroundColor: '#6366F1',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  bookButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default TripDetails;