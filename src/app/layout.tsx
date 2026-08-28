import type { Metadata } from "next";
import "./globals.css";
import Providers from "providers/Providers";

export const metadata: Metadata = {
  title: "Trading Journal — Admin",
  description: "Trading Journal Admin Panel",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
