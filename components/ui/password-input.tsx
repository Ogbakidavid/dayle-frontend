import * as React from "react"
import { Eye, EyeOff } from "lucide-react"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"

const PasswordInput = React.forwardRef(({ className, ...props }, ref) => {
    const [isVisible, setIsVisible] = React.useState(false)

    const toggleVisibility = () => setIsVisible(!isVisible)

    return (
        <div className="relative group">
            <Input
                type={isVisible ? "text" : "password"}
                className={cn("pr-12", className)}
                ref={ref}
                {...props}
            />
            <button
                type="button"
                onClick={toggleVisibility}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-white/50 hover:text-white transition-colors focus:outline-none"
                tabIndex={-1}
            >
                {isVisible ? (
                    <EyeOff className="h-5 w-5" aria-hidden="true" />
                ) : (
                    <Eye className="h-5 w-5" aria-hidden="true" />
                )}
                <span className="sr-only">
                    {isVisible ? "Hide password" : "Show password"}
                </span>
            </button>
        </div>
    )
})
PasswordInput.displayName = "PasswordInput"

export { PasswordInput }
