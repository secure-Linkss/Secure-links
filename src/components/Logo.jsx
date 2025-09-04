import { Brain, Link } from 'lucide-react'

const Logo = ({ size = 'md', showText = true, className = '' }) => {
  const sizes = {
    sm: {
      container: 'h-8',
      icon: 'h-6 w-6',
      text: 'text-lg'
    },
    md: {
      container: 'h-10',
      icon: 'h-8 w-8',
      text: 'text-xl'
    },
    lg: {
      container: 'h-12',
      icon: 'h-10 w-10',
      text: 'text-2xl'
    },
    xl: {
      container: 'h-16',
      icon: 'h-12 w-12',
      text: 'text-3xl'
    }
  }

  const currentSize = sizes[size]

  return (
    <div className={`flex items-center gap-3 ${currentSize.container} ${className}`}>
      {/* Logo Icon */}
      <div className="relative">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 rounded-lg blur-sm opacity-75"></div>
        <div className="relative bg-gradient-to-br from-blue-600 via-purple-600 to-pink-600 rounded-lg p-2 shadow-lg">
          <div className="relative">
            <Brain className={`${currentSize.icon} text-white`} />
            <Link className="absolute -bottom-1 -right-1 h-4 w-4 text-white bg-gradient-to-br from-blue-500 to-purple-500 rounded-full p-0.5" />
          </div>
        </div>
      </div>

      {/* Logo Text */}
      {showText && (
        <div className="flex flex-col">
          <h1 className={`${currentSize.text} font-bold bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent leading-tight`}>
            Brain Link
          </h1>
          <span className="text-xs text-muted-foreground font-medium tracking-wider uppercase -mt-1">
            Tracker
          </span>
        </div>
      )}
    </div>
  )
}

export default Logo

