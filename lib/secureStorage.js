import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';

export async function setStorageItem(key, value) {
    if (Platform.OS === 'web') {
        if (value === null) {
            localStorage.removeItem(key);
          } else {
            localStorage.setItem(key, value);
          }
    } else {
        if (value == null) {
            await SecureStore.deleteItemAsync(key);
        } else {
            await SecureStore.setItemAsync(key, value);
        }
    }
}

export async function getStorageItem(key) {
    if (Platform.OS === 'web') {
        return localStorage.getItem(key);
    } else {
        return await SecureStore.getItemAsync(key);
    }
}