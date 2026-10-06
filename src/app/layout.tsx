import type { Metadata, Viewport } from "next";
import "./globals.css";

export const viewport: Viewport = {
  themeColor: "#172321",
};

export const metadata: Metadata = {
  title: "FORM | Train with intention",
  description: "A focused home for structured training and measurable progress.",
  manifest: "/manifest.webmanifest",
  icons: [
    { rel: "icon", url: "/form-icon.svg", type: "image/svg+xml" },
    { rel: "apple-touch-icon", url: "/icon-192.png" },
  ],
  appleWebApp: {
    capable: true,
    title: "FORM",
    statusBarStyle: "default",
  },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
