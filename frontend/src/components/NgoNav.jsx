import React, { useState, useRef, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useUser, SignOutButton } from "@clerk/clerk-react";
import { Menu, X, ChevronDown, User, LogOut, UserCircle } from "lucide-react";
import { AnimatedThemeToggler } from "@/components/magicui/animated-theme-toggler";
import { toast } from "sonner";

const NgoNav = () => {
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const { user, isSignedIn, isLoaded } = useUser();
  const navigate = useNavigate();
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

  const handleViewProfile = async () => {
    try {
      const email = user?.primaryEmailAddress?.emailAddress;
      if (!email) {
        toast.error('Email not found');
        return;
      }

      const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/ngo/by-email/${email}`);
      const result = await response.json();

      if (result.success && result.data?.ngoID) {
        navigate(`/ngo-dashboard/${result.data.ngoID}`);
      } else {
        toast.error('NGO dashboard not assigned');
      }
    } catch (error) {
      console.error('Error fetching NGO data:', error);
      toast.error('NGO dashboard not assigned');
    }
    setIsUserMenuOpen(false);
  };

  if (!isLoaded) return null;

  return (
    <nav className="bg-white dark:bg-gray-900 shadow-lg sticky top-0 z-50 border-b border-gray-200 dark:border-gray-700 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2">
            <div className="text-2xl font-bold text-green-600 dark:text-green-400 hover:text-green-700 dark:hover:text-green-300 transition-colors">
              AidVerify NGO
            </div>
          </Link>

          {/* Desktop Navigation */}
          {isSignedIn && (
            <div className="hidden md:flex items-center space-x-8">
              {/* Navigation Links */}
              {/* <div className="flex items-center space-x-6">
                <Link to="/campaign-application" className="text-gray-700 dark:text-gray-200 hover:text-green-600 dark:hover:text-green-400 transition-colors font-medium">
                  Campaign Application
                </Link>
                <Link to="/ngo-dashboard" className="text-gray-700 dark:text-gray-200 hover:text-green-600 dark:hover:text-green-400 transition-colors font-medium">
                  Dashboard
                </Link>
              </div> */}
              
              {/* Welcome Message & User Menu */}
              <div className="flex items-center space-x-4">
                <div className="hidden lg:block text-sm text-gray-600 dark:text-gray-300">
                  Welcome, {user?.firstName || "NGO"}!
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
                      <div className="w-8 h-8 bg-green-600 rounded-full flex items-center justify-center">
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
                        <button
                          onClick={handleViewProfile}
                          className="flex items-center w-full px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                        >
                          <UserCircle className="w-4 h-4 mr-3" />
                          View Profile
                        </button>

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
              </div>
              <AnimatedThemeToggler  size={24} className="ml-4" />
            </div>
          )}

          {/* Mobile menu button */}
          {isSignedIn && (
            <div className="md:hidden flex items-center space-x-3">
              <div className="text-sm text-gray-600 dark:text-gray-300">
                Hi, {user?.firstName || "NGO"}!
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
              {/* Navigation Links */}
              {/* <Link
                to="/campaign-application"
                className="block px-3 py-2 text-base font-medium text-gray-700 dark:text-gray-200 hover:text-green-600 dark:hover:text-green-400 hover:bg-white dark:hover:bg-gray-700 rounded-md transition-colors"
                onClick={() => setIsMobileOpen(false)}
              >
                Campaign Application
              </Link>
              <Link
                to="/ngo-dashboard"
                className="block px-3 py-2 text-base font-medium text-gray-700 dark:text-gray-200 hover:text-green-600 dark:hover:text-green-400 hover:bg-white dark:hover:bg-gray-700 rounded-md transition-colors"
                onClick={() => setIsMobileOpen(false)}
              >
                Dashboard
              </Link> */}

              {/* User Info */}
              <div className="flex items-center space-x-3 px-3 py-3 bg-white dark:bg-gray-900 rounded-lg mb-3 mt-4">
                {user?.imageUrl ? (
                  <img
                    src={user.imageUrl}
                    alt="Profile"
                    className="w-10 h-10 rounded-full object-cover"
                  />
                ) : (
                  <div className="w-10 h-10 bg-green-600 rounded-full flex items-center justify-center">
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

export default NgoNav;