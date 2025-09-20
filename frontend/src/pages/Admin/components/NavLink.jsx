import { Button } from '@/components/ui/button';

export const NavLink = ({ viewName, children, activeView, onNavigate, icon: IconComponent }) => (
  <Button
    variant={activeView === viewName ? 'secondary' : 'ghost'}
    className="w-full justify-start"
    onClick={() => onNavigate(viewName)}
  >
    {IconComponent && <IconComponent className="mr-2 h-4 w-4" />}
    {children}
  </Button>
);
