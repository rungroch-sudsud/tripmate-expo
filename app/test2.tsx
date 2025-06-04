import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
} from 'react-native';

const { width } = Dimensions.get('window');

interface TransportFormProps {
  onSendPress?: (message: string) => void;
}

const TransportFormUI: React.FC<TransportFormProps> = ({ onSendPress }) => {
  const [message, setMessage] = useState('');

  const handleSend = () => {
    if (message.trim()) {
      onSendPress?.(message);
      setMessage('');
    }
  };

  return (
    <View style={styles.container}>
      {/* Main Form Section */}
      <View style={styles.formSection}>
        {/* Bus Icon and Label */}
        <View style={styles.transportSection}>
          <View style={styles.iconContainer}>
            <Text style={styles.busIcon}>🚌</Text>
          </View>
          <Text style={styles.transportLabel}>บันทึกแบบร่าง</Text>
        </View>

        {/* Input and Send Button Row */}
        <View style={styles.inputRow}>
          <View style={styles.inputContainer}>
            <TextInput
              style={styles.textInput}
              placeholder="ตรวจสอบข้อมูลให้ครบถ้วนก่อนโพสต์"
              placeholderTextColor="#9ca3af"
              value={message}
              onChangeText={setMessage}
              multiline={false}
            />
          </View>
          
          <TouchableOpacity 
            style={styles.sendButton}
            onPress={handleSend}
            activeOpacity={0.8}
          >
            <Text style={styles.sendIcon}>✈️</Text>
            <Text style={styles.sendText}>โพสต์ทริป</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Bottom Helper Text */}
      <Text style={styles.helperText}>
        * ตรวจสอบข้อมูลให้ครบถ้วนก่อนโพสต์
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
    paddingHorizontal: 16,
    paddingVertical: 24,
    justifyContent: 'center',
  },
  formSection: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 4,
    marginBottom: 16,
  },
  transportSection: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  iconContainer: {
    width: 48,
    height: 48,
    backgroundColor: '#f3f4f6',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  busIcon: {
    fontSize: 24,
  },
  transportLabel: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1f2937',
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  inputContainer: {
    flex: 1,
    backgroundColor: '#f9fafb',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  textInput: {
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 14,
    color: '#374151',
    minHeight: 48,
  },
  sendButton: {
    backgroundColor: '#6366f1',
    borderRadius: 12,
    paddingHorizontal: 20,
    paddingVertical: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 48,
  },
  sendIcon: {
    fontSize: 16,
    marginRight: 6,
  },
  sendText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
  helperText: {
    fontSize: 12,
    color: '#6b7280',
    textAlign: 'left',
    marginTop: 8,
  },
});

export default TransportFormUI;