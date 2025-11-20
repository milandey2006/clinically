import * as React from "react"
import { cn } from "@/lib/utils"

const DropdownMenu = ({ children }) => {
  const [open, setOpen] = React.useState(false)
  const containerRef = React.useRef(null)

  React.useEffect(() => {
    const handleClickOutside = (event) => {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setOpen(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  return (
    <div className="relative inline-block text-left" ref={containerRef}>
      {React.Children.map(children, (child) => {
        if (React.isValidElement(child)) {
          return React.cloneElement(child, { open, setOpen })
        }
        return child
      })}
    </div>
  )
}

const DropdownMenuTrigger = ({ children, asChild, open, setOpen, ...props }) => {
  const Comp = asChild ? Slot : "button" // Simplified: we don't have Slot, so just render children if asChild
  // Actually, if asChild is true, we should clone the child and add onClick.
  // Since we don't have Slot, let's just assume children is a single element if asChild is true.
  
  if (asChild && React.isValidElement(children)) {
    return React.cloneElement(children, {
      onClick: (e) => {
        children.props.onClick?.(e)
        setOpen(!open)
      },
      "data-state": open ? "open" : "closed",
      ...props
    })
  }

  return (
    <button
      onClick={() => setOpen(!open)}
      data-state={open ? "open" : "closed"}
      {...props}
    >
      {children}
    </button>
  )
}

const DropdownMenuContent = ({ className, align = "center", open, setOpen, ...props }) => {
  if (!open) return null

  const alignmentClasses = {
    start: "left-0",
    center: "left-1/2 -translate-x-1/2",
    end: "right-0",
  }

  return (
    <div
      className={cn(
        "absolute z-50 min-w-[8rem] overflow-hidden rounded-md border bg-popover p-1 text-popover-foreground shadow-md animate-in fade-in-0 zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 mt-2",
        alignmentClasses[align],
        className
      )}
      {...props}
    />
  )
}

const DropdownMenuItem = ({ className, inset, ...props }) => (
  <div
    className={cn(
      "relative flex cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50",
      inset && "pl-8",
      className
    )}
    {...props}
  />
)

const DropdownMenuLabel = ({ className, inset, ...props }) => (
  <div
    className={cn(
      "px-2 py-1.5 text-sm font-semibold",
      inset && "pl-8",
      className
    )}
    {...props}
  />
)

const DropdownMenuSeparator = ({ className, ...props }) => (
  <div
    className={cn("-mx-1 my-1 h-px bg-muted", className)}
    {...props}
  />
)

export {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
}
