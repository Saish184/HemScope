import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "HemScope | Gothenburg property intelligence",
  description:
    "Describe the home you're looking for. HemScope helps you discover properties, understand their estimated monthly cost, and compare the trade-offs.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
