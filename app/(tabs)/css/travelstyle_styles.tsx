import {StyleSheet} from  'react-native'

const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: '#fff',
    },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: 10,
      borderBottomWidth: 1,
      borderBottomColor: '#f0f0f0',
    },
    backButton: {
      padding: 4,
      marginRight: 12,
    },
    headerText: {
      fontSize: 19,
      fontWeight: '300',
      color: '#333',
      flex: 1,
      textAlign: 'center',
      fontFamily: 'InterTight-Regular'
    },
    placeholder: {
      width: 50,
      height: 50,
    },
    content: {
      flex: 1,
      paddingHorizontal: 20,
      paddingTop: 2,
    },
    title: {
      fontSize: 16,
      color: '#333',
      fontWeight: '800',
      marginBottom: 24,
      lineHeight: 24,
      fontFamily: 'InterTight-Regular'
    },
    categoriesContainer: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 12,
    },
    categoryItem: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: 16,
      paddingVertical: 14,
      height: 38,
      borderRadius: 30,
      marginBottom: 8,
      borderWidth: 1,
      borderColor: '#e0e0e0',
    },
    selectedItem: {
      backgroundColor: 'rgba(41, 196, 175, 0.1)',
      borderColor: '#29C4AF',
    },
    categoryIcon: {
      width: 14,
      height: 12,
    },
    categoryText: {
      marginLeft: 8,
      fontSize: 14,
      color: '#666',
      fontWeight: '700',
      fontFamily: 'InterTight-Regular'
    },
    selectedText: {
      color: '#29C4AF',
      fontFamily: 'InterTight-Regular'
    },
    bottomContainer: {
      paddingHorizontal: 20,
      paddingVertical: 20,
      paddingBottom: 34,
    },
    continueButton: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: '#29C4AF',
      paddingVertical: 16,
      borderRadius: 12,
    },
    disabledButton: {
      backgroundColor: '#f0f0f0',
    },
    continueButtonText: {
      fontSize: 16,
      fontWeight: '600',
      color: '#fff',
      marginRight: 8,
    },
    disabledButtonText: {
      color: '#ccc',
    },
    buttonIcon: {
      marginLeft: 4,
    },
    loadingContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
    },
    loadingText: {
      marginTop: 16,
      fontSize: 16,
      color: '#666',
      fontFamily: 'InterTight-Regular',
    },
    progressContainer: {
      paddingBottom: 15,
    },
    progressBar: {
      height: 4,
      backgroundColor: '#e0e0e0',
      borderRadius: 2,
      overflow: 'hidden',
    },
    progressFill: {
      height: '100%',
      backgroundColor: '#29C4AF',
      borderRadius: 2,
    },
    loadingOverlay: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(255, 255, 255, 0.9)',
      justifyContent: 'center',
      alignItems: 'center',
      zIndex: 1000,
    },
    loadingContent: {
      backgroundColor: 'white',
      padding: 30,
      borderRadius: 15,
      alignItems: 'center',
      shadowColor: '#000',
      shadowOffset: {
        width: 0,
        height: 2,
      },
      shadowOpacity: 0.25,
      shadowRadius: 3.84,
      elevation: 5,
    },
  });



  export default styles