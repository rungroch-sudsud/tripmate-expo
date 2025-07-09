import {StyleSheet} from 'react-native'

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
  },
  headerTitle: {
    flex:0.9,
    fontSize: 18,
    color: '#1F2937',
    textAlign: 'left',
    paddingVertical: 16,
    fontWeight:500,
    lineHeight:18,
    fontFamily:'InterTight-Regular',
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
    paddingVertical: 8,
    borderRadius: 9999,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#D1D5DB',
    color:'#374151',
    gap: 8,
    height:34,
  },
  categoryItemActive: {
    backgroundColor: '#29C4AF',
    borderColor: '#29C4AF',
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
    fontSize: 14,
    fontWeight: '400',
    color: '#374151',
    fontFamily:'InterTight-SemiBold',
    
  },
  categoryTextActive: {
    color: '#ffffff',
  },

  searchInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    paddingHorizontal: 12,
    height: 44,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  searchIcon: {
    width: 18,
    height: 18,
    marginRight: 8,
    tintColor: '#999',
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#ADAEBC',
    paddingVertical: 0,
    outlineColor:'#f5f5f5',
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
  
  // Floating Button Styles
  floatingButton: {
    position: 'absolute',
    bottom: 90, // Above bottom navigation
    right: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#29C4AF',
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
    fontSize: 24,
    fontWeight: 'bold',
    lineHeight: 24,
  },
  tripCountContainer: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: '#fff',
    flexDirection:'row',
    alignItems:'center'
  },
  tripCountText: {
    fontSize: 14,
    flex:0.8,
    color: '#1F2937',
    fontFamily:'InterTight-SemiBold'
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

  // Update existing searchContainer to handle positioning
  searchContainer: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: '#FFFFFF',
    position: 'relative', // Add this for dropdown positioning
    zIndex: 1, // Add this for dropdown layering
  },
});

export default styles