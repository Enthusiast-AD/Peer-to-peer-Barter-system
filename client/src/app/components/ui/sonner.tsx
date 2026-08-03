"use client";

import { useTheme } from "next-themes";
import { Toaster as Sonner, ToasterProps } from "sonner";
import * as React from "react";

const Toaster = ({ ...props }: ToasterProps) => {
  const { theme = "system" } = useTheme();

  return (
    <Sonner
      theme={theme as ToasterProps["theme"]}
      className="toaster group"
      position="top-right"
      gap={8}
      toastOptions={{
        unstyled: true,
        classNames: {
          toast: "group/toast !w-full !flex !items-start !gap-3 !rounded-xl !px-4 !py-3 !font-sans !text-sm !shadow-[0_12px_40px_-8px_rgba(0,0,0,0.6)] !border",
          title: "!font-medium !text-[13.5px] !leading-snug",
          description: "!text-[12.5px] !leading-snug !text-muted-foreground !mt-0.5",
          icon: "!shrink-0 !mt-0.5",
          closeButton: "group/toast-close",
        },
      }}
      closeButton
      richColors={false}
      style={
        {
          "--normal-bg": "oklch(0.2 0.005 260)",
          "--normal-text": "oklch(0.96 0.003 260)",
          "--normal-border": "oklch(0.31 0.006 260)",
          "--success-bg": "oklch(0.22 0.06 165)",
          "--success-border": "oklch(0.45 0.12 165)",
          "--error-bg": "oklch(0.22 0.07 25)",
          "--error-border": "oklch(0.45 0.15 25)",
          "--info-bg": "oklch(0.22 0.04 250)",
          "--info-border": "oklch(0.42 0.1 250)",
        } as React.CSSProperties
      }
      {...props}
    />
  );
};

export { Toaster };
