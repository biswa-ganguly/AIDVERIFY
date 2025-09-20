import React from "react";
import { RouterProvider, createBrowserRouter, Outlet, Navigate } from "react-router-dom";
import { useUser } from "@clerk/clerk-react";
import Landing from "./pages/Landing/Landing";
import Home from "./pages/Home/Home";
import CampaignDetailPage from "./pages/Campaign/CampaignDetailPage";
import DonorDashboardPage from "./pages/DonorDashboard/DonorDashboardPage";
import PaymentPage from "./pages/Payment/PaymentPage";
import NgoApplicationPage from "./pages/NgoApplication/NgoApplicationPage";
import NgoDashboardPage from "./pages/NgoDashboard/NgoDashboardPage";
import FieldWorkerPage from "./pages/FieldWorker/FieldWorkerPage";
import Auth from "./auth/auth";
import AdminDashboard from "./pages/Admin/AdminDashboard";
import SyncUser from "./components/SyncUser";
import NgoCampaignTerms from "./pages/NgoT&C/NgoCampaignTerms";
import { Toaster } from "@/components/ui/sonner";

// Protected Route Component
function ProtectedRoute({ allowedRoles = [] }) {
  const { isLoaded, isSignedIn, user } = useUser();
  
  console.log('PROTECTED ROUTE COMPONENT RENDERED');
  console.log('Allowed roles:', allowedRoles);

  console.log('=== PROTECTED ROUTE DEBUG ===');
  console.log('ProtectedRoute check:', { isLoaded, isSignedIn, user: !!user, userRole: user?.publicMetadata?.role, allowedRoles });
  console.log('Full user object:', user);
  console.log('User publicMetadata:', user?.publicMetadata);
  console.log('Role in metadata:', user?.publicMetadata?.role);
  console.log('Metadata keys:', user?.publicMetadata ? Object.keys(user.publicMetadata) : 'no metadata');

  if (!isLoaded) {
    return <div className="min-h-screen flex items-center justify-center"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div></div>;
  }

  if (!isSignedIn) {
    console.log('=== ACCESS DENIED ===');
    console.log('User not signed in, redirecting to landing');
    return <Navigate to="/" replace />;
  }

  const userRole = user?.publicMetadata?.role;

  if (!userRole) {
    console.log('=== ACCESS DENIED ===');
    console.log('User has no role, redirecting to landing');
    console.log('User object exists:', !!user);
    console.log('PublicMetadata:', user?.publicMetadata);
    console.log('Role in metadata:', user?.publicMetadata?.role);
    console.log('Metadata keys:', user?.publicMetadata ? Object.keys(user.publicMetadata) : 'no metadata');
    return <Navigate to="/" replace />;
  }

  if (!allowedRoles.includes(userRole)) {
    console.log('=== ACCESS DENIED ===');
    console.log('User role not allowed for this route, redirecting...');
    console.log('User role:', userRole, 'Allowed roles:', allowedRoles);
    // Redirect to appropriate dashboard based on user's role
    if (userRole === "donor") {
      return <Navigate to="/home" replace />;
    } else if (userRole === "ngo") {
      return <Navigate to="/campaign-application" replace />;
    }
    return <Navigate to="/" replace />;
  }

  console.log('=== ACCESS GRANTED ===');
  console.log('Access granted for role:', userRole);
  return <Outlet />;
}

// Router setup
const router = createBrowserRouter([
  {
    path: "/",
    element: <Landing />,
  },
  {
    path: "/signup",
    element: <Auth />,
  },
  {
    path: "/signin",
    element: <Auth />,
  },
  // Donor routes
  {
    element: <ProtectedRoute allowedRoles={["donor"]} />,
    children: [
      { path: "/home", element: <Home /> },
      { path: "/campaign/:id", element: <CampaignDetailPage /> },
      { path: "/dashboard", element: <DonorDashboardPage /> },
      { path: "/dashboard/:donorId", element: <DonorDashboardPage /> },
      { path: "/donate/:campaignId", element: <PaymentPage /> },
    ],
  },
  // NGO routes
  {
    element: <ProtectedRoute allowedRoles={["ngo"]} />,
    children: [
      { path: "/campaign-application", element: <NgoApplicationPage /> },
      { path: "/ngo-dashboard", element: <NgoDashboardPage /> },
      { path: "/volunteer", element: <FieldWorkerPage /> },
      { path: "/campaign-rules", element: <NgoCampaignTerms /> },
    ],
  },
  // Public NGO Dashboard (for email links)
  {
    path: "/ngo-dashboard/:ngoId",
    element: <NgoDashboardPage />,
  },
  // Admin route
  {
    path: "/admin",
    element: <AdminDashboard />,
  },
  // Catch-all
  {
    path: "*",
    element: <Navigate to="/" replace />,
  },
]);

export default function App() {
  return (
    <>
      <SyncUser />
      <RouterProvider router={router} />
      <Toaster />
    </>
  );
}