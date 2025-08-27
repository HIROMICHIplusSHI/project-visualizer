// hooks/useLocalStorage.ts
// ローカルストレージ管理用カスタムフック - App.tsxから抽出

import { useEffect, useState, useCallback } from 'react';

type SetValue<T> = (value: T | ((prevValue: T) => T)) => void;

/**
 * ローカルストレージと同期するカスタムフック
 * @param key ローカルストレージのキー
 * @param initialValue 初期値
 * @returns [value, setValue] タプル
 */
export function useLocalStorage<T>(
  key: string,
  initialValue: T
): [T, SetValue<T>] {
  const [storedValue, setStoredValue] = useState<T>(() => {
    try {
      const item = window.localStorage.getItem(key);
      if (item === null) {
        return initialValue;
      }
      return JSON.parse(item);
    } catch (error) {
      console.warn(`Error reading localStorage key "${key}":`, error);
      return initialValue;
    }
  });

  const setValue: SetValue<T> = useCallback((value) => {
    try {
      // 関数の場合は現在の値で実行（setStoredValueの関数型を利用）
      setStoredValue((currentValue) => {
        const valueToStore = value instanceof Function ? value(currentValue) : value;
        
        // ローカルストレージに保存
        try {
          window.localStorage.setItem(key, JSON.stringify(valueToStore));
        } catch (error) {
          console.warn(`Error saving to localStorage key "${key}":`, error);
        }
        
        return valueToStore;
      });
    } catch (error) {
      console.warn(`Error setting localStorage key "${key}":`, error);
    }
  }, [key]);

  return [storedValue, setValue];
}

/**
 * URL履歴管理用の専用フック
 */
export function useRecentUrls() {
  return useLocalStorage<string[]>('recentUrls', []);
}

/**
 * アプリ設定管理用の専用フック
 */
export function useAppSettings() {
  return useLocalStorage('appSettings', {
    theme: 'light',
    language: 'ja',
    showWelcome: true
  });
}