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
      paddingTop:40,
      paddingBottom:20
    },

    backButton: {
      backgroundColor:'#E5E7EB',
      padding: 8,
    
      marginLeft: 20,
      borderRadius:20,
      width:40,
      height:40,
      alignItems:'center',
      justifyContent:'center'
    },
    headerText: {
      fontSize: 16,
      color: '#374151',
      flex: 1,
      textAlign: 'center',
      fontFamily: 'LineSeedSansTH_A_Bd'
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
      fontSize: 15,
      color: '#374151',
      marginBottom: 24,
      lineHeight: 24,
      fontFamily: 'LineSeedSansTH_A_Bd'
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
      paddingVertical: 25,
      height: 38,
      borderRadius: 30,
      marginBottom: 8,
        boxShadow: '0 0 10px rgba(0, 0, 0, 0.15)',
    },
    selectedItem: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: 16,
      paddingVertical: 25,
      height: 38,
      borderRadius: 30,
      marginBottom: 8,
       boxShadow: '0px 4px 6px rgba(0, 0, 0, 0.1)',
    },
    categoryIcon: {
      width: 14,
      height: 12,
    },
    categoryText: {
  
      fontSize: 12,
      color: '#374151',
     fontFamily: 'LineSeedSansTH_A_Bd'
    },
    selectedText: {
      color: '#374151',
      fontFamily: 'LineSeedSansTH_A_Bd',
       fontSize: 12,
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
      backgroundColor: '#3B82F6',
      paddingVertical: 16,
      borderRadius: 12,
    },
    disabledButton: {
      backgroundColor: '#f0f0f0',
    },
    continueButtonText: {
      fontSize: 15,
      color: '#FFFFFF',
      marginRight: 8,
      fontFamily:'LineSeedSansTH_A_Bd'
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