import React, { useState } from 'react';
import { 
  Activity, Users, Database, Settings, BarChart3 
} from 'lucide-react';

export default function SystemLogsPanel() {
  const [activeTab, setActiveTab] = useState('System Logs');

  const tabs = [
    { name: 'System Overview', icon: Activity },
    { name: 'All Accounts', icon: Users },
    { name: 'System Logs', icon: Database },
    { name: 'Platform Settings', icon: Settings },
    { name: 'Analytics', icon: BarChart3 },
  ];

  const logs = [
    { time: '14:32', category: 'Auth', description: 'Admin login', user: 'Admin Kathmandu' },
    { time: '14:15', category: 'Registration', description: 'New guide registered', user: 'Dorje Tamang' },
    { time: '13:45', category: 'Content', description: 'Package updated', user: 'Admin Pokhara' },
    { time: '13:20', category: 'Payment', description: 'Payment processed', user: 'System' },
    { time: '12:50', category: 'Moderation', description: 'User account suspended', user: 'Super Admin' },
  ];

  return (
    <div className="min-h-screen bg-[#fdfbf9] text-[#2c2520] font-sans antialiased p-4 md:p-8 max-w-7xl mx-auto space-y-6">
      
      {/* Navigation Tabs */}
      <div className="overflow-x-auto scrollbar-none -mx-4 px-4 md:mx-0 md:px-0">
        <nav className="flex space-x-2 md:space-x-4 items-center whitespace-nowrap min-w-max">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.name;
            return (
              <button
                key={tab.name}
                onClick={() => setActiveTab(tab.name)}
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

      {/* Main Activity Logs Container Card */}
      <div className="bg-white border border-[#eae3dc] rounded-2xl shadow-sm overflow-hidden">
        
        {/* Header Title Section */}
        <div className="p-6 pb-4">
          <h2 className="text-xl font-bold text-[#1a130e] tracking-tight font-serif">
            System Activity Logs
          </h2>
        </div>

        {/* Responsive Logs List Container */}
        <div className="overflow-x-auto">
          <div className="divide-y divide-[#f5efe9] min-w-[700px]">
            {logs.map((log, index) => (
              <div 
                key={index} 
                className="flex items-center px-6 py-4 text-sm hover:bg-[#fdfcfb] transition-colors"
              >
                {/* Timestamp */}
                <div className="w-20 text-xs font-mono text-gray-400 font-medium shrink-0">
                  {log.time}
                </div>

                {/* Category Pill Tag */}
                <div className="w-36 shrink-0">
                  <span className="inline-block px-3 py-1 rounded-full text-xs font-medium text-gray-700 bg-white border border-[#dcd3cc] min-w-[100px] text-center">
                    {log.category}
                  </span>
                </div>

                {/* Log Description text */}
                <div className="flex-1 text-[#2c2520] font-medium pl-2">
                  {log.description}
                </div>

                {/* Trigger User Account */}
                <div className="w-44 text-right text-xs font-medium text-gray-400 shrink-0">
                  {log.user}
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}
