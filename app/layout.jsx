import './globals.css';
import { AuthProvider } from '@/context/AuthContext';
import { QueryProvider } from '@/providers/QueryProvider';
import Navbar from '@/components/layout/Navbar';
import { Toaster } from 'react-hot-toast';

export const metadata = {
  title: 'NeighborMart - Hyperlocal Marketplace',
  description: 'Buy and sell products in your neighborhood',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <QueryProvider>
          <AuthProvider>
            <Navbar />
            <main className="min-h-[calc(100vh-4rem)]">{children}</main>
            <Toaster position="top-right" />
          </AuthProvider>
        </QueryProvider>
      </body>
    </html>
  );
}
