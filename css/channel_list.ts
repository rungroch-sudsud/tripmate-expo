import {StyleSheet} from 'react-native'

export const styles = StyleSheet.create({
  container: {
    flex: 1,
   backgroundColor: 'white',
  },
  header: {
   flexDirection:'row',alignItems:'center',backgroundColor:'white',justifyContent:'space-between',paddingTop:30,paddingBottom:20,marginHorizontal:16
  },
  headerTitle: {
    fontSize: 16,
    color: '#374151',
    textAlign: 'left',
    fontWeight:'700',
    fontFamily:'LineSeedSansTH_A_Bd',
  },
  searchContainer: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 40,
    paddingVertical: 12,
    borderBottomWidth: 0,
 
  },
  searchInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F3F4F6',
    borderRadius: 100,
    paddingHorizontal: 12,
    height: 40, 

  
  },
  searchIcon: {
    width: 12,
    height: 12,
    marginRight: 8,
    tintColor: '#9CA3AF',
  },
  searchInput: {
    flex: 1,
    fontSize: 10,
    fontFamily: 'LineSeedSansTH',
    color: '#000000',
    fontWeight:'400',
    outlineWidth:0
  },
  clearIcon: {
    width: 18,
    height: 18,
    tintColor: '#9CA3AF',
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
    boxShadow: '0 -4px 6px rgba(0, 0, 0, 0.05)', // X, Y, blur, color
    borderTopLeftRadius:50,
    borderTopRightRadius:50,
    paddingHorizontal:30
  },
  tab: {
    flex: 1,
     width:100,
    alignItems: 'center',
    borderBottomWidth: 0,
  
    backgroundColor:"#F3F4F6",
    borderRadius:30,height:36,paddingVertical:20,justifyContent:'center',marginTop:30,
    marginHorizontal:10,
    marginBottom:20
  },
  activeTab: {
    borderBottomColor: '#585DDB',
  },
  tabText: {
    fontSize: 12,
    fontFamily: 'LineSeedSansTH_A_Bd',
    color: '#000000',
    fontWeight:'bold'
  },
  activeTabText: {
    color: '#585DDB',
    fontFamily: 'LineSeedSansTH_A_Bd',
  },
  content: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 100,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    fontFamily: 'LineSeedSansTH_A_Rg',
    color: '#6B7280',
  },
  searchResultsContainer: {
    backgroundColor: '#FFFFFF',
    marginTop: 8,
    marginHorizontal: 16,
    borderRadius: 12,
    padding: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontFamily: 'LineSeedSansTH_A_Bd',
    color: '#1F2937',
    marginBottom: 12,
  },
  userItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  userAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 12,
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 16,
    fontFamily: 'LineSeedSansTH_A_Bd',
    color: '#1F2937',
  },
  userEmail: {
    fontSize: 14,
    fontFamily: 'LineSeedSansTH_A_Rg',
    color: '#6B7280',
    marginTop: 2,
  },
  chatIcon: {
    width: 24,
    height: 24,
    tintColor: '#585DDB',
  },
  noResultsText: {
    textAlign: 'center',
    fontSize: 14,
    fontFamily: 'LineSeedSansTH_A_Rg',
    color: '#6B7280',
    paddingVertical: 20,
  },
  channelListContainer: {
    flex: 1,
  },
  channelItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    marginHorizontal: 16,
    marginVertical: 4,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
  },
  channelAvatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 12,
  },
  channelInfo: {
    flex: 1,
  },
  channelHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  channelName: {
    flex: 1,
    fontSize: 14,
    fontFamily: 'LineSeedSansTH_A_Bd',
    color: '#374151',
    marginRight: 8,
    fontWeight:'bold'
  },
  messageTime: {
    fontSize: 12,
    fontFamily: 'LineSeedSansTH',
    fontWeight:'400',
    color: '#9CA3AF',
  },
  channelFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  lastMessage: {
    flex: 1,
    fontSize: 14,
    fontFamily: 'LineSeedSansTH',
    color: '#6B7280',
    marginRight: 8,
  },
  unreadBadge: {
    backgroundColor: '#22C55E',
    borderRadius: 9999,
    width: 8,
    height: 8,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 8,
  },
  unreadCount: {
    fontSize: 12,
    fontFamily: 'LineSeedSansTH_A_Bd',
    color: '#FFFFFF',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 100,
  },
  emptyText: {
    fontSize: 16,
    fontFamily: 'LineSeedSansTH_A_Rg',
    color: '#9CA3AF',
    textAlign: 'center',
  },
});