import {StyleSheet} from 'react-native'

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
  },
  headerTitle: {
    fontSize: 16,
    color: '#374151',
    textAlign: 'left',
    fontWeight:'700',
    fontFamily:'LineSeedSansTH_A_Bd',
  },
  scrollView: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#6b7280',
    fontFamily:'InterTight-Regular'
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 16,
    color: '#6b7280',
    fontFamily:'InterTight-Regular'
  },
  card: {
    backgroundColor: 'white',
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 8,
    margin: 16,
    marginBottom: 12,
  },
  imageContainer: {
    height: 270,
    position: 'relative',
  },
  backgroundImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  placeholderImage: {
    width: '100%',
    height: '100%',
    backgroundColor: '#E5E7EB',
    justifyContent: 'center',
    alignItems: 'center',
  },
  dateBadge: {
    position: 'absolute',
    top: 16,
    left: 16,
    backgroundColor: '#FFFFFFE5',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
    height:24,
    borderWidth:1,
    borderColor:'#E5E7EB'
  },
  dateIcon: {
    fontSize: 14,
    marginRight: 4,
  },
  dateText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#1F2937',
    fontFamily:'InterTight-Regular'
  },
  participantBadge: {
    position: 'absolute',
    top: 16,
    right: 16,
    backgroundColor: '#4F46E5E5',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
    height:24
  },
  participantIcon: {
    fontSize: 14,
    marginRight: 4,
  },
  participantText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#FFFFFF',
    fontFamily:'InterTight-Regular'
  },
  statusBadge: {
    position: 'absolute',
    bottom: 16,
    left: 16,
    backgroundColor: 'rgba(251, 191, 36, 0.9)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#92400e',
    fontFamily:'InterTight-Regular'
  },
  content: {
    padding: 16,
  },
  tripName: {
    fontSize: 18,
    lineHeight:18,
    fontFamily:'InterTight-Regular',
    fontWeight: 500,
    color: '#1F2937',
    marginBottom: 8,
  },
  destinationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  locationIcon: {
    fontSize: 14,
    marginRight: 6,
  },
  destinationContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    flex: 1,
  },
  destinationText: {
    fontSize: 14,
    color: '#4B5563',
    fontWeight:400,
    lineHeight:14,
    fontFamily:'InterTight-Regular'
  },
  description: {
    fontSize: 14,
    color: '#4B5563',
    lineHeight: 20,
    marginBottom: 8,
    fontWeight:400,
    fontFamily:'InterTight-Regular'
  },
  atmosphere: {
    fontSize: 14,
    color: '#6366f1',
    fontStyle: 'italic',
    lineHeight: 20,
    marginBottom: 8,
    fontFamily:'InterTight-Regular'
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  priceLabel: {
    fontSize: 14,
    fontFamily:'InterTight-Regular',
    color: '#6b7280',
    marginRight: 8,
  },
  priceValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#059669',
    fontFamily:'InterTight-Regular'
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 12,
  },
  serviceTag: {
    backgroundColor: '#EFF6FF',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    marginRight: 8,
    marginBottom: 4,
    height:24
  },
  serviceTagText: {
    color: '#2563EB',
    fontSize: 12,
    fontWeight: '400',
   fontFamily:'InterTight-Regular'
  },
  bottomRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  ownerInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  ownerAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 12,
  },
  ownerDetails: {
    flex: 1,
  },
  ownerName: {
    fontSize: 14,
    fontWeight: '500',
    color: '#1F2937',
    fontFamily:'InterTight-SemiBold',
  },
  ownerAge: {
    fontSize: 12,
    color: '#6b7280',
    fontFamily:'InterTight-SemiBold',
  },
  joinButton: {
    backgroundColor: '#29C4AF',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius:8,
    color:'#FFFFFF'
  },
  joinButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '500',
    fontFamily:'InterTight-Regular'

  },
  participantsInfo: {
    alignItems: 'center',
  },
  participantsText: {
    fontSize: 12,
    color: '#6b7280',
    fontFamily:'InterTight-SemiBold',
  },
  categoriesContainer: {
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
    backgroundColor:'#FFFFFF',
  },
  categoriesScrollContent: {
    paddingHorizontal: 16,
    gap: 12,
    backgroundColor:'#FFFFFF'
  },
  categoryItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 9999,
    backgroundColor: '#FFFFFF',
    color:'#374151',
    gap: 8,
     boxShadow: '0px 2px 6px rgba(0, 0, 0, 0.1)',
  },
  categoryItemActive: {
    backgroundColor: '#585DDB',
    borderColor: '#585DDB',
  },
  categoryIcon: {
    width: 20,
    height: 20,
    tintColor: '#6c757d',
  },
  categoryIconActive: {
    tintColor: '#ffffff',
  },
  categoryText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#374151',
    fontFamily:'LineSeedSansTH_A_Bd',
    
  },
  categoryTextActive: {
    color: '#ffffff',
    fontFamily:"LineSeedSansTH_A_Bd"
  },

  searchInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F3F4F6',
    borderRadius: 100,
    paddingHorizontal: 12,
    height: 44,
    fontFamily:'LineSeedSansTH'
  },
  searchIcon: {
    width: 14,
    height: 14,
    marginRight: 8,
    tintColor: '#999',
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#374151',
    paddingVertical: 0,
    outlineWidth:0,
    lineHeight:24,
    fontFamily:'InterTight-Regular'
  },
  clearButton: {
    padding: 4,
    marginLeft: 4,
  },
  clearButtonText: {
    color: '#999',
    fontSize: 16,
    fontWeight: 'bold',
  },
  

  floatingButton: {
    position: 'absolute',
    bottom: 70, 
    right: 180,
    width: 66.67,
    height: 66.67,
    borderRadius: 9999,
    backgroundColor: '#FF956E',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 4.65,
    zIndex: 1000,
  },
  floatingButtonIcon: {
    color: '#fff',
    fontSize: 30,
    fontWeight: 'bold',
    lineHeight: 24,
  },
  tripCountContainer: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    justifyContent: 'space-between',
    backgroundColor: '#fff',
    flexDirection: 'row',
    alignItems: 'center'
  },
  tripCountText: {
    fontSize: 12,
    color: '#585DDB',
    fontFamily:'LineSeedSansTH',
    fontWeight:'400'
  },
  searchHistoryContainer: {
    position: 'absolute',
    top: '100%',
    left: 0,
    right: 0,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    marginTop: 4,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    zIndex: 1000,
    maxHeight: 300,
  },
  filterButton: {
    flex: 0.1,
    backgroundColor: '#E5E7EB',
    justifyContent: 'center',
    alignItems: 'center',
    width: 32,
    height: 34,
    borderRadius: 6,
    position: 'relative', // For the active indicator dot
  },
  
  filterButtonActive: {
    backgroundColor: '#585DDB',
  },
  
  filterIcon: {
    width: 16,
    height: 16,
    tintColor: '#374151'
  },
  
  filterIconActive: {
    tintColor: '#FFFFFF'
  },
  
  // Small dot indicator for active filters
  filterDot: {
    position: 'absolute',
    top: 4,
    right: 4,
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#EF4444', // Red dot
  },

  // Filter summary text (optional - for showing active filter count)
  filterSummary: {
    fontSize: 10,
    color: '#6B7280',
    fontFamily: 'InterTight-Regular',
    marginTop: 2,
  },
  
  filterSummaryActive: {
    color: '#585DDB',
    fontWeight: '500',
  },

  // Search History Header
  searchHistoryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },

  searchHistoryTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
    fontFamily: 'InterTight-SemiBold',
  },

  clearAllButton: {
    paddingHorizontal: 8,
    paddingVertical: 4,
  },

  clearAllText: {
    fontSize: 14,
    color: '#EF4444',
    fontFamily: 'InterTight-Regular',
  },

  // History List
  historyList: {
    maxHeight: 200,
  },

  // History Item
  historyItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F9FAFB',
  },

  historyItemContent: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },

  historyIcon: {
    width: 16,
    height: 16,
    marginRight: 12,
    tintColor: '#9CA3AF',
  },

  historyText: {
    fontSize: 16,
    color: '#374151',
    fontFamily: 'InterTight-Regular',
    flex: 1,
  },

  removeHistoryButton: {
    padding: 8,
    marginLeft: 8,
  },

  removeHistoryText: {
    fontSize: 16,
    color: '#9CA3AF',
    fontWeight: '600',
  },


  searchContainer: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: '#FFFFFF',
    position: 'relative',
    zIndex: 1, 
    borderWidth:0
  },
});

export default styles