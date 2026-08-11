import './globals.css';
import { AuthProvider } from '../context/AuthContext';

export const metadata = {
  title: 'Todo App',
  description: 'A simple todo app',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-white font-sans text-gray-900">
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
