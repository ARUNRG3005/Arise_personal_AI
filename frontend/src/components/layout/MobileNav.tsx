import { NavLink } from 'react-router-dom';
import { LayoutDashboard, MessageSquare, CheckSquare, Calendar, Flame } from 'lucide-react';

const NAV_ITEMS = [
  { to: '/',           label: 'HOME',    icon: LayoutDashboard },
  { to: '/chat',       label: 'ARISE',   icon: MessageSquare },
  { to: '/tasks',      label: 'TASKS',   icon: CheckSquare },
  { to: '/calendar',   label: 'CAL',     icon: Calendar },
  { to: '/habits',     label: 'HABITS',  icon: Flame },
];

export function MobileNav() {
  return (
    <nav className="flex border-t border-j-cyan/12 bg-j-bg/95 backdrop-blur-sm safe-area-pb">
      {NAV_ITEMS.map(({ to, label, icon: Icon }) => (
        <NavLink
          key={to}
          to={to}
          className={({ isActive }) => `
            flex-1 flex flex-col items-center justify-center py-3 gap-1
            min-h-[60px] transition-colors duration-150
            ${isActive
              ? 'text-j-cyan border-t-2 border-j-cyan bg-j-cyan/5'
              : 'text-j-text-muted border-t-2 border-transparent'
            }
          `}
        >
          <Icon className="w-5 h-5 flex-shrink-0" />
          <span className="j-font-mono text-[8px] tracking-[0.15em]">{label}</span>
        </NavLink>
      ))}
    </nav>
  );
}

export default MobileNav;
