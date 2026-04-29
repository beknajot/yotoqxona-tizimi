"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { 
  Building2, 
  LayoutDashboard, 
  Users, 
  Settings, 
  LogOut, 
  Menu,
  X,
  CreditCard,
  BarChart3
} from "lucide-react";
import { Button } from "@/components/ui/button";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  
  const isAdmin = pathname.startsWith("/admin");

  const adminLinks = [
    { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
    { href: "/admin/students", label: "O'quvchilar", icon: Users },
    { href: "/admin/educators", label: "Tarbiyachilar", icon: Building2 },
    { href: "/admin/categories", label: "Kategoriyalar", icon: Settings },
    { href: "/admin/reports", label: "Hisobotlar", icon: BarChart3 },
    { href: "/dashboard/settings", label: "Sozlamalar", icon: Settings },
  ];

  const educatorLinks = [
    { href: "/dashboard", label: "Guruh paneli", icon: LayoutDashboard },
    { href: "/dashboard/students", label: "O'quvchilar ro'yxati", icon: Users },
    { href: "/dashboard/settings", label: "Sozlamalar", icon: Settings },
  ];

  const links = isAdmin ? adminLinks : educatorLinks;

  return (
    <div className="min-h-screen bg-muted/40 flex w-full">
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex w-64 flex-col fixed inset-y-0 z-50 bg-background border-r">
        <div className="h-16 flex items-center px-6 border-b">
          <Building2 className="w-6 h-6 text-primary mr-2" />
          <span className="font-bold text-lg">Yotoqxona Tizimi</span>
        </div>
        <div className="flex-1 py-6 px-4 space-y-2">
          {links.map((link) => {
            const Icon = link.icon;
            const isActive = pathname === link.href;
            return (
              <Link key={link.href} href={link.href} prefetch={true}>
                <span className={`flex items-center px-4 py-3 rounded-xl transition-all ${
                  isActive 
                  ? "bg-primary text-primary-foreground font-medium shadow-md shadow-primary/20" 
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
                }`}>
                  <Icon className="w-5 h-5 mr-3" />
                  {link.label}
                </span>
              </Link>
            );
          })}
        </div>
        <div className="p-4 border-t">
          <Button 
            variant="ghost" 
            className="w-full justify-start text-destructive hover:bg-destructive/10 hover:text-destructive"
            onClick={() => router.push("/login")}
          >
            <LogOut className="w-5 h-5 mr-3" />
            Tizimdan chiqish
          </Button>
        </div>
      </aside>

      {/* Mobile Drawer Overlay */}
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm md:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Mobile Sidebar */}
      <aside className={`fixed inset-y-0 left-0 z-50 w-64 bg-background border-r transform transition-transform duration-300 md:hidden ${
        isMobileMenuOpen ? "translate-x-0" : "-translate-x-full"
      }`}>
        <div className="h-16 flex items-center justify-between px-4 border-b">
          <div className="flex items-center">
            <Building2 className="w-6 h-6 text-primary mr-2" />
            <span className="font-bold">Yotoqxona</span>
          </div>
          <Button variant="ghost" size="icon" onClick={() => setIsMobileMenuOpen(false)}>
            <X className="w-5 h-5" />
          </Button>
        </div>
        <div className="py-4 px-3 space-y-1 flex-1">
          {links.map((link) => {
            const Icon = link.icon;
            const isActive = pathname === link.href;
            return (
              <Link key={link.href} href={link.href} prefetch={true} onClick={() => setIsMobileMenuOpen(false)}>
                <span className={`flex items-center px-3 py-3 rounded-lg ${
                  isActive ? "bg-primary text-primary-foreground" : "text-muted-foreground"
                }`}>
                  <Icon className="w-5 h-5 mr-3" />
                  {link.label}
                </span>
              </Link>
            );
          })}
        </div>
        <div className="p-4 border-t mt-auto absolute bottom-0 w-full bg-background">
          <Button 
            variant="ghost" 
            className="w-full justify-start text-destructive hover:bg-destructive/10 hover:text-destructive"
            onClick={() => {
              setIsMobileMenuOpen(false);
              router.push("/login");
            }}
          >
            <LogOut className="w-5 h-5 mr-3" />
            Tizimdan chiqish
          </Button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 md:ml-64 min-w-0">
        <header className="h-16 sticky top-0 z-30 bg-background/80 backdrop-blur-md border-b flex items-center px-4 md:px-8 justify-between">
          <Button 
            variant="ghost" 
            size="icon" 
            className="md:hidden -ml-2 text-muted-foreground hover:text-foreground"
            onClick={() => setIsMobileMenuOpen(true)}
          >
            <Menu className="w-6 h-6" />
          </Button>
          <div className="font-medium text-sm text-muted-foreground mr-auto md:ml-0 ml-4">
            {isAdmin ? "Admin Paneli" : "Tarbiyachi Paneli"}
          </div>
          <div className="flex items-center gap-3">
            <div className="text-right hidden sm:block">
              <div className="text-sm font-semibold">User</div>
              <div className="text-xs text-muted-foreground lowercase">{isAdmin ? "Admin" : "Tarbiyachi"}</div>
            </div>
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">
              {isAdmin ? "AD" : "TR"}
            </div>
          </div>
        </header>
        <div className="p-4 md:p-8 animate-in fade-in zoom-in duration-500">
          {children}
        </div>
      </main>
    </div>
  );
}
