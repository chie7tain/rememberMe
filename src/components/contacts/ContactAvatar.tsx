import { getInitials } from '@/lib/utils'
import Image from 'next/image'

const AVATAR_COLORS = [
  'bg-rose-400',
  'bg-orange-400',
  'bg-amber-400',
  'bg-green-400',
  'bg-teal-400',
  'bg-blue-400',
  'bg-indigo-400',
  'bg-purple-400',
]

function getColorForName(name: string): string {
  let hash = 0
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash)
  }
  return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length]
}

interface ContactAvatarProps {
  name: string
  photoUrl?: string | null
  size?: 'sm' | 'md' | 'lg'
}

const sizeClasses = {
  sm: 'w-8 h-8 text-xs',
  md: 'w-10 h-10 text-sm',
  lg: 'w-16 h-16 text-xl',
}

export default function ContactAvatar({ name, photoUrl, size = 'md' }: ContactAvatarProps) {
  const sizeClass = sizeClasses[size]
  const colorClass = getColorForName(name)

  if (photoUrl) {
    return (
      <div className={`${sizeClass} rounded-full overflow-hidden flex-shrink-0`}>
        <Image src={photoUrl} alt={name} width={64} height={64} className="w-full h-full object-cover" />
      </div>
    )
  }

  return (
    <div
      className={`${sizeClass} ${colorClass} rounded-full flex items-center justify-center flex-shrink-0 font-semibold text-white`}
    >
      {getInitials(name)}
    </div>
  )
}
