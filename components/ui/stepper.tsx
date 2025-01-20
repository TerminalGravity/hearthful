"use client"

import { motion } from "framer-motion"
import { Check } from 'lucide-react'

interface Step {
  id: string
  title: string
  description: string
}

interface StepperProps {
  steps: readonly Step[]
  currentStep: number
  onStepClick?: (index: number) => void
}

export function Stepper({ steps, currentStep, onStepClick }: StepperProps) {
  return (
    <div className="flex flex-col gap-1">
      {steps.map((step, index) => {
        const isCompleted = index < currentStep
        const isCurrent = index === currentStep
        const isClickable = isCompleted && onStepClick

        return (
          <motion.button
            key={step.id}
            onClick={() => isClickable && onStepClick(index)}
            className={`
              flex items-center gap-3 px-4 py-2 rounded-lg text-sm
              ${isClickable ? "cursor-pointer hover:bg-gray-50" : "cursor-default"}
              ${isCurrent ? "text-primary" : "text-gray-500"}
            `}
            initial={false}
          >
            <motion.div
              className={`
                w-5 h-5 rounded-full flex items-center justify-center text-xs
                ${isCompleted 
                  ? "bg-primary text-white" 
                  : isCurrent 
                    ? "border-2 border-primary text-primary"
                    : "border-2 border-gray-300 text-gray-300"}
              `}
            >
              {isCompleted ? (
                <Check className="w-3 h-3" />
              ) : (
                <span>{index + 1}</span>
              )}
            </motion.div>
            <div className="flex flex-col items-start">
              <span className="font-medium">{step.title}</span>
              {step.description && (
                <span className="text-xs text-gray-400">{step.description}</span>
              )}
            </div>
          </motion.button>
        )
      })}
    </div>
  )
} 