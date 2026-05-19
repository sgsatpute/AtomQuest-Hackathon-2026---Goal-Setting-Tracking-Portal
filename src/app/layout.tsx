import type { Metadata } from "next";
import "./globals.css";
import Link from "next/link";
import { cookies } from "next/headers";

export const metadata: Metadata = {
  title: "AtomQuest - Goal Setting Portal",
  description: "In-House Goal Setting & Tracking Portal",
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const cookieStore = await cookies();
  const role = cookieStore.get("userRole")?.value || null;
  const userName = cookieStore.get("userName")?.value || null;

  return (
    <html lang="en">
      <body>
        <div className="page-wrapper">
          {role && (
            <nav className="navbar">
              <div className="container nav-container">
                <Link href="/dashboard" className="logo">
                  AtomQuest
                </Link>
                <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                  <span className="badge badge-primary">{role}</span>
                  <span style={{ fontSize: '0.875rem' }}>{userName}</span>
                  <form action="/api/auth/logout" method="POST">
                    <button type="submit" className="btn btn-secondary" style={{ padding: '0.25rem 0.75rem', fontSize: '0.75rem' }}>
                      Logout
                    </button>
                  </form>
                </div>
              </div>
            </nav>
          )}
          <main style={{ flex: 1, padding: role ? '2rem 0' : '0' }}>
            {children}
          </main>
        </div>
      </body>
    </html>
  );
}
