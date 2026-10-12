import AsyncStorage from '@react-native-async-storage/async-storage';

const AVATAR_KEY = '@localkart_user_avatar';
const NAME_KEY = '@localkart_user_name';

export const saveCachedAvatar = async (avatarUrl: string | null): Promise<void> => {
  try {
    if (avatarUrl) {
      await AsyncStorage.setItem(AVATAR_KEY, avatarUrl);
    } else {
      await AsyncStorage.removeItem(AVATAR_KEY);
    }
  } catch (error) {
    console.log('[saveCachedAvatar error]', error);
  }
};

export const clearCachedAvatar = async (): Promise<void> => {
  try {
    await AsyncStorage.removeItem(AVATAR_KEY);
  } catch (error) {
    console.log('[clearCachedAvatar error]', error);
  }
};

export const getCachedAvatar = async (): Promise<string | null> => {
  try {
    return await AsyncStorage.getItem(AVATAR_KEY);
  } catch (error) {
    console.log('[getCachedAvatar error]', error);
    return null;
  }
};

export const saveCachedName = async (name: string): Promise<void> => {
  try {
    if (name) {
      await AsyncStorage.setItem(NAME_KEY, name);
    }
  } catch (error) {
    console.log('[saveCachedName error]', error);
  }
};

export const getCachedName = async (): Promise<string | null> => {
  try {
    return await AsyncStorage.getItem(NAME_KEY);
  } catch (error) {
    console.log('[getCachedName error]', error);
    return null;
  }
};
