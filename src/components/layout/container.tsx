import * as React from "react";

import { cn } from "@/lib/utils";

interface ContainerProps extends React.HTMLAttributes<HTMLDivElement> {
  as?: "div" | "section" | "main";
}

export function Container({ as: Component = "div", className, ...props }: ContainerProps) {
  return <Component className={cn("mx-auto w-full max-w-7xl px-5 sm:px-8 lg:px-12", className)} {...props} />;
}
