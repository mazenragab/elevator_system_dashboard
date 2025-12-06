import { useState, useEffect, useMemo } from 'react';
import { 
  Search, 
  FileText, 
  Clock,
  Wrench,
  CheckCircle,
  AlertTriangle,
  Eye,
  Download,
  Filter,
  BarChart3,
  Users,
  ChevronLeft,
  ChevronRight,
  Hash,
  User,
  Home,
  Building,
  Calendar,
  MapPin
} from 'lucide-react';
import PageHeader from '../../components/layout/PageHeader';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Input from '../../components/forms/Input';
import Select from '../../components/forms/Select';
import Loading from '../../components/ui/Loading';
import EmptyState from '../../components/ui/EmptyState';
import Modal from '../../components/ui/Modal';
import { useReports } from '../../hooks/useReports';
import { useToast } from '../../hooks/useToast';

const Reports = () => {
  const { 
    reports, 
    loading, 
    error,
    statistics,
    pagination,
    selectedReport,
    fetchReports,
    fetchReportById,
    exportReport,
    fetchStatistics,
    setSelectedReport
  } = useReports();
  
  const { showToast } = useToast();
  
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState('date');
  const [selectedReportId, setSelectedReportId] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [loadingDetails, setLoadingDetails] = useState(false);
  const [downloading, setDownloading] = useState(false);

  const filteredReports = useMemo(() => {
    if (!Array.isArray(reports)) {
      console.log('Reports is not an array:', reports);
      return [];
    }
    
    let result = [...reports];

    // البحث بواسطة نوع المشكلة أو رقم الطلب أو اسم الفني
    if (search.trim()) {
      const searchLower = search.toLowerCase();
      result = result.filter(report =>
        report.problemType?.toLowerCase().includes(searchLower) ||
        report.request?.referenceNumber?.toLowerCase().includes(searchLower) ||
        report.technician?.user?.fullName?.toLowerCase().includes(searchLower) ||
        report.request?.elevator?.modelNumber?.toLowerCase().includes(searchLower)
      );
    }

    // الترتيب
    if (sortBy === 'date') {
      result.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
    } else if (sortBy === 'date_oldest') {
      result.sort((a, b) => new Date(a.createdAt || 0) - new Date(b.createdAt || 0));
    } else if (sortBy === 'time') {
      result.sort((a, b) => (b.timeSpentMinutes || 0) - (a.timeSpentMinutes || 0));
    } else if (sortBy === 'problem') {
      result.sort((a, b) => (a.problemType || '').localeCompare(b.problemType || ''));
    }

    return result;
  }, [reports, search, sortBy]);

  const handleSearch = () => {
    // البحث المحلي
  };

  const handleSortChange = (e) => {
    setSortBy(e.target.value);
  };

  const handleViewDetails = async (report) => {
    setSelectedReportId(report.id);
    setLoadingDetails(true);
    setSelectedReport(null);
    
    try {
      const details = await fetchReportById(report.id);
      setShowDetailsModal(true);
    } catch (err) {
      showToast('فشل تحميل بيانات التقرير', 'error');
    } finally {
      setLoadingDetails(false);
    }
  };

  const handleExportReport = async (reportId, format = 'pdf') => {
    setDownloading(true);
    try {
      await exportReport(reportId, format);
      showToast('تم تصدير التقرير بنجاح', 'success');
    } catch (err) {
      showToast('فشل تصدير التقرير', 'error');
    } finally {
      setDownloading(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'غير محدد';
    return new Date(dateString).toLocaleDateString('ar-SA', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatTime = (minutes) => {
    if (!minutes) return 'غير محدد';
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    
    if (hours > 0) {
      return `${hours} ساعة ${mins > 0 ? `${mins} دقيقة` : ''}`;
    }
    return `${mins} دقيقة`;
  };

  const handlePageChange = (page) => {
    const params = {
      page,
      limit: pagination.limit,
    };
    fetchReports(params);
  };

  const PaginationComponent = () => {
    if (pagination.totalPages <= 1) return null;
    
    const pages = [];
    const maxPagesToShow = 5;
    let startPage = Math.max(1, pagination.page - Math.floor(maxPagesToShow / 2));
    let endPage = Math.min(pagination.totalPages, startPage + maxPagesToShow - 1);
    
    if (endPage - startPage + 1 < maxPagesToShow) {
      startPage = Math.max(1, endPage - maxPagesToShow + 1);
    }
    
    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }
    
    return (
      <div className="flex items-center justify-center gap-2 mt-6">
        <Button
          variant="outline"
          size="sm"
          onClick={() => handlePageChange(pagination.page - 1)}
          disabled={pagination.page === 1}
          className="w-10 h-10 p-0"
        >
          <ChevronLeft size={16} />
        </Button>
        
        {startPage > 1 && (
          <>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handlePageChange(1)}
              className="w-10 h-10"
            >
              1
            </Button>
            {startPage > 2 && (
              <span className="px-2 text-gray-400">...</span>
            )}
          </>
        )}
        
        {pages.map((pageNum) => (
          <Button
            key={pageNum}
            variant={pageNum === pagination.page ? "primary" : "outline"}
            size="sm"
            onClick={() => handlePageChange(pageNum)}
            className={`w-10 h-10 ${pageNum === pagination.page ? 'bg-blue-600 text-white' : ''}`}
          >
            {pageNum}
          </Button>
        ))}
        
        {endPage < pagination.totalPages && (
          <>
            {endPage < pagination.totalPages - 1 && (
              <span className="px-2 text-gray-400">...</span>
            )}
            <Button
              variant="outline"
              size="sm"
              onClick={() => handlePageChange(pagination.totalPages)}
              className="w-10 h-10"
            >
              {pagination.totalPages}
            </Button>
          </>
        )}
        
        <Button
          variant="outline"
          size="sm"
          onClick={() => handlePageChange(pagination.page + 1)}
          disabled={pagination.page === pagination.totalPages}
          className="w-10 h-10 p-0"
        >
          <ChevronRight size={16} />
        </Button>
      </div>
    );
  };

  const ProblemTypeBadge = ({ type }) => {
    const typeConfig = {
      'عطل في الموتور': {
        color: 'bg-red-100 text-red-700',
        icon: <AlertTriangle size={14} />
      },
      'عطل في الباب': {
        color: 'bg-orange-100 text-orange-700',
        icon: <AlertTriangle size={14} />
      },
      'عطل كهربائي': {
        color: 'bg-yellow-100 text-yellow-700',
        icon: <AlertTriangle size={14} />
      },
      'صيانة دورية': {
        color: 'bg-blue-100 text-blue-700',
        icon: <CheckCircle size={14} />
      },
      'تغيير كابلات': {
        color: 'bg-purple-100 text-purple-700',
        icon: <Wrench size={14} />
      }
    };

    const config = typeConfig[type] || {
      color: 'bg-gray-100 text-gray-700',
      icon: <FileText size={14} />
    };

    return (
      <div className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm ${config.color}`}>
        {config.icon}
        <span>{type || 'غير محدد'}</span>
      </div>
    );
  };

  if (loading && (!Array.isArray(reports) || reports.length === 0)) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loading size="lg" />
      </div>
    );
  }

  if (error && (!Array.isArray(reports) || reports.length === 0)) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <EmptyState
          icon={<FileText className="w-16 h-16 text-gray-300" />}
          title="حدث خطأ"
          description={error}
          actionLabel="إعادة المحاولة"
          onAction={() => fetchReports()}
        />
      </div>
    );
  }

  if (!Array.isArray(reports) || reports.length === 0) {
    return (
      <div className="space-y-6 p-4 md:p-6">
        <PageHeader
          title="التقارير"
          subtitle="عرض تقارير الصيانة والإصلاح"
        />
        
        <Card className="shadow-sm">
          <EmptyState
            icon={<FileText className="w-16 h-16 text-gray-300" />}
            title="لا توجد تقارير"
            description="لم يتم العثور على تقارير في النظام"
          />
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-4 md:p-6">
      {/* العنوان */}
      <PageHeader
        title="التقارير"
        subtitle="عرض تقارير الصيانة والإصلاح"
      />

      {/* الفلترة والبحث */}
      <Card className="p-6 shadow-sm">
        <div className="flex flex-col md:flex-row gap-4 md:items-center md:justify-between">
          <div className="flex-1">
            <Input
              placeholder="ابحث بنوع المشكلة أو الفني أو رقم الطلب أو الموديل..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
              leftIcon={<Search size={18} />}
              className="w-full"
            />
          </div>
          <div className="w-full md:w-64">
            <Select
              value={sortBy}
              onChange={handleSortChange}
              options={[
                { value: 'date', label: 'الأحدث أولاً' },
                { value: 'date_oldest', label: 'الأقدم أولاً' },
                { value: 'time', label: 'أطول وقت' },
                { value: 'problem', label: 'نوع المشكلة' },
              ]}
              className="w-full"
            />
          </div>
        </div>
      </Card>

      {/* إحصائيات سريعة */}
      {statistics && (
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
          <Card className="p-4 md:p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <div className="text-right">
                <p className="text-2xl md:text-3xl font-bold text-gray-900">{statistics.totalReports || 0}</p>
                <p className="text-xs md:text-sm text-blue-600 font-medium mt-1">إجمالي التقارير</p>
              </div>
              <div className="p-2 md:p-3 bg-blue-50 rounded-lg md:rounded-xl">
                <FileText className="text-blue-600 w-5 h-5 md:w-6 md:h-6" />
              </div>
            </div>
          </Card>
          
          <Card className="p-4 md:p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <div className="text-right">
                <p className="text-2xl md:text-3xl font-bold text-gray-900">{statistics.avgTimeSpent || 0} د</p>
                <p className="text-xs md:text-sm text-emerald-600 font-medium mt-1">متوسط وقت الإصلاح</p>
              </div>
              <div className="p-2 md:p-3 bg-emerald-50 rounded-lg md:rounded-xl">
                <Clock className="text-emerald-600 w-5 h-5 md:w-6 md:h-6" />
              </div>
            </div>
          </Card>
          
          <Card className="p-4 md:p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <div className="text-right">
                <p className="text-2xl md:text-3xl font-bold text-gray-900">{statistics.totalProblems || 0}</p>
                <p className="text-xs md:text-sm text-purple-600 font-medium mt-1">أنواع المشاكل</p>
              </div>
              <div className="p-2 md:p-3 bg-purple-50 rounded-lg md:rounded-xl">
                <AlertTriangle className="text-purple-600 w-5 h-5 md:w-6 md:h-6" />
              </div>
            </div>
          </Card>
          
          <Card className="p-4 md:p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <div className="text-right">
                <p className="text-2xl md:text-3xl font-bold text-gray-900">{statistics.techniciansCount || 0}</p>
                <p className="text-xs md:text-sm text-amber-600 font-medium mt-1">فنيين مشاركين</p>
              </div>
              <div className="p-2 md:p-3 bg-amber-50 rounded-lg md:rounded-xl">
                <Users className="text-amber-600 w-5 h-5 md:w-6 md:h-6" />
              </div>
            </div>
          </Card>
          
          <Card className="p-4 md:p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <div className="text-right">
                <p className="text-2xl md:text-3xl font-bold text-gray-900">{statistics.completedWithImages || 0}%</p>
                <p className="text-xs md:text-sm text-rose-600 font-medium mt-1">تقارير بالصور</p>
              </div>
              <div className="p-2 md:p-3 bg-rose-50 rounded-lg md:rounded-xl">
                <CheckCircle className="text-rose-600 w-5 h-5 md:w-6 md:h-6" />
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* قائمة التقارير */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
        {filteredReports.map((report) => {
          const request = report.request || {};
          const technician = report.technician || {};
          const elevator = request.elevator || {};
          const client = request.client || {};
          
          return (
            <Card key={report.id} className="shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden">
              <div className="p-4 md:p-6">
                {/* رأس البطاقة */}
                <div className="flex items-start justify-between mb-4 md:mb-6">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 md:w-12 md:h-12 bg-gradient-to-br from-blue-500 to-blue-700 rounded-lg flex items-center justify-center flex-shrink-0">
                      <FileText className="text-white w-5 h-5 md:w-6 md:h-6" />
                    </div>
                    <div className="text-right">
                      <h3 className="font-bold text-gray-900 text-sm md:text-base line-clamp-1">
                        {report.problemType || 'تقرير صيانة'}
                      </h3>
                      <p className="text-xs text-gray-500">
                        #{request.referenceNumber || 'غير محدد'}
                      </p>
                    </div>
                  </div>
                  <div className="flex-shrink-0">
                    <ProblemTypeBadge type={report.problemType} />
                  </div>
                </div>

                {/* معلومات التقرير */}
                <div className="space-y-2 md:space-y-3 mb-4 md:mb-6">
                  <div className="flex items-center justify-between text-xs md:text-sm">
                    <div className="flex items-center gap-1 md:gap-2 text-gray-600">
                      <Calendar size={14} className="text-gray-400 flex-shrink-0" />
                      <span className="hidden md:inline">تاريخ الإنشاء</span>
                      <span className="md:hidden">التاريخ</span>
                    </div>
                    <span className="font-medium text-gray-900 text-xs md:text-sm">
                      {formatDate(report.createdAt)}
                    </span>
                  </div>
                  
                  <div className="flex items-center justify-between text-xs md:text-sm">
                    <div className="flex items-center gap-1 md:gap-2 text-gray-600">
                      <Clock size={14} className="text-gray-400 flex-shrink-0" />
                      <span className="hidden md:inline">وقت الإصلاح</span>
                      <span className="md:hidden">الوقت</span>
                    </div>
                    <span className="font-medium text-gray-900 text-xs md:text-sm">
                      {formatTime(report.timeSpentMinutes)}
                    </span>
                  </div>
                  
                  <div className="flex items-center justify-between text-xs md:text-sm">
                    <div className="flex items-center gap-1 md:gap-2 text-gray-600">
                      <User size={14} className="text-gray-400 flex-shrink-0" />
                      <span>الفني</span>
                    </div>
                    <span className="font-medium text-gray-900 text-xs md:text-sm truncate max-w-[120px] md:max-w-[150px]">
                      {technician.user?.fullName || 'غير محدد'}
                    </span>
                  </div>
                  
                  <div className="flex items-center justify-between text-xs md:text-sm">
                    <div className="flex items-center gap-1 md:gap-2 text-gray-600">
                      <Home size={14} className="text-gray-400 flex-shrink-0" />
                      <span>المصعد</span>
                    </div>
                    <span className="font-medium text-gray-900 text-xs md:text-sm truncate max-w-[100px] md:max-w-[130px]">
                      {elevator.modelNumber || 'غير محدد'}
                    </span>
                  </div>
                  
                  <div className="flex items-center justify-between text-xs md:text-sm">
                    <div className="flex items-center gap-1 md:gap-2 text-gray-600">
                      <Building size={14} className="text-gray-400 flex-shrink-0" />
                      <span>العميل</span>
                    </div>
                    <span className="font-medium text-gray-900 text-xs md:text-sm truncate max-w-[100px] md:max-w-[130px]">
                      {client.user?.fullName || 'غير محدد'}
                    </span>
                  </div>
                </div>

                {/* الإحصائيات */}
                <div className="grid grid-cols-3 gap-2 md:gap-4 pt-3 md:pt-4 border-t border-gray-200">
                  <div className="text-center">
                    <div className="flex items-center justify-center gap-1">
                      <Hash size={12} className="text-blue-500 hidden md:block" />
                      <span className="font-bold text-xs md:text-sm">{report.images?.length || 0}</span>
                    </div>
                    <p className="text-[10px] md:text-xs text-gray-500 mt-1">الصور</p>
                  </div>
                  
                  <div className="text-center">
                    <div className="flex items-center justify-center gap-1">
                      <Wrench size={12} className="text-emerald-500 hidden md:block" />
                      <span className="font-bold text-xs md:text-sm">{request.priority ? 1 : 0}</span>
                    </div>
                    <p className="text-[10px] md:text-xs text-gray-500 mt-1">أولوية</p>
                  </div>
                  
                  <div className="text-center">
                    <div className="flex items-center justify-center gap-1">
                      <CheckCircle size={12} className="text-amber-500 hidden md:block" />
                      <span className="font-bold text-xs md:text-sm">{request.status === 'COMPLETED' ? 1 : 0}</span>
                    </div>
                    <p className="text-[10px] md:text-xs text-gray-500 mt-1">مكتمل</p>
                  </div>
                </div>

                {/* الأزرار */}
                <div className="flex gap-2 mt-4 md:mt-6">
                  <Button 
                    variant="outline" 
                    className="flex-1 text-blue-600 border-blue-200 hover:bg-blue-50 text-xs md:text-sm py-2"
                    onClick={() => handleViewDetails(report)}
                    leftIcon={<Eye size={14} className="hidden md:block" />}
                  >
                    <span className="hidden md:inline">التفاصيل</span>
                    <span className="md:hidden">تفاصيل</span>
                  </Button>
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      {/* الترقيم */}
      <PaginationComponent />

      {/* مودال تفاصيل التقرير */}
      {selectedReport && (
        <Modal
          isOpen={showDetailsModal}
          onClose={() => {
            setShowDetailsModal(false);
            setSelectedReport(null);
          }}
          title="تفاصيل التقرير"
          size="lg"
        >
          {loadingDetails ? (
            <div className="flex items-center justify-center py-12">
              <Loading size="md" />
            </div>
          ) : (
            <div className="space-y-6">
              {/* معلومات التقرير الأساسية */}
              <Card className="shadow-sm">
                <div className="p-4 md:p-6">
                  <div className="flex items-start justify-between mb-6">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 md:w-16 md:h-16 bg-gradient-to-br from-blue-500 to-blue-700 rounded-xl flex items-center justify-center flex-shrink-0">
                        <FileText className="text-white w-6 h-6 md:w-8 md:h-8" />
                      </div>
                      <div className="text-right">
                        <h3 className="font-bold text-lg md:text-2xl text-gray-900">
                          {selectedReport.problemType}
                        </h3>
                        <p className="text-xs md:text-sm text-gray-500 mt-1">
                          #{selectedReport.request?.referenceNumber}
                        </p>
                        <div className="mt-2">
                          <ProblemTypeBadge type={selectedReport.problemType} />
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-500 mb-2">وصف المشكلة</label>
                        <div className="p-3 bg-gray-50 rounded-lg min-h-[100px]">
                          <p className="text-gray-900 text-sm md:text-base">
                            {selectedReport.solutionDescription || 'لا يوجد وصف'}
                          </p>
                        </div>
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-500 mb-2">الأجزاء المستبدلة</label>
                        <div className="p-3 bg-gray-50 rounded-lg">
                          <p className="text-gray-900 text-sm md:text-base">
                            {selectedReport.sparePartsDescription || 'لم يتم استبدال أي أجزاء'}
                          </p>
                        </div>
                      </div>
                    </div>
                    
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-500 mb-2">معلومات الطلب</label>
                        <div className="space-y-3 p-3 bg-gray-50 rounded-lg">
                          <div className="flex items-center justify-between">
                            <span className="text-gray-500 text-sm">رقم الطلب:</span>
                            <span className="font-medium text-gray-900 text-sm md:text-base">{selectedReport.request?.referenceNumber}</span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-gray-500 text-sm">الأولوية:</span>
                            <span className="font-medium text-gray-900 text-sm md:text-base">{selectedReport.request?.priority}</span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-gray-500 text-sm">النوع:</span>
                            <span className="font-medium text-gray-900 text-sm md:text-base">{selectedReport.request?.requestType}</span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-gray-500 text-sm">تاريخ الطلب:</span>
                            <span className="font-medium text-gray-900 text-sm md:text-base">
                              {formatDate(selectedReport.request?.createdAt)}
                            </span>
                          </div>
                        </div>
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-500 mb-2">معلومات الفني</label>
                        <div className="space-y-3 p-3 bg-gray-50 rounded-lg">
                          <div className="flex items-center justify-between">
                            <span className="text-gray-500 text-sm">اسم الفني:</span>
                            <span className="font-medium text-gray-900 text-sm md:text-base">{selectedReport.technician?.user?.fullName}</span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-gray-500 text-sm">وقت العمل:</span>
                            <span className="font-medium text-gray-900 text-sm md:text-base">{formatTime(selectedReport.timeSpentMinutes)}</span>
                          </div>
                        </div>
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-500 mb-2">معلومات المصعد</label>
                        <div className="space-y-3 p-3 bg-gray-50 rounded-lg">
                          <div className="flex items-center justify-between">
                            <span className="text-gray-500 text-sm">الموديل:</span>
                            <span className="font-medium text-gray-900 text-sm md:text-base">{selectedReport.request?.elevator?.modelNumber}</span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-gray-500 text-sm">الموقع:</span>
                            <span className="font-medium text-gray-900 text-sm md:text-base truncate">{selectedReport.request?.elevator?.locationAddress}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  {selectedReport.recommendations && (
                    <div className="mt-4 md:mt-6">
                      <label className="block text-sm font-medium text-gray-500 mb-2">التوصيات</label>
                      <div className="p-3 bg-amber-50 rounded-lg">
                        <p className="text-gray-900 text-sm md:text-base">{selectedReport.recommendations}</p>
                      </div>
                    </div>
                  )}
                </div>
              </Card>

              {/* أزرار الإجراءات */}
              <div className="flex flex-col md:flex-row gap-3 justify-end pt-4 border-t border-gray-200">
                <Button
                  variant="outline"
                  onClick={() => {
                    setShowDetailsModal(false);
                    setSelectedReport(null);
                  }}
                  className="w-full md:w-auto"
                >
                  إغلاق
                </Button>
                
              </div>
            </div>
          )}
        </Modal>
      )}
    </div>
  );
};

export default Reports;