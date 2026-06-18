import { 
  Users, Database, ShieldAlert, Briefcase, Wallet, 
  Globe, ShieldCheck, Clock 
} from 'lucide-react';

const SystemOverview = () => {
     const stats = [
    { label: 'Total Users', value: '15,847', trend: '+8.2%', icon: Users, iconColor: 'text-red-500', bgIcon: 'bg-red-50' },
    { label: 'Active Admins', value: '12', trend: '+2', icon: ShieldAlert, iconColor: 'text-orange-500', bgIcon: 'bg-orange-50' },
    { label: 'Freelance Guides', value: '245', trend: '+15', icon: Briefcase, iconColor: 'text-teal-500', bgIcon: 'bg-teal-50' },
    { label: 'System Revenue', value: 'NPR 1.2Cr', trend: '+32%', icon: Wallet, iconColor: 'text-blue-500', bgIcon: 'bg-blue-50' },
  ];

  const userDistribution = [
    { role: 'Tourists', count: '15,200', percentage: 95.9, color: 'bg-[#b31919]' },
    { role: 'Freelance Guides', count: '245', percentage: 1.5, color: 'bg-teal-500' },
    { role: 'Admins', count: '12', percentage: 0.1, color: 'bg-orange-400' },
    { role: 'Super Admin', count: '1', percentage: 0.01, color: 'bg-indigo-500' },
  ];

  const systemHealth = [
    { name: 'Server Status', status: 'Operational', color: 'bg-red-800 text-white', icon: Database },
    { name: 'Database', status: 'Connected', color: 'bg-red-800 text-white', icon: Database },
    { name: 'API Gateway', status: 'Active', color: 'bg-red-600 text-white', icon: Globe },
    { name: 'SSL Certificate', status: 'Valid', color: 'bg-red-600 text-white', icon: ShieldCheck },
    { name: 'Uptime', status: '99.97%', color: 'bg-red-600 text-white', icon: Clock },
  ];

  return (
    <div>
        {/* Top Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {stats.map((stat, idx) => {
            const Icon = stat.icon;
            return (
              <div key={idx} className="bg-white border border-[#eae3dc] rounded-2xl p-5 shadow-sm relative flex flex-col justify-between min-h-[130px]">
                <div className="flex justify-between items-start">
                  <div className={`p-2.5 rounded-xl ${stat.bgIcon}`}>
                    <Icon className={`w-5 h-5 ${stat.iconColor}`} />
                  </div>
                  <span className="text-xs font-semibold text-gray-500 flex items-center gap-0.5">
                    📈 {stat.trend}
                  </span>
                </div>
                <div className="mt-4">
                  <div className="text-2xl font-bold tracking-tight text-[#1a130e]">{stat.value}</div>
                  <div className="text-xs text-gray-400 font-medium mt-0.5">{stat.label}</div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Analytics Section Split Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* User Role Distribution Card */}
          <div className="bg-white border border-[#eae3dc] rounded-2xl p-6 shadow-sm">
            <h2 className="text-lg font-bold text-[#1a130e] mb-6 tracking-tight font-serif">User Role Distribution</h2>
            <div className="space-y-5">
              {userDistribution.map((item, idx) => (
                <div key={idx} className="space-y-1.5">
                  <div className="flex justify-between text-sm font-medium">
                    <span className="text-gray-700 flex items-center gap-2">
                      <span className={`w-2 h-2 rounded-full ${item.color}`}></span>
                      {item.role}
                    </span>
                    <span className="text-gray-400 font-mono">{item.count}</span>
                  </div>
                  <div className="w-full bg-[#f3ede8] h-2 rounded-full overflow-hidden">
                    <div 
                      className={`${item.color} h-full rounded-full transition-all duration-500`} 
                      style={{ width: `${item.percentage}%` }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* System Health Card */}
          <div className="bg-white border border-[#eae3dc] rounded-2xl p-6 shadow-sm">
            <h2 className="text-lg font-bold text-[#1a130e] mb-6 tracking-tight font-serif">System Health</h2>
            <div className="space-y-3.5">
              {systemHealth.map((item, idx) => {
                const Icon = item.icon;
                return (
                  <div key={idx} className="flex items-center justify-between bg-[#faf7f4] border border-[#f0eae4] rounded-xl p-3">
                    <div className="flex items-center gap-3 text-sm font-medium text-gray-700">
                      <Icon className="w-4 h-4 text-gray-400" />
                      <span>{item.name}</span>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold tracking-wide ${item.color}`}>
                      {item.status}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
    </div>
  )
}

export default SystemOverview
