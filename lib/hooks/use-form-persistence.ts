"use client";

import { useState, useEffect, useCallback } from "react";

/**
 * A custom hook to persist form state in localStorage.
 * 
 * @param storageKey - The unique key to store the data under
 * @param initialState - The default state if no persisted data exists
 * @returns [state, setState, clearPersistence]
 */
export function useFormPersistence<T>(storageKey: string, initialState: T) {
  // Initialize state with a function to lazy-load from localStorage
  const [state, setState] = useState<T>(() => {
    if (typeof window === "undefined") return initialState;
    
    try {
      const persisted = localStorage.getItem(storageKey);
      if (persisted) {
        return JSON.parse(persisted);
      }
    } catch (error) {
      console.warn(`Error loading persisted state for key "${storageKey}":`, error);
    }
    
    return initialState;
  });

  // Update localStorage whenever state changes
  useEffect(() => {
    if (typeof window === "undefined") return;
    
    try {
      localStorage.setItem(storageKey, JSON.stringify(state));
    } catch (error) {
      console.warn(`Error saving state for key "${storageKey}":`, error);
    }
  }, [storageKey, state]);

  // Utility to clear the persisted data
  const clearPersistence = useCallback(() => {
    if (typeof window === "undefined") return;
    
    try {
      localStorage.removeItem(storageKey);
      setState(initialState);
    } catch (error) {
      console.warn(`Error clearing state for key "${storageKey}":`, error);
    }
  }, [storageKey, initialState]);

  return [state, setState, clearPersistence] as const;
}
