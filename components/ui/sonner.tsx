"use client"

import { useTheme } from "next-themes"
import { Toaster as Sonner } from "sonner"

type ToasterProps = React.ComponentProps<typeof Sonner>

const Toaster = ({ ...props }: ToasterProps) => {
  const { theme = "system" } = useTheme()

  return (
    <Sonner
      theme={theme as ToasterProps["theme"]}
      className="toaster group"
      toastOptions={{
        classNames: {
          toast:
            "group toast group-[.toaster]:bg-background-50 group-[.toaster]:text-text-900 group-[.toaster]:border-accent-200 group-[.toaster]:shadow-lg",
          description: "group-[.toast]:text-text-600",
          actionButton:
            "group-[.toast]:bg-primary-500 group-[.toast]:text-text-50",
          cancelButton:
            "group-[.toast]:bg-accent-100 group-[.toast]:text-text-600",
        },
      }}
      {...props}
    />
  )
}

export { Toaster }
