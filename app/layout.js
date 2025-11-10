// app/layout.js
import './globals.css'; // Your global styles

export const metadata = {
  title: 'Prescription App Dashboard',
  description: 'Digital Prescription System for Doctors',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      {/* The <body> tag will contain all the content of your application */}
      <body>
        {children}
      </body>
    </html>
  );
}