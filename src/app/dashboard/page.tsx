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

        <div className="form-group" style={{ backgroundColor: "rgba(0,0,0,0.2)", padding: "1rem", borderRadius: "8px" }}>
          <h3 style={{ marginBottom: "0.5rem" }}>Session Info</h3>
          <pre style={{ overflowX: "auto", fontSize: "0.85rem", color: "var(--text-muted)" }}>
            {JSON.stringify(session, null, 2)}
          </pre>
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
