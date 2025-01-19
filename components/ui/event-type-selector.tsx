"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Check, Utensils, GamepadIcon } from 'lucide-react'

const eventTypes = [
  { id: "meal", label: "Meal", icon: Utensils },
  { id: "game", label: "Game", icon: GamepadIcon },
] as const;

type EventType = typeof eventTypes[number]["id"]

interface EventTypeSelectorProps {
  selectedEventType?: EventType
  onChange?: (eventType: EventType) => void
  className?: string
  title?: string
}

export function EventTypeSelector({
  selectedEventType: externalSelected,
  onChange,
  className = "",
  title = ""
}: EventTypeSelectorProps) {
  const [internalSelected, setInternalSelected] = useState<EventType>("meal")
  
  // Use either controlled or uncontrolled state
  const selected = externalSelected || internalSelected
  const setSelected = (newSelection: EventType) => {
    setInternalSelected(newSelection)
    onChange?.(newSelection)
  }

  return (
    <div className={`w-full ${className}`}>
      {title && (
        <h2 className="text-xl font-semibold mb-4">
          {title}
        </h2>
      )}
      <div className="w-full">
        <motion.div 
          className="flex gap-2"
          layout
          transition={{
            type: "spring",
            stiffness: 500,
            damping: 30,
            mass: 0.5,
          }}
        >
          {eventTypes.map(({ id, label, icon: Icon }) => {
            const isSelected = selected === id
            return (
              <motion.button
                key={id}
                onClick={() => setSelected(id)}
                layout
                initial={false}
                animate={{
                  backgroundColor: isSelected ? "rgb(var(--primary))" : "transparent",
                }}
                whileHover={{
                  backgroundColor: isSelected ? "rgb(var(--primary))" : "rgba(var(--muted), 0.8)",
                }}
                whileTap={{
                  backgroundColor: isSelected ? "rgb(var(--primary))" : "rgba(var(--muted), 0.9)",
                }}
                transition={{
                  type: "spring",
                  stiffness: 500,
                  damping: 30,
                  mass: 0.5,
                  backgroundColor: { duration: 0.1 },
                }}
                className={`
                  flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-full text-sm font-medium
                  whitespace-nowrap overflow-hidden ring-1 ring-inset
                  ${isSelected 
                    ? "text-primary-foreground ring-primary" 
                    : "text-muted-foreground ring-border hover:text-foreground"}
                `}
              >
                <motion.div 
                  className="relative flex items-center gap-2"
                  animate={{ 
                    width: isSelected ? "auto" : "100%",
                    paddingRight: isSelected ? "1.5rem" : "0",
                  }}
                  transition={{
                    ease: [0.175, 0.885, 0.32, 1.275],
                    duration: 0.3,
                  }}
                >
                  <Icon className="w-4 h-4" />
                  <span>{label}</span>
                  <AnimatePresence>
                    {isSelected && (
                      <motion.span
                        initial={{ scale: 0, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0, opacity: 0 }}
                        transition={{ 
                          type: "spring", 
                          stiffness: 500, 
                          damping: 30, 
                          mass: 0.5 
                        }}
                        className="absolute right-0"
                      >
                        <div className="w-4 h-4 rounded-full bg-background flex items-center justify-center">
                          <Check className="w-3 h-3 text-primary" strokeWidth={2} />
                        </div>
                      </motion.span>
                    )}
                  </AnimatePresence>
                </motion.div>
              </motion.button>
            )
          })}
        </motion.div>
      </div>
    </div>
  )
} 