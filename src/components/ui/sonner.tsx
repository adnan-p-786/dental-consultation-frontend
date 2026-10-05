import React from "react"
import { Toaster as Sonner, toast } from "sonner"

type ToasterProps = React.ComponentProps<typeof Sonner>

const Toaster = ({ position = "top-center", ...props }: ToasterProps) => {
  return (
    <Sonner
      className="toaster group"
      position={position}
      style={
        {
          "--normal-bg": "#FAF7F6",
          "--normal-text": "#261B1A",
          "--normal-border": "#E8DCD8",
          "--success-bg": "#FAF2F0",
          "--success-text": "#5E3E3B",
          "--success-border": "#E8CDC9",
          "--error-bg": "#FDF2F0",
          "--error-text": "#B4483A",
          "--error-border": "#F4D1CB",
          "--warning-bg": "#FDF8F2",
          "--warning-text": "#925418",
          "--warning-border": "#F4E3C8",
          "--info-bg": "#FAF2F0",
          "--info-text": "#5E3E3B",
          "--info-border": "#E8CDC9",
        } as React.CSSProperties
      }
      toastOptions={{
        classNames: {
          toast:
            "group toast group-[.toaster]:bg-[#FAF7F6] group-[.toaster]:text-[#261B1A] group-[.toaster]:border-[#E8DCD8] group-[.toaster]:shadow-lg group-[.toaster]:shadow-black/5 group-[.toaster]:rounded-2xl group-[.toaster]:px-4 group-[.toaster]:py-3.5 group-[.toaster]:font-sans group-[.toaster]:border",
          title:
            "group-[.toast]:font-semibold group-[.toast]:text-xs group-[.toast]:text-inherit",
          description:
            "group-[.toast]:text-[11.5px] group-[.toast]:text-[#635351] group-[.toast]:mt-0.5",
          actionButton:
            "group-[.toast]:bg-[#5E3E3B] group-[.toast]:text-white group-[.toast]:hover:bg-[#262525] group-[.toast]:rounded-xl group-[.toast]:text-xs group-[.toast]:font-semibold group-[.toast]:transition-colors",
          cancelButton:
            "group-[.toast]:bg-[#F4ECE9] group-[.toast]:text-[#635351] group-[.toast]:rounded-xl group-[.toast]:text-xs",
          success:
            "!bg-[#FAF2F0] !text-[#5E3E3B] !border-[#E8CDC9] [&_[data-icon]]:!text-[#5E3E3B] [&_[data-title]]:!text-[#5E3E3B]",
          error:
            "!bg-[#FDF2F0] !text-[#B4483A] !border-[#F4D1CB] [&_[data-icon]]:!text-[#B4483A] [&_[data-title]]:!text-[#B4483A]",
          info:
            "!bg-[#FAF2F0] !text-[#5E3E3B] !border-[#E8CDC9] [&_[data-icon]]:!text-[#5E3E3B] [&_[data-title]]:!text-[#5E3E3B]",
          warning:
            "!bg-[#FDF8F2] !text-[#925418] !border-[#F4E3C8] [&_[data-icon]]:!text-[#925418] [&_[data-title]]:!text-[#925418]",
        },
      }}
      {...props}
    />
  )
}

export { Toaster, toast }
