import {StyleSheet} from 'react-native'


export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    color: '#fff',
    fontSize: 16,
  },
  errorText: {
    color: '#ff6b6b',
    fontSize: 16,
  },
  noDataText: {
    color: '#fff',
    fontSize: 16,
  },
  
  // Background Layer - Full Profile Image
  backgroundImageContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 1,
  },
  backgroundImage: {
    width: '100%',
    height: '100%',
  },
  placeholderBackground: {
    backgroundColor: '#e5e7eb',
  },
  editProfile: {
    position: 'absolute',
    top: 60,
    left: 16,
    padding: 8,
    backgroundColor: 'rgba(156, 163, 175, 0.8)',
    borderRadius: 50,
    height: 36,
    width: 36,
    justifyContent: 'center',
    alignItems: 'center',
  },
  threedots: {
    position: 'absolute',
    top: 60,
    right: 16,
    padding: 6,
    backgroundColor: 'rgba(156, 163, 175, 0.8)',
    borderRadius: 50,
    height: 36,
    width: 36,
    justifyContent: 'center',
    alignItems: 'center',
  },

  // Draggable Bottom Sheet
  draggableSheet: {
    position: 'absolute',
    bottom: 90, // Increased space for bottom navigation
    left: 0,
    right: 0,
    backgroundColor: '#ffffff',
    borderTopLeftRadius: 50,
    borderTopRightRadius: 50,
    minHeight: 300,
    zIndex: 5, // Lower than bottom nav but higher than background
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: -4,
    },
    shadowOpacity: 0.25,
    shadowRadius: 12,
    elevation: 5,
  },
  
  // Drag Handle (Home Tab)
  dragHandle: {
    width: 40,
    height: 4,
    backgroundColor: '#d1d5db',
    borderRadius: 2,
    alignSelf: 'center',
    marginTop: 12,
    marginBottom: 20,
  },

  // User Info Content
  userInfoContent: {
    padding: 24,
    alignItems: 'center',
  },
  avatarContainer: {
    marginBottom: 16,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
  },
  placeholderAvatar: {
    backgroundColor: '#e5e7eb',
  },
  userName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#374151',
    marginBottom: 8,
    fontFamily: 'LineSeedSansTH_A_Bd',
  },
  occupation: {
    fontSize: 16,
    color: '#6b7280',
    fontFamily: 'LineSeedSansTH',
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',

    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  ratingText: {
    marginLeft: 4,
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
    fontFamily: 'LineSeedSansTH_A_Bd',
  },

  // Bottom Navigation Container
  bottomNavContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    zIndex: 15, // Highest z-index to ensure it's always visible
    elevation: 10,
    backgroundColor: 'transparent',
  },
});
