import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { NavLink } from "./NavLink";
import { LayoutDashboard, Target, FileText, Users, LineChart, Bell, Settings } from "lucide-react";

export const Sidebar = ({ activeView, setActiveView }) => (
  <aside className="hidden w-64 flex-col border-r bg-background sm:flex">
    <div className="border-b p-4 flex items-center gap-3">
      <Avatar>
        <AvatarImage src="https://i.pravatar.cc/150?u=ngo" alt="NGO Logo" />
        <AvatarFallback>NGO</AvatarFallback>
      </Avatar>
      <h2 className="text-lg font-bold">NGO Panel</h2>
    </div>
    <nav className="flex flex-col gap-1 p-2">
      <NavLink viewName="dashboard" icon={LayoutDashboard} activeView={activeView} setActiveView={setActiveView}>
        Overview
      </NavLink>
      <NavLink viewName="campaigns" icon={Target} activeView={activeView} setActiveView={setActiveView}>
        Campaigns
      </NavLink>
      <NavLink viewName="utilization" icon={FileText} activeView={activeView} setActiveView={setActiveView}>
        Fund Utilization
      </NavLink>
      <NavLink viewName="workers" icon={Users} activeView={activeView} setActiveView={setActiveView}>
        Field Workers
      </NavLink>
    </nav>
  </aside>
);