"use client";

import { NextUIProvider } from "@nextui-org/react";
import { ClerkProvider } from "@clerk/nextjs";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ClerkProvider
      appearance={{
        layout: {
          socialButtonsPlacement: "bottom",
          socialButtonsVariant: "iconButton",
          termsPageUrl: "https://clerk.com/terms",
          privacyPageUrl: "https://clerk.com/privacy",
        },
        elements: {
          formButtonPrimary: 
            "bg-black hover:bg-gray-900 text-sm font-medium text-white normal-case",
          footerActionLink: "text-black hover:text-gray-900",
          card: "shadow-none border border-gray-200",
          formFieldInput: 
            "border-gray-200 focus:border-black focus:ring-black",
          dividerLine: "bg-gray-200",
          dividerText: "text-gray-400 text-sm",
          socialButtonsBlockButton: 
            "border-gray-200 hover:bg-gray-50 text-gray-600 hover:text-gray-900",
          socialButtonsBlockButtonText: "font-medium",
          headerTitle: "text-gray-900 font-display text-2xl",
          headerSubtitle: "text-gray-600",
          formFieldLabel: "text-gray-600 font-medium",
          identityPreviewText: "text-gray-600",
          identityPreviewEditButtonIcon: "text-gray-600",
        },
      }}
    >
      <NextUIProvider>
        {children}
      </NextUIProvider>
    </ClerkProvider>
  );
} 