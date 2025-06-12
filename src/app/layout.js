import { Inter } from 'next/font/google';
import './globals.css';
import MDXProviderWrapper from '../components/MDXProvider.client';
import Header from '@/components/Header';

const inter = Inter({
  variable: '--font-inter',
  subsets: ['latin'],
});

export const metadata = {
  title: 'GSAP Components',
  description: 'A platform for GSAP animation components',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={`${inter.variable} antialiased`}>
        <Header />
        <MDXProviderWrapper>
          {children}
        </MDXProviderWrapper>
      </body>
    </html>
  );
}