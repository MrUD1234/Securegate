import { auth } from "@/auth";
import { logout } from "@/actions/logout";

export default async function DashboardPage() {
  const session = await auth();

  return (
    <main className="auth-wrapper">
      <div className="auth-card" style={{ maxWidth: "600px" }}>
        <div className="auth-header">
          <h1 className="auth-title">Dashboard</h1>
          <p className="auth-subtitle">Welcome back, {session?.user?.name || session?.user?.email}</p>
        </div>

        <form action={logout}>
          <button type="submit" className="btn-primary" style={{ backgroundColor: "var(--error-color)" }}>
            Logout
          </button>
        </form>
      </div>
    </main>
  );
}
