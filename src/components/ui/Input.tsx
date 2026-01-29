import * as React from "react"
import { cn } from "@/lib/utils"

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string
  icon?: React.ReactNode
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, label, icon, ...props }, ref) => {
    return (
      <div className="w-full space-y-2">
        {/* 1. Renderizado opcional del Label */}
        {label && (
          <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 text-foreground">
            {label}
          </label>
        )}

        {/* 2. Contenedor relativo para posicionar el icono dentro */}
        <div className="relative">
          {icon && (
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground/70 pointer-events-none [&_svg]:size-4">
              {icon}
            </div>
          )}

          <input
            type={type}
            className={cn(
              // --- BASE ---
              "flex h-11 w-full rounded-md border border-input px-3 py-1 text-base transition-all outline-none md:text-sm",
              "file:border-0 file:bg-transparent file:text-sm file:font-medium",

              // --- ESTILO ANCOME ---
              "bg-slate-50 dark:bg-slate-950/50 placeholder:text-muted-foreground/70",

              // --- FOCUS ---
              "focus-visible:bg-background focus-visible:border-primary focus-visible:ring-1 focus-visible:ring-primary",

              // --- ERROR ---
              "aria-invalid:border-destructive aria-invalid:ring-destructive/20 aria-invalid:bg-destructive/5",

              // --- DISABLED ---
              "disabled:cursor-not-allowed disabled:opacity-50",

              // --- ICON PADDING ---
              // Si hay icono, empujamos el texto a la derecha
              icon ? "pl-10" : "",

              className
            )}
            ref={ref}
            {...props}
          />
        </div>
      </div>
    )
  }
)
Input.displayName = "Input"

export { Input }