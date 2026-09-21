import {
  BarChart3,
  Dumbbell,
  History,
  LayoutDashboard,
  Search,
  Settings,
} from "lucide-react";
import Link from "next/link";

const navigation = [
  { label: "Overview", href: "/dashboard", icon: LayoutDashboard },
  { label: "Workouts", href: "/workouts", icon: Dumbbell },
  { label: "Exercises", href: "/exercises", icon: Search },
  { label: "Progress", href: "/progress", icon: BarChart3 },
  { label: "History", href: "/history", icon: History },
];

export function AppShell({ children }: { children: React.ReactNode }) {
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
            <div className="avatar" aria-hidden="true">AM</div>
            <div>
              <strong>Alex Morgan</strong>
              <span>Member</span>
            </div>
          </div>
        </div>
      </aside>

      <main className="main-content">
        <header className="topbar">
          <div className="mobile-brand brand">
            <span className="brand-mark">F</span>
            <span>FORM</span>
          </div>
          <div className="topbar-actions">
            <button className="icon-button" type="button" aria-label="Search">
              <Search size={19} strokeWidth={1.8} aria-hidden="true" />
            </button>
            <Link className="avatar avatar-link" href="/profile" aria-label="Open profile">AM</Link>
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
      </nav>
    </div>
  );
}
