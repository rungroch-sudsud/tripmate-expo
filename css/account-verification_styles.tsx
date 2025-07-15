import {StyleSheet} from 'react-native'



const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: '#FFFFFF',
    },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: 10,
      paddingTop:35,
      paddingBottom:25,
      borderBottomWidth: 1,
      borderBottomColor: '#f0f0f0',
      boxShadow: '0px 2px 4px rgba(0, 0, 0, 0.09)',
    },
    backButton: {
      width: 30,
      height: 30,
      alignItems: 'center',
      justifyContent: 'center',
      marginLeft: -5,
    },
    backIcon: {
      fontSize: 18,
      color: '#374151',
    },
    headerTitle: {
      fontSize: 16,
      fontFamily:'LineSeedSansTH_A_Bd',
      color: '#374151',
      flex: 1,
      textAlign: 'center',
    },
    placeholder: {
      width: 50,
      height: 50,
    },
    flagContainer: {
      padding: 8,
    },
    flag: {
      fontSize: 16,
      color:'#4F46E5',
      fontFamily:'InterTightRegular',
  
    },
    content: {
      flex: 1,
      paddingHorizontal: 16,
    },
    privacySection: {
      alignItems: 'center',
      paddingVertical: 24,
      backgroundColor: '#FFFFFF',
      marginTop: 16,
      borderRadius: 12,
      marginBottom: 16,
    },
    shieldIcon: {
      width: 68,
      height: 68,
      backgroundColor: '#E5E7EB',
      borderRadius: 9999,
      justifyContent: 'center',
      alignItems: 'center',
      marginBottom: 16,
    },
    shieldEmoji: {
      fontSize: 28,
    },
    privacyTitle: {
      fontSize: 20,
      color: '#374151',
      marginBottom: 8,
      fontFamily:'LineSeedSansTH_A_Bd'
    },
    privacySubtitle: {
      fontSize: 14,
      color: '#6B7280',
      textAlign: 'center',
      lineHeight: 20,
      paddingHorizontal: 16,
      marginBottom: 8,
      fontFamily:'LineSeedSansTH'
    },
    noteText: {
      fontSize: 12,
      color: '#9CA3AF',
      textAlign: 'center',
    },
    formSection: {
      backgroundColor: '#FFFFFF',
      borderRadius: 12,
      padding: 16,
      marginBottom: 16,
    },
    sectionLabel: {
      fontSize: 14,
      fontWeight: '300',
      color: '#374151',
      marginBottom: 8,
    },
    uploadSection: {
      marginTop:16,
      marginBottom: 12,
      height:208
    },
    uploadLabel: {
      fontSize: 14,
     
      color: '#374151',
      marginBottom: 8,
      fontFamily:'Inter_500Medium'
    },
    uploadBox: {
      borderRadius: 12,
      padding: 24,
      alignItems: 'center',
      minHeight: 120,
      backgroundColor:'#F3F4F6'
    },
    uploadPlaceholder: {
      alignItems: 'center',
    },
    cameraIcon: {
      width: 64,
      height: 64,
      backgroundColor: '#E5E7EB',
      borderRadius: 9999,
      justifyContent: 'center',
      alignItems: 'center',
      marginBottom: 12,
    },
    personIcon: {
      width: 64,
      height: 64,
      backgroundColor: '#E5E7EB',
      borderRadius: 9999,
      justifyContent: 'center',
      alignItems: 'center',
      marginBottom: 12,
    },
    cameraEmoji: {
      fontSize: 20,
    },
    personEmoji: {
      fontSize: 20,
    },
    uploadText: {
      fontSize: 14,
      fontFamily:"LineSeedSansTH_A_Bd",
      color: '#374151',
      marginBottom: 4,
      lineHeight: 14,
    },
    uploadSubtext: {
      fontSize: 12,
      fontFamily:'LineSeedSansTH',
      color: '#6B7280',
      textAlign: 'center',
      lineHeight: 12,
    },
    uploadedImage: {
      width: '100%',
      height: 120,
      borderRadius: 8,
      resizeMode:'contain'
    },
    contactSection: {
      paddingTop: 1,
    },
    inputGroup: {
      marginBottom: 16,
      backgroundColor:'#F3F4F6',
      borderRadius:9
    },
    inputLabel: {
      fontSize: 14,
      fontFamily:'Inter_500Medium',
      color: '#374151',
      marginBottom: 8,
    },
    textInput: {
      borderWidth: 1,
      borderColor: '#E5E7EB',
      borderRadius: 12,
      paddingHorizontal: 12,
      paddingVertical: 12,
      fontSize: 16,
      color: '#1F2937',
      backgroundColor: '#F9FAFB80',
      outlineColor: '#e0e0e0'
    },
    bottomSection: {
      padding: 16,
      backgroundColor: '#FFFFFF',
      borderTopWidth: 1,
      borderTopColor: '#E5E7EB',
    },
    disabledButton: {
      opacity: 0.6,
    },
    submitButton: {
      backgroundColor: '#29C4AF',
      borderRadius: 12,
      paddingVertical: 16,
      flexDirection: 'row',
      justifyContent: 'center',
      alignItems: 'center',
      marginBottom: 8,
     
    },
    submitButtonText: {
      fontSize: 16,
      fontFamily:'Inter_500Medium',
      color: '#FFFFFF',
      marginRight: 8,
    },
    checkMark: {
      fontSize: 16,
      color: '#FFFFFF',
    },
    disclaimer: {
      fontSize: 12,
      color: '#9CA3AF',
      textAlign: 'center',
    
      fontFamily:'Inter_400Regular',
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
       backgroundColor: '#4F46E5',
       borderRadius: 100,
     },
     input:{
   
      borderColor: '#E5E7EB',
      borderStyle: 'solid',
      borderRadius: 12,
      fontSize:16,
      backgroundColor:'#F9FAFB80',
      padding: 24,
      alignItems: 'center',
      height: 58,
      outlineColor: '#e0e0e0'
     },
      errorText: {
    color: 'red',
    fontSize: 12,
    marginTop: 4,
    marginBottom: 8,
  },
  });

  export default styles