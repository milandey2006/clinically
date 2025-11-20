// app/layout.js
import { ClerkProvider } from '@clerk/nextjs';
import { ThemeProvider } from '@/components/ThemeProvider';
import './globals.css'; // Your global styles

export const metadata = {
  title: 'Prescription App Dashboard',
  description: 'Digital Prescription System for Doctors',
};

export default function RootLayout({ children }) {
  return (
    <ClerkProvider>
      <html lang="en" suppressHydrationWarning>
        {/* The <body> tag will contain all the content of your application */}
        <body>
          <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
          >
            {children}
          </ThemeProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}