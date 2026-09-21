import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "FORM | Train with intention",
  description: "A focused home for structured training and measurable progress.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
