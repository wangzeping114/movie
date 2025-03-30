import { defineStore } from 'pinia'

export const useThemeStore = defineStore('theme', {
  state: () => ({
    currentTheme: localStorage.getItem('theme') || 'gold',
    themes: {
      gold: {
        name: '金色主题',
        primary: '#d4af37',
        secondary: '#e5c158',
        background: '#1a1f2a',
        surface: '#0a0f1a',
        text: '#ffffff',
        textSecondary: 'rgba(255, 255, 255, 0.6)',
        border: 'rgba(212, 175, 55, 0.1)',
        gradient: 'linear-gradient(135deg, #d4af37, #e5c158)'
      },
      blue: {
        name: '蓝色主题',
        primary: '#2196f3',
        secondary: '#64b5f6',
        background: '#1a237e',
        surface: '#0d47a1',
        text: '#ffffff',
        textSecondary: 'rgba(255, 255, 255, 0.6)',
        border: 'rgba(33, 150, 243, 0.1)',
        gradient: 'linear-gradient(135deg, #2196f3, #64b5f6)'
      },
      purple: {
        name: '紫色主题',
        primary: '#9c27b0',
        secondary: '#ba68c8',
        background: '#4a148c',
        surface: '#311b92',
        text: '#ffffff',
        textSecondary: 'rgba(255, 255, 255, 0.6)',
        border: 'rgba(156, 39, 176, 0.1)',
        gradient: 'linear-gradient(135deg, #9c27b0, #ba68c8)'
      },
      green: {
        name: '绿色主题',
        primary: '#4caf50',
        secondary: '#81c784',
        background: '#1b5e20',
        surface: '#0a280e',
        text: '#ffffff',
        textSecondary: 'rgba(255, 255, 255, 0.6)',
        border: 'rgba(76, 175, 80, 0.1)',
        gradient: 'linear-gradient(135deg, #4caf50, #81c784)'
      }
    }
  }),

  actions: {
    setTheme(themeName) {
      if (this.themes[themeName]) {
        this.currentTheme = themeName
        localStorage.setItem('theme', themeName)
        this.applyTheme()
      }
    },

    applyTheme() {
      const theme = this.themes[this.currentTheme]
      const root = document.documentElement
      
      // 设置CSS变量
      root.style.setProperty('--primary-color', theme.primary)
      root.style.setProperty('--secondary-color', theme.secondary)
      root.style.setProperty('--background-color', theme.background)
      root.style.setProperty('--surface-color', theme.surface)
      root.style.setProperty('--text-color', theme.text)
      root.style.setProperty('--text-secondary-color', theme.textSecondary)
      root.style.setProperty('--border-color', theme.border)
      root.style.setProperty('--gradient', theme.gradient)
    }
  }
}) 