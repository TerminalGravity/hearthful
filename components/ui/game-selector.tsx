"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Check } from 'lucide-react'
import { cn } from "@/lib/utils"

const gameOptions = [
  "Board Games",
  "Card Games",
  "Video Games",
  "Puzzle Games",
  "Strategy Games",
  "Party Games",
  "Role-Playing Games",
  "Trivia Games",
  "Word Games",
  "Sports Games",
  "Chess",
  "Monopoly",
  "Scrabble",
  "Uno",
  "Jenga",
  "Pictionary"
]

interface GameSelectorProps {
  selectedGames?: string[]
  onChange?: (games: string[]) => void
  className?: string
  title?: string
}

const selectedButtonClass = "border-2 border-amber-400 bg-amber-50 dark:bg-amber-900/20 text-amber-900 dark:text-amber-100 ring-0"
const unselectedButtonClass = "border border-gray-200 dark:border-gray-700 hover:border-amber-200 dark:hover:border-amber-700 text-muted-foreground ring-0 hover:text-foreground"

export function GameSelector({
  selectedGames: externalSelected,
  onChange,
  className = "",
  title = "Game Preferences"
}: GameSelectorProps) {
  const [internalSelected, setInternalSelected] = useState<string[]>([])
  
  // Use either controlled or uncontrolled state
  const selected = externalSelected || internalSelected
  const setSelected = (newSelection: string[]) => {
    setInternalSelected(newSelection)
    onChange?.(newSelection)
  }

  const toggleGame = (game: string) => {
    if (selected.includes(game)) {
      setSelected(selected.filter((c) => c !== game))
    } else {
      setSelected([...selected, game])
    }
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
          className="flex flex-wrap gap-2"
          layout
          transition={{
            type: "spring",
            stiffness: 500,
            damping: 30,
            mass: 0.5,
          }}
        >
          {gameOptions.map((game) => {
            const isSelected = selected.includes(game)
            return (
              <motion.button
                key={game}
                onClick={() => toggleGame(game)}
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
                  isSelected ? selectedButtonClass : unselectedButtonClass
                )}
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
                  <span>{game}</span>
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