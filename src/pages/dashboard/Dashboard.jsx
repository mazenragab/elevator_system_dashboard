import { useState, useEffect } from 'react';
import { 
  Users, 
  Building, 
  CheckCircle, 
  AlertCircle, 
  FileText,
  UserCheck,
  Phone,
  MapPin,
  Clock,
} from 'lucide-react';
import PageHeader from '../../components/layout/PageHeader';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';
import Loading from '../../components/ui/Loading';
import EmptyState from '../../components/ui/EmptyState';
import { useDashboard } from '../../hooks/useDashboard';
import { useToast } from '../../hooks/useToast';

const Dashboard = () => {
  const { 
    dashboardData, 
    stats, 
    pendingRequests, 
    analytics, 
    loading, 
    error,
    fetchDashboard,
    fetchPendingRequests,
    fetchAllAnalytics,
    refetch
  } = useDashboard();
  
  const { showToast } = useToast();

  // ✅ Load data on mount
  useEffect(() => {
    const loadData = async () => {
      try {
        // استدعاء جميع البيانات بالتوازي
        await Promise.all([
          fetchDashboard(),
          fetchPendingRequests(), // ✅ استدعاء صريح للطلبات المعلقة
          fetchAllAnalytics()
        ]);
      } catch (err) {
        console.error('Error loading dashboard:', err);
        showToast('فشل تحميل البيانات', 'error');
      }
    };
    
    loadData();
  }, [fetchDashboard, fetchPendingRequests, fetchAllAnalytics, showToast]);

  // ✅ Debug: Log data when it changes
  useEffect(() => {
    console.log('📊 Dashboard Data:', {
      stats,
      pendingRequests,
      analytics,
      loading,
      error
    });
  }, [stats, pendingRequests, analytics, loading, error]);

  // الإحصائيات الرئيسية
  const mainStats = stats ? [
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
      path: '/contracts'
    },
  ];

  // ✅ معالجة البيانات للرسوم البيانية - with safe checks
  const getStatusChartData = () => {
    if (!analytics?.requests?.byStatus) {
      console.warn('⚠️ No analytics.requests.byStatus data');
      return [];
    }
    
    return Object.entries(analytics.requests.byStatus).map(([status, count]) => ({
      name: status === 'PENDING' ? 'معلق' :
            status === 'IN_PROGRESS' ? 'قيد التنفيذ' :
            status === 'COMPLETED' ? 'مكتمل' :
            status === 'CANCELLED' ? 'ملغي' :
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
    if (!analytics?.requests?.byPriority) {
      console.warn('⚠️ No analytics.requests.byPriority data');
      return [];
    }
    
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

  // ✅ Handle refresh with proper error handling
  const handleRefresh = async () => {
    try {
      await refetch();
      showToast('تم تحديث البيانات بنجاح', 'success');
    } catch (err) {
      showToast('فشل تحديث البيانات', 'error');
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
          onAction={handleRefresh}
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
            <Button 
              variant="outline"
              onClick={handleRefresh}
              loading={loading}
            >
              تحديث البيانات
            </Button>
          </div>
        }
      />

      {/* الإحصائيات الرئيسية */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {mainStats.map((stat, index) => (
          <Card key={index} className="p-5 border-0 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500 mb-1">{stat.title}</p>
                <p className="text-2xl font-bold text-gray-900">{stat.value.toLocaleString()}</p>
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
              {!pendingRequests || pendingRequests.length === 0 ? (
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
                        <div className="flex items-center gap-3 mb-3">
                          <span className="font-bold text-gray-900 text-base">{req.referenceNumber}</span>
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
                          <Badge 
                            variant={req.requestType === 'EMERGENCY' ? 'danger' : 'info'}
                            className="text-xs"
                          >
                            {req.requestType === 'EMERGENCY' ? 'طوارئ' : 'صيانة'}
                          </Badge>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-3">
                          <div className="space-y-1">
                            <div className="flex items-center gap-2 text-sm">
                              <UserCheck size={14} className="text-blue-500 flex-shrink-0" />
                              <span className="font-medium text-gray-700">العميل:</span>
                              <span className="text-gray-900">{req.clientName || req.client?.user?.fullName || 'غير محدد'}</span>
                            </div>
                            <div className="flex items-center gap-2 text-sm text-gray-600">
                              <Phone size={14} className="text-gray-400 flex-shrink-0" />
                              <span dir="ltr">{req.clientPhone || req.client?.user?.phoneNumber || 'غير متوفر'}</span>
                            </div>
                            {req.clientEmail && (
                              <div className="flex items-center gap-2 text-sm text-gray-600">
                                <span className="text-xs">✉</span>
                                <span className="truncate">{req.clientEmail}</span>
                              </div>
                            )}
                          </div>
                          
                          <div className="space-y-1">
                            <div className="flex items-center gap-2 text-sm">
                              <Building size={14} className="text-purple-500 flex-shrink-0" />
                              <span className="font-medium text-gray-700">المصعد:</span>
                              <span className="text-gray-900">{req.elevatorModel || req.elevator?.modelNumber || 'غير محدد'}</span>
                            </div>
                            {req.serialNumber && (
                              <div className="flex items-center gap-2 text-sm text-gray-600">
                                <span className="font-mono text-xs bg-gray-100 px-2 py-0.5 rounded">
                                  {req.serialNumber}
                                </span>
                              </div>
                            )}
                            <div className="flex items-start gap-2 text-sm text-gray-600">
                              <MapPin size={14} className="text-gray-400 flex-shrink-0 mt-0.5" />
                              <span className="line-clamp-2">{req.location || req.elevator?.locationAddress || 'غير محدد'}</span>
                            </div>
                          </div>
                        </div>
                        
                        {req.description && (
                          <div className="mb-3 p-3 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-100 rounded-lg">
                            <p className="text-sm text-gray-700 font-medium mb-1">الوصف:</p>
                            <p className="text-sm text-gray-600">{req.description}</p>
                          </div>
                        )}
                        
                        <div className="flex items-center justify-between border-t border-gray-100 pt-3">
                          <div className="flex items-center gap-2 text-sm">
                            <Clock size={14} className="text-gray-400" />
                            <span className="text-gray-500">
                              {new Date(req.createdAt).toLocaleDateString('ar-SA', {
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric'
                              })}
                            </span>
                          </div>
                          
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
                
                {pendingRequests.length > 5 && (
                  <div className="text-center pt-2">
                    <a href="/requests?status=PENDING">
                      <Button variant="outline" className="w-full">
                        عرض جميع الطلبات المعلقة ({pendingRequests.length})
                      </Button>
                    </a>
                  </div>
                )}
              </div>
            )}
          </Card>
        </div>

        {/* الجانب الأيمن: التحليلات */}
        <div className="space-y-6">
          {/* تحليل حالة الطلبات */}
          <Card title="حالة الطلبات" className="border-0 shadow-sm">
            {getStatusChartData().length === 0 ? (
              <EmptyState
                title="لا توجد بيانات"
                description="لا توجد طلبات لعرضها"
                icon={<FileText size={32} className="text-gray-300" />}
              />
            ) : (
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
            )}
          </Card>

          {/* تحليل أولوية الطلبات */}
          <Card title="أولوية الطلبات" className="border-0 shadow-sm">
            {getPriorityChartData().length === 0 ? (
              <EmptyState
                title="لا توجد بيانات"
                description="لا توجد طلبات لعرضها"
                icon={<FileText size={32} className="text-gray-300" />}
              />
            ) : (
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
            )}
          </Card>

          {/* إحصائيات سريعة */}
          <Card title="إحصائيات سريعة" className="border-0 shadow-sm">
            <div className="space-y-4">
              {analytics?.clients && analytics.clients.length > 0 && (
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

              {analytics?.elevators && (
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
    </div>
  );
};

export default Dashboard;