import { useState, type ReactNode } from "react";
import { Link, useNavigate, useRouterState } from "@tanstack/react-router";
import {
  Bell,
  Boxes,
  Building2,
  ClipboardList,
  Cog,
  FileSearch,
  LayoutDashboard,
  LogOut,
  Menu,
  Package,
  Ruler,
  Search,
  Store,
  Truck,
  Users,
  Warehouse,
  Wallet,
  type LucideIcon,
} from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { ROLE_LABELS, useAuth } from "@/lib/auth";
import { cn } from "@/lib/utils";

interface NavItem {
  to: string;
  label: string;
  icon: LucideIcon;
  permission?: string;
  supremeOnly?: boolean;
}

const NAV_GROUPS: { heading: string; items: NavItem[] }[] = [
  {
    heading: "Overview",
    items: [
      { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
      { to: "/finance", label: "Finance", icon: Wallet, permission: "reports.view" },
      { to: "/audit", label: "Audit trail", icon: FileSearch, permission: "audit.view" },
    ],
  },
  {
    heading: "Inventory",
    items: [
      { to: "/inventory", label: "Items", icon: Package, permission: "inventory.view" },
      { to: "/stock", label: "Stock on hand", icon: Boxes, permission: "inventory.view" },
      { to: "/categories", label: "Categories", icon: ClipboardList, permission: "inventory.view" },
      { to: "/units", label: "Units of measure", icon: Ruler, permission: "inventory.view" },
      { to: "/suppliers", label: "Suppliers", icon: Truck, permission: "inventory.view" },
    ],
  },
  {
    heading: "Organization",
    items: [
      { to: "/stores", label: "Stores", icon: Store, permission: "inventory.view" },
      { to: "/departments", label: "Departments", icon: Warehouse, permission: "inventory.view" },
      { to: "/users", label: "Users", icon: Users, permission: "users.manage" },
      { to: "/settings", label: "Settings", icon: Cog },
    ],
  },
  {
    heading: "Platform",
    items: [
      { to: "/platform", label: "Platform overview", icon: LayoutDashboard, supremeOnly: true },
      { to: "/platform/organizations", label: "Organizations", icon: Building2, supremeOnly: true },
    ],
  },
];

function initials(name?: string | null, email?: string | null) {
  const source = name?.trim() || email || "U";
  return source
    .split(/[\s@.]+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase())
    .join("");
}

function NavLinks({ onNavigate }: { onNavigate?: () => void }) {
  const { can, isSupremeAdmin } = useAuth();
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  return (
    <nav className="flex flex-col gap-6 px-3 py-4">
      {NAV_GROUPS.map((group) => {
        const items = group.items.filter((item) => {
          if (item.supremeOnly) return isSupremeAdmin;
          if (isSupremeAdmin && group.heading !== "Platform") return false;
          if (!item.permission) return true;
          return can(item.permission);
        });
        if (!items.length) return null;
        return (
          <div key={group.heading}>
            <p className="px-3 pb-2 text-[0.68rem] font-semibold uppercase tracking-widest text-sidebar-foreground/55">
              {group.heading}
            </p>
            <ul className="space-y-0.5">
              {items.map((item) => {
                const active = pathname === item.to || pathname.startsWith(`${item.to}/`);
                return (
                  <li key={item.to}>
                    <Link
                      to={item.to}
                      onClick={onNavigate}
                      className={cn(
                        "flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors",
                        active
                          ? "bg-sidebar-accent font-medium text-sidebar-accent-foreground"
                          : "text-sidebar-foreground/80 hover:bg-sidebar-accent/60 hover:text-sidebar-accent-foreground",
                      )}
                    >
                      <item.icon className="size-4 shrink-0" aria-hidden />
                      <span className="truncate">{item.label}</span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        );
      })}
    </nav>
  );
}

function Brand() {
  return (
    <div className="flex items-center gap-2.5 px-5 py-4">
      <span className="flex size-8 items-center justify-center rounded-md bg-sidebar-primary text-sidebar-primary-foreground">
        <Boxes className="size-4.5" aria-hidden />
      </span>
      <div className="leading-tight">
        <p className="text-sm font-semibold text-sidebar-accent-foreground">StockFlow Africa</p>
        <p className="text-[0.65rem] uppercase tracking-widest text-sidebar-foreground/55">Stores control</p>
      </div>
    </div>
  );
}

export function AppShell({ children }: { children: ReactNode }) {
  const { profile, organization, roles, signOut, isSupremeAdmin } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleSignOut = async () => {
    await queryClient.cancelQueries();
    queryClient.clear();
    await signOut();
    void navigate({ to: "/auth", replace: true });
  };

  const contextLabel = isSupremeAdmin ? "Platform administration" : (organization?.name ?? "No organization");

  return (
    <div className="flex min-h-screen bg-background">
      <aside className="hidden w-64 shrink-0 flex-col border-r border-sidebar-border bg-sidebar lg:flex">
        <Brand />
        <div className="flex-1 overflow-y-auto">
          <NavLinks />
        </div>
        <div className="border-t border-sidebar-border px-5 py-3">
          <p className="truncate text-xs text-sidebar-foreground/60">{contextLabel}</p>
        </div>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-30 flex h-14 items-center gap-3 border-b border-border bg-card/95 px-4 backdrop-blur">
          <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="lg:hidden" aria-label="Open navigation">
                <Menu className="size-5" aria-hidden />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-72 border-sidebar-border bg-sidebar p-0">
              <SheetTitle className="sr-only">Navigation</SheetTitle>
              <Brand />
              <div className="overflow-y-auto">
                <NavLinks onNavigate={() => setMobileOpen(false)} />
              </div>
            </SheetContent>
          </Sheet>

          <div className="relative hidden max-w-sm flex-1 md:block">
            <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              disabled
              placeholder="Global search — coming soon"
              aria-label="Global search (coming soon)"
              className="pl-9"
            />
          </div>

          <div className="ml-auto flex items-center gap-1.5">
            <span className="hidden max-w-[16rem] truncate rounded-md bg-muted px-2.5 py-1 text-xs font-medium text-muted-foreground sm:inline">
              {contextLabel}
            </span>
            <Button variant="ghost" size="icon" disabled aria-label="Notifications (coming soon)">
              <Bell className="size-4.5" aria-hidden />
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" aria-label="Account menu">
                  <Avatar className="size-7">
                    <AvatarFallback className="bg-primary text-xs text-primary-foreground">
                      {initials(profile?.full_name, profile?.email)}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-60">
                <DropdownMenuLabel>
                  <p className="truncate text-sm font-medium">{profile?.full_name ?? profile?.email}</p>
                  <p className="truncate text-xs font-normal text-muted-foreground">
                    {roles.map((r) => ROLE_LABELS[r]).join(", ") || "No role assigned"}
                  </p>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link to="/settings">Settings</Link>
                </DropdownMenuItem>
                <DropdownMenuItem onSelect={() => void handleSignOut()}>
                  <LogOut className="size-4" aria-hidden /> Sign out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>

        <main className="flex-1 px-4 py-6 sm:px-6 lg:px-8">
          <div className="mx-auto w-full max-w-7xl">{children}</div>
        </main>
      </div>
    </div>
  );
}
