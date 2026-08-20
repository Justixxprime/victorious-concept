import { Sun, Moon, MonitorSmartphone } from 'lucide-react'
import { useTheme } from '../hooks/useTheme'

const options = [
  { key: 'light', icon: Sun },
  { key: 'auto', icon: MonitorSmartphone },
  { key: 'dark', icon: Moon },
]

function ThemeToggle() {
  const [mode, setMode] = useTheme()

  return (
    <div className="flex items-center gap-1 bg-espresso/5 dark:bg-cream/10 rounded-full p-1">
      {options.map(({ key, icon: Icon }) => (
        <button
          key={key}
          onClick={() => setMode(key)}
          className={`p-1.5 rounded-full transition-colors ${
            mode === key
              ? 'bg-gold text-espresso'
              : 'text-espresso/50 dark:text-cream/50 hover:text-espresso dark:hover:text-cream'
          }`}
          aria-label={`${key} mode`}
        >
          <Icon className="w-4 h-4" />
        </button>
      ))}
    </div>
  )
}

export default ThemeToggle