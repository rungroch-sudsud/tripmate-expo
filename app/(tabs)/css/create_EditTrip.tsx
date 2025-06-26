import {StyleSheet} from 'react-native'


const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: 'white',
    },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: '#fff',
      borderBottomWidth:1,
      paddingVertical: 12,
      borderBottomColor: '#e0e0e0',
    },
    backButton: {
      marginRight:-30,
      marginLeft:-10,
      padding:15
    },
    headerTitle: {
      fontSize: 18,
      color: '#1F2937',
      flex: 1,
      textAlign: 'center',
      fontWeight:500,
      fontFamily:'InterTight-Regular',
      marginLeft:-20,
     
    },
    content: {
      flex: 1,
      marginBottom:30,
      marginHorizontal:20,
    },
    imageSection: {
      alignItems: 'center',
      marginVertical: 20,
    },
    imagePlaceholder: {
      width: 120,
      height: 120,
      backgroundColor: '#f0f0f0',
      borderRadius: 8,
      justifyContent: 'center',
      alignItems: 'center',
      borderWidth: 2,
      borderColor: '#e0e0e0',
      borderStyle: 'dashed',
    },
    imageText: {
      marginTop: 8,
      fontSize: 12,
      color: '#666',
    },
    formSection: {
      backgroundColor: '#fff',
      borderRadius: 8,
      padding: 16,
      marginBottom: 10,       // Add consistent bottom margin
    },
    fieldContainer: {
      marginBottom: 20,
    },
    label: {
      fontWeight: '500',
      color: '#333',
      marginBottom:4,
      fontFamily:'InterTight-Regular',
      fontSize:16
    },
    requiredText: {
      fontSize: 12,
      color: '#666',
      marginBottom: 8,
    },
    disabledButton: {
      opacity: 0.5, 
      backgroundColor: '#4285f4', 
    },
    textInput: {
      borderWidth:1,
      borderColor: '#e0e0e0',
      marginTop:5,
      borderRadius: 8,
      paddingHorizontal: 12,
      paddingVertical: 12,
      fontSize: 16,
      backgroundColor: '#fff',
      fontWeight:400,
      fontFamily:'InterTight-Regular'
    },
    textInputFocused: {
      borderColor: 'transparent',
      outlineColor:'#e0e0e0',
      outlineWidth:1,
    },
    dateContainer: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginBottom: 20,       // Reduced from 30 to 20
      borderWidth: 1,
      borderColor: '#e0e0e0',
      borderRadius: 8,
      height: 50,
      alignItems: 'center'
    },
    dateField: {
      flex: 0.48,
    },
    dateLabel: {
      fontSize: 14,
      fontWeight: '500',
      color: '#333',
      marginBottom: 8,
    },
    dateInput: {
      borderRadius: 8,
      paddingHorizontal: 12,
      paddingVertical: 12,
      fontSize: 14,
      backgroundColor: '#fff',
    },
    alignmentIcon: {
      fontSize: 16,
      color: '#333',
      fontWeight: 'bold',
    },
    tagsContainer: {
      marginBottom: 20,
    },
    tagButtons: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      marginTop: 8,
    },
    tagButton: {
      paddingHorizontal: 16,
      paddingVertical: 8,
      borderRadius: 20,
      backgroundColor: '#f0f0f0',
      marginRight: 8,
      marginBottom: 8,
    },
    activeTag: {
      backgroundColor: '#4285f4',
    },
    tagText: {
      fontSize: 14,
      color: '#666',
    },
    activeTagText: {
      fontSize: 14,
      color: '#fff',
    },
    textArea: {
      borderWidth: 1,
      borderColor: '#e0e0e0',
      borderRadius: 8,
      paddingHorizontal: 12,
      paddingVertical: 12,
      fontSize: 14,
      backgroundColor: '#fff',
      minHeight: 80,
      textAlignVertical: 'top',
      outlineColor:'#e0e0e0',
      fontFamily:'InterTight-Regular'
    },
    attachmentSection: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 20,
    },
    attachmentText: {
      fontSize: 14,
      color: '#333',
    },
    attachmentCount: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    countNumber: {
      fontSize: 14,
      color: '#666',
    },
    checkboxSection: {
      marginBottom: 20,
      marginHorizontal:20
    },
    checkboxContainer: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginTop: 12,
      
    },
    checkboxRow: {
      flexDirection: 'row',
      alignItems: 'center',
      flex: 0.48,
      borderRadius:5,
      height:30,
      paddingHorizontal:4,
      backgroundColor:"#F9FAFBFF",
      marginHorizontal:5
      
    },
    checkbox: {
      width: 20,
      height: 20,
      borderWidth: 2,
      borderColor: '#ddd',
      borderRadius: 4,
      marginRight: 8,
      justifyContent: 'center',
      alignItems: 'center',
    },
    checkboxInner: {
      width: 12,
      height: 12,
      borderRadius: 2,
    },
    checked: {
      backgroundColor: '#4285f4',
    },
    checkboxText: {
      fontSize: 14,
      color: '#333',
      fontFamily:'InterTight-Regular'
    },
    bottomSection: {
      alignItems: 'center',
      marginTop: 20,
    },
    addButton: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: 16,
      paddingVertical: 8,
      backgroundColor: '#f0f0f0',
      borderRadius: 8,
    },
    addButtonText: {
      marginLeft: 8,
      fontSize: 14,
      color: '#666',
    },
    submitContainer: {
      flex:0.5,
      backgroundColor: '#fff',
      paddingHorizontal: 16,
      paddingVertical: 16,
    },
    drafContainer: {
      flex:0.5,
      backgroundColor: '#fff',
      paddingHorizontal: 16,
      paddingVertical: 16,
    },
    submitButton: {
      flex:0.5,
      flexDirection: 'row',
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: '#29C4AF',
      paddingVertical: 16,
      borderRadius: 8,
      marginBottom: 8,
    },
    draftButton:{
      flex:0.5,
      flexDirection: 'row',
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: '#E5E7EB',
      paddingVertical: 16,
      borderRadius: 8,
      marginBottom: 8,
    },
    draftText:{
      marginLeft: 8,
      fontSize: 16,
      fontWeight: '600',
    },
    submitText: {
      marginLeft: 8,
      fontSize: 16,
      fontWeight: '600',
      color: '#fff',
    },
    submitNote: {
      fontSize: 12,
      color: '#666',
      textAlign: 'center',
      marginTop:-25,
      marginBottom:20
    },
    uploadBox: {
      borderWidth: 2,
      borderColor: '#E5E7EB',
      borderStyle: 'solid',
      borderRadius: 12,
      alignItems: 'center',
      minHeight: 270,
      backgroundColor: '#E5E7EB',
      verticalAlign: 'middle',
      marginBottom: 20,       // Reduced from 30 to 20
      justifyContent: 'center',
    },
    uploadPlaceholder: {
      alignItems: 'center',
      verticalAlign:'middle'
    },
    container2:{
    
       
    },
    personIcon: {
      width: 64,
      height: 64,
      backgroundColor: '#E5E7EB',
      borderRadius: 9999,
      justifyContent: 'center',
      alignItems: 'center',
     
    },
    uploadText: {
      fontSize: 14,
      fontFamily:"Inter_500Medium",
      color: '#374151',
      marginBottom: 4,
      lineHeight: 14,
    },
    uploadedImage: {
      width: '100%',
      flex: 1,
      borderRadius: 8,
      resizeMode: 'cover',
      minHeight: 200,
    },
    uploadSubtext: {
      fontSize: 16,
      color: '#6B7280',
      textAlign: 'center',
      lineHeight: 12,
      fontFamily:'InterTight-Regular',
    },
    title: {
      fontSize: 16,
      color: '#333',
      fontWeight: '800',
      marginBottom: 14,
      lineHeight: 24,
      fontFamily:'Inter_900Black'
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
      alignItems: 'center',
      marginTop: 5,
      marginBottom: 10, // Add space after categories
    },
    categoryItem: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: 16,
      paddingVertical: 14,
      height: 38,
      borderRadius: 30,
      // Remove marginBottom: 20
      borderWidth: 1,
      borderColor: '#e0e0e0',
    },
    selectedItem: {
      backgroundColor: 'rgba(41, 196, 175, 0.1)', // 10% opacity of #6366f1
      borderColor: '#29C4AF',
    },
    selectedText: {
      color: '#29C4AF',
      fontFamily:'InterTight-Regular'
    },
    categoryText: {
      marginLeft: 8,
      fontSize: 14,
      color: '#666',
      fontWeight: '500',
      fontFamily:'InterTight-Regular'
    },
    toolbarButton: {
      paddingHorizontal: 8,
      paddingVertical: 6,
      borderRadius: 4,
      marginRight: 4,
    },
    activeButton: {
      backgroundColor: '#007bff',
    },
    toolbarButtonText: {
      fontSize: 14,
      color: '#333',
      fontWeight: '500',
    },
    activeButtonText: {
      color: '#fff',
    },
  
    toolbar: {
      flexDirection: 'row',
      backgroundColor: '#fff',
      borderRadius: 8,
      padding: 8,
      marginBottom: 8,
      elevation: 2,
      shadowColor: '#000',
      shadowRadius: 2,
      flexWrap: 'wrap',
      alignItems: 'center',
    }, 
     dropdown: {
      position: 'absolute',         
      top: 52,                     
      left: 0,                    
      right: 0,                    
      backgroundColor: '#FFFFFF',  
      borderWidth: 1,
      borderColor: 'black',      
      borderTopWidth: 0,         
      borderBottomLeftRadius: 8,   
      borderBottomRightRadius: 8,
      maxHeight: 200,              
      zIndex: 1002,                
      elevation: 5,              
      shadowColor: '#000',        
      shadowOffset: {
        width: 0,
        height: 2,
      },shadowOpacity: 0.1,
      shadowRadius: 4,
      
    },
    
    dropdownText: {
      fontSize: 14,
      color: '#333',
      marginRight: 4,
    },
    dropdownArrow: {
      fontSize: 10,
      color: '#666',
    },
  
    formatButton: {
      minWidth: 32,
      alignItems: 'center',
    },
    italicButton: {
      fontStyle: 'italic',
    },
    underlineButton: {
      textDecorationLine: 'underline',
    },
    listButton: {
      minWidth: 32,
      alignItems: 'center',
    },
    toolButton: {
      paddingHorizontal: 8,
      paddingVertical: 6,
      marginRight: 4,
    },
    toolButtonText: {
      fontSize: 14,
      color: '#666',
    },
  
    editorContainer: {
      flex: 1,
      backgroundColor: '#fff',
      borderRadius: 8,
      elevation: 2,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.1,
      shadowRadius: 2,
      borderWidth:0.1
    },
    textEditor: {
      flex: 1,
      padding: 16,
      fontSize: 16,
      lineHeight: 24,
      borderRadius:8,
      color: '#333',
      fontFamily: 'System', // Supports Thai characters
      minHeight: 200,
      outlineColor:'#e0e0e0'
    },
    dateInputError: {
      borderColor: '#FF6B6B',
      borderWidth: 1,
    },
    calendarIcon: {
      width: 20,
      height: 20,
      borderRadius: 3,
      position: 'relative',
    },
    calendarTop: {
      flexDirection: 'row',
      justifyContent: 'space-around',
      paddingTop: 2,
      paddingHorizontal: 3,
    },
    calendarHook: {
      width: 2,
      height: 3,
      backgroundColor: 'white',
      borderRadius: 1,
    },
    calendarBody: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      justifyContent: 'space-around',
      alignItems: 'center',
      paddingHorizontal: 3,
      paddingTop: 2,
      flex: 1,
    },
    calendarDot: {
      width: 2,
      height: 2,
      backgroundColor: 'white',
      borderRadius: 1,
      margin: 1,
    },
    wordCount: {
      position: 'absolute',
      bottom: 8,
      right: 12,
      fontSize: 12,
      fontFamily:'InterTight-Regular',
    },
    text: {
      flex: 1,
      fontSize: 16,
      lineHeight: 22,
    },
    linkText: {
      color: 'blue',
      textDecorationLine: 'underline',
    },
    input: {
      borderWidth: 1,
      borderColor: '#D1D5DB',
      borderRadius: 8,
      paddingHorizontal: 12,
      paddingVertical: 12,
      fontSize: 16,
      fontFamily: 'Inter_400Regular',
      lineHeight: 24,
      color: '#374151',
      height: 50,
      backgroundColor: '#FFFFFF',
      outlineColor:'#e0e0e0'
    },
    dropdownItem: {
      paddingHorizontal: 12,
      paddingVertical: 12,
      borderBottomWidth: 1,
      borderBottomColor: '#F3F4F6',
      backgroundColor: '#FFFFFF',
    },
    emptyText: {
      padding: 10,
      textAlign: 'center',
      color: '#999',
      fontStyle: 'italic',
      fontFamily:'InterTight-Regular'
    },
    selectedContainer: { 
      marginTop: 10,
     
      },
    selectedGrid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap:5,
      
    },
    container4: {
      flex: 4,
      backgroundColor: 'white',
      position: 'relative',         
      zIndex: 1000,
      maxHeight:120,
      overflowY:'auto',
      marginTop:20,
    },
    selectedButton: {
      backgroundColor: '#4F46E51A',
      borderWidth: 1,
      paddingHorizontal:8,
      paddingVertical:7,
      borderRadius: 9999,
      borderColor:'#4F46E5',
      minWidth: 84.09,   
      height:38,
      alignItems: 'center',
      justifyContent:'center'
    },
    selectedButtonText: {
      color: '#4F46E5',
      fontFamily:'Inter_400Regular',
      fontSize: 14,
    },
    container3: {
      flex: 4,
      backgroundColor: 'white',        
      marginHorizontal: 20,
      marginBottom: 20,       // Add consistent bottom margin
    },
    modalOverlay: {
      flex: 1,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      justifyContent: 'center',
      alignItems: 'center',
    },
    colorPickerContainer: {
      backgroundColor: '#fff',
      borderRadius: 12,
      padding: 20,
      margin: 20,
      maxWidth: 300,
    },
    modalTitle: {
      fontSize: 18,
      fontWeight: 'bold',
      textAlign: 'center',
      marginBottom: 16,
      color: '#333',
    },
    colorGrid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      justifyContent: 'center',
      marginBottom: 16,
    },
    colorOption: {
      width: 40,
      height: 40,
      borderRadius: 20,
      margin: 4,
      borderWidth: 2,
      borderColor: '#ddd',
    },
    selectedColor: {
      borderColor: '#007bff',
      borderWidth: 3,
    },
    modalCloseButton: {
      backgroundColor: '#007bff',
      paddingVertical: 12,
      paddingHorizontal: 24,
      borderRadius: 8,
      alignItems: 'center',
      marginTop: 8,
    },
    modalCloseText: {
      color: '#fff',
      fontSize: 16,
      fontWeight: '500',
    },
    fontSizeContainer: {
      backgroundColor: '#fff',
      borderRadius: 12,
      padding: 20,
      margin: 20,
      maxWidth: 250,
    },
    fontSizeOption: {
      paddingVertical: 12,
      paddingHorizontal: 16,
      borderBottomWidth: 1,
      borderBottomColor: '#eee',
    },
    selectedFontSize: {
      backgroundColor: '#f0f8ff',
    },
    fontSizeText: {
      color: '#333',
    },
    headerContainer: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 16,
    },
    colorButton: {
      width: 32,
      height: 32,
      borderRadius: 16,
      alignItems: 'center',
      justifyContent: 'center',
      marginRight: 4,
      borderWidth: 2,
      borderColor: '#ddd',
    },
    colorButtonText: {
      fontSize: 14,
      fontWeight: 'bold',
    },
    statusBar: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      backgroundColor: '#f8f9fa',
      paddingHorizontal: 12,
      paddingVertical: 6,
      borderRadius: 4,
      marginTop: 8,
    },
    statusText: {
      fontSize: 12,
      color: '#666',
    },
    textFormatIcon: {
      fontSize: 14,
      color: '#333',
      fontWeight: 'bold',
      fontStyle: 'italic',
    },
    textFormatX: {
      fontSize: 10,
      color: '#666',
      position: 'absolute',
      right: 2,
      bottom: 2,
    },
    selectedTravelStylesContainer: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      marginVertical: 10,
      gap: 8, 
    },
    inputModalContainer: {
      backgroundColor: '#fff',
      borderRadius: 12,
      padding: 24,
      margin: 20,
      minWidth: 300,
    },
    modalInput: {
      borderWidth: 1,
      borderColor: '#ddd',
      borderRadius: 8,
      paddingHorizontal: 12,
      paddingVertical: 10,
      fontSize: 16,
      marginBottom: 20,
      backgroundColor: '#f9f9f9',
    },
    modalButtons: {
      flexDirection: 'row',
      justifyContent: 'space-between',
    },
    modalCancelButton: {
      paddingVertical: 12,
      paddingHorizontal: 24,
      borderRadius: 8,
      backgroundColor: '#f5f5f5',
      flex: 1,
      marginRight: 8,
    },
    modalSubmitButton: {
      paddingVertical: 12,
      paddingHorizontal: 24,
      borderRadius: 8,
      backgroundColor: '#007bff',
      flex: 1,
      marginLeft: 8,
    },
    modalCancelText: {
      color: '#666',
      fontSize: 16,
      fontWeight: '500',
      textAlign: 'center',
    },
    modalSubmitText: {
      color: '#fff',
      fontSize: 16,
      fontWeight: '500',
      textAlign: 'center',
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
      borderRadius: 12,
    },
    dateBadge: {
      position: 'absolute',
      top: 16,
      left: 16,
      backgroundColor: 'rgba(255, 255, 255, 0.9)',
      paddingHorizontal: 12,
      paddingVertical: 6,
      borderRadius: 20,
      flexDirection: 'row',
      alignItems: 'center',
    },
    dateIcon: {
      fontSize: 14,
      marginRight: 4,
    },
    dateText: {
      fontSize: 12,
      fontWeight: '500',
      color: '#333',
    },
    participantBadge: {
      position: 'absolute',
      top: 16,
      right: 16,
      backgroundColor: '#6366f1',
      paddingHorizontal: 12,
      paddingVertical: 6,
      borderRadius: 20,
      flexDirection: 'row',
      alignItems: 'center',
    },
    participantIcon: {
      fontSize: 14,
      marginRight: 4,
    },
    participantText: {
      fontSize: 12,
      fontWeight: '500',
      color: 'white',
    },
    content2: {
      padding: 16,
    },
    tripName: {
      fontSize: 18,
      fontWeight: 'bold',
      color: '#1f2937',
      marginBottom: 8,
    },
    destinationRow: {
      flexDirection: 'row',
      alignItems: 'baseline',
      marginBottom: 8,
    },
    locationIcon: {
      fontSize: 14,
      marginRight: 6,
    },
    sectionWithError: {
      marginBottom: 5,        // Minimal margin, let ErrorMessage handle spacing
    },
    destinationContainer: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      flex: 1,
    },
    destinationText: {
      fontSize: 14,
      color: '#6b7280',
    },
    description: {
      fontSize: 14,
      color: '#4b5563',
      lineHeight: 20,
      marginBottom: 12,
    },
    tagsContainer2: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      marginBottom: 12,
    },
    serviceTag: {
      backgroundColor: '#dbeafe',
      paddingHorizontal: 12,
      paddingVertical: 6,
      borderRadius: 16,
      marginRight: 8,
      marginBottom: 4,
    },
    serviceTagText: {
      color: '#2563eb',
      fontSize: 12,
      fontWeight: '500',
    },
    travelStylesContainer: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      marginBottom: 16,
      marginHorizontal:20
    },
    categoryItem2: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: '#f3f4f6',
      paddingHorizontal: 12,
      paddingVertical: 6,
      borderRadius: 16,
      marginRight: 8,
      marginBottom: 4,
    },
    categoryIcon: {
      width: 14,
      height: 12,
      tintColor: '#6366f1',
      marginRight: 6,
    },
    categoryText2: {
      fontSize: 12,
      color: '#6366f1',
      fontWeight: '500',
    },
    joinButton: {
      backgroundColor: '#6366f1',
      paddingHorizontal: 24,
      paddingVertical: 12,
      borderRadius: 9,
      alignSelf: 'flex-end',
    },
    joinButtonText: {
      color: 'white',
      fontSize: 16,
      fontWeight: '400',
      textAlign: 'center',
    },
  
    calendarContainer: {
      backgroundColor: 'white',
      borderRadius: 10,
      margin: 20,
      maxHeight: '80%',
      width: '90%',
    },
    calendarHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: 15,
      borderBottomWidth: 1,
      borderBottomColor: '#E5E5E5',
    },
    calendarTitle: {
      fontSize: 18,
      fontWeight: 'bold',
      color: '#333',
    },
    closeButton: {
      width: 30,
      height: 30,
      justifyContent: 'center',
      alignItems: 'center',
    },
    closeButtonText: {
      fontSize: 18,
      color: '#666',
    },
  
    fontDropdownContainer: {
      backgroundColor: 'white',
      borderRadius: 8,
      padding: 16,
      margin: 20,
      maxHeight: 400,
      minWidth: 200,
      shadowColor: '#000',
      shadowOffset: {
        width: 0,
        height: 2,
      },
      shadowOpacity: 0.25,
      shadowRadius: 3.84,
      elevation: 5,
    },
    dropdownTitle: {
      fontSize: 18,
      fontWeight: 'bold',
      marginBottom: 12,
      textAlign: 'center',
      color: '#333',
    },
    fontList: {
      maxHeight: 300,
    },
    fontItem: {
      paddingVertical: 12,
      paddingHorizontal: 16,
      borderBottomWidth: 1,
      borderBottomColor: '#eee',
      borderRadius: 4,
      marginBottom: 2,
    },
    selectedFontItem: {
      backgroundColor: '#007AFF',
    },
    fontItemText: {
      fontSize: 16,
      color: '#333',
    },
    selectedFontText: {
      color: 'white',
      fontWeight: 'bold',
    },
    fontButtonText: {
      fontSize: 12,
      color: '#333',
      fontWeight: '500',
    },
  
    modalContent: {
      width: '80%',
      backgroundColor: '#ffffff',
      padding: 16,
      borderRadius: 8,
      elevation: 4,
    },
  
    modalActions: {
      flexDirection: 'row',
      justifyContent: 'flex-end',
      marginTop: 8,
    },
    wordCountText: {
      position: 'absolute',
      bottom: 8,
      right: 12,
      fontSize: 12,
      color: '#666',
      backgroundColor: 'rgba(255, 255, 255, 0.8)', 
      paddingHorizontal: 4,
      paddingVertical: 2,
      borderRadius: 4,
    },
    errorText: {
      color: '#EF4444',
      fontSize: 12,
      marginTop: 5,           
  
      fontFamily: 'InterTight-Regular',
      marginBottom: 15,       
    },
    inputError: {
      borderColor: '#EF4444',
      borderWidth: 1,
      marginBottom:5
    },
    uploadBoxError: {
      borderColor: '#EF4444',
      borderWidth: 2,
      marginBottom:0
    },
    dateErrorContainer: {
      flexDirection: 'row',
      justifyContent: 'space-around',
  
      marginTop: 5,
      marginBottom: 15,
    },
    dateErrorText: {
      color: '#EF4444',
      fontSize: 12,
      fontFamily: 'InterTight-Regular',
      flex: 1,
      textAlign:'center'
    }
  });


  export default styles
  