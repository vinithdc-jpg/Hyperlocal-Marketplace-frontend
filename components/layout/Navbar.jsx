'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useThemeStore } from '@/store/useStore';
import { useQuery } from '@tanstack/react-query';
import { notificationService } from '@/services/api';
import {
  Home, Store, Heart, MessageCircle, Bell, User, LogOut, Moon, Sun, LayoutDashboard, Shield,
} from 'lucide-react';
import Button from '@/components/ui/Button';

export default function Navbar() {
  const { isAuthenticated, user, logout } = useAuth();
  const router = useRouter();
  const { dark, toggle, init } = useThemeStore();

  const { data: notifData } = useQuery({
    queryKey: ['notifications'],
    queryFn: () => notificationService.getAll().then((r) => r.data),
    enabled: isAuthenticated,
    refetchInterval: 30000,
  });

  useEffect(() => { init(); }, [init]);

  const handleLogout = () => {
    logout();
    router.push('/');
  };

  const unread = notifData?.unreadCount || 0;

  return (
    <nav className="sticky top-0 z-50 bg-card/95 backdrop-blur border-b border-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <Link href="/" className="flex items-center gap-2">
            <Store className="w-6 h-6 text-primary" />
            <span className="font-bold text-xl">NeighborMart</span>
          </Link>

          <div className="hidden md:flex items-center gap-1">
            <NavLink href="/" icon={Home}>Home</NavLink>
            <NavLink href="/marketplace" icon={Store}>Marketplace</NavLink>
            {isAuthenticated && (
              <>
                <NavLink href="/dashboard" icon={LayoutDashboard}>Dashboard</NavLink>
                <NavLink href="/wishlist" icon={Heart}>Wishlist</NavLink>
                <NavLink href="/chat" icon={MessageCircle}>Chat</NavLink>
                {user?.role === 'admin' && <NavLink href="/admin" icon={Shield}>Admin</NavLink>}
              </>
            )}
          </div>

          <div className="flex items-center gap-2">
            <button onClick={toggle} className="p-2 rounded-lg hover:bg-background transition" aria-label="Toggle theme">
              {dark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>

            {isAuthenticated ? (
              <>
                <Link href="/notifications" className="relative p-2 rounded-lg hover:bg-background transition">
                  <Bell className="w-5 h-5" />
                  {unread > 0 && (
                    <span className="absolute -top-0.5 -right-0.5 bg-red-500 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center">
                      {unread > 9 ? '9+' : unread}
                    </span>
                  )}
                </Link>
                <Link href="/profile" className="hidden sm:flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-background transition">
                  <User className="w-4 h-4" />
                  {user?.name}
                </Link>
                <Button variant="ghost" size="sm" onClick={handleLogout}>
                  <LogOut className="w-4 h-4" />
                </Button>
              </>
            ) : (
              <>
                <Link href="/login"><Button variant="ghost" size="sm">Login</Button></Link>
                <Link href="/register"><Button size="sm">Register</Button></Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}

function NavLink({ href, icon: Icon, children }) {
  return (
    <Link href={href} className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm hover:bg-background transition">
      <Icon className="w-4 h-4" />
      {children}
    </Link>
  );
}
