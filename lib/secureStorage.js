import * as SecureStore from 'expo-secure-store';
import { useEffect, useCallback, useReducer } from 'react';

function useAsyncState(initialValue = [true, undefined]) {
  return useReducer((state, action = null) => [false, action], initialValue);
}

async function setStorageItemAsync(key, value) {
    if (value == null) {
        await SecureStore.deleteItemAsync(key);
    } else {
        await SecureStore.setItemAsync(key, value);
    }
}

export default function useStorageState(key) {
  const [state, setState] = useAsyncState();

  useEffect(() => {
    SecureStore.getItemAsync(key).then((value) => {
        setState(value);
    });
  }, [key]);

  const setValue = useCallback((value) => {
    setStorageItemAsync(key, value).then(() => {
      setState(value);
    });
  }, [key]);

  return [state, setValue];
}