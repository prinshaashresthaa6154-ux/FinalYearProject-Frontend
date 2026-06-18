import { useState } from 'react';
import { 
  ArrowLeft, Bell, Activity, Users, Database, Settings, 
  BarChart3
} from 'lucide-react';
import { Outlet, useNavigate } from 'react-router';

export default function SuperAdminPanel() {
  const [activeTab, setActiveTab] = useState('System Overview');
  const navigate = useNavigate();

  const tabs = [
    { id:1, name: 'System Overview', icon: Activity, path: "/superadmin" },
    { id:2, name: 'All Accounts', icon: Users, path: "/superadmin/allaccount" },
    { id:3, name: 'System Logs', icon: Database, path: "/superadmin/systemlog" },
    { id:4, name: 'Platform Settings', icon: Settings, path: "/superadmin" },
    { id:5, name: 'Analytics', icon: BarChart3, path: "/superadmin" },
  ];

  const handleChange = (tab : any) => {
    setActiveTab(tab.name);
    navigate(tab.path);
  };

  return (
    <div className="min-h-screen bg-[#fdfbf9] text-[#2c2520] font-sans antialiased">
      {/* Top Header */}
      <header className="bg-[#1e1611] text-[#f5efe9] py-4 flex items-center justify-between shadow-md">
        <div className='max-w-7xl w-full mx-auto flex justify-between'>
          <div className="flex items-center gap-4 ">
          <button className="text-gray-400 hover:text-white transition">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-lg font-semibold tracking-wide flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-orange-500 inline-block"></span>
              Super Admin Panel
            </h1>
            <p className="text-xs text-gray-400">Full System Control</p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <button className="relative text-gray-300 hover:text-white p-1">
            <Bell className="w-5 h-5" />
            <span className="absolute top-1 right-1 w-2 h-2 bg-orange-500 rounded-full"></span>
          </button>
          <div className="bg-[#2d221a] px-4 py-1.5 rounded-full text-xs font-medium text-orange-300 border border-orange-900/50">
            Super Admin
          </div>
        </div>
        </div>
      </header>

      <main className="py-8 max-w-7xl mx-auto space-y-9">
        {/* Navigation Tabs */}
        <div className="overflow-x-auto scrollbar-none -mx-4 px-4 md:mx-0 md:px-0">
          <nav className="flex space-x-2 md:space-x-4 items-center whitespace-nowrap min-w-max">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.name;
              return (
                <button
                  key={tab.id}
                  onClick={() => handleChange(tab)}
                  className={`flex items-center gap-2 px-5 py-2.5 text-[14px] font-medium transition-all duration-200 rounded-xl ${
                    isActive
                      ? 'bg-[#b31919] text-white shadow-sm'
                      : 'text-[#6e5e54] hover:text-[#b31919] hover:bg-[#efece9]'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{tab.name}</span>
                </button>
              );
            })}
          </nav>
        </div>

        {/* Outlet */}
        <Outlet/>
        
      </main>
    </div>
  );
}
