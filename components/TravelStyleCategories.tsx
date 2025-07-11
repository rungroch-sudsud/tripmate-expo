import React from 'react';
import { View, ScrollView, TouchableOpacity, Text, Image } from 'react-native';
import { Category } from '../shared/schemas/api.schema';
import styles from '../css/findTrip_css';

interface TravelStyleCategoriesProps {
  travelStyles: Category[];
  selectedTravelStyles: string[];
  onTravelStylePress: (styleId: string) => void;
}

export const TravelStyleCategories: React.FC<TravelStyleCategoriesProps> = ({
  travelStyles,
  selectedTravelStyles,
  onTravelStylePress,
}) => {
  const renderTravelStyleItem = (style: Category, isSelected: boolean) => (
    <TouchableOpacity
      key={style.id}
      style={[
        styles.categoryItem,
        isSelected && styles.categoryItemActive
      ]}
      onPress={() => onTravelStylePress(style.id)}
    >
      {(style.iconImageUrl || style.activeIconImageUrl) && (
        <Image
          source={{ 
            uri: isSelected && style.activeIconImageUrl 
              ? style.activeIconImageUrl 
              : style.iconImageUrl 
          }}
          style={[
            styles.categoryIcon,
            isSelected && styles.categoryIconActive
          ]}
        />
      )}
      <Text style={[
        styles.categoryText,
        isSelected && styles.categoryTextActive
      ]}>
        {style.title}
      </Text>
    </TouchableOpacity>
  );

  const renderAllCategory = () => (
    <TouchableOpacity
      key="all"
      style={[
        styles.categoryItem,
        selectedTravelStyles.includes('all') && styles.categoryItemActive
      ]}
      onPress={() => onTravelStylePress('all')}
    >
      <Text style={[
        styles.categoryText,
        selectedTravelStyles.includes('all') && styles.categoryTextActive
      ]}>
        ทั้งหมด
      </Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.categoriesContainer}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.categoriesScrollContent}
      >
        {renderAllCategory()}
        {travelStyles.map(style => 
          renderTravelStyleItem(style, selectedTravelStyles.includes(style.id))
        )}
      </ScrollView>
    </View>
  );
};
