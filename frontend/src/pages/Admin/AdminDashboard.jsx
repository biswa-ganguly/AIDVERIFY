import { useState } from 'react';
import { DashboardView } from './views/DashboardView';
import { CampaignRequestsView } from './views/CampaignRequestsView';
import { ActiveCampaignsView } from './views/ActiveCampaignsView';
import { DonationsView } from './views/DonationsView';
import { NgoManagementView } from './views/NgoManagementView';
import { UsersView } from './views/UsersView';
import { SettingsView } from './views/SettingsView';
import axios from "axios";
import { Sidebar } from './components/Sidebar';
import { Header } from './components/Header';

export default function AdminDashboard() {
  const [activeView, setActiveView] = useState('dashboard');
  const [authenticated, setAuthenticated] = useState(false);
  const [passwordInput, setPasswordInput] = useState('');
  const [loginerror, setloginerror] = useState("");
  const [showPassword, setShowPassword] = useState(false); // For toggle

  const handleLogin = async () => {
    try {
      const res = await axios.post(
        `${import.meta.env.VITE_BACKEND_URL}/api/admin/login`,
        { password: passwordInput }
      );

      if (res.status === 200) {
        setAuthenticated(true);
        sessionStorage.setItem("AdminToken", res.data.token);
        setloginerror(""); // Clear error on successful login
      }
    } catch (error) {
      console.log("Error:", error);
      setloginerror("Invalid password. Please try again."); // Set error message
    }
  };

  const renderView = () => {
    switch (activeView) {
      case 'dashboard': return <DashboardView />;
      case 'requests': return <CampaignRequestsView />;
      case 'campaigns': return <ActiveCampaignsView />;
      case 'donations': return <DonationsView />;
      case 'ngos': return <NgoManagementView />;
      case 'users': return <UsersView />;
      case 'settings': return <SettingsView />;
      default: return <DashboardView />;
    }
  };

  if (!authenticated) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <div className="bg-white p-6 rounded-xl shadow-md w-80">
          <h2 className="text-xl font-semibold mb-4 text-center">Admin Login</h2>
          
          <div className="relative mb-2">
            <input
              type={showPassword ? "text" : "password"}
              placeholder="Enter Password"
              value={passwordInput}
              onChange={(e) => {
                setPasswordInput(e.target.value);
                setloginerror(""); // Clear error while typing
              }}
              className="w-full p-2 border rounded pr-12"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-600 text-sm"
            >
              {showPassword ? "Hide" : "Show"}
            </button>
          </div>

          {loginerror && (
            <p className="text-red-500 text-sm mb-4">{loginerror}</p>
          )}

          <button
            onClick={handleLogin}
            className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700"
          >
            Login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen w-full bg-muted/40">
      <Sidebar activeView={activeView} setActiveView={setActiveView} />
      <div className="flex flex-1 flex-col">
        <Header />
        <main className="flex-1 p-6">{renderView()}</main>
      </div>
    </div>
  );
}
