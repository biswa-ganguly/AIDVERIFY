import { LayoutDashboard, FileCheck, Megaphone, DollarSign, Building, Users, Settings } from 'lucide-react';
import { NavLink } from './NavLink';


export const Sidebar = ({ activeView, setActiveView }) => (
  <aside className="hidden w-64 flex-col border-r bg-background sm:flex">
    <div className="border-b p-4">
      <h2 className="text-xl font-bold">AidVerifyAI Panel</h2>
    </div>
    <nav className="flex flex-col gap-1 p-2">
      <NavLink viewName="dashboard" icon={LayoutDashboard} activeView={activeView} onNavigate={setActiveView}>Dashboard</NavLink>
      <NavLink viewName="requests" icon={FileCheck} activeView={activeView} onNavigate={setActiveView}>Campaign Requests</NavLink>
      <NavLink viewName="campaigns" icon={Megaphone} activeView={activeView} onNavigate={setActiveView}>Campaigns</NavLink>
      <NavLink viewName="donations" icon={DollarSign} activeView={activeView} onNavigate={setActiveView}>Donations</NavLink>
      <NavLink viewName="ngos" icon={Building} activeView={activeView} onNavigate={setActiveView}>NGOs</NavLink>

    </nav>
  </aside>
);
