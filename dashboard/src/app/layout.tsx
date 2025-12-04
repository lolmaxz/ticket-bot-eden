import type { Metadata } from 'next';
import { SessionProvider } from '@/components/providers/SessionProvider';
import { QueryProvider } from '@/components/providers/QueryProvider';
import { ThemeProvider } from '@/components/providers/ThemeProvider';
import './globals.css';

export const metadata: Metadata = {
  title: 'Eden Ticket Portal',
  description: 'Ticket Management Dashboard for The Eden Apis Discord Server',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}): JSX.Element {
  return (
    <html lang="en" suppressHydrationWarning className="dark">
      <body>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                const savedTheme = localStorage.getItem('theme');
                if (savedTheme === 'dark' || (!savedTheme)) {
                  document.documentElement.classList.add('dark');
                } else {
                  document.documentElement.classList.remove('dark');
                }
              })();
            `,
          }}
        />
        <ThemeProvider>
          <SessionProvider>
            <QueryProvider>{children}</QueryProvider>
          </SessionProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
