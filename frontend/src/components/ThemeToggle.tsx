import React from 'react';
import './ThemeToggle.css';

interface ThemeToggleProps {
  isDarkMode: boolean;
  onToggle: (isDark: boolean) => void;
}

const ThemeToggle: React.FC<ThemeToggleProps> = ({ isDarkMode, onToggle }) => {
  return (
    <button
      className={`theme-toggle ${isDarkMode ? 'dark' : 'light'}`}
      onClick={() => onToggle(!isDarkMode)}
      aria-label="Toggle theme"
    >
      <span className="theme-icon">{isDarkMode ? '☀️' : '🌙'}</span>
      <span className="theme-label">{isDarkMode ? 'Light' : 'Dark'}</span>
    </button>
  );
};

export default ThemeToggle;

