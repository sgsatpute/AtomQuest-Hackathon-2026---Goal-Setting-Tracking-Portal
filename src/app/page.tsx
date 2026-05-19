import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import prisma from "@/lib/db";

export default async function Home() {
  const cookieStore = await cookies();
  const role = cookieStore.get("userRole");

  if (role) {
    redirect("/dashboard");
  }

  // Get users for quick login
  const users = await prisma.user.findMany({
    orderBy: { role: 'asc' }
  });

  return (
    <div className="auth-container">
      <div className="card auth-card">
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <h1 className="logo" style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>AtomQuest</h1>
          <p>Select a persona to enter the portal</p>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          {users.map((user: any) => (
            <form action="/api/auth/login" method="POST" key={user.id}>
              <input type="hidden" name="userId" value={user.id} />
              <button type="submit" className="role-btn">
                <div>
                  <div style={{ fontWeight: '600' }}>{user.name}</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                    {user.role} {user.managerId && '- Has Manager'}
                  </div>
                </div>
                <span>→</span>
              </button>
            </form>
          ))}

          {users.length === 0 && (
            <div style={{ textAlign: 'center', padding: '1rem', color: 'var(--warning)' }}>
              Database is empty. Please run the seed script.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
