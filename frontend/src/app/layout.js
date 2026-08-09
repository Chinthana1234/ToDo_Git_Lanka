import './globals.css';
import { AuthProvider } from '../context/AuthContext';

export const metadata = {
  title: 'Todo App',
  description: 'A simple todo app',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
