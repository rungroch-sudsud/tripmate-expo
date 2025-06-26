import {StyleSheet} from 'react-native'

const styles = StyleSheet.create({
    container: {
      
      flex: 1,
      backgroundColor: '#fff',
    },
    inputContainer:{
    
    },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: 16,
      
      borderBottomWidth: 1,
      borderBottomColor: '#e5e5e5',
      backgroundColor: '#fff',
    },
    backButton: {
      marginRight: 12,
      padding: 10,

    },
    headerTitle: {
      fontSize: 18,
      fontWeight: '600',
      color: '#333',
    },
    scrollView: {
      flex: 1,
    },
    scrollContent: {
      paddingBottom: 30,
    },
    profileSection: {
      alignItems: 'center',
      paddingVertical: 24,
      backgroundColor: '#fff',
    },
    profileImageContainer: {
      position: 'relative',
      marginBottom: 8,
    },
    profileImage: {
      width: 112,
      height: 112,
      borderRadius: 9999,
      borderWidth: 2,
      borderColor: '#29C4AF', 
    },
    
    cameraButton: {
      position: 'absolute',
      bottom: 0,
      right: 0,
      backgroundColor: '#29C4AF',
      borderRadius: 9999,
      width: 36,
      height: 36,
      justifyContent: 'center',
      alignItems: 'center',
      borderWidth: 2,
      borderColor: '#fff',
    },
    uploadText: {
      fontSize: 14,
      fontFamily:'InterTight-Regular',
      color: '#6B7280',
      textAlign: 'center',
      marginTop: 4,
      lineHeight:14
    },
    formSection: {
      paddingHorizontal: 16,
    },
    inputGroup: {
      marginBottom: 20,
    },
    label: {
      fontSize: 14,
      fontFamily:'InterTight-Regular',
      marginBottom: 8,
    },
    subLabel: {
      fontSize: 14,
      color: '#666',
      marginBottom: 12,
      lineHeight: 20,
    },
    input: {
      borderWidth: 1,
      borderColor: '#D1D5DB',
      borderRadius: 8,
      paddingHorizontal: 12,
      paddingVertical: 12,
      fontSize: 16,
      fontFamily:'InterTight-Regular',
      lineHeight:24,
      color: '#374151',
      height:50,
      backgroundColor: '#FFFFFF',
       outlineColor: '#e0e0e0'
    },
    inputError: {
      borderColor: '#ef4444',
    },
    errorText: {
      color: '#ef4444',
      fontSize: 14,
      marginTop: 4,
    },
    textArea: {
      height: 80,
      textAlignVertical: 'top',
    },
    genderContainer: {
      gap: 12,
    },
    genderOption: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: 8,
    },
    genderOptionSelected: {
      // Additional styling for selected option if needed
    },
    radioButton: {
      width: 20,
      height: 20,
      borderRadius: 10,
      borderWidth: 2,
      borderColor: '#d1d5db',
      marginRight: 12,
      alignItems: 'center',
      justifyContent: 'center',
    },
    radioButtonSelected: {
      borderColor: '#6B46C1',
    },
    radioButtonInner: {
      width: 10,
      height: 10,
      borderRadius: 5,
      backgroundColor: '#6B46C1',
    },
    genderText: {
      fontSize: 16,
      color: '#333',
    },
    genderTextSelected: {
      color: '#6B46C1',
      fontWeight: '500',
    },
    customGenderInput: {
      marginTop: 12,
    },
    socialInputContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      borderWidth: 1,
      borderColor: '#e5e5e5',
      borderRadius: 8,
      paddingHorizontal: 12,
      marginBottom: 12,
      backgroundColor: '#fff',
      justifyContent:'space-between'
    },
    socialInput: {
      flex: 1,
      paddingVertical: 12,
      paddingLeft: 12,
      fontSize: 16,
      fontFamily:'InterTight-Regular',
      color: '#374151',
      lineHeight:24,
      marginLeft:10,
      outlineColor: '#e0e0e0'
    },
    lineIcon: {
      backgroundColor: '#00B900',
      paddingHorizontal: 6,
      paddingVertical: 2,
      borderRadius: 4,
    },
    lineText: {
      color: '#fff',
      fontSize: 12,
      fontWeight: 'bold',
    },
    tagsContainer: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      marginTop: 12,
    },
    selectedTag: {
      backgroundColor: '#29C4AF',
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: 12,
      paddingVertical: 6,
      borderRadius: 20,
      marginRight: 8,
      marginBottom: 8,
    },
    selectedTagText: {
      color: '#fff',
      fontSize: 14,
      marginRight: 4,
    },
    availableTag: {
      backgroundColor: '#f5f5f5',
      paddingHorizontal: 12,
      paddingVertical: 6,
      borderRadius: 20,
      marginRight: 8,
      marginBottom: 8,
    },
    availableTagText: {
      color: '#666',
      fontSize: 14,
    },
    submitButton: {
      backgroundColor: '#29C4AF',
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      paddingVertical: 16,
      marginHorizontal: 16,
      marginVertical: 24,
      borderRadius: 8,
      shadowColor: '#6B46C1',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.2,
      shadowRadius: 4,
      elevation: 3,
    },
    submitButtonText: {
      color: '#fff',
      fontSize: 16,
      fontWeight: '600',
      marginRight: 8,
    },
    headerText: {
      fontSize: 18,
      fontFamily:'InterTight-Regular',
      color: '#1F2937',
      flex: 1,
      textAlign: 'center',
      marginBottom:12,
      marginTop:12,
      marginLeft:-25
    },
    placeholder: {
      width: 50,
      height: 50,
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
   
     dropdownButton: {
       padding: 12,
       borderWidth: 1,
       borderColor: '#999',
       borderRadius: 6,
       backgroundColor: '#eee',
     },
     dropdownButtonText: { fontSize: 16 },
     dropdown: {
       marginTop: 5,
       borderWidth: 1,
       borderColor: '#999',
       borderRadius: 6,
       maxHeight: 200,
     },
     dropdownItem: {
       padding: 10,
       borderBottomWidth: 1,
       borderBottomColor: '#ddd',
     },
     selectedContainer: { marginTop: 20 },
     selectedItem: {
       flexDirection: 'row',
       padding: 8,
       marginBottom: 5,
       backgroundColor: '#4F46E51A',
       borderRadius: 9999,
       alignItems: 'center',
       justifyContent: 'space-between',
     },
     deleteButton: { marginLeft: 5 },
     selectedGrid: {
       flexDirection: 'row',
       flexWrap: 'wrap',
     },
     selectedButton: {
       backgroundColor: '#4F46E51A',
       borderWidth: 1,
       paddingHorizontal:8,
       paddingTop:7,
       borderRadius: 9999,
       margin: 5,
       borderColor:'#4F46E5',
       minWidth: 84.09,   
       height:38,
       alignItems: 'center',
     },
     selectedButtonText: {
       color: '#4F46E5',
       fontFamily:'InterTight-Regular',
       fontSize: 14,
     },
  
  
    dropdownTrigger: {
      borderWidth: 1,
      borderColor: '#ccc',
      padding: 8,
      borderRadius: 6,
      marginTop: 4,
      backgroundColor: '#fff',
    },
    dropdownList: {
      borderWidth: 1,
      borderColor: '#ccc',
      borderRadius: 6,
      marginTop: 4,
      backgroundColor: '#f9f9f9',
    },
   
    dropdownItemSelected: {
      backgroundColor: '#d0c4f7',
    },
    content: {
      flex: 1,
      paddingTop: 10,
      marginBottom:24,
    },
    title: {
      fontSize: 14,
      color: '#374151',
      marginBottom: 6,
      fontFamily:'InterTight-Regular'
    },
  
  
    subtitle: {
      fontSize: 12,
      lineHeight:13,
      color: '#6B7280',
      marginBottom: 12,
      fontFamily:'InterTight-Regular'
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
    },
    categoriesContainer: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 12,
      alignItems:'center'
      
    },
    categoryItem: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: 16,
      paddingVertical: 12,
      backgroundColor: '#FFFFFF',
      borderRadius: 30,
      marginBottom: 8,
      height:38,
      minWidth:87.61,
      borderWidth: 1,
      borderColor: '#D1D5DB',
      
    },
    emptyText: {
      padding: 10,
      textAlign: 'center',
      color: '#999',
      fontStyle: 'italic'
    },
    categoryText: {
      marginLeft: 8,
      fontSize: 14,
      color: '#374151',
      textAlign:'center',
      verticalAlign:'middle',
      fontFamily:'Inter_400Regular',
    },
    selectedText: {
      color: '#6366f1',
    },
    // Updated styles to match your existing input style
  inputWithIcon: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#D1D5DB', // Match your input borderColor
    borderRadius: 8,
    backgroundColor: '#FFFFFF', // Match your input backgroundColor
    height: 50, // Match your input height
    overflow: 'visible', // Ensure icon is not clipped
  },
  
  textInputField: {
    flex: 1,
    paddingHorizontal: 12,
    paddingVertical: 12, // Match your input paddingVertical
    fontSize: 16,
    color: '#333',
    fontFamily: 'Inter_400Regular', // Match your input fontFamily
    lineHeight: 24, // Match your input lineHeight
    height: '100%', // Take full height of container
  },
  
  textDisplayArea: {
    flex: 1,
    paddingHorizontal: 12,
    paddingVertical: 12, // Match your input paddingVertical
    justifyContent: 'center',
    height: '100%', // Take full height of container
  },
  
  displayText: {
    fontSize: 16,
    color: '#ADAEBC', 
    fontFamily: 'InterTight-Regular', 
    lineHeight: 24, 
  },
  
  iconButton: {
    paddingHorizontal: 8, 
    paddingVertical: 0, 
    justifyContent: 'center',
    alignItems: 'center',
    minWidth: 40, 
    height: 48, 
  },
  
  dropdownIcon: {
    width: 18, 
    height: 18, 
    tintColor: '#666',
    resizeMode: 'contain',
  },
    
  
  });


  export default styles