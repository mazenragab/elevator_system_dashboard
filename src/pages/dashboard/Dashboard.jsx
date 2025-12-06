import { useState, useEffect } from 'react';
import { 
  Users, 
  Wrench, 
  Building, 
  CheckCircle, 
  AlertCircle, 
  FileText,
  UserCheck,
  BarChart3,
  Filter,
  Search,
  Calendar,
  Eye,
  TrendingUp,
  Phone,
  Mail,
  MapPin,
  Clock,
  Shield,
  Package
} from 'lucide-react';
import PageHeader from '../../components/layout/PageHeader';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';
import Input from '../../components/forms/Input';
import Select from '../../components/forms/Select';
import Loading from '../../components/ui/Loading';
import EmptyState from '../../components/ui/EmptyState';
import { useDashboard } from '../../hooks/useDashboard';
import { useToast } from '../../hooks/useToast';
import { managerService } from '../../services/managerService';

const Dashboard = () => {
  const { 
    dashboardData, 
    stats, 
    pendingRequests, 
    analytics, 
    loading, 
    error,
    fetchDashboard,
    fetchAnalytics,
    fetchAllAnalytics 
  } = useDashboard();
  
  const { showToast } = useToast();
  
  const [dateRange, setDateRange] = useState({
    start: new Date(new Date().setDate(new Date().getDate() - 30)).toISOString().split('T')[0],
    end: new Date().toISOString().split('T')[0]
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState('all');
  const [generatingReport, setGeneratingReport] = useState(false);

  useEffect(() => {
    fetchDashboard();
  }, []);

  // الإحصائيات الرئيسية
  const mainStats = stats ? [
    { 
      title: 'العملاء', 
      value: stats.totalClients || 0, 
      icon: <Users className="text-white" size={24} />,
      color: 'bg-gradient-to-br from-blue-500 to-blue-600',
      borderColor: 'border-blue-100'
    },
    { 
      title: 'الفنيين', 
      value: stats.totalTechnicians || 0, 
      icon: <Wrench className="text-white" size={24} />,
      color: 'bg-gradient-to-br from-green-500 to-green-600',
      borderColor: 'border-green-100'
    },
    { 
      title: 'المصاعد', 
      value: stats.totalElevators || 0, 
      icon: <Building className="text-white" size={24} />,
      color: 'bg-gradient-to-br from-purple-500 to-purple-600',
      borderColor: 'border-purple-100'
    },
    { 
      title: 'طلبات مكتملة', 
      value: stats.completedRequests || 0, 
      icon: <CheckCircle className="text-white" size={24} />,
      color: 'bg-gradient-to-br from-emerald-500 to-emerald-600',
      borderColor: 'border-emerald-100'
    },
    { 
      title: 'طلبات معلقة', 
      value: stats.pendingRequests || 0, 
      icon: <AlertCircle className="text-white" size={24} />,
      color: 'bg-gradient-to-br from-rose-500 to-rose-600',
      borderColor: 'border-rose-100'
    },
    { 
      title: 'إجمالي الطلبات', 
      value: stats.totalRequests || 0, 
      icon: <FileText className="text-white" size={24} />,
      color: 'bg-gradient-to-br from-amber-500 to-amber-600',
      borderColor: 'border-amber-100'
    },
  ] : [];

  // الإجراءات السريعة
  const quickActions = [
    { 
      icon: <FileText size={20} />, 
      label: 'إنشاء عقد جديد', 
      description: 'إضافة عقد صيانة جديد',
      color: 'bg-gradient-to-r from-blue-50 to-blue-100 border border-blue-200',
      iconColor: 'text-blue-600',
      path: '/contracts/create'
    },
    { 
      icon: <Wrench size={20} />, 
      label: 'تعيين طلب', 
      description: 'تعيين طلب لفني',
      color: 'bg-gradient-to-r from-emerald-50 to-emerald-100 border border-emerald-200',
      iconColor: 'text-emerald-600',
      path: '/requests'
    },
    { 
      icon: <BarChart3 size={20} />, 
      label: 'إدارة العملاء', 
      description: 'عرض وتعديل العملاء',
      color: 'bg-gradient-to-r from-purple-50 to-purple-100 border border-purple-200',
      iconColor: 'text-purple-600',
      path: '/clients'
    },
    { 
      icon: <UserCheck size={20} />, 
      label: 'إدارة الفنيين', 
      description: 'عرض وتعديل الفنيين',
      color: 'bg-gradient-to-r from-amber-50 to-amber-100 border border-amber-200',
      iconColor: 'text-amber-600',
      path: '/technicians'
    },
  ];

  // معالجة البيانات للرسوم البيانية
  const getStatusChartData = () => {
    if (!analytics.requests?.byStatus) return [];
    return Object.entries(analytics.requests.byStatus).map(([status, count]) => ({
      name: status === 'PENDING' ? 'معلق' :
            status === 'IN_PROGRESS' ? 'قيد التنفيذ' :
            status === 'COMPLETED' ? 'مكتمل' :
            status === 'ASSIGNED' ? 'معين' :
            status === 'ON_WAY' ? 'في الطريق' : status,
      value: count,
      color: status === 'PENDING' ? 'bg-rose-500' :
             status === 'IN_PROGRESS' ? 'bg-amber-500' :
             status === 'COMPLETED' ? 'bg-emerald-500' :
             status === 'ASSIGNED' ? 'bg-blue-500' :
             status === 'ON_WAY' ? 'bg-purple-500' : 'bg-gray-500'
    }));
  };

  const getPriorityChartData = () => {
    if (!analytics.requests?.byPriority) return [];
    return Object.entries(analytics.requests.byPriority).map(([priority, count]) => ({
      name: priority === 'EMERGENCY' ? 'طارئ' :
            priority === 'URGENT' ? 'عاجل' :
            priority === 'NORMAL' ? 'عادي' : priority,
      value: count,
      color: priority === 'EMERGENCY' ? 'bg-rose-500' :
             priority === 'URGENT' ? 'bg-amber-500' :
             priority === 'NORMAL' ? 'bg-emerald-500' : 'bg-gray-500'
    }));
  };

  const handleFilterChange = (e) => {
    setFilter(e.target.value);
  };

  const handleDateChange = (e) => {
    const { name, value } = e.target;
    setDateRange(prev => ({ ...prev, [name]: value }));
  };

  const handleGenerateReport = async () => {
    try {
      setGeneratingReport(true);
      const response = await managerService.generateReport({
        startDate: dateRange.start,
        endDate: dateRange.end,
        type: 'monthly'
      });
      
      if (response.data?.url) {
        window.open(response.data.url, '_blank');
        showToast('تم إنشاء التقرير بنجاح', 'success');
      }
    } catch (err) {
      showToast('فشل إنشاء التقرير', 'error');
    } finally {
      setGeneratingReport(false);
    }
  };

  if (loading && !stats) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loading size="lg" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <EmptyState
          title="حدث خطأ"
          description={error}
          actionLabel="إعادة المحاولة"
          onAction={() => fetchDashboard()}
        />
      </div>
    );
  }

  return (
    <div className="space-y-6 p-4 md:p-6">
      {/* العنوان والإجراءات */}
      <PageHeader
        title="لوحة التحكم"
        subtitle="نظرة عامة على نظام إدارة صيانة المصاعد"
        actions={
          <div className="flex flex-wrap gap-3">
            {/* <Button 
              variant="primary" 
              leftIcon={<BarChart3 size={18} />}
              onClick={handleGenerateReport}
              loading={generatingReport}
              className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800"
            >
              إنشاء تقرير
            </Button> */}
            <Button 
              variant="outline"
              onClick={() => fetchAllAnalytics()}
              loading={loading}
            >
              تحديث البيانات
            </Button>
          </div>
        }
      />

      {/* الإحصائيات الرئيسية */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        {mainStats.map((stat, index) => (
          <Card key={index} className="p-5 border-0 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500 mb-1">{stat.title}</p>
                <p className="text-2xl font-bold text-gray-900">{stat.value.toLocaleString()}</p>
                <div className="flex items-center mt-2">
                  <TrendingUp size={16} className="text-green-500 ml-1" />
                  <span className="text-sm text-green-600">+0%</span>
                  <span className="text-sm text-gray-400 mr-2">من الشهر الماضي</span>
                </div>
              </div>
              <div className={`${stat.color} p-3 rounded-xl`}>
                {stat.icon}
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* المحتوى الرئيسي */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* الجانب الأيسر: الإجراءات السريعة والطلبات */}
        <div className="lg:col-span-2 space-y-6">
          {/* الإجراءات السريعة */}
          <Card title="الإجراءات السريعة" className="border-0 shadow-sm">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {quickActions.map((action, index) => (
                <a
                  key={index}
                  href={action.path}
                  className="group block"
                >
                  <div className={`${action.color} p-4 rounded-xl transition-all duration-200 group-hover:scale-[1.02] group-hover:shadow-md`}>
                    <div className="flex items-center gap-4">
                      <div className={`p-3 rounded-lg ${action.iconColor} bg-white/50`}>
                        {action.icon}
                      </div>
                      <div className="flex-1 text-right">
                        <p className="font-bold text-gray-900">{action.label}</p>
                        <p className="text-sm text-gray-600 mt-1">{action.description}</p>
                      </div>
                    </div>
                  </div>
                </a>
              ))}
            </div>
          </Card>

          {/* الطلبات المعلقة */}
          <Card 
            title="الطلبات المعلقة" 
            className="border-0 shadow-sm"
            action={
              <a href="/requests">
                <Button variant="outline" size="sm" className="text-blue-600 border-blue-200 hover:bg-blue-50">
                  عرض الكل
                </Button>
              </a>
            }
          >
            {pendingRequests.length === 0 ? (
              <EmptyState
                title="لا توجد طلبات معلقة"
                description="جميع الطلبات قيد المعالجة"
                icon={<CheckCircle size={48} className="text-gray-300" />}
              />
            ) : (
              <div className="space-y-4">
                {pendingRequests.slice(0, 5).map((req) => (
                  <div key={req.id} className="p-4 border border-gray-200 rounded-xl hover:border-blue-300 hover:bg-blue-50/50 transition-all">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <span className="font-bold text-gray-900">{req.referenceNumber}</span>
                          {req.priority === 'EMERGENCY' ? (
                            <Badge variant="danger" className="bg-rose-100 text-rose-800 border-rose-200">
                              طارئ
                            </Badge>
                          ) : req.priority === 'URGENT' ? (
                            <Badge variant="warning" className="bg-amber-100 text-amber-800 border-amber-200">
                              عاجل
                            </Badge>
                          ) : (
                            <Badge variant="success" className="bg-emerald-100 text-emerald-800 border-emerald-200">
                              عادي
                            </Badge>
                          )}
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-3">
                          <div>
                            <div className="flex items-center gap-2 text-sm text-gray-600 mb-1">
                              <UserCheck size={14} />
                              <span className="font-medium">العميل:</span>
                              <span>{req.client?.user?.fullName}</span>
                            </div>
                            <div className="flex items-center gap-2 text-sm text-gray-600">
                              <Phone size={14} />
                              <span>{req.client?.user?.phoneNumber}</span>
                            </div>
                          </div>
                          
                          <div>
                            <div className="flex items-center gap-2 text-sm text-gray-600 mb-1">
                              <Building size={14} />
                              <span className="font-medium">المصعد:</span>
                              <span>{req.elevator?.modelNumber}</span>
                            </div>
                            <div className="flex items-center gap-2 text-sm text-gray-600">
                              <MapPin size={14} />
                              <span className="truncate">{req.elevator?.locationAddress}</span>
                            </div>
                          </div>
                        </div>
                        
                        <div className="flex items-center justify-between border-t border-gray-100 pt-3">
                          <div className="flex items-center gap-4">
                            <div className="flex items-center gap-2 text-sm">
                              <Clock size={14} className="text-gray-400" />
                              <span className="text-gray-500">
                                {new Date(req.createdAt).toLocaleDateString('ar-SA')}
                              </span>
                            </div>
                            <Badge 
                              variant={req.requestType === 'EMERGENCY' ? 'danger' : 'info'}
                              className="text-xs"
                            >
                              {req.requestType === 'EMERGENCY' ? 'طلب طارئ' : 'طلب عادي'}
                            </Badge>
                          </div>
                          
                          {/* <a href={`/requests/${req.id}`}>
                            <Button variant="outline" size="sm" className="text-blue-600 border-blue-200 hover:bg-blue-50">
                              <Eye size={16} className="ml-1" />
                              عرض التفاصيل
                            </Button>
                          </a> */}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>

        {/* الجانب الأيمن: التحليلات */}
        <div className="space-y-6">
          {/* تحليل حالة الطلبات */}
          <Card title="حالة الطلبات" className="border-0 shadow-sm">
            <div className="space-y-4">
              {getStatusChartData().map((item, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`w-3 h-3 rounded-full ${item.color}`}></div>
                    <span className="text-sm font-medium text-gray-700">{item.name}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="font-bold text-gray-900">{item.value}</span>
                    <span className="text-xs text-gray-500">طلبات</span>
                  </div>
                </div>
              ))}
            </div>
          </Card>

          {/* تحليل أولوية الطلبات */}
          <Card title="أولوية الطلبات" className="border-0 shadow-sm">
            <div className="space-y-4">
              {getPriorityChartData().map((item, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`w-3 h-3 rounded-full ${item.color}`}></div>
                    <span className="text-sm font-medium text-gray-700">{item.name}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="font-bold text-gray-900">{item.value}</span>
                    <span className="text-xs text-gray-500">طلبات</span>
                  </div>
                </div>
              ))}
            </div>
          </Card>

          {/* إحصائيات سريعة */}
          <Card title="إحصائيات سريعة" className="border-0 shadow-sm">
            <div className="space-y-4">
              {analytics.clients && (
                <div className="p-3 bg-gradient-to-r from-blue-50 to-blue-100 border border-blue-200 rounded-lg">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-blue-800">أفضل العملاء</p>
                      <p className="text-lg font-bold text-gray-900 mt-1">
                        {analytics.clients[0]?.name || 'لا يوجد'}
                      </p>
                    </div>
                    <div className="p-2 bg-white/50 rounded-lg">
                      <Users className="text-blue-600" size={20} />
                    </div>
                  </div>
                  <p className="text-xs text-blue-600 mt-2">
                    {analytics.clients[0]?.totalRequests || 0} طلب
                  </p>
                </div>
              )}

              {analytics.elevators && (
                <div className="p-3 bg-gradient-to-r from-emerald-50 to-emerald-100 border border-emerald-200 rounded-lg">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-emerald-800">حالة المصاعد</p>
                      <div className="flex items-center gap-3 mt-1">
                        <div>
                          <p className="text-lg font-bold text-gray-900">
                            {analytics.elevators.byStatus?.ACTIVE || 0}
                          </p>
                          <p className="text-xs text-emerald-600">نشطة</p>
                        </div>
                        <div>
                          <p className="text-lg font-bold text-gray-900">
                            {analytics.elevators.byStatus?.OUT_OF_SERVICE || 0}
                          </p>
                          <p className="text-xs text-rose-600">خارج الخدمة</p>
                        </div>
                      </div>
                    </div>
                    <div className="p-2 bg-white/50 rounded-lg">
                      <Building className="text-emerald-600" size={20} />
                    </div>
                  </div>
                </div>
              )}

              {stats && (
                <div className="p-3 bg-gradient-to-r from-amber-50 to-amber-100 border border-amber-200 rounded-lg">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-amber-800">معدل الإنجاز</p>
                      <p className="text-lg font-bold text-gray-900 mt-1">
                        {stats.totalRequests > 0 
                          ? `${Math.round((stats.completedRequests / stats.totalRequests) * 100)}%`
                          : '0%'
                        }
                      </p>
                    </div>
                    <div className="p-2 bg-white/50 rounded-lg">
                      <CheckCircle className="text-amber-600" size={20} />
                    </div>
                  </div>
                  <p className="text-xs text-amber-600 mt-2">
                    {stats.completedRequests} من أصل {stats.totalRequests} طلب
                  </p>
                </div>
              )}
            </div>
          </Card>
        </div>
      </div>

      {/* العملاء */}
      {/* {analytics.clients && analytics.clients.length > 0 && (
        <Card title="أفضل العملاء" className="border-0 shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-right py-3 px-4 text-sm font-medium text-gray-500">العميل</th>
                  <th className="text-right py-3 px-4 text-sm font-medium text-gray-500">معلومات التواصل</th>
                  <th className="text-right py-3 px-4 text-sm font-medium text-gray-500">المصاعد</th>
                  <th className="text-right py-3 px-4 text-sm font-medium text-gray-500">الطلبات</th>
                  <th className="text-right py-3 px-4 text-sm font-medium text-gray-500">العقود</th>
                  <th className="text-right py-3 px-4 text-sm font-medium text-gray-500">الحالة</th>
                </tr>
              </thead>
              <tbody>
                {analytics.clients.slice(0, 5).map((client, index) => (
                  <tr key={client.id || index} className="border-b border-gray-100 hover:bg-gray-50/50">
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-blue-100 to-blue-200 rounded-full flex items-center justify-center">
                          <span className="font-bold text-blue-700 text-lg">
                            {client.name?.charAt(0) || 'ع'}
                          </span>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-gray-900">{client.name}</p>
                          <p className="text-sm text-gray-500">عميل #{client.id}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <Mail size={14} />
                          <span>{client.email}</span>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-2">
                        <Building size={18} className="text-blue-500" />
                        <span className="font-bold text-gray-900">{client.totalElevators}</span>
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-2">
                        <FileText size={18} className="text-emerald-500" />
                        <span className="font-bold text-gray-900">{client.totalRequests}</span>
                        <TrendingUp size={16} className="text-green-500" />
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-2">
                        <Shield size={18} className="text-purple-500" />
                        <span className="font-bold text-gray-900">{client.totalContracts}</span>
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <Badge 
                        variant="success" 
                        className="bg-emerald-100 text-emerald-800 border-emerald-200"
                      >
                        نشط
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )} */}
    </div>
  );
};

export default Dashboard;