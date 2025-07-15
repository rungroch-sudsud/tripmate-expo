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
    paddingBottom:20,
    paddingTop:40,
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
    fontSize: 16,
    color: '#374151',
    fontFamily: 'LineSeedSansTH_A_Bd',
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
    height: 5,
    backgroundColor: '#e0e0e0',
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 2,
    overflow:'hidden'
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
    backgroundColor: '#585DDB',
  },
appName: {
  fontSize: 24,
  fontFamily: 'LineSeedSansTH_A_XBd',
  color: 'linear-gradient(90deg, #585DDB 0%, #FF956E 100%)',
  textAlign: 'center',
},
    gradientContainer: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 8,
    marginBottom: 8,
    alignSelf: 'center', 
  },
  subtitle: {
    fontFamily: 'LineSeedSansTH',
    marginBottom: 20,
    textAlign: 'center',
    color: '#4B5563',
    fontSize: 15,
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
    marginBottom: 20,
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
    height:23,
    width:23,
  },
  googleButtonText: {
    color: '#0000008A',
    fontSize: 15,
    fontFamily: 'LineSeedSansTH_A_Bd',
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
    fontSize: 13,
    color: '#6B7280',
    textAlign: 'center',
    fontFamily: 'LineSeedSansTH',
    marginBottom:20,
  },
  termsBaseText: {
    fontFamily: 'LineSeedSansTH',
    fontSize:12,
    color: '#6B7280',

  },
  linkText: {
    color: '#3B82F6',
    fontFamily: 'LineSeedSansTH',
    fontSize: 12,
    textDecorationLine: 'underline',
  },
});


  

  export default styles