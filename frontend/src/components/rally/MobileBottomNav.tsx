import React from 'react';
import { Home, CalendarCheck, Award, Users2, ShoppingBag, User } from 'lucide-react';
import { RallyPageTab } from './RallyHeader';

interface MobileBottomNavProps {
  currentTab: RallyPageTab;
  onSelectTab: (tab: RallyPageTab) => void;
  onOpenAuth: () => void;
  isLoggedIn: boolean;
}

export const MobileBottomNav: React.FC<MobileBottomNavProps> = ({
  currentTab,
  onSelectTab,
  onOpenAuth,
  isLoggedIn
}) => {
  const ITEMS = [
    { id: 'home' as RallyPageTab, label: 'خانه', icon: Home },
    { id: 'courts' as RallyPageTab, label: 'زمین‌ها', icon: CalendarCheck },
    { id: 'coaches' as RallyPageTab, label: 'مربیان', icon: Award },
    { id: 'tournaments' as RallyPageTab, label: 'مسابقات', icon: Users2 },
    { id: 'shop' as RallyPageTab, label: 'فروشگاه', icon: ShoppingBag },
    { id: 'account' as const, label: 'حساب من', icon: User }
  ];

  return (
    <div className="lg:hidden fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-200 shadow-lg px-2 py-1 safe-area-pb">
      <div className="grid grid-cols-6 items-center max-w-md mx-auto">
        {ITEMS.map((item) => {
          const Icon = item.icon;
          const isAccount = item.id === 'account';
          const isActive = !isAccount && currentTab === item.id;

          const handleClick = () => {
            if (isAccount) {
              onOpenAuth();
            } else {
              onSelectTab(item.id as RallyPageTab);
            }
          };

          return (
            <button
              key={item.label}
              onClick={handleClick}
              className={`flex flex-col items-center justify-center min-h-[50px] py-1.5 px-1 rounded-xl transition-colors cursor-pointer select-none ${
                isActive ? 'text-rally-primary font-bold' : 'text-gray-500 hover:text-gray-900 font-medium'
              }`}
            >
              <div className="relative">
                <Icon className={`w-5 h-5 ${isActive ? 'text-rally-primary' : 'text-gray-400'}`} />
                {isActive && (
                  <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-rally-accent ring-2 ring-white" />
                )}
              </div>
              <span className="text-[10px] xs:text-[11px] mt-1 tracking-tight truncate max-w-full">
                {isAccount && isLoggedIn ? 'پروفایل' : item.label}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
