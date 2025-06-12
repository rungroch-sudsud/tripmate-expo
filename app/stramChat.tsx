import { StreamChat } from 'stream-chat';
import React, { useEffect, useState, useCallback, useMemo, useRef } from 'react';
import {
  Channel,
  Chat,
  Window,
  MessageInput,
  MessageList,
  Thread,
  TypingContextValue,
  TypingIndicator,
  LoadingIndicator,
} from 'stream-chat-react';
import type { Channel as StreamChannel } from 'stream-chat';
import { useRouter, useLocalSearchParams } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { View, Text, Image, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { axiosInstance } from '../lib/axios';
import 'stream-chat-react/dist/css/v2/index.css';
import {requirements} from './requirement'
import {ScrollView,useWindowDimensions,TextInput,ActivityIndicator} from 'react-native'

interface TripParticipant {
  userId: string;
  fullname: string;
  nickname: string;
  profileImageUrl: string;
  age: number;
  email: string;
}

interface Trip {
  id: string;
  name: string;
  participants: string[];
  tripOwnerId: string;
  destinations: string[];
  detail: string;
  endDate: string;
  startDate: string;
  groupAtmosphere: string;
  includedServices: string[];
  maxParticipants: number;
  pricePerPerson: number;
  status: string;
  travelStyles: string[];
  tripCoverImageUrl: string;
}

// Interface for mapped data
interface TravelStyle {
  id: string;
  title: string;
  iconImageUrl: string;
  activeIconImageUrl: string;
}

interface Service {
  id: string;
  title: string;
}





const MAX_DISPLAYED_AVATARS = 3;
const DEFAULT_AVATAR = 'https://via.placeholder.com/40x40/cccccc/666666?text=👤';

// Custom Channel Header Component
const CustomChannelHeader: React.FC<{ 
  participants: TripParticipant[], 
  tripName: string,
  onBack: () => void 
}> = React.memo(({ participants, tripName, onBack }) => {
  const displayParticipants = useMemo(() => 
    participants.slice(0, MAX_DISPLAYED_AVATARS), 
    [participants]
  );
  const remainingCount = Math.max(0, participants.length - MAX_DISPLAYED_AVATARS);

  return (
    <View style={styles.headerContainer}>
      <TouchableOpacity onPress={onBack} style={styles.backButton}>
        <Text style={styles.backButtonText}>←</Text>
      </TouchableOpacity>
      
      <View style={styles.participantsContainer}>
        <View style={styles.avatarsContainer}>
          {displayParticipants.map((participant, index) => (
            <View 
              key={participant.userId} 
              style={[styles.avatarWrapper, { zIndex: MAX_DISPLAYED_AVATARS - index }]}
            >
              <Image
                source={{ 
                  uri: participant.profileImageUrl !== 'N/A' 
                    ? participant.profileImageUrl 
                    : DEFAULT_AVATAR
                }}
                style={styles.participantAvatar}
                defaultSource={{ uri: DEFAULT_AVATAR }}
              />
            </View>
          ))}
          {remainingCount > 0 && (
            <View style={styles.countBadge}>
              <Text style={styles.countText}>+{remainingCount}</Text>
            </View>
          )}
        </View>
        
        <View style={styles.groupInfo}>
          <Text style={styles.participantCount}>
            {participants.length} คน
          </Text>
          <Text style={styles.tripHint} numberOfLines={1}>
            {tripName}
          </Text>
        </View>
      </View>
    </View>
  );
});

// Custom Message Component with improved error handling
const CustomMessage: React.FC<{
  message: any;
  participants: TripParticipant[];
  currentUser: any;
}> = React.memo(({ message, participants, currentUser }) => {
  // Validation
  if (!message?.user?.id || !message.text) {
    return null;
  }

  const user = message.user;
  const participantData = useMemo(() => 
    participants.find(p => p.userId === user.id), 
    [participants, user.id]
  );
  
  const displayName = useMemo(() => {
    if (participantData) {
      return participantData.nickname || participantData.fullname;
    }
    return user.name || user.id || 'Unknown User';
  }, [participantData, user]);
  
  const displayImage = useMemo(() => {
    if (participantData?.profileImageUrl && participantData.profileImageUrl !== 'N/A') {
      return participantData.profileImageUrl;
    }
    return user.image || DEFAULT_AVATAR;
  }, [participantData, user.image]);
  
  const isOwnMessage = user.id === currentUser?.id;
  
  const formatTime = useCallback((timestamp: string | Date) => {
    try {
      const date = timestamp instanceof Date ? timestamp : new Date(timestamp);
      if (isNaN(date.getTime())) return '';
      
      return date.toLocaleTimeString('th-TH', {
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return '';
    }
  }, []);
  
  return (
    <View style={[
      styles.customMessage,
      isOwnMessage && styles.ownMessage
    ]}>
      {!isOwnMessage && (
        <Image
          source={{ uri: displayImage }}
          style={styles.messageAvatar}
          defaultSource={{ uri: DEFAULT_AVATAR }}
          onError={() => console.log('Failed to load avatar:', displayImage)}
        />
      )}
      <View style={[
        styles.messageContent,
        isOwnMessage && styles.ownMessageContent
      ]}>
        {!isOwnMessage && (
          <View style={styles.messageHeader}>
            <Text style={styles.senderName}>{displayName}</Text>
            <Text style={styles.messageTime}>
              {formatTime(message.created_at)}
            </Text>
          </View>
        )}
        <View style={[
          styles.messageBubble,
          isOwnMessage && styles.ownMessageBubble
        ]}>
          <Text style={[
            styles.messageText,
            isOwnMessage && styles.ownMessageText
          ]}>
            {message.text}
          </Text>
        </View>
        {isOwnMessage && (
          <Text style={styles.ownMessageTime}>
            {formatTime(message.created_at)}
          </Text>
        )}
      </View>
    </View>
  );
});

const EditTripForm: React.FC<{
  trip: Trip;
  onSave: (updatedTrip: Partial<Trip>) => Promise<void>;
  onCancel: () => void;
  loading: boolean;
}> = ({ trip, onSave, onCancel, loading }) => {
  const [localFormData, setLocalFormData] = useState({
    name: trip.name,
    startDate: formatDateForInput(trip.startDate),
    endDate: formatDateForInput(trip.endDate),
    detail: trip.detail || '',
    destinations: [...trip.destinations],
    travelStyles: [...trip.travelStyles],
    includedServices: [...trip.includedServices],
    maxParticipants: trip.maxParticipants,
    pricePerPerson: trip.pricePerPerson,
    groupAtmosphere: trip.groupAtmosphere || '',
  });

  const [allDestinations, setAllDestinations] = useState<string[]>([]);
  const [allTravelStyles, setAllTravelStyles] = useState<TravelStyle[]>([]);
  const [allServices, setAllServices] = useState<Service[]>([]);
  const [destinationDropdownOpen, setDestinationDropdownOpen] = useState(false);
  const [destinationSearchText, setDestinationSearchText] = useState('');
  const [showStartDatePicker, setShowStartDatePicker] = useState(false);
  const [showEndDatePicker, setShowEndDatePicker] = useState(false);
  const [fetchLoading, setFetchLoading] = useState(false);

  // Fetch all data for dropdowns
  useEffect(() => {
    const fetchAllData = async () => {
      setFetchLoading(true);
      try {
        const [destinationsRes, travelStylesRes, servicesRes] = await Promise.all([
          axiosInstance.get('/destinations'),
          axiosInstance.get('/travel-styles'),
          axiosInstance.get('/services')
        ]);

        setAllDestinations(destinationsRes.data.data || []);
        
        const mappedTravelStyles: TravelStyle[] = travelStylesRes.data.data.map((item: any) => ({
          id: item.id,
          title: item.title,
          iconImageUrl: item.iconImageUrl,
          activeIconImageUrl: item.activeIconImageUrl || item.iconImageUrl,
        }));
        setAllTravelStyles(mappedTravelStyles);

        const mappedServices: Service[] = servicesRes.data.data.map((item: any) => ({
          id: item.id,
          title: item.title,
        }));
        setAllServices(mappedServices);
      } catch (error) {
        console.error('Failed to fetch data:', error);
        Alert.alert('Error', 'Failed to load form data');
      } finally {
        setFetchLoading(false);
      }
    };

    fetchAllData();
  }, []);

  const filteredDestinations = useMemo(() => {
    if (!destinationSearchText) return allDestinations;
    return allDestinations.filter(dest => 
      dest.toLowerCase().includes(destinationSearchText.toLowerCase())
    );
  }, [allDestinations, destinationSearchText]);

  const addDestination = (destination: string) => {
    if (!localFormData.destinations.includes(destination)) {
      setLocalFormData(prev => ({
        ...prev,
        destinations: [...prev.destinations, destination]
      }));
    }
    setDestinationSearchText('');
    setDestinationDropdownOpen(false);
  };

  const removeDestination = (destination: string) => {
    setLocalFormData(prev => ({
      ...prev,
      destinations: prev.destinations.filter(d => d !== destination)
    }));
  };

  const toggleTravelStyle = (styleId: string) => {
    setLocalFormData(prev => ({
      ...prev,
      travelStyles: prev.travelStyles.includes(styleId)
        ? prev.travelStyles.filter(id => id !== styleId)
        : [...prev.travelStyles, styleId]
    }));
  };

  const toggleService = (serviceId: string) => {
    setLocalFormData(prev => ({
      ...prev,
      includedServices: prev.includedServices.includes(serviceId)
        ? prev.includedServices.filter(id => id !== serviceId)
        : [...prev.includedServices, serviceId]
    }));
  };

  const formatDateInput = (text: string) => {
    const numbers = text.replace(/\D/g, '');
    if (numbers.length <= 2) return numbers;
    if (numbers.length <= 4) return `${numbers.slice(0, 2)}/${numbers.slice(2)}`;
    return `${numbers.slice(0, 2)}/${numbers.slice(2, 4)}/${numbers.slice(4, 8)}`;
  };

  const handleSave = async () => {
    try {
      // Validation
      if (!localFormData.name.trim()) {
        Alert.alert('Error', 'กรุณาใส่ชื่อทริป');
        return;
      }
      if (localFormData.destinations.length === 0) {
        Alert.alert('Error', 'กรุณาเลือกจุดหมายปลายทางอย่างน้อย 1 แห่ง');
        return;
      }

      const updatedTrip: Partial<Trip> = {
        name: localFormData.name.trim(),
        startDate: convertDateFormat(localFormData.startDate),
        endDate: convertDateFormat(localFormData.endDate),
        detail: localFormData.detail.trim(),
        destinations: localFormData.destinations,
        travelStyles: localFormData.travelStyles,
        includedServices: localFormData.includedServices,
        maxParticipants: localFormData.maxParticipants,
        pricePerPerson: localFormData.pricePerPerson,
        groupAtmosphere: localFormData.groupAtmosphere.trim(),
      };

      await onSave(updatedTrip);
    } catch (error) {
      console.error('Save error:', error);
    }
  };

  if (fetchLoading) {
    return (
      <View style={styles.editLoadingContainer}>
        <ActivityIndicator size="large" color="#007bff" />
        <Text style={styles.editLoadingText}>กำลังโหลดข้อมูล...</Text>
      </View>
    );
  }

  return (
    <View style={styles.editContainer}>
      {/* Header */}
      <View style={styles.editHeader}>
        <TouchableOpacity onPress={onCancel} style={styles.cancelButton}>
          <Text style={styles.cancelButtonText}>✕</Text>
        </TouchableOpacity>
        <Text style={styles.editTitle}>แก้ไขทริป</Text>
        <TouchableOpacity 
          onPress={handleSave} 
          style={[styles.saveButton, loading && styles.saveButtonDisabled]}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : (
            <Text style={styles.saveButtonText}>บันทึก</Text>
          )}
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.editForm} showsVerticalScrollIndicator={false}>
        {/* Trip Name */}
        <View style={styles.formGroup}>
          <Text style={styles.formLabel}>ชื่อทริป *</Text>
          <TextInput
            style={styles.formInput}
            value={localFormData.name}
            onChangeText={(text) => setLocalFormData(prev => ({ ...prev, name: text }))}
            placeholder="ใส่ชื่อทริป"
          />
        </View>

        {/* Date Fields */}
        <View style={styles.dateRow}>
          <View style={styles.dateField}>
            <Text style={styles.formLabel}>วันที่เริ่มต้น *</Text>
            <TouchableOpacity onPress={() => setShowStartDatePicker(true)}>
              <TextInput
                style={styles.formInput}
                value={localFormData.startDate}
                onChangeText={(text) => {
                  const formatted = formatDateInput(text);
                  setLocalFormData(prev => ({ ...prev, startDate: formatted }));
                }}
                placeholder="dd/mm/yyyy"
                keyboardType="numeric"
                maxLength={10}
                editable={true}
                pointerEvents="none"
              />
            </TouchableOpacity>
          </View>

          <View style={styles.dateField}>
            <Text style={styles.formLabel}>วันที่สิ้นสุด *</Text>
            <TouchableOpacity onPress={() => setShowEndDatePicker(true)}>
              <TextInput
                style={styles.formInput}
                value={localFormData.endDate}
                onChangeText={(text) => {
                  const formatted = formatDateInput(text);
                  setLocalFormData(prev => ({ ...prev, endDate: formatted }));
                }}
                placeholder="dd/mm/yyyy"
                keyboardType="numeric"
                maxLength={10}
                editable={true}
                pointerEvents="none"
              />
            </TouchableOpacity>
          </View>
        </View>

        {/* Destinations */}
        <View style={styles.formGroup}>
          <Text style={styles.formLabel}>จุดหมายปลายทาง *</Text>
          <View style={[styles.destinationContainer, destinationDropdownOpen && styles.destinationContainerOpen]}>
            <TouchableOpacity onPress={() => setDestinationDropdownOpen(!destinationDropdownOpen)}>
              <View>
                {destinationDropdownOpen ? (
                  <TextInput
                    style={styles.destinationInput}
                    placeholder="ค้นหาสถานที่"
                    value={destinationSearchText}
                    onChangeText={setDestinationSearchText}
                    autoFocus={true}
                  />
                ) : (
                  <Text style={styles.destinationPlaceholder}>
                    📍 ค้นหาสถานที่
                  </Text>
                )}
              </View>
            </TouchableOpacity>

            {destinationDropdownOpen && (
              <View style={styles.destinationDropdown}>
                <ScrollView style={styles.destinationScrollView}>
                  {filteredDestinations.length > 0 ? (
                    filteredDestinations.map((item, index) => (
                      <TouchableOpacity
                        key={index}
                        style={styles.destinationItem}
                        onPress={() => addDestination(item)}
                      >
                        <Text style={styles.destinationItemText}>{item}</Text>
                      </TouchableOpacity>
                    ))
                  ) : (
                    <Text style={styles.noDestinationsText}>
                      ไม่พบสถานที่ที่ค้นหา
                    </Text>
                  )}
                </ScrollView>
              </View>
            )}
          </View>

          {/* Selected Destinations */}
          <View style={styles.selectedDestinations}>
            {localFormData.destinations.map((dest, index) => (
              <TouchableOpacity
                key={index}
                style={styles.destinationTag}
                onPress={() => removeDestination(dest)}
              >
                <Text style={styles.destinationTagText}>
                  {dest} <Text style={styles.removeIcon}>×</Text>
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Travel Styles */}
        <View style={styles.formGroup}>
          <Text style={styles.formLabel}>สไตล์การเที่ยว</Text>
          <View style={styles.checkboxContainer}>
            {allTravelStyles.map((style) => (
              <TouchableOpacity
                key={style.id}
                style={[
                  styles.checkboxItem,
                  localFormData.travelStyles.includes(style.id) && styles.checkboxItemSelected
                ]}
                onPress={() => toggleTravelStyle(style.id)}
              >
                <View style={[
                  styles.checkbox,
                  localFormData.travelStyles.includes(style.id) && styles.checkboxChecked
                ]}>
                  {localFormData.travelStyles.includes(style.id) && (
                    <Text style={styles.checkmark}>✓</Text>
                  )}
                </View>
                <Text style={[
                  styles.checkboxLabel,
                  localFormData.travelStyles.includes(style.id) && styles.checkboxLabelSelected
                ]}>
                  {style.title}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Services */}
        <View style={styles.formGroup}>
          <Text style={styles.formLabel}>สิ่งที่รวมในราคา</Text>
          <View style={styles.checkboxContainer}>
            {allServices.map((service) => (
              <TouchableOpacity
                key={service.id}
                style={[
                  styles.checkboxItem,
                  localFormData.includedServices.includes(service.id) && styles.checkboxItemSelected
                ]}
                onPress={() => toggleService(service.id)}
              >
                <View style={[
                  styles.checkbox,
                  localFormData.includedServices.includes(service.id) && styles.checkboxChecked
                ]}>
                  {localFormData.includedServices.includes(service.id) && (
                    <Text style={styles.checkmark}>✓</Text>
                  )}
                </View>
                <Text style={[
                  styles.checkboxLabel,
                  localFormData.includedServices.includes(service.id) && styles.checkboxLabelSelected
                ]}>
                  {service.title}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Price and Max Participants */}
        <View style={styles.formRow}>
          <View style={styles.formFieldHalf}>
            <Text style={styles.formLabel}>ราคาต่อคน (บาท)</Text>
            <TextInput
              style={styles.formInput}
              value={localFormData.pricePerPerson.toString()}
              onChangeText={(text) => {
                const price = parseInt(text.replace(/[^0-9]/g, '')) || 0;
                setLocalFormData(prev => ({ ...prev, pricePerPerson: price }));
              }}
              placeholder="0"
              keyboardType="numeric"
            />
          </View>

          <View style={styles.formFieldHalf}>
            <Text style={styles.formLabel}>จำนวนผู้เข้าร่วมสูงสุด</Text>
            <TextInput
              style={styles.formInput}
              value={localFormData.maxParticipants.toString()}
              onChangeText={(text) => {
                const max = parseInt(text.replace(/[^0-9]/g, '')) || 1;
                setLocalFormData(prev => ({ ...prev, maxParticipants: Math.max(1, max) }));
              }}
              placeholder="1"
              keyboardType="numeric"
            />
          </View>
        </View>

        {/* Group Atmosphere */}
        <View style={styles.formGroup}>
          <Text style={styles.formLabel}>บรรยากาศกลุ่ม</Text>
          <TextInput
            style={styles.formInput}
            value={localFormData.groupAtmosphere}
            onChangeText={(text) => setLocalFormData(prev => ({ ...prev, groupAtmosphere: text }))}
            placeholder="เช่น สนุกสนาน, ผ่อนคลาย, ผจญภัย"
          />
        </View>

        {/* Detail */}
        <View style={styles.formGroup}>
          <Text style={styles.formLabel}>รายละเอียดเพิ่มเติม</Text>
          <TextInput
            style={[styles.formInput, styles.textArea]}
            value={localFormData.detail}
            onChangeText={(text) => setLocalFormData(prev => ({ ...prev, detail: text }))}
            placeholder="รายละเอียดเพิ่มเติมเกี่ยวกับทริป..."
            multiline
            numberOfLines={4}
            textAlignVertical="top"
          />
        </View>

        <View style={styles.formBottomPadding} />
      </ScrollView>

      {/* Date Pickers */}
      <DatePickerModal
        visible={showStartDatePicker}
        onClose={() => setShowStartDatePicker(false)}
        onDateSelect={(date) => {
          setLocalFormData(prev => ({ 
            ...prev, 
            startDate: formatDateForInput(date.toISOString()) 
          }));
          setShowStartDatePicker(false);
        }}
        title="เลือกวันที่เริ่มต้น"
      />

      <DatePickerModal
        visible={showEndDatePicker}
        onClose={() => setShowEndDatePicker(false)}
        onDateSelect={(date) => {
          setLocalFormData(prev => ({ 
            ...prev, 
            endDate: formatDateForInput(date.toISOString()) 
          }));
          setShowEndDatePicker(false);
        }}
        title="เลือกวันที่สิ้นสุด"
      />
    </View>
  );
};

const formatDateForInput = (dateString: string) => {
  const date = new Date(dateString);
  const day = date.getDate().toString().padStart(2, '0');
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const year = date.getFullYear();
  return `${day}/${month}/${year}`;
};

const convertDateFormat = (dateString: string) => {
  const [day, month, year] = dateString.split('/');
  return `${year}-${month}-${day}`;
};

const TripDetailsCard: React.FC<{ 
  trip: Trip; 
  travelStyles: TravelStyle[]; 
  services: Service[];
  onToggle: () => void;
  onEdit: () => void;
  isVisible: boolean;
  isOwner: boolean;
}> = React.memo(({ trip, travelStyles, services, onToggle, onEdit, isVisible, isOwner }) => {
  // Map IDs to actual data
  const mappedTravelStyles = useMemo(() => 
    trip.travelStyles
      .map(styleId => travelStyles.find(style => style.id === styleId))
      .filter(Boolean), 
    [trip.travelStyles, travelStyles]
  );

  const mappedServices = useMemo(() => 
    trip.includedServices
      .map(serviceId => services.find(service => service.id === serviceId))
      .filter(Boolean), 
    [trip.includedServices, services]
  );

  const formatDate = useCallback((dateString: string) => {
    return new Date(dateString).toLocaleDateString('th-TH', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }, []);

  if (!isVisible) {
    return (
      <TouchableOpacity onPress={onToggle} style={styles.collapsedTripHeader}>
        <Text style={styles.collapsedTripTitle}>{trip.name}</Text>
        <View style={styles.collapsedActions}>
          {isOwner && (
            <TouchableOpacity onPress={onEdit} style={styles.editButton}>
              <Text style={styles.editButtonText}>แก้ไข</Text>
            </TouchableOpacity>
          )}
          <Text style={styles.expandButton}>ดูรายละเอียด ▼</Text>
        </View>
      </TouchableOpacity>
    );
  }

  return (
    <View style={styles.tripDetailsContainer}>
      <View style={styles.tripDetailsHeader}>
        <TouchableOpacity onPress={onToggle} style={styles.collapseButton}>
          <Text style={styles.collapseButtonText}>ซ่อนรายละเอียด ▲</Text>
        </TouchableOpacity>
        {isOwner && (
          <TouchableOpacity onPress={onEdit} style={styles.editButtonHeader}>
            <Text style={styles.editButtonHeaderText}>✏️ แก้ไข</Text>
          </TouchableOpacity>
        )}
      </View>
      
      <ScrollView style={styles.tripDetailsScroll} showsVerticalScrollIndicator={false}>
        <View style={styles.tripDetailsCard}>
          {/* Trip Cover Image */}
          {trip.tripCoverImageUrl && (
            <Image 
              source={{ uri: trip.tripCoverImageUrl }} 
              style={styles.tripCoverImage}
              resizeMode="cover"
            />
          )}
          
          {/* Trip Info */}
          <View style={styles.tripInfo}>
            <Text style={styles.tripName}>{trip.name}</Text>
            
            {/* Dates */}
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>📅 วันที่เดินทาง:</Text>
              <Text style={styles.infoText}>
                {formatDate(trip.startDate)} - {formatDate(trip.endDate)}
              </Text>
            </View>

            {/* Destinations */}
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>📍 จุดหมาย:</Text>
              <Text style={styles.infoText}>{trip.destinations.join(', ')}</Text>
            </View>

            {/* Price */}
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>💰 ราคาต่อคน:</Text>
              <Text style={styles.priceText}>฿{trip.pricePerPerson.toLocaleString()}</Text>
            </View>

            {/* Group Atmosphere */}
            {trip.groupAtmosphere && (
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>🌟 บรรยากาศ:</Text>
                <Text style={styles.infoText}>{trip.groupAtmosphere}</Text>
              </View>
            )}

            {/* Travel Styles */}
            {mappedTravelStyles.length > 0 && (
              <View style={styles.infoSection}>
                <Text style={styles.sectionLabel}>🎯 สไตล์การเดินทาง:</Text>
                <View style={styles.tagsContainer}>
                  {mappedTravelStyles.map((style) => (
                    <View key={style.id} style={styles.styleTag}>
                      <Text style={styles.styleTagText}>{style.title}</Text>
                    </View>
                  ))}
                </View>
              </View>
            )}

            {/* Included Services */}
            {mappedServices.length > 0 && (
              <View style={styles.infoSection}>
                <Text style={styles.sectionLabel}>✅ บริการที่รวม:</Text>
                <View style={styles.tagsContainer}>
                  {mappedServices.map((service) => (
                    <View key={service.id} style={styles.serviceTag}>
                      <Text style={styles.serviceTagText}>{service.title}</Text>
                    </View>
                  ))}
                </View>
              </View>
            )}

            {/* Trip Details */}
            {trip.detail && (
              <View style={styles.infoSection}>
                <Text style={styles.sectionLabel}>📝 รายละเอียด:</Text>
                <Text style={styles.detailText}>{trip.detail}</Text>
              </View>
            )}

            {/* Max Participants */}
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>👥 จำนวนผู้เข้าร่วมสูงสุด:</Text>
              <Text style={styles.infoText}>{trip.maxParticipants} คน</Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </View>
  );
});

export default function TripGroupChat() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const tripId = params.tripId as string;


  // State
  const [client, setClient] = useState<StreamChat | null>(null);
  const [channel, setChannel] = useState<StreamChannel | null>(null);
  const [participants, setParticipants] = useState<TripParticipant[]>([]);
  const [trip, setTrip] = useState<Trip | null>(null);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
const [showReactions, setShowReactions] = useState(false);
const [messageReactions, setMessageReactions] = useState({});
const [travelStyles, setTravelStyles] = useState<TravelStyle[]>([]);
const [services, setServices] = useState<Service[]>([]);
const [showTripDetails, setShowTripDetails] = useState(true);
const [formData, setFormData] = useState({
  name: '',
  startDate: '',
  endDate: '',
  detail: '',
  destinations: [] as string[],
  travelStyles: [] as string[],
  includedServices: [] as string[],
  maxParticipants: 1,
  pricePerPerson: 0,
  groupAtmosphere: '',
});
const [isEditMode, setIsEditMode] = useState(false);
const [editLoading, setEditLoading] = useState(false);

// Add states for dropdowns and selections
const [allDestinations, setAllDestinations] = useState<string[]>([]);
const [allTravelStyles, setAllTravelStyles] = useState<TravelStyle[]>([]);
const [allServices, setAllServices] = useState<Service[]>([]);
const [destinationDropdownOpen, setDestinationDropdownOpen] = useState(false);
const [destinationSearchText, setDestinationSearchText] = useState('');


// Date picker states
const [showStartDatePicker, setShowStartDatePicker] = useState(false);
const [showEndDatePicker, setShowEndDatePicker] = useState(false);
  // Refs for cleanup
  const isMountedRef = useRef(true);
  const clientRef = useRef<StreamChat | null>(null);

  // Fetch trip details and participants with better error handling
  const fetchTripDetails = useCallback(async () => {
    try {
      // Your existing trip fetching logic
      const tripResponse = await axiosInstance.get(`/trips/${tripId}`);
      const tripData = tripResponse.data.data;
      
      if (!tripData) {
        throw new Error('Trip data not found');
      }
      
      setTrip(tripData);
  
      // Your existing participant fetching logic
      const participantIds = tripData.participants
        ?.map((participant: any) => {
          if (typeof participant === 'string') return participant;
          if (participant?.userId) return participant.userId;
          return null;
        })
        .filter(Boolean) || [];
  
      const allParticipantIds = [
        tripData.tripOwnerId,
        ...participantIds.filter((id: string) => id !== tripData.tripOwnerId)
      ];
  
      const participantPromises = allParticipantIds.map(async (userId) => {
        try {
          const userResponse = await axiosInstance.get(`/users/profile/${userId}`);
          return userResponse.data?.data || null;
        } catch (error) {
          console.warn(`Failed to fetch user ${userId}:`, error);
          return null;
        }
      });
  
      const participantResults = await Promise.allSettled(participantPromises);
      const validParticipants = participantResults
        .filter((result): result is PromisedFulfilledResult<TripParticipant> => 
          result.status === 'fulfilled' && result.value !== null
        )
        .map(result => result.value);
      
      if (validParticipants.length === 0) {
        throw new Error('No valid participants found');
      }
      
      setParticipants(validParticipants);
  
      // NEW: Fetch travel styles and services in parallel
      try {
        const [travelStylesResponse, servicesResponse] = await Promise.all([
          axiosInstance.get('/travel-styles'),
          axiosInstance.get('/services')
        ]);
  
        // Map travel styles
        const mappedTravelStyles: TravelStyle[] = travelStylesResponse.data.data.map((item: any) => ({
          id: item.id,
          title: item.title,
          iconImageUrl: item.iconImageUrl,
          activeIconImageUrl: item.activeIconImageUrl || item.iconImageUrl,
        }));
  
        // Map services
        const mappedServices: Service[] = servicesResponse.data.data.map((item: any) => ({
          id: item.id,
          title: item.title,
        }));
  
        setTravelStyles(mappedTravelStyles);
        setServices(mappedServices);
      } catch (error) {
        console.warn('Failed to fetch travel styles or services:', error);
        // Don't throw here as trip details are more important
      }
  
      return { tripData, participantProfiles: validParticipants };
    } catch (error) {
      console.error('Error fetching trip details:', error);
      throw new Error(`Failed to load trip details: ${error.message}`);
    }
  }, [tripId]);
  const isOwner = useMemo(() => {
    return trip?.tripOwnerId === currentUser?.id; // Replace with your user check logic
  }, [trip, currentUser]);


  const handleEditTrip = useCallback(() => {
    setIsEditMode(true);
    setShowTripDetails(false); // Hide normal trip details
  }, []);

  const handleCancelEdit = useCallback(() => {
    setIsEditMode(false);
    setShowTripDetails(true); // Show normal trip details
  }, []);

  const handleSaveTrip = useCallback(async (updatedTrip: Partial<Trip>) => {
    setEditLoading(true);
    try {
      const response = await axiosInstance.put(`/trips/${tripId}`, updatedTrip);
      
      if (response.data) {
        // Update local trip state
        setTrip(prev => ({ ...prev, ...updatedTrip }));
        setIsEditMode(false);
        setShowTripDetails(true);
        
        Alert.alert('สำเร็จ', 'อัปเดตข้อมูลทริปเรียบร้อยแล้ว');
      }
    } catch (error) {
      console.error('Failed to update trip:', error);
      Alert.alert('เกิดข้อผิดพลาด', 'ไม่สามารถอัปเดตข้อมูลทริปได้ กรุณาลองใหม่');
    } finally {
      setEditLoading(false);
    }
  }, [tripId]);

  const handleToggleTripDetails = useCallback(() => {
    setShowTripDetails(prev => !prev);
  }, []);
  // Get current user from AsyncStorage
  const getCurrentUser = useCallback(async (participantProfiles: TripParticipant[]) => {
    try {
      const userId = await AsyncStorage.getItem('userId');
      
      if (!userId) {
        throw new Error('User not logged in');
      }

      const userProfile = participantProfiles.find(p => p.userId === userId);
      
      if (!userProfile) {
        throw new Error('You are not a participant in this trip');
      }

      return {
        id: userProfile.userId,
        name: userProfile.nickname || userProfile.fullname,
        image: userProfile.profileImageUrl !== 'N/A' 
          ? userProfile.profileImageUrl 
          : DEFAULT_AVATAR
      };
    } catch (error) {
      console.error('Error getting current user:', error);
      throw error;
    }
  }, []);

  // Initialize chat with better error handling and cleanup
  useEffect(() => {
    if (!tripId) return;

    let chatClient: StreamChat | null = null;

    async function initializeChat() {
      try {
        setLoading(true);
        setError(null);
        
        const tripData = await fetchTripDetails();
        if (!isMountedRef.current) return;

        const user = await getCurrentUser(tripData.participantProfiles);
        if (!isMountedRef.current) return;

        console.log('🔵 Initializing chat for user:', user.id);
        setCurrentUser(user);

        // Initialize Stream Chat
        chatClient = StreamChat.getInstance(requirements.stream_api_key);
        clientRef.current = chatClient;
        
        // Disconnect any existing connection
        if (chatClient.userID && chatClient.userID !== user.id) {
          console.log('🔄 Disconnecting previous user:', chatClient.userID);
          await chatClient.disconnectUser();
        }

        // Connect user if not already connected
        if (chatClient.userID !== user.id) {
          console.log('🔵 Connecting user to Stream Chat:', user.id);
          await chatClient.connectUser(user, chatClient.devToken(user.id));
          console.log('✅ User connected successfully');
        }

        // Create user objects for all participants
        const allUsers = tripData.participantProfiles.map(participant => ({
          id: participant.userId,
          name: participant.nickname || participant.fullname,
          image: participant.profileImageUrl !== 'N/A' 
            ? participant.profileImageUrl 
            : DEFAULT_AVATAR
        }));

        console.log('👥 Upserting users:', allUsers.length);
        
        // Upsert all users
        try {
          await chatClient.upsertUsers(allUsers);
          console.log('✅ All users upserted successfully');
        } catch (upsertError) {
          console.warn('⚠️ Some users may already exist:', upsertError);
        }

        const allMemberIds = allUsers.map(u => u.id);
        const channelId = `trip-${tripId}`;
        
        // Handle channel creation/access
        let newChannel;
        try {
          console.log('🔍 Accessing channel:', channelId);
          newChannel = chatClient.channel('messaging', channelId);
          
          const channelState = await newChannel.query();
          console.log('✅ Channel accessed, members:', Object.keys(channelState.members).length);
          
          const currentMembers = Object.keys(newChannel.state.members || {});
          const missingMembers = allMemberIds.filter(id => !currentMembers.includes(id));
          
          if (missingMembers.length > 0) {
            console.log('➕ Adding missing members:', missingMembers);
            await newChannel.addMembers(missingMembers);
          }
          
        } catch (channelError) {
          console.log('🆕 Creating new channel:', channelId);
          
          newChannel = chatClient.channel('messaging', channelId, {
            name: `${tripData.tripData.name} - Group Chat`,
            members: allMemberIds,
            created_by_id: user.id,
            trip_id: tripId,
            trip_name: tripData.tripData.name,
          });

          await newChannel.create();
          console.log('✅ Channel created successfully');
        }

        if (isMountedRef.current) {
          setChannel(newChannel);
          setClient(chatClient);
          console.log('✅ Chat initialization complete');
        }
      } catch (error) {
        console.error('❌ Error initializing chat:', error);
        if (isMountedRef.current) {
          setError(error.message || 'Failed to initialize chat');
        }
      } finally {
        if (isMountedRef.current) {
          setLoading(false);
        }
      }
    }

    initializeChat();

    return () => {
      isMountedRef.current = false;
      if (chatClient && chatClient === clientRef.current) {
        chatClient.disconnectUser().catch(console.error);
      }
    };
  }, [tripId, fetchTripDetails, getCurrentUser]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      isMountedRef.current = false;
      if (clientRef.current) {
        clientRef.current.disconnectUser().catch(console.error);
      }
    };
  }, []);

  const handleBack = useCallback(() => {
    router.push('/channelList')
  }, [router]);

  const handleRetry = useCallback(() => {
    setError(null);
    setLoading(true);
    // Re-trigger the useEffect by updating a dependency
    window.location.reload?.() || router.replace(router.pathname);
  }, [router]);

  // Memoized message component
  const MessageComponent = useMemo(() => {
    const Component = (props) => {
      if (!props.message) {
        return <View style={{ height: 1 }} />;
      }
      
      return (
        <CustomMessage
          message={props.message}
          participants={participants}
          currentUser={currentUser}
        />
      );
    };
    
    // Helpful for debugging
    Component.displayName = 'MessageComponent';
    
    return Component;
  }, [participants, currentUser]);

  // Error handling with better UX
  const showErrorAlert = useCallback((errorMessage: string) => {
    Alert.alert(
      'เกิดข้อผิดพลาด',
      errorMessage,
      [
        { text: 'ลองใหม่', onPress: handleRetry },
        { text: 'กลับ', onPress: handleBack, style: 'cancel' }
      ]
    );
  }, [handleRetry, handleBack]);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <LoadingIndicator />
        <Text style={styles.loadingText}>กำลังโหลดแชท...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorTitle}>ไม่สามารถโหลดแชทได้</Text>
        <Text style={styles.errorText}>{error}</Text>
        <View style={styles.errorButtons}>
          <TouchableOpacity onPress={handleRetry} style={styles.retryButton}>
            <Text style={styles.retryButtonText}>ลองใหม่</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={handleBack} style={styles.backButtonError}>
            <Text style={styles.backButtonErrorText}>กลับ</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  if (!channel || !client || !trip) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>เตรียมแชท...</Text>
      </View>
    );
  }

  return (
<View style={styles.container}>
      <Chat client={client} theme="messaging light">
        <Channel channel={channel}>
          <Window>
            <CustomChannelHeader 
              participants={participants}
              tripName={trip.name}
              onBack={handleBack}
            />
            
            {isEditMode ? (
              <EditTripForm
                trip={trip}
                onSave={handleSaveTrip}
                onCancel={handleCancelEdit}
                loading={editLoading}
              />
            ) : (
              <>
                <TripDetailsCard
                  trip={trip}
                  travelStyles={travelStyles}
                  services={services}
                  onToggle={handleToggleTripDetails}
                  onEdit={handleEditTrip}
                  isVisible={showTripDetails}
                  isOwner={isOwner}
                />
                <MessageList />
                <MessageInput />
              </>
            )}
          </Window>
          <Thread />
        </Channel>
      </Chat>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 20,
  },
  errorTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
    textAlign: 'center',
  },
  errorText: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 20,
  },
  errorButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  retryButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  retryButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  backButtonError: {
    backgroundColor: '#f0f0f0',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  backButtonErrorText: {
    color: '#666',
    fontSize: 16,
    fontWeight: '600',
  },
  headerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e5e5',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  backButton: {
    marginRight: 16,
    padding: 4,
  },
  backButtonText: {
    fontSize: 24,
    color: '#007AFF',
  },
  participantsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  avatarsContainer: {
    flexDirection: 'row',
    marginRight: 12,
  },
  avatarWrapper: {
    marginLeft: -8,
  },
  participantAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: '#fff',
  },
  countBadge: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#007AFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: -8,
  },
  countText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  groupInfo: {
    flex: 1,
  },
  participantCount: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  tripHint: {
    fontSize: 14,
    color: '#666',
    marginTop: 2,
  },
  // Message styles
  customMessage: {
    flexDirection: 'row',
    padding: 12,
    marginVertical: 2,
    alignItems: 'flex-end',
  },
  ownMessage: {
    flexDirection: 'row-reverse',
  },
  messageAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    marginRight: 8,
  },
  messageContent: {
    flex: 1,
    maxWidth: '75%',
  },
  ownMessageContent: {
    alignItems: 'flex-end',
  },
  messageHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  senderName: {
    fontSize: 12,
    fontWeight: '600',
    color: '#666',
  },
  messageTime: {
    fontSize: 10,
    color: '#999',
    marginLeft: 8,
  },
  messageBubble: {
    backgroundColor: '#f0f0f0',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 16,
    borderBottomLeftRadius: 4,
  },
  ownMessageBubble: {
    backgroundColor: '#007AFF',
    borderBottomRightRadius: 4,
    borderBottomLeftRadius: 16,
  },
  messageText: {
    fontSize: 16,
    color: '#333',
    lineHeight: 20,
  },
  ownMessageText: {
    color: '#fff',
  },
  ownMessageTime: {
    fontSize: 10,
    color: '#999',
    marginTop: 2,
  },
  tripDetailsContainer: {
    backgroundColor: '#f8f9fa',
    borderBottomWidth: 1,
    borderBottomColor: '#e9ecef',
  },
  collapsedTripHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 12,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e9ecef',
  },
  collapsedTripTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    flex: 1,
  },
  expandButton: {
    fontSize: 12,
    color: '#007bff',
    fontWeight: '500',
  },
  collapseButton: {
    alignItems: 'center',
    padding: 8,
    backgroundColor: '#fff',
  },
  collapseButtonText: {
    fontSize: 12,
    color: '#007bff',
    fontWeight: '500',
  },
  tripDetailsScroll: {
    maxHeight: 280,
  },
  tripDetailsCard: {
    backgroundColor: '#fff',
    margin: 12,
    borderRadius: 12,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  tripCoverImage: {
    width: '100%',
    height: 120,
  },
  tripInfo: {
    padding: 16,
  },
  tripName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 12,
  },
  infoRow: {
    marginBottom: 8,
  },
  infoLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#666',
    marginBottom: 2,
  },
  infoText: {
    fontSize: 14,
    color: '#333',
  },
  priceText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#007bff',
  },
  infoSection: {
    marginBottom: 12,
  },
  sectionLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#666',
    marginBottom: 6,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  styleTag: {
    backgroundColor: '#e3f2fd',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  styleTagText: {
    fontSize: 12,
    color: '#1976d2',
    fontWeight: '500',
  },
  serviceTag: {
    backgroundColor: '#f3e5f5',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  serviceTagText: {
    fontSize: 12,
    color: '#7b1fa2',
    fontWeight: '500',
  },
  detailText: {
    fontSize: 14,
    color: '#333',
    lineHeight: 20,
  },
  collapsedActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  editButton: {
    backgroundColor: '#007bff',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  editButtonText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '500',
  },
  tripDetailsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e9ecef',
  },
  editButtonHeader: {
    backgroundColor: '#007bff',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  editButtonHeaderText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },

  // Edit form styles
  editContainer: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  editLoadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
  },
  editLoadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#666',
  },
  editHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e9ecef',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  cancelButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#f8f9fa',
    justifyContent: 'center',
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: 18,
    color: '#666',
    fontWeight: 'bold',
  },
  editTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  saveButton: {
    backgroundColor: '#007bff',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 6,
    minWidth: 60,
    alignItems: 'center',
  },
  saveButtonDisabled: {
    backgroundColor: '#cccccc',
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },

  // Form styles
  editForm: {
    flex: 1,
    padding: 16,
  },
  formGroup: {
    marginBottom: 20,
  },
  formRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 20,
  },
  formFieldHalf: {
    flex: 1,
  },
  formLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 6,
  },
  formInput: {
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    fontSize: 16,
    color: '#374151',
    backgroundColor: '#fff',
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },

  // Date field styles
  dateRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 20,
  },
  dateField: {
    flex: 1,
  },

  // Destination styles
  destinationContainer: {
    position: 'relative',
    zIndex: 1000,
    marginBottom: 12,
  },
  destinationContainerOpen: {
    marginBottom: 220, // Space for dropdown
  },
  destinationInput: {
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    fontSize: 16,
    color: '#374151',
    backgroundColor: '#fff',
  },
  destinationPlaceholder: {
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    fontSize: 16,
    color: '#9ca3af',
    backgroundColor: '#fff',
  },
  destinationDropdown: {
    position: 'absolute',
    top: 55,
    left: 0,
    right: 0,
    backgroundColor: '#fff',
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
  },
  destinationScrollView: {
    maxHeight: 200,
  },
  destinationItem: {
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  destinationItemText: {
    fontSize: 14,
    color: '#374151',
  },
  noDestinationsText: {
    padding: 12,
    fontSize: 14,
    color: '#9ca3af',
    textAlign: 'center',
    fontStyle: 'italic',
  },

  // Selected destinations styles
  selectedDestinations: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 8,
  },
  destinationTag: {
    backgroundColor: '#e3f2fd',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#2196f3',
  },
  destinationTagText: {
    fontSize: 14,
    color: '#1976d2',
    fontWeight: '500',
  },
  removeIcon: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#f44336',
    marginLeft: 4,
  },

  // Checkbox styles
  checkboxContainer: {
    gap: 12,
  },
  checkboxItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  checkboxItemSelected: {
    backgroundColor: '#eff6ff',
    borderColor: '#3b82f6',
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: '#d1d5db',
    backgroundColor: '#fff',
    marginRight: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxChecked: {
    backgroundColor: '#3b82f6',
    borderColor: '#3b82f6',
  },
  checkmark: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  checkboxLabel: {
    fontSize: 14,
    color: '#374151',
    flex: 1,
  },
  checkboxLabelSelected: {
    color: '#1d4ed8',
    fontWeight: '500',
  },

  // Form spacing
  formBottomPadding: {
    height: 50,
  },

  // Focus states (you can add these for better UX)
  formInputFocused: {
    borderColor: '#3b82f6',
  },
  
  // Error states (if you want to add validation feedback)
  formInputError: {
    borderColor: '#ef4444',
  },


  // Additional utility styles
  mt8: {
    marginTop: 8,
  },
  mt12: {
    marginTop: 12,
  },
  mb8: {
    marginBottom: 8,
  },
  mb12: {
    marginBottom: 12,
  },

});