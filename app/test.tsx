import React from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

const { width } = Dimensions.get('window');

interface TravelCardProps {
  onBookPress?: () => void;
  onBookmarkPress?: () => void;
}

const TravelCard: React.FC<TravelCardProps> = ({
  onBookPress,
  onBookmarkPress,
}) => {
  return (
    <View style={styles.container}>
      <View style={styles.card}>
        {/* Header Image */}
        <View style={styles.imageContainer}>
          <Image
            source={{
              uri: 'https://images.unsplash.com/photo-1589394815804-964ed0be2eb5?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80',
            }}
            style={styles.backgroundImage}
          />
          
          {/* Overlay gradient */}
          <LinearGradient
            colors={['transparent', 'rgba(0,0,0,0.3)']}
            style={styles.imageOverlay}
          />
          
          {/* Date badge */}
          <View style={styles.dateBadge}>
            <Text style={styles.dateIcon}>📅</Text>
            <Text style={styles.dateText}>15-18 มิ.ย. 67</Text>
          </View>
          
          {/* Booking badge */}
          <View style={styles.bookingBadge}>
            <Text style={styles.bookingIcon}>👥</Text>
            <Text style={styles.bookingText}>ต้องการ 2-3 คน</Text>
          </View>
        </View>

        {/* Content */}
        <View style={styles.content}>
          {/* Title and Bookmark */}
          <View style={styles.titleRow}>
            <View style={styles.titleSection}>
              <Text style={styles.title}>ทริปภูเก็ต 4 วัน 3 คืน</Text>
              <View style={styles.locationRow}>
                <Text style={styles.locationIcon}>📍</Text>
                <Text style={styles.location}>ภูเก็ต, ประเทศไทย</Text>
              </View>
            </View>
            <TouchableOpacity
              style={styles.bookmarkButton}
              onPress={onBookmarkPress}
            >
              <Text style={styles.bookmarkIcon}>🔖</Text>
            </TouchableOpacity>
          </View>

          {/* Description */}
          <Text style={styles.description}>
            เที่ยวภูเก็ตแบบชิลๆ ดำน้ำ ถ่ายรูปสวยๆ กินซีฟู้ดรม
            กะเล หาเพื่อนร่วมทริปสายถ่ายรูป ชอบกิจกรรม
          </Text>

          {/* Tags */}
          <View style={styles.tagsContainer}>
            <View style={[styles.tag, styles.tagBlue]}>
              <Text style={styles.tagTextBlue}>#กะเล</Text>
            </View>
            <View style={[styles.tag, styles.tagPurple]}>
              <Text style={styles.tagTextPurple}>#ถ่ายรูป</Text>
            </View>
            <View style={[styles.tag, styles.tagGreen]}>
              <Text style={styles.tagTextGreen}>#อาหาร</Text>
            </View>
          </View>

          {/* Bottom row */}
          <View style={styles.bottomRow}>
            <View style={styles.hostInfo}>
              <Image
                source={{
                  uri: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?ixlib=rb-4.0.3&auto=format&fit=crop&w=100&q=80',
                }}
                style={styles.hostAvatar}
              />
              <View style={styles.hostDetails}>
                <Text style={styles.hostName}>มินนี่</Text>
                <View style={styles.ratingRow}>
                  <Text style={styles.starIcon}>⭐</Text>
                  <Text style={styles.rating}>4.8</Text>
                </View>
              </View>
            </View>

            <TouchableOpacity style={styles.joinButton} onPress={onBookPress}>
              <Text style={styles.joinButtonText}>สนใจเข้าร่วม</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    padding: 16,
    justifyContent: 'center',
  },
  card: {
    backgroundColor: 'white',
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 8,
  },
  imageContainer: {
    height: 200,
    position: 'relative',
  },
  backgroundImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  imageOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
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
  bookingBadge: {
    position: 'absolute',
    top: 16,
    right: 16,
    backgroundColor: '#6366f1',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    flexDirection: 'row',
    alignItems: 'center',
  },
  bookingIcon: {
    fontSize: 14,
    marginRight: 4,
  },
  bookingText: {
    fontSize: 12,
    fontWeight: '500',
    color: 'white',
  },
  content: {
    padding: 16,
  },
  titleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  titleSection: {
    flex: 1,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 4,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  locationIcon: {
    fontSize: 12,
    marginRight: 4,
  },
  location: {
    fontSize: 14,
    color: '#6b7280',
  },
  bookmarkButton: {
    padding: 8,
  },
  bookmarkIcon: {
    fontSize: 20,
    color: '#6366f1',
  },
  description: {
    fontSize: 14,
    color: '#4b5563',
    lineHeight: 20,
    marginBottom: 16,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 16,
  },
  tag: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginRight: 8,
    marginBottom: 4,
  },
  tagBlue: {
    backgroundColor: '#dbeafe',
  },
  tagPurple: {
    backgroundColor: '#e9d5ff',
  },
  tagGreen: {
    backgroundColor: '#d1fae5',
  },
  tagTextBlue: {
    color: '#2563eb',
    fontSize: 12,
    fontWeight: '500',
  },
  tagTextPurple: {
    color: '#7c3aed',
    fontSize: 12,
    fontWeight: '500',
  },
  tagTextGreen: {
    color: '#059669',
    fontSize: 12,
    fontWeight: '500',
  },
  bottomRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  hostInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  hostAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    marginRight: 8,
  
  },
  hostDetails: {
    justifyContent: 'center',
  },
  hostName: {
    fontSize: 14,
    fontWeight: '500',
    color: '#1f2937',
    marginBottom: 2,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  starIcon: {
    fontSize: 12,
    marginRight: 2,
  },
  rating: {
    fontSize: 12,
    color: '#6b7280',
    fontWeight: '500',
  },
  joinButton: {
    backgroundColor: '#6366f1',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
  },
  joinButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
});

export default TravelCard;