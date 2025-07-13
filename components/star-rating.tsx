'use client'

import React, { useState } from 'react'
import { Star } from 'lucide-react'
import { cn } from '@/lib/utils'

interface StarRatingProps {
  value?: number
  onChange?: (value: number) => void
  maxStars?: number
  size?: 'sm' | 'md' | 'lg'
  readonly?: boolean
  showValue?: boolean
  className?: string
}

export function StarRating({
  value = 0,
  onChange,
  maxStars = 5,
  size = 'md',
  readonly = false,
  showValue = true,
  className
}: StarRatingProps) {
  const [hoverValue, setHoverValue] = useState<number | null>(null)

  const displayValue = hoverValue !== null ? hoverValue : value

  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-5 w-5',
    lg: 'h-6 w-6'
  }

  const handleStarClick = (starValue: number) => {
    if (readonly) return
    onChange?.(starValue)
  }

  const handleStarHover = (starValue: number) => {
    if (readonly) return
    setHoverValue(starValue)
  }

  const handleMouseLeave = () => {
    if (readonly) return
    setHoverValue(null)
  }

  return (
    <div className={cn('flex items-center gap-2', className)}>
      <div 
        className="flex items-center gap-1" 
        onMouseLeave={handleMouseLeave}
      >
        {Array.from({ length: maxStars }, (_, index) => {
          const starValue = index + 1
          const isFilled = starValue <= displayValue
          
          return (
            <button
              key={index}
              type="button"
              className={cn(
                'transition-colors duration-150',
                readonly ? 'cursor-default' : 'cursor-pointer hover:scale-110',
                'focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary rounded'
              )}
              onClick={() => handleStarClick(starValue)}
              onMouseEnter={() => handleStarHover(starValue)}
              disabled={readonly}
            >
              <Star
                className={cn(
                  sizeClasses[size],
                  'transition-colors duration-150',
                  isFilled 
                    ? 'fill-yellow-400 text-yellow-400' 
                    : 'text-gray-300 hover:text-yellow-300'
                )}
              />
            </button>
          )
        })}
      </div>
      
      {showValue && (
        <span className="text-sm text-muted-foreground ml-1">
          {displayValue.toFixed(1)}/5
        </span>
      )}
    </div>
  )
}

// 只读星级显示组件
interface StarDisplayProps {
  value: number
  maxStars?: number
  size?: 'sm' | 'md' | 'lg'
  showValue?: boolean
  className?: string
}

export function StarDisplay({
  value,
  maxStars = 5,
  size = 'sm',
  showValue = true,
  className
}: StarDisplayProps) {
  return (
    <StarRating
      value={value}
      maxStars={maxStars}
      size={size}
      readonly={true}
      showValue={showValue}
      className={className}
    />
  )
}