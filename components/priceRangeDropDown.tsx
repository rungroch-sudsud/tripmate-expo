import {Image,View,StyleSheet,Text} from  'react-native'
import {Dropdown} from 'react-native-element-dropdown'

export type priceRange={
    id: string;
    label: string;
    min:number;
    max:number;
}

type PriceRangeDropdownProps={
    selectedPriceRange: priceRange | null;
    onPriceRangeSelect: (item:priceRange)=>void;
}

export const PriceRangeDropdown:React.FC<PriceRangeDropdownProps> = ({ selectedPriceRange, onPriceRangeSelect }) => {
  const priceRanges = [
    { id: 'all', label: 'มากไปน้อย', min: 0, max: Infinity },
    { id: 'under-1000', label: 'ต่ำกว่า 1,000 บาท', min: 0, max: 999 },
    { id: '1000-2000', label: '1,000 - 2,000 บาท', min: 1000, max: 2000 },
    { id: '2000-3000', label: '2,000 - 3,000 บาท', min: 2000, max: 3000 },
    { id: '3000-5000', label: '3,000 - 5,000 บาท', min: 3000, max: 5000 },
    { id: 'over-5000', label: 'มากกว่า 5,000 บาท', min: 5000, max: Infinity }
  ];

  return (
    <View style={styles.priceContainer}>
      <Text style={styles.sectionTitle}>ราคาทริปต่อคน</Text>

     <Dropdown
  style={styles.dropdownTrigger}
  placeholderStyle={styles.dropdownTriggerText}
  selectedTextStyle={styles.dropdownTriggerText}
  itemTextStyle={styles.dropdownItemText}
  data={priceRanges}
  labelField="label"
  valueField="id"
  placeholder="มากไปน้อย"
  value={selectedPriceRange?.id}
  onChange={(item) => onPriceRangeSelect(item)}
  containerStyle={{marginBottom:10,borderBottomLeftRadius:5,borderBottomRightRadius:5}}
  renderRightIcon={() => (
    <Image
      source={require('../app/assets/images/dropdown-icon.png')}
      style={styles.dropdownIcon}
      resizeMode="contain"
    />
  )}
  iconStyle={styles.dropdownIcon}
/>

    </View>
  );
};


const styles=StyleSheet.create({
  priceContainer: {
    padding: 20,
    paddingHorizontal:50,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    flex: 1,
  },
    sectionTitle: {
    fontSize: 12,
    fontWeight: 'bold',
    fontFamily: 'LineSeedSansTH_A_Bd',
    color: '#374151',
    flex: 0.5,
  },
  dropdownTrigger: {
  flex: 0.5,
  flexDirection: 'row',
  justifyContent: 'space-between',
  alignItems: 'center',
  paddingVertical: 12,
  paddingHorizontal: 16,
  backgroundColor: '#F9FAFB',
  borderRadius: 8,
  borderWidth: 1,
  borderColor: '#585DDB',
  marginBottom: 8,
},
dropdownTriggerText: {
  fontSize: 12,
  color: '#374151',
  fontFamily: 'LineSeedSansTH_A_Bd',
  flex: 1,
},

dropdownIcon: {
  width: 12,
  height: 8,
  marginLeft: 8,
  tintColor: '#6B7280', // Optional: Match theme
},
  dropdownItemText: {
     fontSize: 12,
    color: '#374151',
    fontWeight:'700',
    fontFamily: 'LineSeedSansTH_A_Bd',
    flex: 1,
  },
})