import { useState, useEffect } from 'react';
import { Search, Bell } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { AnimatedThemeToggler } from "@/components/magicui/animated-theme-toggler";
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuItem } from '@/components/ui/dropdown-menu';

export const Header = () => {
  const [pendingCount, setPendingCount] = useState(0);

  useEffect(() => {
    const fetchPendingCount = async () => {
      try {
        const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/ngo/pendingApplications`);
        const data = response.ok ? await response.json() : [];
        setPendingCount(Array.isArray(data) ? data.length : 0);
      } catch (error) {
        console.error('Error fetching pending count:', error);
      }
    };

    fetchPendingCount();
    const interval = setInterval(fetchPendingCount, 30000); // Check every 30 seconds
    return () => clearInterval(interval);
  }, []);

  return (
    <header className="sticky top-0 z-10 flex h-16 items-center justify-between border-b bg-background px-6">
      <h1 className="text-lg font-semibold capitalize">Admin Dashboard</h1>
      <div className="flex items-center gap-4">
        <div className="relative">
          <AnimatedThemeToggler />
        </div>
      </div>
    </header>
  );
};
