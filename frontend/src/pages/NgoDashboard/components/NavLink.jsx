import { Button } from "@/components/ui/button";

export const NavLink = ({ viewName, icon: Icon, children, activeView, setActiveView }) => (
  <Button
    variant={activeView === viewName ? "secondary" : "ghost"}
    className="w-full justify-start"
    onClick={() => setActiveView(viewName)}
  >
    <Icon className="mr-2 h-4 w-4" />
    {children}
  </Button>
);