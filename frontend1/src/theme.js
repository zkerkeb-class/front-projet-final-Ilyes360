import { useState, useEffect } from 'react';

export function getStoredTheme() {
  return localStorage.getItem('theme') === 'dark';
}

export function applyTheme(darkMode) {
  if (darkMode) {
    document.body.classList.add('dark-theme');
    localStorage.setItem('theme', 'dark');
  } else {
    document.body.classList.remove('dark-theme');
    localStorage.setItem('theme', 'light');
  }
}

export function useTheme() {
  const [darkMode, setDarkMode] = useState(getStoredTheme());
  useEffect(() => {
    applyTheme(darkMode);
  }, [darkMode]);
  return [darkMode, setDarkMode];
} 