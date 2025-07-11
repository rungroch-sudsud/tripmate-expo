import { renderHook, waitFor } from '@testing-library/react-native';
import { useAuth } from '../useAuth';
import AsyncStorage from '@react-native-async-storage/async-storage';

jest.mock('@react-native-async-storage/async-storage', () => ({
  getItem: jest.fn(),
}));

describe('useAuth', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should return userId from AsyncStorage', async () => {
    (AsyncStorage.getItem as jest.Mock).mockResolvedValue('test-user-id');

    const { result } = renderHook(() => useAuth());
    
    await waitFor(() => {
     return result.current.loading === false;
    });

    expect(result.current.userId).toBe('test-user-id');
  });

  it('should handle null value from AsyncStorage', async () => {
    (AsyncStorage.getItem as jest.Mock).mockResolvedValue(null);

    const { result } = renderHook(() => useAuth());
    
    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.userId).toBe(null);
  });

  it('should handle error in AsyncStorage.getItem', async () => {
    const mockError = new Error('AsyncStorage error');
    (AsyncStorage.getItem as jest.Mock).mockRejectedValue(mockError);

    const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

    const { result } = renderHook(() => useAuth());

    await waitFor(() => {
       return result.current.loading === false; 
    });

    expect(result.current.userId).toBe(null);
    expect(consoleSpy).toHaveBeenCalledWith(
      'Failed to load userId from AsyncStorage:',
      mockError
    );

    consoleSpy.mockRestore();
  });

  it('should start with loading true and userId null', () => {
    (AsyncStorage.getItem as jest.Mock).mockImplementation(() => 
      new Promise(resolve => setTimeout(() => resolve('test-user-id'), 100))
    );

    const { result } = renderHook(() => useAuth());
    
    expect(result.current.loading).toBe(true);
    expect(result.current.userId).toBe(null);
  });
});