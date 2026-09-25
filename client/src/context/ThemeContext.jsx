import { createContext, useContext, useEffect, useState } from 'react'
import { Moon, Sun } from 'lucide-react'

const ThemeContext = createContext(null)
const THEME_KEY = 'taskflow_theme'

const getInitialTheme = () => {
  const savedTheme = localStorage.getItem(THEME_KEY)
  if (savedTheme) return savedTheme
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
}

export function ThemeProvider({ children }) {
  const [theme, setTheme] = useState(getInitialTheme)

  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark')
    localStorage.setItem(THEME_KEY, theme)
  }, [theme])

  const toggleTheme = () => setTheme((current) => current === 'dark' ? 'light' : 'dark')
  return <ThemeContext.Provider value={{ theme, toggleTheme }}><button type="button" onClick={toggleTheme} className="theme-toggle fixed bottom-5 right-5 z-[60] grid h-10 w-10 place-items-center rounded-xl border border-slate-200 bg-white text-slate-500 shadow-sm transition hover:border-indigo-300 hover:text-indigo-600" aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'} title={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}>{theme === 'dark' ? <Sun size={17} /> : <Moon size={17} />}</button>{children}</ThemeContext.Provider>
}

export const useTheme = () => useContext(ThemeContext)
