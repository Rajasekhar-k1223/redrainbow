import { Shield, Activity, Lock, Layers, Terminal, Network, Radio, Settings, LogOut, User as UserIcon } from "lucide-react";
import { NavLink } from "@/components/NavLink";
import { useLocation, Link, useNavigate } from "react-router-dom";
import { LanguageSelector } from "./LanguageSelector";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarFooter,
  useSidebar,
} from "@/components/ui/sidebar";

const mainItems = [
  { title: "Overview", url: "/dashboard", icon: Activity },
  { title: "Target Pipeline", url: "/dashboard/missions", icon: Layers },
  { title: "Signal Mesh", url: "/dashboard/signals", icon: Radio },
  { title: "Evidence Vault", url: "/dashboard/vault", icon: Lock },
  { title: "Constellation", url: "/dashboard/constellation", icon: Network },
  { title: "Terminal", url: "/dashboard/terminal", icon: Terminal },
];

export function DashboardSidebar() {
  const { state } = useSidebar();
  const collapsed = state === "collapsed";
  const location = useLocation();
  const navigate = useNavigate();
  const isActive = (path: string) => location.pathname === path;

  const handleLogout = () => {
    localStorage.removeItem("redrainbow_token");
    navigate("/login", { replace: true });
  };

  return (
    <Sidebar collapsible="icon" className="border-r border-border/50 bg-sidebar">
      <div className="p-4 border-b border-border/50">
        <Link to="/" className="flex items-center gap-2">
          <Shield className="h-6 w-6 text-primary flex-shrink-0" />
          {!collapsed && (
            <span className="font-mono font-bold text-sm tracking-wider text-foreground">
              RRC<span className="text-primary">Layer</span>
            </span>
          )}
        </Link>
      </div>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel className="font-mono text-xs text-muted-foreground tracking-widest">
            {!collapsed && "OPERATIONS"}
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {mainItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink
                      to={item.url}
                      end={item.url === "/dashboard"}
                      className="hover:bg-muted/50 font-mono text-sm"
                      activeClassName="bg-primary/10 text-primary border-l-2 border-primary"
                    >
                      <item.icon className="mr-2 h-4 w-4 flex-shrink-0" />
                      {!collapsed && <span>{item.title}</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="border-t border-border/50 p-4 space-y-4">
        {!collapsed && (
          <div className="space-y-2">
            <span className="font-mono text-[9px] text-muted-foreground uppercase tracking-widest block px-1">Global Context</span>
            <LanguageSelector />
          </div>
        )}
        <div className="flex items-center gap-2 px-1">
          <span className="h-1.5 w-1.5 rounded-full bg-glow-green animate-pulse" />
          {!collapsed && <span className="font-mono text-[10px] text-muted-foreground uppercase tracking-tighter">Systems Nominal</span>}
        </div>
        {!collapsed && (
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 mt-2 w-full font-mono text-[10px] uppercase tracking-widest text-muted-foreground hover:text-destructive transition-colors text-left px-1"
          >
            <LogOut className="h-3 w-3" />
            <span>Terminate Session</span>
          </button>
        )}
      </SidebarFooter>
    </Sidebar>
  );
}
