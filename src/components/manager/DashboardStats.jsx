import { ArrowUpRight, ArrowDownRight } from 'lucide-react';

const DashboardStats = ({ 
  title, 
  value, 
  change, 
  trend, 
  icon,
  color = 'bg-gray-100',
  textColor = 'text-gray-700'
}) => {
  return (
    <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-gray-500">{title}</p>
          <p className="text-2xl font-bold mt-2">{value}</p>
          <div className="flex items-center gap-1 mt-2">
            {trend === 'up' ? (
              <ArrowUpRight size={16} className="text-green-500" />
            ) : (
              <ArrowDownRight size={16} className="text-red-500" />
            )}
            <span className={`text-sm font-medium ${
              trend === 'up' ? 'text-green-600' : 'text-red-600'
            }`}>
              {change}
            </span>
            <span className="text-xs text-gray-500">من الشهر الماضي</span>
          </div>
        </div>
        <div className={`p-3 rounded-lg ${color}`}>
          <div className={textColor}>
            {icon}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardStats;