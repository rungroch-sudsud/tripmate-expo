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
import { useRouter,useLocalSearchParams,Stack,useFocusEffect } from 'expo-router';
import { axiosInstance } from '../../lib/axios';
import { Ionicons } from '@expo/vector-icons';

const { width } = Dimensions.get('window');

interface TripOwner {
  id: string;
  name: string;
  fullname: string;
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
  tripCoverImageUrls?: string[];
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

  // Helper function to get sub images safely
  const getSubImages = () => {
    if (trip?.tripCoverImageUrls && trip.tripCoverImageUrls.length > 0) {
      return trip.tripCoverImageUrls;
    }
    return [];
  };

 

  const fetchTripDetails = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await axiosInstance.get(`/trips/${tripId}`);
      setTrip(response.data.data);
      console.log(trip);
      
    } catch (err) {
      setError('Failed to load trip details');
      console.error('Error fetching trip:', err);
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
  React.useCallback(() => {
    fetchTripDetails();
  }, [tripId])
);

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

  const getStyleColor = (style: string) => {
    const colors: { [key: string]: string } = {
      'ธรรมชาติ': '#4CAF50',
      'ผจญภัย': '#FF9800',
      'วัฒนธรรม': '#9C27B0',
      'ผ่อนคลาย': '#2196F3',
      'ชายหาด': '#00BCD4',
      'ภูเขา': '#795548',
      '🗺️ แนวแพลนเนอร์ / ชอบจัดทริป': '#6366F1',
    };
    return colors[style] || '#666666';
  };

  // Helper function to get main image URL safely
  const getMainImageUrl = () => {
    if (trip?.tripCoverImageUrls && trip.tripCoverImageUrls.length > 0 && trip.tripCoverImageUrls[0]) {
      return trip.tripCoverImageUrls[0];
    }else{
      return 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&h=600&fit=crop';
    }
   // return 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&h=600&fit=crop';
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
   <View style={{flex:1}}>
     <ScrollView style={styles.container}
     showsVerticalScrollIndicator={false}
    >

      <Stack.Screen options={{ headerShown: false }} />
         <Image
          source={{ uri: getMainImageUrl() }}
 
          resizeMode="cover"
        />
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
          source={{ uri: getMainImageUrl() }}
          style={styles.mainImage}
          resizeMode="cover"
        />

        {/* Sub Images Gallery */}
        {getSubImages().length > 0 && (
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.subImagesContainer}>
            {getSubImages().map((imageUrl, index) => (
              <TouchableOpacity key={index} style={styles.subImageWrapper}>
                <Image
                  source={{ uri: imageUrl }}
                  style={styles.subImage}
                  resizeMode="cover"
                />
              </TouchableOpacity>
            ))}
          </ScrollView>
        )}

        {/* Trip Info */}
        <View style={styles.tripInfo}>
          <View style={styles.titleRow}>
            <Text style={styles.tripTitle}>{trip.name}</Text>
            <View style={styles.participantsInfo}>
              <Text style={styles.participantsCount}>
                {trip.maxParticipants} ที่เหลือ
              </Text>
            </View>
          </View>

          <View style={styles.locationRow}>
            <Ionicons name="location-outline" size={16} color="#EF4444" />
            <Text style={styles.locationText}>
             {trip.destinations}
            </Text>
          </View>


          <Text style={styles.loremText}>
            บรรยากาศกลุ่ม: {trip.groupAtmosphere}
          </Text>


          <Text style={styles.tripDescription}>
            {trip.detail}
          </Text>

          {/* Travel Styles Tags */}
          {trip.travelStyles && trip.travelStyles.length > 0 && (
            <View style={styles.tagsContainer}>
              {trip.travelStyles.map((style, index) => (
                <View key={index} style={[styles.tag, { backgroundColor: getStyleColor(style) + '20' }]}>
                  <Text style={[styles.tagText]}>
                    {style}
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
                  <Ionicons name="calendar-outline" size={20} color="#585DDB26" />
                </View>
                <View>
                  <Text style={styles.detailLabel}>วันที่เดินทาง</Text>
                  <Text style={styles.detailValue}>
                    {formatDate(trip.startDate)} - {formatDate(trip.endDate)}
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
                    ฿{trip.pricePerPerson}
                  </Text>
                </View>
              </View>
            </View>

            {/* Included Services
            {trip.includedServices && trip.includedServices.length > 0 && (
              <View style={styles.servicesContainer}>
                <Text style={styles.servicesTitle}>บริการที่รวม:</Text>
                {trip.includedServices.map((service, index) => (
                  <Text key={index} style={styles.serviceItem}>• {service}</Text>
                ))}
              </View>
            )} */}

           



          </View>
          <View>
 <View style={{borderRadius:16,borderWidth:1,borderColor:'#E5E7EB',padding:20,marginVertical:20}}>
              <Text style={{color:'#374151',fontSize:10,fontFamily:'LineSeedSansTH_A_Bd',fontWeight:'bold',marginBottom:5}}>🗓 แผนการเดินทาง</Text>
              <Text style={{color:'#374151',fontFamily:'LineSeedSansTH',fontSize:10,fontWeight:'400'}}><Text style={{color:'#585DDB',fontFamily:'LineSeedSansTH_A_Bd',fontSize:10,fontWeight:'bold'}}>07:00</Text>{'   '}นัดพบ BTS หมอชิต</Text>
              <Text style={{color:'#374151',fontFamily:'LineSeedSansTH',fontSize:10,fontWeight:'400'}}><Text style={{color:'#585DDB',fontFamily:'LineSeedSansTH_A_Bd',fontSize:10,fontWeight:'bold'}}>12:00</Text>{'   '}แวะกินข้าวกลางวัน</Text>
              <Text style={{color:'#374151',fontFamily:'LineSeedSansTH',fontSize:10,fontWeight:'400'}}><Text style={{color:'#585DDB',fontFamily:'LineSeedSansTH_A_Bd',fontSize:10,fontWeight:'bold'}}>14:00</Text>{'   '}เช็กอินที่พัก ปายแลนด์</Text>
              <Text style={{color:'#374151',fontFamily:'LineSeedSansTH',fontSize:10,fontWeight:'400'}}><Text style={{color:'#585DDB',fontFamily:'LineSeedSansTH_A_Bd',fontSize:10,fontWeight:'bold'}}>17:00</Text>{'   '}ชมวิวหยุนไหล</Text>
            </View>

            <View style={{borderRadius:16,borderWidth:1,borderColor: '#E5E7EB',padding:20,marginVertical:20}}>
              <Text style={{color:'#374151',fontSize:10,fontFamily:'LineSeedSansTH_A_Bd',fontWeight:'bold',marginBottom:5}}>❌ สิ่งที่ไม่รวม</Text>
              <Text style={{color:'#374151',fontFamily:'LineSeedSansTH',fontSize:10,fontWeight:'400'}}>- ค่าอาหารกลางวัน</Text>
               <Text style={{color:'#374151',fontFamily:'LineSeedSansTH',fontSize:10,fontWeight:'400'}}>- ค่าทางเข้าอุทยาน</Text>
                <Text style={{color:'#374151',fontFamily:'LineSeedSansTH',fontSize:10,fontWeight:'400'}}>- ค่าเครื่องดื่มส่วนตัว</Text>
            </View>

              <View style={{borderRadius:16,borderWidth:1,borderColor: '#E5E7EB',padding:20,marginVertical:20}}>
              <Text style={{color:'#374151',fontSize:10,fontFamily:'LineSeedSansTH_A_Bd',fontWeight:'bold',marginBottom:5}}>🎒 สิ่งที่ต้องเตรียมมาเอง</Text>
              <Text style={{color:'#374151',fontFamily:'LineSeedSansTH',fontSize:10,fontWeight:'400'}}>- บัตรประชาชน/พาสปอร์ต/Visa</Text>
               <Text style={{color:'#374151',fontFamily:'LineSeedSansTH',fontSize:10,fontWeight:'400'}}>- เสื้อกันหนาว</Text>
                <Text style={{color:'#374151',fontFamily:'LineSeedSansTH',fontSize:10,fontWeight:'400'}}>- ยาประจำตัว</Text>
                <Text style={{color:'#374151',fontFamily:'LineSeedSansTH',fontSize:10,fontWeight:'400'}}>- ของใช้ส่วนตัว</Text>
              </View>



              <View style={{borderRadius:16,borderWidth:1,borderColor: '#E5E7EB',padding:20,marginVertical:20}}>
              <Text style={{color:'#374151',fontSize:10,fontFamily:'LineSeedSansTH_A_Bd',fontWeight:'bold',marginBottom:5}}>✅ เงื่อนไข / กติกาทริป</Text>
              <Text style={{color:'#374151',fontFamily:'LineSeedSansTH',fontSize:10,fontWeight:'400'}}>- เดินทางตรงเวลา</Text>
               <Text style={{color:'#374151',fontFamily:'LineSeedSansTH',fontSize:10,fontWeight:'400'}}>- แชร์ห้องพัก 2 คน/ห้อง</Text>
                <Text style={{color:'#374151',fontFamily:'LineSeedSansTH',fontSize:10,fontWeight:'400'}}>- งดใช้เสียงหลัง 22:00</Text>
                <Text style={{color:'#374151',fontFamily:'LineSeedSansTH',fontSize:10,fontWeight:'400'}}>- ทริปนี้หญิงล้วน</Text>
              </View>

              <View>
                <Text style={{color:'#374151',fontFamily:'LineSeedSansTH_A_Bd',fontWeight:'bold',fontSize:10}}>แนะนำตัวในฐานะหัวตี้</Text>
                <View style={{borderRadius:16,borderWidth:1,borderBlockColor:'#E5E7EB',padding:20,marginVertical:20}}>
                  <Text style={{color:'#374151',fontFamily:'LineSeedSansTH',fontSize:10,fontWeight:'400'}}>
                    ชื่อเบียร์ครับ เป็นสายเที่ยวชิล ๆ ชอบถ่ายรูป เคยจัดทริปไปปาย 4 ครั้ง
ดูแลเพื่อนๆ ตั้งแต่ต้นจนจบชอบวางแผนเน้นครบ จบ ไม่ต้องจ่ายเพิ่ม
ขอแค่ตรงเวลา รับรองว่าทริปสนุกแน่นอน!
                  </Text>
                </View>
              </View>


              <View>
                <View style={{borderRadius:16,borderWidth:1,borderColor: '#E5E7EB',padding:20,marginVertical:20}}>
                  <Text style={{color:'#374151',fontSize:10,fontFamily:'LineSeedSansTH_A_Bd',fontWeight:'bold',marginBottom:5}}>ธนาคารกสิกรไทย</Text>
                  <Text style={{color:'#374151',fontFamily:'LineSeedSansTH',fontSize:10,fontWeight:'400'}}><Text style={{color:'#585DDB',fontFamily:'LineSeedSansTH_A_Bd',fontSize:10,fontWeight:'bold'}}>ชื่อบัญชี</Text>{'    '}นายเบียร์</Text>
                   <Text style={{color:'#374151',fontFamily:'LineSeedSansTH',fontSize:10,fontWeight:'400'}}><Text style={{color:'#585DDB',fontFamily:'LineSeedSansTH_A_Bd',fontSize:10,fontWeight:'bold'}}>เลขที่บัญชี</Text>{'    '}123-4567-890</Text>
                </View>
              </View>


              <View>
                <Text style={{color:'#374151',fontFamily:'LineSeedSansTH',fontSize:10,fontWeight:'400'}}><Text style={{color:'#585DDB',fontFamily:'LineSeedSansTH_A_Bd',fontSize:10,fontWeight:'bold'}}>*</Text> จำนวนผู้เข้าร่วมขั้นต่ำ 2 คน</Text>
              </View>
          </View>

       
        </View>
      </View>
    </ScrollView>
       {/* Book Button */}
          <TouchableOpacity style={styles.bookButton} onPress={handleTripPress}>
            <Text style={styles.bookButtonText}>เข้าร่วมแชท</Text>
          </TouchableOpacity>
   </View>
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
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  headerIcons: {
    position: 'absolute',
    top: 30,
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
    backgroundColor: '#585DDB26',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  participantsCount: {
    fontSize: 12,
    color: '#585DDB',
    fontWeight: '600',
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
   // backgroundColor:'#FFF7ED'
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
  servicesContainer: {
    marginTop: 16,
    padding: 12,
    backgroundColor: '#F9FAFB',
    borderRadius: 8,
  },
  servicesTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
  },
  serviceItem: {
    fontSize: 13,
    color: '#6B7280',
    marginBottom: 4,
  },
  bookButton: {
    backgroundColor: '#6366F1',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    margin:20
  },
  bookButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default TripDetails;