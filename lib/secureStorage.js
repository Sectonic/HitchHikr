import * as SecureStore from 'expo-secure-store';

export async function setStorageItem(key, value) {
    if (value == null) {
        await SecureStore.deleteItemAsync(key);
    } else {
        await SecureStore.setItemAsync(key, value);
    }
}

export async function getStorageItem(key) {
    return await SecureStore.getItemAsync(key)
}