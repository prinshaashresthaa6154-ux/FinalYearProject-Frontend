import React, { useState } from 'react';
import { 
  Activity, Users, Database, Settings, BarChart3, 
  Search, Eye, UserX 
} from 'lucide-react';

export default function AllAccountsPanel() {
  const [activeTab, setActiveTab] = useState('All Accounts');
  const [searchQuery, setSearchQuery] = useState('');

  const tabs = [
    { name: 'System Overview', icon: Activity },
    { name: 'All Accounts', icon: Users },
    { name: 'System Logs', icon: Database },
    { name: 'Platform Settings', icon: Settings },
    { name: 'Analytics', icon: BarChart3 },
  ];

  const initialUsers = [
    { id: 'U001', name: 'Admin Kathmandu', email: 'admin@ktm.com', role: 'Admin', status: 'Active', lastLogin: '2 hours ago' },
    { id: 'U002', name: 'Admin Pokhara', email: 'admin@pkr.com', role: 'Admin', status: 'Active', lastLogin: '5 hours ago' },
    { id: 'U003', name: 'Pemba Sherpa', email: 'pemba@guide.com', role: 'Guide', status: 'Active', lastLogin: '1 hour ago' },
    { id: 'U004', name: 'Sita Gurung', email: 'sita@guide.com', role: 'Guide', status: 'Active', lastLogin: '3 hours ago' },
    { id: 'U005', name: 'Sarah Johnson', email: 'sarah@tourist.com', role: 'Tourist', status: 'Active', lastLogin: '30 min ago' },
    { id: 'U006', name: 'Blocked User', email: 'blocked@user.com', role: 'Tourist', status: 'Suspended', lastLogin: '2 weeks ago' },
  ];

  // Helper styles for roles
  const getRoleStyle = (role: string) => {
    switch (role) {
      case 'Admin': return 'bg-[#0f3460] text-white';
      case 'Guide': return 'bg-[#1b4332] text-white';
      case 'Tourist': return 'bg-[#1d2d44] text-white';
      default: return 'bg-gray-500 text-white';
    }
  };

  // Helper styles for status
  const getStatusStyle = (status: string) => {
    return status === 'Active' 
      ? 'bg-[#b31919] text-white' 
      : 'bg-[#e63946] text-white opacity-90';
  };

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

      {/* Main Table Container Card */}
      <div className="bg-white border border-[#eae3dc] rounded-2xl shadow-sm overflow-hidden">
        
        {/* Table Header Controls */}
        <div className="p-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-[#f0eae4]">
          <h2 className="text-xl font-bold text-[#1a130e] tracking-tight font-serif">All Accounts</h2>
          
          <div className="flex items-center gap-3 w-full sm:w-auto">
            <div className="relative flex-1 sm:w-64">
              <input
                type="text"
                placeholder="Search users..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-[#faf7f4] border border-[#dcd3cc] rounded-lg pl-3 pr-10 py-2 text-sm text-gray-700 placeholder-gray-400 focus:outline-none focus:border-[#b31919] transition"
              />
              <Search className="w-4 h-4 text-gray-400 absolute right-3 top-1/2 -translate-y-1/2" />
            </div>
            <button className="bg-[#b31919] hover:bg-[#941414] text-white px-4 py-2 rounded-lg text-sm font-medium tracking-wide shadow-sm whitespace-nowrap transition">
              Add User
            </button>
          </div>
        </div>

        {/* Responsive Table Wrapper */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[800px]">
            <thead>
              <tr className="bg-[#fcfaf7] border-b border-[#f0eae4] text-xs font-semibold tracking-wider text-gray-400 uppercase">
                <th className="py-3.5 px-6 font-medium normal-case">ID</th>
                <th className="py-3.5 px-6 font-medium normal-case">Name</th>
                <th className="py-3.5 px-6 font-medium normal-case">Email</th>
                <th className="py-3.5 px-6 font-medium normal-case">Role</th>
                <th className="py-3.5 px-6 font-medium normal-case">Status</th>
                <th className="py-3.5 px-6 font-medium normal-case">Last Login</th>
                <th className="py-3.5 px-6 font-medium normal-case text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#f5efe9]">
              {initialUsers.map((user) => (
                <tr key={user.id} className="hover:bg-[#fdfcfb] transition-colors">
                  {/* ID */}
                  <td className="py-4 px-6 text-xs font-mono text-gray-400 align-middle">
                    {user.id}
                  </td>
                  
                  {/* Name */}
                  <td className="py-4 px-6 text-sm font-semibold text-[#2c2520] align-middle">
                    {user.name}
                  </td>
                  
                  {/* Email */}
                  <td className="py-4 px-6 text-sm text-gray-400 font-medium align-middle">
                    {user.email}
                  </td>
                  
                  {/* Role Tag */}
                  <td className="py-4 px-6 align-middle">
                    <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold tracking-wide text-center min-w-[70px] ${getRoleStyle(user.role)}`}>
                      {user.role}
                    </span>
                  </td>
                  
                  {/* Status Tag */}
                  <td className="py-4 px-6 align-middle">
                    <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold tracking-wide text-center min-w-[75px] ${getStatusStyle(user.status)}`}>
                      {user.status}
                    </span>
                  </td>
                  
                  {/* Last Login */}
                  <td className="py-4 px-6 text-sm text-gray-400 font-medium align-middle">
                    {user.lastLogin}
                  </td>
                  
                  {/* Actions Buttons */}
                  <td className="py-4 px-6 align-middle">
                    <div className="flex items-center justify-center gap-4">
                      <button className="text-gray-600 hover:text-black transition" title="View Profile">
                        <Eye className="w-4 h-4" />
                      </button>
                      <button className="text-[#b31919] hover:text-red-800 transition" title="Manage Account">
                        <UserX className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

      </div>
    </div>
  );
}
