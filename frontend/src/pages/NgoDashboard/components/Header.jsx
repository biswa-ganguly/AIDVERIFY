import { useState, useRef, useEffect } from 'react';
import { useUser, SignOutButton } from '@clerk/clerk-react';
import { Link } from 'react-router-dom';
import { User, ChevronDown, LogOut } from 'lucide-react';
import { AnimatedThemeToggler } from '@/components/magicui/animated-theme-toggler';

export const Header = ({ activeView }) => {
  const { user } = useUser();
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const userMenuRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target)) {
        setIsUserMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <header className="sticky top-0 z-10 flex h-16 items-center justify-between border-b bg-background px-6">
      <h1 className="text-lg font-semibold capitalize">{activeView.replace('-', ' ')}</h1>
      
      <div className="flex items-center space-x-4">
        <div className="hidden lg:block text-sm text-gray-600 dark:text-gray-300">
          Welcome, {user?.firstName || "User"}!
        </div>

        {/* User Menu Dropdown */}
        <div className="relative" ref={userMenuRef}>
          <button
            onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
            className="flex items-center space-x-2 bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full px-3 py-2 transition-colors duration-200"
          >
            {user?.imageUrl ? (
              <img
                src={user.imageUrl}
                alt="Profile"
                className="w-8 h-8 rounded-full object-cover"
              />
            ) : (
              <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                <User className="w-4 h-4 text-white" />
              </div>
            )}
            <ChevronDown
              className={`w-4 h-4 text-gray-500 dark:text-gray-400 transition-transform duration-200 ${
                isUserMenuOpen ? "rotate-180" : ""
              }`}
            />
          </button>

          {/* User Dropdown Menu */}
          {isUserMenuOpen && (
            <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 py-2">
              {/* User Info */}
              <div className="px-4 py-3 border-b border-gray-100 dark:border-gray-700">
                <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                  {user?.fullName ||
                    `${user?.firstName} ${user?.lastName}`.trim()}
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-400 truncate">
                  {user?.primaryEmailAddress?.emailAddress}
                </p>
              </div>

              {/* Menu Items */}
              <div className="py-1">
                

                <div className="border-t border-gray-100 dark:border-gray-700 my-1"></div>

                <SignOutButton>
                  <button className="flex items-center w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-gray-700 transition-colors">
                    <LogOut className="w-4 h-4 mr-3" />
                    Sign Out
                  </button>
                </SignOutButton>
              </div>
            </div>
          )}
        </div>

        {/* Theme Toggler */}
        <AnimatedThemeToggler />
      </div>
    </header>
  );
};