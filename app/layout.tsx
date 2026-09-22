import type { Metadata } from 'next';
import './globals.css';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import WhatsAppButton from '@/components/WhatsAppButton';
import { CartProvider } from '@/lib/cart-context';
import { TIENDA } from '@/lib/utils';

export const metadata: Metadata = {
  title: `${TIENDA.nombre} — Ropa vintage y pre-owned en ${TIENDA.ciudad}`,
  description:
    'Ropa de segunda mano curada, vintage y multimarca para hombre y mujer. Piezas únicas con segunda vida, en buen estado y a precio justo.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es-MX">
      <body className="font-sans text-tinta antialiased">
        <CartProvider>
          <Header />
          <main className="min-h-screen">{children}</main>
          <Footer />
          <WhatsAppButton />
        </CartProvider>
      </body>
    </html>
  );
}
