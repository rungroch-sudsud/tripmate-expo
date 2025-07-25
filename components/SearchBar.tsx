import React from 'react';
import { View, TextInput, TouchableOpacity, Text, Image, FlatList } from 'react-native';
import styles from '../css/findTrip_css';

interface SearchBarProps {
  searchQuery: string;
  onSearchChange: (text: string) => void;
  onSearchSubmit: () => void;
  searchHistory: string[];
  showSearchHistory: boolean;
  isSearchFocused: boolean;
  onFocus: () => void;
  onBlur: () => void;
  onHistorySelect: (query: string) => void;
  onRemoveFromHistory: (query: string) => void;
  onClearAllHistory: () => void;
}

export const SearchBar: React.FC<SearchBarProps> = ({
  searchQuery,
  onSearchChange,
  onSearchSubmit,
  searchHistory,
  showSearchHistory,
  isSearchFocused,
  onFocus,
  onBlur,
  onHistorySelect,
  onRemoveFromHistory,
  onClearAllHistory,
}) => (
  <View style={styles.searchContainer}>
    <View style={styles.searchInputContainer}>
      <Image 
        source={require('../app/assets/images/images/images/image9.png')} 
        style={styles.searchIcon}
      />
      <TextInput
        style={styles.searchInput}
        placeholder="ค้นหาจุดหมายปลายทาง หรือ สไตล์เที่ยว"
        placeholderTextColor="#9CA3AF"
        value={searchQuery}
        onChangeText={onSearchChange}
        onFocus={onFocus}
        onBlur={onBlur}
        onSubmitEditing={onSearchSubmit}
        returnKeyType="search"
      />
      {searchQuery.length > 0 && (
        <TouchableOpacity
          style={styles.clearButton}
          onPress={() => {
            onSearchChange('');
          }}
        >
          <Text style={styles.clearButtonText}>✕</Text>
        </TouchableOpacity>
      )}
    </View>
    
    {/* Search History Dropdown 
    {showSearchHistory && isSearchFocused && searchHistory.length > 0 && (
      <View style={styles.searchHistoryContainer}>
        <View style={styles.searchHistoryHeader}>
          <Text style={styles.searchHistoryTitle}>Recent Searches</Text>
          <TouchableOpacity 
            onPress={onClearAllHistory}
            style={styles.clearAllButton}
          >
            <Text style={styles.clearAllText}>Clear All</Text>
          </TouchableOpacity>
        </View>
        
      <FlatList
          data={searchHistory}
          keyExtractor={(item, index) => `${item}-${index}`}
          renderItem={({ item }) => (
            <View style={styles.historyItem}>
              <TouchableOpacity
                style={styles.historyItemContent}
                onPress={() => onHistorySelect(item)}
              >
                <Image 
                  source={require('../app/assets/images/images/images/clock.png')}
                  style={styles.historyIcon}
                />
                <Text style={styles.historyText}>{item}</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.removeHistoryButton}
                onPress={() => onRemoveFromHistory(item)}
              >
                <Text style={styles.removeHistoryText}>✕</Text>
              </TouchableOpacity>
            </View>
          )}
          style={styles.historyList}
          showsVerticalScrollIndicator={false}
        />
      </View>
    )}*/}
  </View>
);