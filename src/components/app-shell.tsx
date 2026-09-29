import {
  BarChart3,
  Dumbbell,
  History,
  LayoutDashboard,
  LogOut,
  Search,
  Settings,
} from "lucide-react";
import Link from "next/link";
import { getCurrentUser } from "@/lib/session";

const navigation = [
  { label: "Overview", href: "/dashboard", icon: LayoutDashboard },
  { label: "Workouts", href: "/workouts", icon: Dumbbell },
  { label: "Exercises", href: "/exercises", icon: Search },
  { label: "Progress", href: "/progress", icon: BarChart3 },
  { label: "History", href: "/history", icon: History },
];

export async function AppShell({ children }: { children: React.ReactNode }) {
  const user = await getCurrentUser();
  const displayName = user?.name?.trim() || "there";
  const initials = user?.name?.trim().split(/\s+/).map((part) => part[0]).join("").slice(0, 2).toUpperCase() || "?";

  return (
    <div className="app-shell">
      <aside className="sidebar" aria-label="Primary navigation">
        <Link className="brand" href="/" aria-label="Form home">
          <span className="brand-mark">F</span>
          <span>FORM</span>
        </Link>

        <div className="sidebar-section">
          <p className="eyebrow sidebar-label">Workspace</p>
          <nav className="nav-list">
            {navigation.map(({ label, href, icon: Icon }) => (
              <Link
                className={`nav-link ${label === "Overview" ? "active" : ""}`}
                href={href}
                key={label}
              >
                <Icon size={18} strokeWidth={1.8} aria-hidden="true" />
                <span>{label}</span>
              </Link>
            ))}
          </nav>
        </div>

        <div className="sidebar-footer">
          <Link className="nav-link" href="/settings">
            <Settings size={18} strokeWidth={1.8} aria-hidden="true" />
            <span>Settings</span>
          </Link>
          <div className="profile-chip">
                  {user?.avatarUrl ? <img className="avatar avatar-image" src={user.avatarUrl} alt="" /> : <div className="avatar" aria-hidden="true">{initials}</div>}
            <div>
              <strong>{displayName}</strong>
              <span>{user?.role === "ADMIN" ? "Admin" : "Member"}</span>
            </div>
          </div>
          <form action="/api/auth/logout" method="post">
            <button className="nav-link logout-button" type="submit">
              <LogOut size={18} strokeWidth={1.8} aria-hidden="true" />
              <span>Log out</span>
            </button>
          </form>
        </div>
      </aside>

      <main className="main-content">
        <header className="topbar">
          <div className="mobile-brand brand">
            <span className="brand-mark">F</span>
            <span>FORM</span>
          </div>
          <div className="topbar-actions">
            <Link className="icon-button" href="/exercises" aria-label="Search exercises">
              <Search size={19} strokeWidth={1.8} aria-hidden="true" />
            </Link>
            <Link className="avatar avatar-link" href="/profile" aria-label="Open profile">{user?.avatarUrl ? <img className="avatar avatar-image" src={user.avatarUrl} alt="" /> : initials}</Link>
          </div>
        </header>
        <div className="page-container">{children}</div>
      </main>

      <nav className="mobile-nav" aria-label="Mobile navigation">
        {navigation.slice(0, 4).map(({ label, href, icon: Icon }) => (
          <Link className={`mobile-nav-link ${label === "Overview" ? "active" : ""}`} href={href} key={label}>
            <Icon size={20} strokeWidth={1.8} aria-hidden="true" />
            <span>{label}</span>
          </Link>
        ))}
        <form action="/api/auth/logout" method="post">
          <button className="mobile-nav-link logout-button" type="submit">
            <LogOut size={20} strokeWidth={1.8} aria-hidden="true" />
            <span>Log out</span>
          </button>
        </form>
      </nav>
    </div>
  );
}
