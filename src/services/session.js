import * as SecureStore from 'expo-secure-store';

const SESSION_KEY = 'klon_user_session';

export const saveSession = async (userData) => {
  try {
    await SecureStore.setItemAsync(SESSION_KEY, JSON.stringify(userData));
  } catch (error) {
    console.error('Error saving session:', error);
  }
};

export const getSession = async () => {
    try {
      const session = await SecureStore.getItemAsync(SESSION_KEY);
      return session ? JSON.parse(session) : null;
    } catch (error) {
      console.error('Error getting session:', error);
      return null;
    }
  };

export const clearSession = async () => {
  try {
    await SecureStore.deleteItemAsync(SESSION_KEY);
  } catch (error) {
    console.error('Error clearing session:', error);
  }
};
