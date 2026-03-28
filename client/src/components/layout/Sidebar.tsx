import { NavLink, useNavigate } from "react-router-dom";
import {
  Target,
  FileText,
  FileEdit,
  Briefcase,
  Settings,
  LogOut,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuthStore } from "@/services/authStore";

const navItems = [
  { to: "/dashboard/job-pool", label: "Job Pool", icon: Briefcase },
  { to: "/dashboard/job-matcher", label: "Job Matcher", icon: Target },
  {
    to: "/dashboard/letter-architect",
    label: "Letter Architect",
    icon: FileText,
  },
  {
    to: "/dashboard/smart-pdf-editor",
    label: "Smart PDF Editor",
    icon: FileEdit,
  },
  { to: "/dashboard/settings", label: "Settings", icon: Settings },
];

export function Sidebar() {
  const navigate = useNavigate();
  const logout = useAuthStore((state) => state.logout);

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  return (
    <aside className="flex flex-col w-64 min-h-screen border-r border-border bg-sidebar">
      <div className="p-6">
        <h1 className="text-xl font-semibold text-sidebar-foreground">
          Recruiter First
        </h1>
      </div>

      <nav className="flex-1 px-3">
        <ul className="space-y-1">
          {navItems.map((item) => (
            <li key={item.to}>
              <NavLink
                to={item.to}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                    isActive
                      ? "bg-sidebar-accent text-sidebar-accent-foreground"
                      : "text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground"
                  }`
                }
              >
                <item.icon className="w-5 h-5" />
                {item.label}
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>

      <div className="p-3 border-t border-sidebar-border">
        <Button
          variant="ghost"
          className="w-full justify-start gap-3 text-sidebar-foreground/70 hover:text-sidebar-foreground hover:bg-sidebar-accent/50"
          onClick={handleLogout}
        >
          <LogOut className="w-5 h-5" />
          Log Out
        </Button>
      </div>
    </aside>
  );
}
