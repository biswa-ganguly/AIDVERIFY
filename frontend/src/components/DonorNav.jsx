import React, { useState, useRef, useEffect } from "react";
import { Link } from "react-router-dom";
import { useUser, SignOutButton } from "@clerk/clerk-react";
import { Menu, X, ChevronDown, User, LogOut } from "lucide-react";
import { AnimatedThemeToggler } from "@/components/magicui/animated-theme-toggler";

const DonorNav = () => {
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const { user, isSignedIn, isLoaded } = useUser();
  const userMenuRef = useRef(null);

  // Close user menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target)) {
        setIsUserMenuOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  if (!isLoaded) return null;

  return (
    <nav className="bg-white dark:bg-gray-900 shadow-lg sticky top-0 z-50 border-b border-gray-200 dark:border-gray-700 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2">
            <div className="text-2xl font-bold text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-colors">
              AidVerify
            </div>
          </Link>

          {/* Desktop Navigation */}
          {isSignedIn && (
            <div className="hidden md:flex items-center space-x-8">
              {/* Navigation Links */}
              <div className="flex items-center space-x-6">
                
                <Link to="/campaign" className="text-gray-700 dark:text-gray-200 hover:text-blue-600 dark:hover:text-blue-400 transition-colors font-medium">
                  Campaigns
                </Link>
                
                <Link to="/crowdfunding" className="text-gray-700 dark:text-gray-200 hover:text-blue-600 dark:hover:text-blue-400 transition-colors font-medium">
                  Crowdfunding
                </Link>
                
                <Link to={`/dashboard/${user?.id || ''}`} className="text-gray-700 dark:text-gray-200 hover:text-blue-600 dark:hover:text-blue-400 transition-colors font-medium">
                  Dashboard
                </Link>
              </div>
              
              {/* Welcome Message & User Menu */}
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
                        <Link
                          to={`/dashboard/${user?.id || ''}`}
                          className="flex items-center px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                          onClick={() => setIsUserMenuOpen(false)}
                        >
                          <User className="w-4 h-4 mr-3" />
                          View Profile
                        </Link>

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
            </div>
          )}

          {/* Mobile menu button */}
          {isSignedIn && (
            <div className="md:hidden flex items-center space-x-3">
              <div className="text-sm text-gray-600 dark:text-gray-300">
                Hi, {user?.firstName || "User"}!
              </div>
              <button
                onClick={() => setIsMobileOpen(!isMobileOpen)}
                className="text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors"
              >
                {isMobileOpen ? <X size={24} /> : <Menu size={24} />}
              </button>
            </div>
          )}
        </div>

        {/* Mobile Navigation Menu */}
        {isSignedIn && isMobileOpen && (
          <div className="md:hidden border-t border-gray-200 dark:border-gray-700">
            <div className="px-2 pt-2 pb-3 space-y-1 bg-gray-50 dark:bg-gray-800">
              {/* User Info */}
              <div className="flex items-center space-x-3 px-3 py-3 bg-white dark:bg-gray-900 rounded-lg mb-3">
                {user?.imageUrl ? (
                  <img
                    src={user.imageUrl}
                    alt="Profile"
                    className="w-10 h-10 rounded-full object-cover"
                  />
                ) : (
                  <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center">
                    <User className="w-5 h-5 text-white" />
                  </div>
                )}
                <div>
                  <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                    {user?.fullName ||
                      `${user?.firstName} ${user?.lastName}`.trim()}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                    {user?.primaryEmailAddress?.emailAddress}
                  </p>
                </div>
              </div>

              {/* Mobile Menu Actions */}
              <div className="border-t border-gray-200 dark:border-gray-700 pt-3 mt-3">
                <Link
                  to={`/dashboard/${user?.id || ''}`}
                  className="flex items-center px-3 py-2 text-base font-medium text-gray-700 dark:text-gray-200 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-white dark:hover:bg-gray-700 rounded-md transition-colors"
                  onClick={() => setIsMobileOpen(false)}
                >
                  <User className="w-5 h-5 mr-3" />
                  View Profile
                </Link>

                <SignOutButton>
                  <button className="flex items-center w-full px-3 py-2 text-base font-medium text-red-600 hover:bg-red-50 dark:hover:bg-gray-700 rounded-md transition-colors mt-1">
                    <LogOut className="w-5 h-5 mr-3" />
                    Sign Out
                  </button>
                </SignOutButton>
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default DonorNav;
