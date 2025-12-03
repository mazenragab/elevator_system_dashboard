import { useState } from 'react';
import { 
  BarChart3, 
  Download, 
  Filter,
  Calendar,
  TrendingUp,
  Users,
  DollarSign,
  Clock,
  PieChart
} from 'lucide-react';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Input from '../../components/forms/Input';
import Select from '../../components/forms/Select';

const Reports = () => {
  const [dateRange, setDateRange] = useState({
    start: '',
    end: ''
  });
  const [reportType, setReportType] = useState('overview');

  const reports = [
    {
      id: 1,
      title: 'تقرير الأداء الشهري',
      type: 'monthly',
      date: 'يناير 2024',
      downloads: 45,
      size: '2.4 MB'
    },
    {
      id: 2,
      title: 'تقرير الطلبات الطارئة',
      type: 'emergency',
      date: 'ديسمبر 2023',
      downloads: 32,
      size: '1.8 MB'
    },
    {
      id: 3,
      title: 'تقرير أداء الفنيين',
      type: 'performance',
      date: 'الربع الرابع 2023',
      downloads: 28,
      size: '3.1 MB'
    },
    {
      id: 4,
      title: 'تقرير التكاليف',
      type: 'cost',
      date: '2023 سنوي',
      downloads: 19,
      size: '4.2 MB'
    },
  ];

  const statistics = [
    {
      title: 'إجمالي الطلبات',
      value: '245',
      change: '+12%',
      trend: 'up',
      icon: <TrendingUp className="text-blue-600" size={24} />
    },
    {
      title: 'متوسط وقت الإنجاز',
      value: '3.2 ساعة',
      change: '-0.5 ساعة',
      trend: 'down',
      icon: <Clock className="text-green-600" size={24} />
    },
    {
      title: 'إجمالي التكاليف',
      value: '85,400 جنيه',
      change: '+8%',
      trend: 'up',
      icon: <DollarSign className="text-purple-600" size={24} />
    },
    {
      title: 'رضا العملاء',
      value: '4.7/5',
      change: '+0.2',
      trend: 'up',
      icon: <Users className="text-yellow-600" size={24} />
    },
  ];

  return (
    <div className="space-y-6">
      {/* العنوان والإجراءات */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">التقارير والإحصائيات</h1>
          <p className="text-gray-600 mt-1">تحليل بيانات الأداء والتقارير الشهرية</p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" leftIcon={<Filter size={16} />}>
            تصفية
          </Button>
          <Button leftIcon={<Download size={16} />}>
            تصدير جميع التقارير
          </Button>
        </div>
      </div>

      {/* الفلترة */}
      <Card className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Select
            value={reportType}
            onChange={(e) => setReportType(e.target.value)}
            options={[
              { value: 'overview', label: 'نظرة عامة' },
              { value: 'performance', label: 'أداء الفنيين' },
              { value: 'requests', label: 'تحليل الطلبات' },
              { value: 'cost', label: 'التكاليف' },
              { value: 'clients', label: 'العملاء' },
            ]}
            leftIcon={<BarChart3 size={18} />}
          />
          
          <Input
            type="date"
            value={dateRange.start}
            onChange={(e) => setDateRange({ ...dateRange, start: e.target.value })}
            placeholder="من تاريخ"
            leftIcon={<Calendar size={18} />}
          />
          
          <Input
            type="date"
            value={dateRange.end}
            onChange={(e) => setDateRange({ ...dateRange, end: e.target.value })}
            placeholder="إلى تاريخ"
          />
          
          <Button className="h-[42px]">
            توليد التقرير
          </Button>
        </div>
      </Card>

      {/* إحصائيات سريعة */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statistics.map((stat, index) => (
          <Card key={index} className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">{stat.title}</p>
                <p className="text-2xl font-bold mt-2">{stat.value}</p>
                <div className={`flex items-center gap-1 mt-2 text-sm ${
                  stat.trend === 'up' ? 'text-green-600' : 'text-red-600'
                }`}>
                  <span>{stat.change}</span>
                  <span>من الشهر الماضي</span>
                </div>
              </div>
              <div className="p-3 bg-gray-50 rounded-lg">
                {stat.icon}
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* الرسوم البيانية */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card title="طلبات الصيانة حسب النوع">
          <div className="h-64 flex items-center justify-center">
            <div className="text-center">
              <PieChart size={48} className="mx-auto text-gray-300 mb-4" />
              <p className="text-gray-500">رسم بياني دائري لأنواع الطلبات</p>
              <div className="flex items-center justify-center gap-4 mt-4">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                  <span className="text-sm text-gray-600">طارئ</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                  <span className="text-sm text-gray-600">عاجل</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                  <span className="text-sm text-gray-600">عادي</span>
                </div>
              </div>
            </div>
          </div>
        </Card>
        
        <Card title="أداء الفنيين">
          <div className="h-64 flex items-center justify-center">
            <div className="text-center">
              <BarChart3 size={48} className="mx-auto text-gray-300 mb-4" />
              <p className="text-gray-500">رسم بياني عمودي لأداء الفنيين</p>
            </div>
          </div>
        </Card>
      </div>

      {/* التقارير المحفوظة */}
      <Card 
        title="التقارير المحفوظة"
        action={
          <Button variant="outline" size="sm">
            عرض الكل
          </Button>
        }
      >
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-right py-3 px-4 text-sm font-medium text-gray-500">التقرير</th>
                <th className="text-right py-3 px-4 text-sm font-medium text-gray-500">النوع</th>
                <th className="text-right py-3 px-4 text-sm font-medium text-gray-500">التاريخ</th>
                <th className="text-right py-3 px-4 text-sm font-medium text-gray-500">التحميلات</th>
                <th className="text-right py-3 px-4 text-sm font-medium text-gray-500">الحجم</th>
                <th className="text-right py-3 px-4 text-sm font-medium text-gray-500">الإجراءات</th>
              </tr>
            </thead>
            <tbody>
              {reports.map((report) => (
                <tr key={report.id} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="py-4 px-4">
                    <p className="font-medium text-gray-900">{report.title}</p>
                  </td>
                  <td className="py-4 px-4">
                    <span className="px-3 py-1 bg-gray-100 text-gray-800 rounded-full text-xs">
                      {report.type}
                    </span>
                  </td>
                  <td className="py-4 px-4 text-gray-600">{report.date}</td>
                  <td className="py-4 px-4">
                    <span className="font-medium">{report.downloads}</span>
                  </td>
                  <td className="py-4 px-4 text-gray-600">{report.size}</td>
                  <td className="py-4 px-4">
                    <Button variant="outline" size="sm">
                      <Download size={14} />
                      تحميل
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
};

export default Reports;