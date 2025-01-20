"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Check } from 'lucide-react'
import { cn } from "@/lib/utils"

const cuisines = [
  "Mexican",
  "Italian",
  "Chinese",
  "Japanese",
  "Indian",
  "Greek",
  "French",
  "Spanish",
  "Turkish",
  "Lebanese",
  "Vietnamese",
  "Korean",
  "Argentinian",
  "Peruvian",
  "Ethiopian",
  "Nigerian",
  "German",
  "British",
  "Irish",
  "Swedish",
  "Danish",
  "Polish",
  "Hungarian",
  "Portuguese",
]

interface CuisineSelectorProps {
  selectedCuisines?: string[]
  onChange?: (cuisines: string[]) => void
  className?: string
  title?: string
  maxSelections?: number
}

const selectedButtonClass = "border-2 border-amber-400 bg-amber-50 dark:bg-amber-900/20 text-amber-900 dark:text-amber-100 ring-0"
const unselectedButtonClass = "border border-gray-200 dark:border-gray-700 hover:border-amber-200 dark:hover:border-amber-700 text-muted-foreground ring-0 hover:text-foreground"

export function CuisineSelector({
  selectedCuisines: externalSelected,
  onChange,
  className = "",
  title = "What are your favorite cuisines?",
  maxSelections
}: CuisineSelectorProps) {
  const [internalSelected, setInternalSelected] = useState<string[]>([])
  
  // Use either controlled or uncontrolled state
  const selected = externalSelected || internalSelected
  const setSelected = (newSelection: string[]) => {
    setInternalSelected(newSelection)
    onChange?.(newSelection)
  }

  const toggleCuisine = (cuisine: string) => {
    if (selected.includes(cuisine)) {
      setSelected(selected.filter((c) => c !== cuisine))
    } else {
      if (maxSelections && selected.length >= maxSelections) {
        return // Don't add if max selections reached
      }
      setSelected([...selected, cuisine])
    }
  }

  return (
    <div className={`w-full ${className}`}>
      {title && (
        <h2 className="text-xl font-semibold mb-4">
          {title}
        </h2>
      )}
      {maxSelections && (
        <p className="text-sm text-muted-foreground mb-2">
          Select up to {maxSelections} cuisines
        </p>
      )}
      <div className="w-full">
        <motion.div 
          className="flex flex-wrap gap-2"
          layout
          transition={{
            type: "spring",
            stiffness: 500,
            damping: 30,
            mass: 0.5,
          }}
        >
          {cuisines.map((cuisine) => {
            const isSelected = selected.includes(cuisine)
            return (
              <motion.button
                key={cuisine}
                onClick={() => toggleCuisine(cuisine)}
                layout
                initial={false}
                animate={{
                  scale: isSelected ? 1.05 : 1,
                }}
                whileHover={{
                  scale: 1.05,
                }}
                whileTap={{
                  scale: 0.95,
                }}
                transition={{
                  type: "spring",
                  stiffness: 500,
                  damping: 30,
                  mass: 0.5,
                }}
                className={cn(
                  "inline-flex items-center px-3 py-1.5 rounded-full text-sm font-medium transition-all duration-200",
                  isSelected ? selectedButtonClass : unselectedButtonClass,
                  (maxSelections && selected.length >= maxSelections && !isSelected) && "opacity-50 cursor-not-allowed"
                )}
                disabled={maxSelections && selected.length >= maxSelections && !isSelected}
              >
                <motion.div 
                  className="relative flex items-center"
                  animate={{ 
                    width: isSelected ? "auto" : "100%",
                    paddingRight: isSelected ? "1.5rem" : "0",
                  }}
                  transition={{
                    ease: [0.175, 0.885, 0.32, 1.275],
                    duration: 0.3,
                  }}
                >
                  <span>{cuisine}</span>
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
                        <div className="w-4 h-4 rounded-full bg-amber-100 dark:bg-amber-900 flex items-center justify-center">
                          <Check className="w-3 h-3 text-amber-600 dark:text-amber-400" strokeWidth={2} />
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