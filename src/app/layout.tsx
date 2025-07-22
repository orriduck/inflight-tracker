import "./globals.css";
import { Toaster } from "sonner";
import { ThemeProvider } from "./providers";

export const metadata = {
  title: "Inflight Tracker",
  description: "Track your flight in real-time",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
      </head>
      <body>
        <ThemeProvider>
          <div className="mt-4 px-4">
            {children}
          </div>
          <Toaster position="top-right" />
        </ThemeProvider>
      </body>
    </html>
  );
}
