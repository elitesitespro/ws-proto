import { Button as ButtonPrimitive } from "@base-ui/react/button"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "cn"

// The design system's pill button (.cx-btn in ds/styles): gold with ink text
// for the primary action (one per view), a hairline ghost for the second, a
// quiet one for chrome. Utilities in className still win over the kit.
const buttonVariants = cva(
  "cx-btn group/button aria-invalid:shadow-[inset_0_0_0_1px_var(--cx-loss-border)]",
  {
    variants: {
      variant: {
        default: "",
        outline: "cx-btn--ghost",
        secondary: "cx-btn--quiet bg-surface-2",
        ghost: "cx-btn--quiet",
        destructive: "cx-btn--danger",
        // Liquid glass, for controls over photos, video and colour.
        // aria-pressed toggles turn gold glass.
        glass: "cx-btn--glass",
        link: "h-auto bg-transparent p-0 text-ember-text underline-offset-4 hover:underline hover:shadow-none",
      },
      size: {
        default: "",
        xs: "cx-btn--sm",
        sm: "cx-btn--sm",
        lg: "cx-btn--lg",
        icon: "cx-btn--icon",
        "icon-xs": "cx-btn--icon cx-btn--sm",
        "icon-sm": "cx-btn--icon cx-btn--sm",
        "icon-lg": "cx-btn--icon cx-btn--lg",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

function Button({
  className,
  variant = "default",
  size = "default",
  ...props
}: ButtonPrimitive.Props & VariantProps<typeof buttonVariants>) {
  return (
    <ButtonPrimitive
      data-slot="button"
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  )
}

export { Button, buttonVariants }
