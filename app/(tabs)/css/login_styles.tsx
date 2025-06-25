import {StyleSheet}  from 'react-native'


const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: '#ffffff',
    },
    loadingContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
    },
    loadingText: {
      marginTop: 16,
      fontSize: 16,
      color: '#6B7280',
      fontFamily: 'InterTight-Regular',
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
      width: 40,
      height: 40,
      alignItems: 'center',
      justifyContent: 'center',
      borderRadius: 20,
    },
    headerText: {
      flex: 1,
      textAlign: 'center',
      fontSize: 18,
      fontWeight: '500',
      color: '#1F2937',
      fontFamily: 'InterTight-SemiBold',
      marginVertical:10
    },
    placeholder: {
      width: 40,
      height: 40,
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
      backgroundColor: '#6366f1',
      borderRadius: 2,
    },
    content: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      paddingHorizontal: 40,
    },
    logoContainer: {
      marginBottom: 30,
    },
    logo: {
      width: 96,
      height: 96,
      borderRadius: 48,
      backgroundColor: '#3B82F6',
    },
    appName: {
      fontSize: 24,
      fontFamily: 'InterTight-SemiBold',
      color: '#333333',
      marginBottom: 8,
    },
    subtitle: {
      fontFamily: 'InterTight-Regular',
      marginBottom: 60,
      textAlign: 'center',
      color: '#6B7280',
      fontSize: 14,
    },
    errorContainer: {
      backgroundColor: '#FEF2F2',
      borderColor: '#FECACA',
      borderWidth: 1,
      borderRadius: 8,
      padding: 12,
      marginBottom: 16,
      width: '100%',
      alignItems: 'center',
    },
    errorText: {
      color: '#DC2626',
      fontSize: 14,
      fontFamily: 'InterTight-Regular',
      textAlign: 'center',
      marginBottom: 8,
    },
    retryButton: {
      backgroundColor: '#DC2626',
      paddingHorizontal: 16,
      paddingVertical: 8,
      borderRadius: 4,
    },
    retryButtonText: {
      color: '#FFFFFF',
      fontSize: 12,
      fontFamily: 'InterTight-SemiBold',
    },
    googleButton: {
      backgroundColor: '#ffffff',
      paddingVertical: 12,
      paddingHorizontal: 20,
      borderRadius: 10,
      marginBottom: 5,
      width: 350,
      height: 58,
      borderWidth: 1,
      borderColor: '#dadce0',
      shadowColor: '#000',
      shadowOffset: {
        width: 0,
        height: 2,
      },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 3,
    },
    disabledButton: {
      opacity: 0.6,
    },
    googleButtonContent: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      height: '100%',
    },
    googleIconContainer: {
      width: 30,
      height: 30,
      marginRight: 12,
      alignItems: 'center',
      justifyContent: 'center',
    },
    googleIcon: {
      fontSize: 28,
      fontWeight: 'bold',
      color: '#4285f4',
    },
    googleButtonText: {
      color: '#374151',
      fontSize: 16,
      fontFamily: 'InterTight-SemiBold',
      lineHeight: 16,
    },
    termsText: {
      fontSize: 12,
      color: '#6B7280',
      textAlign: 'center',
      lineHeight: 16,
      paddingHorizontal: 20,
    },
    descriptionText: {
      fontSize: 14,
      color: '#6B7280',
      textAlign: 'center',
      fontFamily: 'InterTight-Regular',
    },
    termsBaseText: {
      fontFamily: 'InterTight-Regular',
      fontSize: 12,
      color: '#6B7280',
    },
    linkText: {
      color: '#3B82F6',
      fontFamily: 'InterTight-Regular',
      fontSize: 12,
      textDecorationLine: 'underline',
    },
  });

  

  export default styles