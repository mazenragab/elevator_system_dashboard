import { useState, useEffect } from 'react';
import {
  Search,
  Filter,
  Plus,
  Clock,
  AlertCircle,
  CheckCircle,
  XCircle,
  Wrench,
  User,
  ChevronLeft,
  ChevronRight,
  Eye,
  Calendar,
  MapPin,
  Phone,
  Mail,
  FileText,
  Navigation,
  RefreshCw,
  SortAsc,
  SortDesc
} from 'lucide-react';
import PageHeader from '../../components/layout/PageHeader';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Input from '../../components/forms/Input';
import Select from '../../components/forms/Select';
import Badge from '../../components/ui/Badge';
import Loading from '../../components/ui/Loading';
import EmptyState from '../../components/ui/EmptyState';
import Modal from '../../components/ui/Modal';
import { useRequests } from '../../hooks/useRequests';
import { useToast } from '../../hooks/useToast';
import AddMaintenanceRequestModal from '../../components/models/AddMaintenanceRequestModal';
import AssignTechnicianModal from '../../components/models/AssignTechnicianModal';
import { formatDate, formatDateTime, getTimeDifference } from '../../utils/dateHelper';

const Requests = () => {
  const { showToast } = useToast();
  
  // استخدام useRequests مع القيم الافتراضية
  const {
    requests,
    loading,
    error,
    pagination,
    fetchRequests,
    fetchRequestById,
    createRequest,
    assignTechnician,
    updateStatus,
    updatePagination,
    refetch,
    updateFilters
  } = useRequests();

  // States
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');
  const [sortBy, setSortBy] = useState('createdAt_desc');
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [loadingDetails, setLoadingDetails] = useState(false);
  const [addRequestLoading, setAddRequestLoading] = useState(false);
  const [addRequestError, setAddRequestError] = useState(null);
  const [requestToAssign, setRequestToAssign] = useState(null);
  const [requestToUpdateStatus, setRequestToUpdateStatus] = useState(null);
  const [selectedStatus, setSelectedStatus] = useState('');

  // دالة البحث مع تأخير (debounce)
  useEffect(() => {
    const timer = setTimeout(() => {
      handleSearch();
    }, 500);

    return () => clearTimeout(timer);
  }, [search, filter, priorityFilter, sortBy]);

  const handleSearch = () => {
    const params = {
      page: 1,
      limit: pagination.limit,
      search: search.trim() || undefined,
      status: filter !== 'all' ? filter : undefined,
      priority: priorityFilter !== 'all' ? priorityFilter : undefined,
      sortBy: sortBy
    };
    
    // إزالة الحقول غير المعرفة
    Object.keys(params).forEach(key => {
      if (params[key] === undefined || params[key] === '') {
        delete params[key];
      }
    });
    
    updateFilters(params);
  };

  const handleFilterChange = (e) => {
    setFilter(e.target.value);
  };

  const handlePriorityChange = (e) => {
    setPriorityFilter(e.target.value);
  };

  const handleSortChange = (e) => {
    setSortBy(e.target.value);
  };

  const handleViewDetails = async (request) => {
    setSelectedRequest(request);
    setLoadingDetails(true);

    try {
      const details = await fetchRequestById(request.id);
      setSelectedRequest(details);
      setShowDetailsModal(true);
    } catch (err) {
      showToast('فشل تحميل بيانات الطلب', 'error');
    } finally {
      setLoadingDetails(false);
    }
  };

  const handleOpenAssignModal = (request) => {
    setRequestToAssign(request);
    setShowAssignModal(true);
  };

  const handleOpenStatusModal = (request) => {
    setRequestToUpdateStatus(request);
    setSelectedStatus(request.status);
    setShowStatusModal(true);
  };

  const handleAddRequest = async (requestData) => {
    setAddRequestLoading(true);
    setAddRequestError(null);

    try {
      // تحويل البيانات للتنسيق المناسب للـ API
      const formattedData = {
        clientId: parseInt(requestData.clientId),
        elevatorId: parseInt(requestData.elevatorId),
        contractId: requestData.contractId ? parseInt(requestData.contractId) : undefined,
        priority: requestData.priority,
        requestType: requestData.requestType,
        description: requestData.description,
        accessDetails: requestData.accessDetails || undefined,
        locationLat: requestData.locationLat || undefined,
        locationLng: requestData.locationLng || undefined,
        scheduledDate: requestData.scheduledDate || undefined
      };

      // إزالة الحقول غير المعرفة
      Object.keys(formattedData).forEach(key => {
        if (formattedData[key] === undefined) {
          delete formattedData[key];
        }
      });

      await createRequest(formattedData);
      showToast('تم إضافة طلب الصيانة بنجاح', 'success');
      setShowAddModal(false);
    } catch (err) {
      const errorMessage = err.response?.data?.message || err.response?.data?.error || 'فشل إضافة طلب الصيانة';
      setAddRequestError(errorMessage);
      showToast(errorMessage, 'error');
    } finally {
      setAddRequestLoading(false);
    }
  };

  const handleAssignTechnician = async (technicianId) => {
    if (!requestToAssign) return;

    try {
      await assignTechnician(requestToAssign.id, parseInt(technicianId));
      showToast('تم تعيين الفني بنجاح', 'success');
      setShowAssignModal(false);
      setRequestToAssign(null);
    } catch (err) {
      const errorMessage = err.response?.data?.message || err.response?.data?.error || 'فشل تعيين الفني';
      showToast(errorMessage, 'error');
    }
  };

  const handleUpdateStatus = async () => {
    if (!requestToUpdateStatus || !selectedStatus) return;

    try {
      await updateStatus(requestToUpdateStatus.id, { status: selectedStatus });
      showToast('تم تحديث حالة الطلب بنجاح', 'success');
      setShowStatusModal(false);
      setRequestToUpdateStatus(null);
      setSelectedStatus('');
    } catch (err) {
      const errorMessage = err.response?.data?.message || err.response?.data?.error || 'فشل تحديث حالة الطلب';
      showToast(errorMessage, 'error');
      console.error('Error updating status:', err);
    }
  };

  const handleRefresh = () => {
    refetch();
  };

  const handlePageChange = (page) => {
    updatePagination({ page });
  };

  const getStatusArabic = (status) => {
    const statusMap = {
      PENDING: 'معلق',
      ASSIGNED: 'مُعين',
      ON_WAY: 'في الطريق',
      IN_PROGRESS: 'قيد التنفيذ',
      COMPLETED: 'مكتمل',
      CANCELLED: 'ملغي'
    };
    return statusMap[status] || status;
  };

  const getPriorityArabic = (priority) => {
    const priorityMap = {
      EMERGENCY: 'طارئ',
      URGENT: 'عاجل',
      NORMAL: 'عادي'
    };
    return priorityMap[priority] || priority;
  };

  const getStatusColor = (status) => {
    const colorMap = {
      PENDING: 'warning',
      ASSIGNED: 'info',
      ON_WAY: 'primary',
      IN_PROGRESS: 'secondary',
      COMPLETED: 'success',
      CANCELLED: 'danger'
    };
    return colorMap[status] || 'default';
  };

  const getPriorityColor = (priority) => {
    const colorMap = {
      EMERGENCY: 'danger',
      URGENT: 'warning',
      NORMAL: 'success'
    };
    return colorMap[priority] || 'default';
  };

  const handleDownloadReport = (requestId) => {
    showToast('جاري تحميل التقرير...', 'info');
    // هنا يمكنك إضافة منطق تحميل التقرير
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

  const statistics = {
    total: pagination.total || requests.length,
    emergency: requests.filter(r => r.priority === 'EMERGENCY').length,
    urgent: requests.filter(r => r.priority === 'URGENT').length,
    normal: requests.filter(r => r.priority === 'NORMAL').length,
    pending: requests.filter(r => r.status === 'PENDING').length,
    assigned: requests.filter(r => r.status === 'ASSIGNED').length,
    onWay: requests.filter(r => r.status === 'ON_WAY').length,
    inProgress: requests.filter(r => r.status === 'IN_PROGRESS').length,
    completed: requests.filter(r => r.status === 'COMPLETED').length,
    cancelled: requests.filter(r => r.status === 'CANCELLED').length,
  };

  statistics.completionRate = statistics.total > 0
    ? Math.round((statistics.completed / statistics.total) * 100)
    : 0;

  if (loading && requests.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loading size="lg" />
      </div>
    );
  }

  if (error && requests.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <EmptyState
          icon={<FileText className="w-16 h-16 text-gray-300" />}
          title="حدث خطأ"
          description={error}
          actionLabel="إعادة المحاولة"
          onAction={() => fetchRequests()}
        />
      </div>
    );
  }

  return (
    <div className="space-y-6 p-4 md:p-6">
      <PageHeader
        title="طلبات الصيانة"
        subtitle="إدارة ومتابعة طلبات صيانة المصاعد"
        actions={
          <div className="flex flex-wrap gap-3">
            <Button
              variant="primary"
              onClick={() => setShowAddModal(true)}
              className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800"
            >
              <Plus size={18} className="mr-2" />
              طلب جديد
            </Button>
          </div>
        }
      />

      {/* الفلترة والبحث */}
      <Card className="p-6 shadow-sm">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="md:col-span-2">
            <Input
              placeholder="ابحث برقم المرجع أو اسم العميل..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              icon={<Search size={18} />}
              iconPosition="left"
            />
          </div>

          <Select
            value={filter}
            onChange={handleFilterChange}
            options={[
              { value: 'all', label: 'جميع الحالات' },
              { value: 'PENDING', label: 'معلق' },
              { value: 'ASSIGNED', label: 'مُعين' },
              { value: 'ON_WAY', label: 'في الطريق' },
              { value: 'IN_PROGRESS', label: 'قيد التنفيذ' },
              { value: 'COMPLETED', label: 'مكتمل' },
              { value: 'CANCELLED', label: 'ملغي' },
            ]}
            icon={<Filter size={18} />}
          />

          <Select
            value={sortBy}
            onChange={handleSortChange}
            options={[
              { value: 'createdAt_desc', label: 'الأحدث أولاً' },
              { value: 'createdAt_asc', label: 'الأقدم أولاً' },
              { value: 'priority', label: 'حسب الأولوية' },
              { value: 'status', label: 'حسب الحالة' },
            ]}
            icon={sortBy.includes('_asc') ? <SortAsc size={18} /> : <SortDesc size={18} />}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4 pt-4 border-t border-gray-200">
          <Select
            value={priorityFilter}
            onChange={handlePriorityChange}
            options={[
              { value: 'all', label: 'جميع الأولويات' },
              { value: 'EMERGENCY', label: 'طارئ' },
              { value: 'URGENT', label: 'عاجل' },
              { value: 'NORMAL', label: 'عادي' },
            ]}
          />
        </div>
      </Card>

      {/* إحصائيات سريعة */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
        <Card className="p-6 shadow-sm bg-gradient-to-br from-blue-50 to-blue-100 border border-blue-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-3xl font-bold text-gray-900">{statistics.total}</p>
              <p className="text-sm text-blue-600 font-medium mt-1">إجمالي الطلبات</p>
            </div>
            <div className="p-3 bg-white/50 rounded-xl">
              <FileText className="text-blue-600" size={24} />
            </div>
          </div>
        </Card>

        <Card className="p-6 shadow-sm bg-gradient-to-br from-red-50 to-red-100 border border-red-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-3xl font-bold text-gray-900">{statistics.emergency}</p>
              <p className="text-sm text-red-600 font-medium mt-1">طارئ</p>
            </div>
            <div className="p-3 bg-white/50 rounded-xl">
              <AlertCircle className="text-red-600" size={24} />
            </div>
          </div>
        </Card>

        <Card className="p-6 shadow-sm bg-gradient-to-br from-amber-50 to-amber-100 border border-amber-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-3xl font-bold text-gray-900">{statistics.inProgress}</p>
              <p className="text-sm text-amber-600 font-medium mt-1">قيد التنفيذ</p>
            </div>
            <div className="p-3 bg-white/50 rounded-xl">
              <Clock className="text-amber-600" size={24} />
            </div>
          </div>
        </Card>

        <Card className="p-6 shadow-sm bg-gradient-to-br from-emerald-50 to-emerald-100 border border-emerald-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-3xl font-bold text-gray-900">{statistics.completed}</p>
              <p className="text-sm text-emerald-600 font-medium mt-1">مكتمل</p>
            </div>
            <div className="p-3 bg-white/50 rounded-xl">
              <CheckCircle className="text-emerald-600" size={24} />
            </div>
          </div>
        </Card>

        <Card className="p-6 shadow-sm bg-gradient-to-br from-purple-50 to-purple-100 border border-purple-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-3xl font-bold text-gray-900">{statistics.pending}</p>
              <p className="text-sm text-purple-600 font-medium mt-1">معلق</p>
            </div>
            <div className="p-3 bg-white/50 rounded-xl">
              <Clock className="text-purple-600" size={24} />
            </div>
          </div>
        </Card>
      </div>

      {/* قائمة طلبات الصيانة */}
      {requests.length === 0 ? (
        <Card className="shadow-sm">
          <EmptyState
            icon={<FileText className="w-16 h-16 text-gray-300" />}
            title="لا توجد طلبات"
            description="لم يتم العثور على طلبات مطابقة لبحثك"
            actionLabel="إنشاء طلب جديد"
            onAction={() => setShowAddModal(true)}
          />
        </Card>
      ) : (
        <>
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            {requests.map((request) => {
              const statusColor = getStatusColor(request.status);
              const priorityColor = getPriorityColor(request.priority);
              const hasReport = !!request.report;
              const timeSinceCreation = getTimeDifference(new Date(request.createdAt), new Date());

              return (
                <Card key={request.id} className="shadow-sm hover:shadow-lg transition-all duration-300">
                  <div className="p-6">
                    {/* العنوان والأيقونات */}
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h3 className="font-bold text-gray-900 truncate">
                          {request.referenceNumber}
                        </h3>
                        <p className="text-sm text-gray-500">
                          {formatDate(request.createdAt)}
                        </p>
                      </div>
                      <div className="flex flex-col items-end gap-1">
                        <Badge variant={statusColor} size="sm">
                          {getStatusArabic(request.status)}
                        </Badge>
                        <Badge variant={priorityColor} size="sm">
                          {getPriorityArabic(request.priority)}
                        </Badge>
                      </div>
                    </div>

                    {/* معلومات العميل - مع تنسيق مميز */}
                    <div className="mb-4 p-3 bg-blue-50 rounded-lg border-r-4 border-blue-400">
                      <div className="flex items-center gap-2 mb-2">
                        <User size={16} className="text-blue-600 flex-shrink-0" />
                        <span className="text-sm font-medium text-blue-800">العميل</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                          <User size={14} className="text-blue-600" />
                        </div>
                        <div>
                          <p className="font-bold text-gray-900 text-sm truncate">
                            {request.client?.user?.fullName || request.clientName || 'غير معروف'}
                          </p>
                          {request.client?.user?.phoneNumber && (
                            <p className="text-xs text-gray-600 mt-1 flex items-center gap-1">
                              <Phone size={12} />
                              {request.client.user.phoneNumber}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* معلومات الفني المعين - مع تنسيق مختلف */}
                    {request.assignedTechnician ? (
                      <div className="mb-4 p-3 bg-green-50 rounded-lg border-r-4 border-green-400">
                        <div className="flex items-center gap-2 mb-2">
                          <Wrench size={16} className="text-green-600 flex-shrink-0" />
                          <span className="text-sm font-medium text-green-800">الفني المعين</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                            <Wrench size={14} className="text-green-600" />
                          </div>
                          <div>
                            <p className="font-bold text-gray-900 text-sm truncate">
                              {request.assignedTechnician.user?.fullName || request.technicianName || 'فني غير معروف'}
                            </p>
                            {request.assignedTechnician.user?.phoneNumber && (
                              <p className="text-xs text-gray-600 mt-1 flex items-center gap-1">
                                <Phone size={12} />
                                {request.assignedTechnician.user.phoneNumber}
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="mb-4 p-3 bg-gray-100 rounded-lg border-r-4 border-gray-300">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
                            <User size={14} className="text-gray-500" />
                          </div>
                          <div>
                            <p className="text-sm font-medium text-gray-700">لم يتم تعيين فني</p>
                            <p className="text-xs text-gray-500 mt-1">في انتظار التعيين</p>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* معلومات المصعد */}
                    <div className="mb-6 p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center gap-2 mb-2">
                        <MapPin size={16} className="text-gray-500 flex-shrink-0" />
                        <span className="text-sm font-medium text-gray-700">معلومات المصعد</span>
                      </div>
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-gray-600">الموديل:</span>
                          <span className="text-sm font-medium text-gray-900 truncate">
                            {request.elevator?.modelNumber || request.elevatorModel || 'بدون موديل'}
                          </span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-gray-600">التسلسلي:</span>
                          <span className="text-sm font-medium text-gray-900 truncate">
                            {request.elevator?.serialNumber || request.elevatorSerial || 'بدون رقم تسلسلي'}
                          </span>
                        </div>
                        <div className="flex items-center gap-1">
                          <MapPin size={12} className="text-gray-400 flex-shrink-0" />
                          <span className="text-xs text-gray-600 truncate">
                            {request.elevator?.locationAddress || request.locationAddress || 'لا يوجد عنوان'}
                          </span>
                        </div>
                      </div>
                    </div>

                    {request.description && (
                      <div className="mb-6 pt-4 border-t border-gray-200">
                        <div className="flex items-center gap-2 mb-2">
                          <FileText size={16} className="text-gray-400 flex-shrink-0" />
                          <span className="text-sm font-medium text-gray-700">وصف المشكلة</span>
                        </div>
                        <p className="text-sm text-gray-600 line-clamp-2 bg-gray-50 p-3 rounded">
                          {request.description}
                        </p>
                      </div>
                    )}

                    {/* الإحصائيات */}
                    <div className="grid grid-cols-3 gap-4 pt-4 border-t border-gray-200">
                      <div className="text-center">
                        <div className="text-lg font-bold text-gray-900">
                          {getTimeDifference(new Date(request.createdAt), new Date())}
                        </div>
                        <p className="text-xs text-gray-500 mt-1">منذ الإنشاء</p>
                      </div>

                      <div className="text-center">
                        <div className="text-lg font-bold text-gray-900">
                          {!!request.report ? 'نعم' : 'لا'}
                        </div>
                        <p className="text-xs text-gray-500 mt-1">تقرير</p>
                      </div>

                      <div className="text-center">
                        <div className={`text-lg font-bold ${request.assignedTechnician ? 'text-green-600' : 'text-red-600'}`}>
                          {request.assignedTechnician ? 'مُعين' : 'غير معين'}
                        </div>
                        <p className="text-xs text-gray-500 mt-1">حالة التعيين</p>
                      </div>
                    </div>

                    {/* الأزرار */}
                    <div className="flex gap-2 mt-6">
                      <Button
                        variant="outline"
                        className="flex-1 text-blue-600 border-blue-200 hover:bg-blue-50"
                        onClick={() => handleViewDetails(request)}
                      >
                        <Eye size={16} className="mr-2" />
                        التفاصيل
                      </Button>

                      {request.status === 'PENDING' && (
                        <Button
                          variant="outline"
                          className="flex-1 text-green-600 border-green-200 hover:bg-green-50"
                          onClick={() => handleOpenAssignModal(request)}
                        >
                          <User size={16} className="mr-2" />
                          تعيين
                        </Button>
                      )}

                      {['ASSIGNED', 'ON_WAY', 'IN_PROGRESS'].includes(request.status) && (
                        <Button
                          variant="outline"
                          className="flex-1 text-purple-600 border-purple-200 hover:bg-purple-50"
                          onClick={() => handleOpenStatusModal(request)}
                          aria-label="Update status"
                        >
                          <Clock size={16} />
                        </Button>
                      )}
                    </div>

                   
                  </div>
                </Card>
              );
            })}
          </div>

          <PaginationComponent />
        </>
      )}

      <AddMaintenanceRequestModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        onSubmit={handleAddRequest}
        isLoading={addRequestLoading}
        error={addRequestError}
      />

      <AssignTechnicianModal
        isOpen={showAssignModal}
        onClose={() => {
          setShowAssignModal(false);
          setRequestToAssign(null);
        }}
        onSubmit={handleAssignTechnician}
        request={requestToAssign}
      />

      <Modal
        isOpen={showStatusModal}
        onClose={() => {
          setShowStatusModal(false);
          setRequestToUpdateStatus(null);
          setSelectedStatus('');
        }}
        title="تحديث حالة الطلب"
        size="md"
      >
        <div className="space-y-6">
          <div className="bg-gray-50 p-4 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">رقم المرجع</p>
                <p className="font-bold text-gray-900">{requestToUpdateStatus?.referenceNumber}</p>
              </div>
              <Badge variant={getStatusColor(requestToUpdateStatus?.status)}>
                {getStatusArabic(requestToUpdateStatus?.status)}
              </Badge>
            </div>
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">الحالة الحالية</label>
            <div className="flex items-center gap-2">
              <div className={`w-3 h-3 rounded-full ${requestToUpdateStatus?.status === 'PENDING' ? 'bg-yellow-500' :
                requestToUpdateStatus?.status === 'ASSIGNED' ? 'bg-blue-500' :
                  requestToUpdateStatus?.status === 'ON_WAY' ? 'bg-purple-500' :
                    requestToUpdateStatus?.status === 'IN_PROGRESS' ? 'bg-green-500' :
                      requestToUpdateStatus?.status === 'COMPLETED' ? 'bg-emerald-500' :
                        'bg-red-500'}`}></div>
              <span className="font-medium">{getStatusArabic(requestToUpdateStatus?.status)}</span>
            </div>
          </div>

          <Select
            label="الحالة الجديدة"
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            options={(() => {
              const currentStatus = requestToUpdateStatus?.status;
              const options = [];

              if (currentStatus === 'PENDING') {
                options.push({ value: 'ASSIGNED', label: 'مُعين' });
                options.push({ value: 'CANCELLED', label: 'ملغي' });
              } else if (currentStatus === 'ASSIGNED') {
                options.push({ value: 'ON_WAY', label: 'في الطريق' });
                options.push({ value: 'CANCELLED', label: 'ملغي' });
              } else if (currentStatus === 'ON_WAY') {
                options.push({ value: 'IN_PROGRESS', label: 'قيد التنفيذ' });
                options.push({ value: 'CANCELLED', label: 'ملغي' });
              } else if (currentStatus === 'IN_PROGRESS') {
                options.push({ value: 'COMPLETED', label: 'مكتمل' });
                options.push({ value: 'CANCELLED', label: 'ملغي' });
              } else if (currentStatus === 'COMPLETED') {
                options.push({ value: 'IN_PROGRESS', label: 'إعادة فتح (قيد التنفيذ)' });
              } else if (currentStatus === 'CANCELLED') {
                options.push({ value: 'PENDING', label: 'إعادة فتح (معلق)' });
              }

              return options;
            })()}
            required
            disabled={!requestToUpdateStatus}
          />

          {selectedStatus === 'COMPLETED' && (
            <div className="bg-emerald-50 border border-emerald-200 p-4 rounded-lg">
              <div className="flex items-start gap-2">
                <CheckCircle size={18} className="text-emerald-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-medium text-emerald-800">سيتم إغلاق الطلب</p>
                  <p className="text-sm text-emerald-700 mt-1">
                    عند تحديث الحالة إلى "مكتمل"، سيتم:
                    <ul className="list-disc list-inside mt-1 space-y-1">
                      <li>تسجيل وقت إتمام العمل تلقائياً</li>
                      <li>إشعار العميل بإتمام الصيانة</li>
                      <li>إرسال استبيان تقييم للعميل</li>
                      <li>تحديث سجل المصعد</li>
                    </ul>
                  </p>
                </div>
              </div>
            </div>
          )}

          {selectedStatus === 'CANCELLED' && (
            <div className="bg-red-50 border border-red-200 p-4 rounded-lg">
              <div className="flex items-start gap-2">
                <AlertCircle size={18} className="text-red-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-medium text-red-800">سيتم إلغاء الطلب</p>
                  <p className="text-sm text-red-700 mt-1">
                    عند إلغاء الطلب، سيتم:
                    <ul className="list-disc list-inside mt-1 space-y-1">
                      <li>إشعار العميل بإلغاء الطلب</li>
                      <li>إطلاق الفني المعين (إذا كان معيناً)</li>
                      <li>تسجيل سبب الإلغاء في التقرير</li>
                    </ul>
                  </p>
                </div>
              </div>
            </div>
          )}

          <div className="flex gap-3 justify-end pt-4 border-t border-gray-200">
            <Button
              variant="outline"
              onClick={() => {
                setShowStatusModal(false);
                setRequestToUpdateStatus(null);
                setSelectedStatus('');
              }}
            >
              إلغاء
            </Button>
            <Button
              variant="primary"
              onClick={handleUpdateStatus}
              disabled={!selectedStatus || selectedStatus === requestToUpdateStatus?.status}
              className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800"
            >
              تحديث الحالة
            </Button>
          </div>
        </div>
      </Modal>

      {selectedRequest && (
        <Modal
          isOpen={showDetailsModal}
          onClose={() => {
            setShowDetailsModal(false);
            setSelectedRequest(null);
          }}
          title="تفاصيل طلب الصيانة"
          size="lg"
        >
          {loadingDetails ? (
            <div className="flex items-center justify-center py-12">
              <Loading size="md" />
            </div>
          ) : (
            <div className="space-y-6">
              <Card className="shadow-sm">
                <div className="p-6">
                  <div className="flex items-center justify-between mb-6">
                    <div>
                      <h3 className="font-bold text-xl text-gray-900">
                        {selectedRequest.referenceNumber}
                      </h3>
                      <div className="flex gap-2 mt-2">
                        <Badge variant={getStatusColor(selectedRequest.status)}>
                          {getStatusArabic(selectedRequest.status)}
                        </Badge>
                        <Badge variant={getPriorityColor(selectedRequest.priority)}>
                          {getPriorityArabic(selectedRequest.priority)}
                        </Badge>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-gray-500">تاريخ الإنشاء</p>
                      <p className="font-medium text-gray-900">{formatDateTime(selectedRequest.createdAt)}</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <h4 className="font-bold text-gray-900 border-b pb-2">معلومات العميل</h4>
                      <div className="space-y-3">
                        <div className="flex items-center gap-2">
                          <User size={16} className="text-gray-400" />
                          <div>
                            <p className="font-medium text-gray-900">
                              {selectedRequest.client?.user?.fullName || selectedRequest.clientName}
                            </p>
                            <p className="text-sm text-gray-500">العميل</p>
                          </div>
                        </div>

                        {selectedRequest.client?.user?.phoneNumber && (
                          <div className="flex items-center gap-2">
                            <Phone size={16} className="text-gray-400" />
                            <div>
                              <p className="font-medium text-gray-900">
                                {selectedRequest.client.user.phoneNumber}
                              </p>
                              <p className="text-sm text-gray-500">رقم الهاتف</p>
                            </div>
                          </div>
                        )}

                        {selectedRequest.client?.user?.email && (
                          <div className="flex items-center gap-2">
                            <Mail size={16} className="text-gray-400" />
                            <div>
                              <p className="font-medium text-gray-900 truncate">
                                {selectedRequest.client.user.email}
                              </p>
                              <p className="text-sm text-gray-500">البريد الإلكتروني</p>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="space-y-4">
                      <h4 className="font-bold text-gray-900 border-b pb-2">معلومات المصعد</h4>
                      <div className="space-y-3">
                        <div>
                          <p className="font-medium text-gray-900">
                            {selectedRequest.elevator?.modelNumber || selectedRequest.elevatorModel}
                          </p>
                          <p className="text-sm text-gray-500">رقم الموديل</p>
                        </div>

                        <div>
                          <p className="font-medium text-gray-900">
                            {selectedRequest.elevator?.serialNumber || selectedRequest.elevatorSerial}
                          </p>
                          <p className="text-sm text-gray-500">الرقم التسلسلي</p>
                        </div>

                        <div className="flex items-center gap-2">
                          <MapPin size={16} className="text-gray-400" />
                          <div>
                            <p className="font-medium text-gray-900">
                              {selectedRequest.elevator?.locationAddress || selectedRequest.locationAddress}
                            </p>
                            <p className="text-sm text-gray-500">العنوان</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {selectedRequest.description && (
                    <div className="mt-6 pt-6 border-t border-gray-200">
                      <h4 className="font-bold text-gray-900 mb-3">وصف المشكلة</h4>
                      <p className="text-gray-600 bg-gray-50 p-4 rounded-lg">
                        {selectedRequest.description}
                      </p>
                    </div>
                  )}

                  {selectedRequest.accessDetails && (
                    <div className="mt-4">
                      <h4 className="font-bold text-gray-900 mb-3">تفاصيل الوصول</h4>
                      <p className="text-gray-600 bg-gray-50 p-4 rounded-lg">
                        {selectedRequest.accessDetails}
                      </p>
                    </div>
                  )}
                </div>
              </Card>

              {selectedRequest.assignedTechnician && (
                <Card className="shadow-sm">
                  <div className="p-6">
                    <h4 className="font-bold text-gray-900 mb-4">الفني المعين</h4>
                    <div className="flex items-center gap-4">
                      <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-700 rounded-full flex items-center justify-center">
                        <span className="font-bold text-white text-xl">
                          {selectedRequest.assignedTechnician.user?.fullName?.charAt(0) || 'ف'}
                        </span>
                      </div>
                      <div className="flex-1">
                        <h5 className="font-bold text-gray-900">
                          {selectedRequest.assignedTechnician.user?.fullName || selectedRequest.technicianName}
                        </h5>
                        <div className="flex items-center gap-4 mt-2">
                          {selectedRequest.assignedTechnician.user?.phoneNumber && (
                            <div className="flex items-center gap-2 text-sm text-gray-600">
                              <Phone size={14} className="text-gray-400" />
                              <span>{selectedRequest.assignedTechnician.user.phoneNumber}</span>
                            </div>
                          )}
                          <div className="flex items-center gap-2 text-sm text-gray-600">
                            <MapPin size={14} className="text-gray-400" />
                            <span>
                              {selectedRequest.assignedTechnician.currentLocationLat &&
                                selectedRequest.assignedTechnician.currentLocationLng ? (
                                <a
                                  href={`https://maps.google.com/?q=${selectedRequest.assignedTechnician.currentLocationLat},${selectedRequest.assignedTechnician.currentLocationLng}`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-blue-600 hover:text-blue-800 flex items-center gap-1"
                                >
                                  <Navigation size={12} />
                                  عرض الموقع
                                </a>
                              ) : 'غير متاح'}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6 pt-6 border-t border-gray-200">
                      {selectedRequest.assignedAt && (
                        <div>
                          <p className="text-sm text-gray-500">تم التعيين</p>
                          <p className="font-medium text-gray-900">{formatDateTime(selectedRequest.assignedAt)}</p>
                        </div>
                      )}

                      {selectedRequest.startedAt && (
                        <div>
                          <p className="text-sm text-gray-500">بداية العمل</p>
                          <p className="font-medium text-gray-900">{formatDateTime(selectedRequest.startedAt)}</p>
                        </div>
                      )}

                      {selectedRequest.completedAt && (
                        <div>
                          <p className="text-sm text-gray-500">إتمام العمل</p>
                          <p className="font-medium text-gray-900">{formatDateTime(selectedRequest.completedAt)}</p>
                        </div>
                      )}
                    </div>
                  </div>
                </Card>
              )}

              {selectedRequest.contract && (
                <Card className="shadow-sm">
                  <div className="p-6">
                    <h4 className="font-bold text-gray-900 mb-4">معلومات العقد</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-gray-500">رقم العقد</p>
                        <p className="font-medium text-gray-900">{selectedRequest.contract.contractNumber}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">نوع العقد</p>
                        <p className="font-medium text-gray-900">{selectedRequest.contract.contractType}</p>
                      </div>
                    </div>
                  </div>
                </Card>
              )}

              {selectedRequest.report && (
                <Card className="shadow-sm">
                  <div className="p-6">
                    <h4 className="font-bold text-gray-900 mb-4">تقرير الصيانة</h4>
                    <div className="space-y-4">
                      <div>
                        <p className="text-sm text-gray-500">نوع المشكلة</p>
                        <p className="font-medium text-gray-900">{selectedRequest.report.problemType}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">الوقت المستغرق</p>
                        <p className="font-medium text-gray-900">{selectedRequest.report.timeSpentMinutes} دقيقة</p>
                      </div>
                    </div>
                  </div>
                </Card>
              )}

              <div className="flex gap-3 justify-end pt-4 border-t border-gray-200">
                <Button
                  variant="outline"
                  onClick={() => {
                    setShowDetailsModal(false);
                    setSelectedRequest(null);
                  }}
                >
                  إغلاق
                </Button>

                {selectedRequest.status === 'PENDING' && (
                  <Button
                    variant="primary"
                    onClick={() => {
                      setShowDetailsModal(false);
                      handleOpenAssignModal(selectedRequest);
                    }}
                  >
                    <User size={16} className="mr-2" />
                    تعيين فني
                  </Button>
                )}

                {['ASSIGNED', 'ON_WAY', 'IN_PROGRESS'].includes(selectedRequest.status) && (
                  <Button
                    variant="primary"
                    onClick={() => {
                      setShowDetailsModal(false);
                      handleOpenStatusModal(selectedRequest);
                    }}
                  >
                    <Clock size={16} className="mr-2" />
                    تحديث الحالة
                  </Button>
                )}
              </div>
            </div>
          )}
        </Modal>
      )}
    </div>
  );
};

export default Requests;