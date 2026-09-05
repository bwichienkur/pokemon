"use client";

import * as React from "react";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { X } from "lucide-react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const Sheet = DialogPrimitive.Root;
const SheetTrigger = DialogPrimitive.Trigger;
const SheetClose = DialogPrimitive.Close;
const SheetPortal = DialogPrimitive.Portal;
const SheetOverlay = React.forwardRef<React.ElementRef<typeof DialogPrimitive.Overlay>, React.ComponentPropsWithoutRef<typeof DialogPrimitive.Overlay>>(({ className, ...props }, ref) => <DialogPrimitive.Overlay ref={ref} className={cn("fixed inset-0 z-50 bg-black/70 backdrop-blur-sm", className)} {...props} />);
const sheetVariants = cva("fixed z-50 grid gap-4 border-border bg-popover p-6 shadow-2xl transition ease-in-out focus:outline-none", { variants: { side: { top: "inset-x-0 top-0 border-b", bottom: "inset-x-0 bottom-0 border-t", left: "inset-y-0 left-0 h-full w-3/4 border-r sm:max-w-sm", right: "inset-y-0 right-0 h-full w-3/4 border-l sm:max-w-sm" } }, defaultVariants: { side: "right" } });
const SheetContent = React.forwardRef<React.ElementRef<typeof DialogPrimitive.Content>, React.ComponentPropsWithoutRef<typeof DialogPrimitive.Content> & VariantProps<typeof sheetVariants>>(({ side = "right", className, children, ...props }, ref) => <SheetPortal><SheetOverlay /><DialogPrimitive.Content ref={ref} className={cn(sheetVariants({ side }), className)} {...props}>{children}<DialogPrimitive.Close className="absolute top-4 right-4 rounded-sm text-muted-foreground opacity-70 hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring"><X className="size-4" /><span className="sr-only">Close</span></DialogPrimitive.Close></DialogPrimitive.Content></SheetPortal>);
const SheetHeader = ({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) => <div className={cn("flex flex-col space-y-2 text-center sm:text-left", className)} {...props} />;
const SheetFooter = ({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) => <div className={cn("mt-auto flex flex-col-reverse gap-2 sm:flex-row sm:justify-end", className)} {...props} />;
const SheetTitle = React.forwardRef<React.ElementRef<typeof DialogPrimitive.Title>, React.ComponentPropsWithoutRef<typeof DialogPrimitive.Title>>(({ className, ...props }, ref) => <DialogPrimitive.Title ref={ref} className={cn("font-display text-2xl font-semibold", className)} {...props} />);
const SheetDescription = React.forwardRef<React.ElementRef<typeof DialogPrimitive.Description>, React.ComponentPropsWithoutRef<typeof DialogPrimitive.Description>>(({ className, ...props }, ref) => <DialogPrimitive.Description ref={ref} className={cn("text-sm text-muted-foreground", className)} {...props} />);

SheetOverlay.displayName = "SheetOverlay";
SheetContent.displayName = "SheetContent";
SheetTitle.displayName = "SheetTitle";
SheetDescription.displayName = "SheetDescription";
export { Sheet, SheetClose, SheetContent, SheetDescription, SheetFooter, SheetHeader, SheetOverlay, SheetPortal, SheetTitle, SheetTrigger };
