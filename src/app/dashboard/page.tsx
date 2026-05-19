import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import prisma from "@/lib/db";
import EmployeeDashboard from "@/components/EmployeeDashboard";
import ManagerDashboard from "@/components/ManagerDashboard";
import AdminDashboard from "@/components/AdminDashboard";

export default async function Dashboard() {
  const cookieStore = await cookies();
  const userId = cookieStore.get("userId")?.value;
  const role = cookieStore.get("userRole")?.value;

  if (!userId || !role) {
    redirect("/");
  }

  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: { team: true }
  });

  if (!user) {
    redirect("/");
  }

  return (
    <div className="container">
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ marginBottom: '0.5rem' }}>Welcome, {user.name}</h1>
        <p>Your Role: <span className="badge badge-success">{user.role}</span></p>
      </div>

      {role === "EMPLOYEE" && <EmployeeDashboard user={user} />}
      {role === "MANAGER" && <ManagerDashboard user={user} team={user.team} />}
      {role === "ADMIN" && <AdminDashboard user={user} />}
    </div>
  );
}
