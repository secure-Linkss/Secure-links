import { useState, useEffect, createContext, useContext } from 'react'

const ThemeContext = createContext()

export const themes = {
  dark: {
    name: 'Dark Ocean',
    class: 'theme-dark',
    colors: {
      background: '#0f172a', // slate-900
      foreground: '#f8fafc', // slate-50
      card: '#1e293b', // slate-800
      cardForeground: '#f8fafc',
      popover: '#1e293b',
      popoverForeground: '#f8fafc',
      primary: '#3b82f6', // blue-500
      primaryForeground: '#f8fafc',
      secondary: '#334155', // slate-700
      secondaryForeground: '#f8fafc',
      muted: '#334155',
      mutedForeground: '#94a3b8', // slate-400
      accent: '#1e40af', // blue-800
      accentForeground: '#f8fafc',
      destructive: '#ef4444', // red-500
      border: '#334155',
      input: '#334155',
      ring: '#3b82f6',
      sidebar: '#1e293b',
      sidebarForeground: '#f8fafc',
      sidebarPrimary: '#3b82f6',
      sidebarAccent: '#334155'
    }
  },
  light: {
    name: 'Light Breeze',
    class: 'theme-light',
    colors: {
      background: '#ffffff',
      foreground: '#0f172a',
      card: '#f8fafc',
      cardForeground: '#0f172a',
      popover: '#ffffff',
      popoverForeground: '#0f172a',
      primary: '#1e40af', // blue-800
      primaryForeground: '#ffffff',
      secondary: '#f1f5f9', // slate-100
      secondaryForeground: '#0f172a',
      muted: '#f1f5f9',
      mutedForeground: '#64748b', // slate-500
      accent: '#e2e8f0', // slate-200
      accentForeground: '#0f172a',
      destructive: '#dc2626', // red-600
      border: '#e2e8f0',
      input: '#e2e8f0',
      ring: '#1e40af',
      sidebar: '#f8fafc',
      sidebarForeground: '#0f172a',
      sidebarPrimary: '#1e40af',
      sidebarAccent: '#e2e8f0'
    }
  },
  purple: {
    name: 'Purple Nebula',
    class: 'theme-purple',
    colors: {
      background: '#1a0b2e', // deep purple
      foreground: '#f3e8ff', // purple-50
      card: '#2d1b4e', // darker purple
      cardForeground: '#f3e8ff',
      popover: '#2d1b4e',
      popoverForeground: '#f3e8ff',
      primary: '#8b5cf6', // violet-500
      primaryForeground: '#f3e8ff',
      secondary: '#4c1d95', // violet-900
      secondaryForeground: '#f3e8ff',
      muted: '#4c1d95',
      mutedForeground: '#c4b5fd', // violet-300
      accent: '#7c3aed', // violet-600
      accentForeground: '#f3e8ff',
      destructive: '#f87171', // red-400
      border: '#4c1d95',
      input: '#4c1d95',
      ring: '#8b5cf6',
      sidebar: '#2d1b4e',
      sidebarForeground: '#f3e8ff',
      sidebarPrimary: '#8b5cf6',
      sidebarAccent: '#4c1d95'
    }
  },
  emerald: {
    name: 'Emerald Forest',
    class: 'theme-emerald',
    colors: {
      background: '#064e3b', // emerald-900
      foreground: '#ecfdf5', // emerald-50
      card: '#065f46', // emerald-800
      cardForeground: '#ecfdf5',
      popover: '#065f46',
      popoverForeground: '#ecfdf5',
      primary: '#10b981', // emerald-500
      primaryForeground: '#ecfdf5',
      secondary: '#047857', // emerald-700
      secondaryForeground: '#ecfdf5',
      muted: '#047857',
      mutedForeground: '#6ee7b7', // emerald-300
      accent: '#059669', // emerald-600
      accentForeground: '#ecfdf5',
      destructive: '#fbbf24', // amber-400
      border: '#047857',
      input: '#047857',
      ring: '#10b981',
      sidebar: '#065f46',
      sidebarForeground: '#ecfdf5',
      sidebarPrimary: '#10b981',
      sidebarAccent: '#047857'
    }
  }
}

export const useTheme = () => {
  const context = useContext(ThemeContext)
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider')
  }
  return context
}

export const ThemeProvider = ({ children }) => {
  const [currentTheme, setCurrentTheme] = useState('dark')

  useEffect(() => {
    // Load theme from localStorage
    const savedTheme = localStorage.getItem('brain-link-tracker-theme')
    if (savedTheme && themes[savedTheme]) {
      setCurrentTheme(savedTheme)
    }
  }, [])

  useEffect(() => {
    // Apply theme to document
    const theme = themes[currentTheme]
    const root = document.documentElement

    // Remove all theme classes
    Object.values(themes).forEach(t => {
      root.classList.remove(t.class)
    })

    // Add current theme class
    root.classList.add(theme.class)

    // Set CSS custom properties
    Object.entries(theme.colors).forEach(([key, value]) => {
      const cssVar = `--${key.replace(/([A-Z])/g, '-$1').toLowerCase()}`
      root.style.setProperty(cssVar, value)
    })

    // Save to localStorage
    localStorage.setItem('brain-link-tracker-theme', currentTheme)
  }, [currentTheme])

  const changeTheme = (themeName) => {
    if (themes[themeName]) {
      setCurrentTheme(themeName)
    }
  }

  return (
    <ThemeContext.Provider value={{
      currentTheme,
      theme: themes[currentTheme],
      themes,
      changeTheme
    }}>
      {children}
    </ThemeContext.Provider>
  )
}

