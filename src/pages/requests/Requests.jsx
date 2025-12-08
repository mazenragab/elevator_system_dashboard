import { useState, useEffect, useMemo } from 'react';
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
  SortDesc,
  Tag,
  Hash,
  Building,
  CalendarClock
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
  
  const {
    requests: allRequests,
    loading,
    error,
    fetchRequests,
    fetchRequestById,
    createRequest,
    assignTechnician,
    updateStatus,
    refetch
  } = useRequests();

  // States للفلترة والبحث المحلي
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');
  const [sortBy, setSortBy] = useState('createdAt_desc');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(9);

  // States للـ Modals
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

  // فلترة وترتيب البيانات محلياً
  const filteredAndSortedRequests = useMemo(() => {
    let filtered = [...allRequests];

    // البحث
    if (search.trim()) {
      const searchLower = search.toLowerCase().trim();
      filtered = filtered.filter(req => 
        req.referenceNumber?.toLowerCase().includes(searchLower) ||
        req.client?.user?.fullName?.toLowerCase().includes(searchLower) ||
        req.clientName?.toLowerCase().includes(searchLower) ||
        req.description?.toLowerCase().includes(searchLower) ||
        req.elevator?.modelNumber?.toLowerCase().includes(searchLower) ||
        req.elevator?.serialNumber?.toLowerCase().includes(searchLower)
      );
    }

    // فلترة حسب الحالة
    if (filter !== 'all') {
      filtered = filtered.filter(req => req.status === filter);
    }

    // فلترة حسب الأولوية
    if (priorityFilter !== 'all') {
      filtered = filtered.filter(req => req.priority === priorityFilter);
    }

    // الترتيب
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'createdAt_desc':
          return new Date(b.createdAt) - new Date(a.createdAt);
        case 'createdAt_asc':
          return new Date(a.createdAt) - new Date(b.createdAt);
        case 'priority':
          const priorityOrder = { EMERGENCY: 0, URGENT: 1, NORMAL: 2 };
          return priorityOrder[a.priority] - priorityOrder[b.priority];
        case 'status':
          const statusOrder = { 
            PENDING: 0, ASSIGNED: 1, ON_WAY: 2, 
            IN_PROGRESS: 3, COMPLETED: 4, CANCELLED: 5 
          };
          return statusOrder[a.status] - statusOrder[b.status];
        default:
          return 0;
      }
    });

    return filtered;
  }, [allRequests, search, filter, priorityFilter, sortBy]);

  // حساب الـ pagination محلياً
  const paginationData = useMemo(() => {
    const total = filteredAndSortedRequests.length;
    const totalPages = Math.ceil(total / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const currentItems = filteredAndSortedRequests.slice(startIndex, endIndex);

    return {
      total,
      totalPages,
      currentPage,
      itemsPerPage,
      currentItems,
      startIndex,
      endIndex
    };
  }, [filteredAndSortedRequests, currentPage, itemsPerPage]);

  // إعادة تعيين الصفحة عند تغيير الفلتر
  useEffect(() => {
    setCurrentPage(1);
  }, [search, filter, priorityFilter, sortBy]);

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
    }
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
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

  // مكون الـ Pagination - بالتصميم القديم
  const PaginationComponent = () => {
    if (paginationData.totalPages <= 1) return null;

    const pages = [];
    const maxPagesToShow = 5;
    let startPage = Math.max(1, currentPage - Math.floor(maxPagesToShow / 2));
    let endPage = Math.min(paginationData.totalPages, startPage + maxPagesToShow - 1);

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
          onClick={() => handlePageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className="w-9 h-9 p-0"
        >
          <ChevronLeft size={16} />
        </Button>

        {startPage > 1 && (
          <>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handlePageChange(1)}
              className="w-9 h-9"
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
            variant={pageNum === currentPage ? "primary" : "outline"}
            size="sm"
            onClick={() => handlePageChange(pageNum)}
            className={`w-9 h-9 ${pageNum === currentPage ? 'bg-blue-600 text-white' : ''}`}
          >
            {pageNum}
          </Button>
        ))}

        {endPage < paginationData.totalPages && (
          <>
            {endPage < paginationData.totalPages - 1 && (
              <span className="px-2 text-gray-400">...</span>
            )}
            <Button
              variant="outline"
              size="sm"
              onClick={() => handlePageChange(paginationData.totalPages)}
              className="w-9 h-9"
            >
              {paginationData.totalPages}
            </Button>
          </>
        )}

        <Button
          variant="outline"
          size="sm"
          onClick={() => handlePageChange(currentPage + 1)}
          disabled={currentPage === paginationData.totalPages}
          className="w-9 h-9 p-0"
        >
          <ChevronRight size={16} />
        </Button>
      </div>
    );
  };

  // حساب الإحصائيات
  const statistics = useMemo(() => {
    return {
      total: filteredAndSortedRequests.length,
      emergency: filteredAndSortedRequests.filter(r => r.priority === 'EMERGENCY').length,
      urgent: filteredAndSortedRequests.filter(r => r.priority === 'URGENT').length,
      normal: filteredAndSortedRequests.filter(r => r.priority === 'NORMAL').length,
      pending: filteredAndSortedRequests.filter(r => r.status === 'PENDING').length,
      assigned: filteredAndSortedRequests.filter(r => r.status === 'ASSIGNED').length,
      onWay: filteredAndSortedRequests.filter(r => r.status === 'ON_WAY').length,
      inProgress: filteredAndSortedRequests.filter(r => r.status === 'IN_PROGRESS').length,
      completed: filteredAndSortedRequests.filter(r => r.status === 'COMPLETED').length,
      cancelled: filteredAndSortedRequests.filter(r => r.status === 'CANCELLED').length,
    };
  }, [filteredAndSortedRequests]);

  if (loading && allRequests.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loading size="lg" />
      </div>
    );
  }

  if (error && allRequests.length === 0) {
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
    <div className="space-y-4 sm:space-y-6">
      <PageHeader
        title="طلبات الصيانة"
        subtitle="إدارة ومتابعة طلبات صيانة المصاعد"
        // actions={
        //   <Button
        //     variant="primary"
        //     onClick={() => setShowAddModal(true)}
        //     className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800"
        //   >
        //     <Plus size={18} className="ml-2" />
        //     طلب جديد
        //   </Button>
        // }
      />

      {/* الفلترة والبحث */}
      <Card className="p-4 sm:p-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          <div className="sm:col-span-2 lg:col-span-2">
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
            onChange={(e) => setFilter(e.target.value)}
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
            onChange={(e) => setSortBy(e.target.value)}
            options={[
              { value: 'createdAt_desc', label: 'الأحدث أولاً' },
              { value: 'createdAt_asc', label: 'الأقدم أولاً' },
              { value: 'priority', label: 'حسب الأولوية' },
              { value: 'status', label: 'حسب الحالة' },
            ]}
            icon={sortBy.includes('_asc') ? <SortAsc size={18} /> : <SortDesc size={18} />}
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 mt-3 sm:mt-4 pt-3 sm:pt-4 border-t border-gray-200">
          <Select
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value)}
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
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4">
        <Card className="p-4 sm:p-5 bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
          <div className="flex items-center justify-between gap-2">
            <div className="min-w-0">
              <p className="text-2xl sm:text-3xl font-bold text-gray-900 truncate">{statistics.total}</p>
              <p className="text-xs sm:text-sm text-blue-600 font-medium mt-1">إجمالي الطلبات</p>
            </div>
            <div className="p-2 sm:p-3 bg-white/50 rounded-lg flex-shrink-0">
              <FileText className="text-blue-600" size={20} />
            </div>
          </div>
        </Card>

        <Card className="p-4 sm:p-5 bg-gradient-to-br from-red-50 to-red-100 border-red-200">
          <div className="flex items-center justify-between gap-2">
            <div className="min-w-0">
              <p className="text-2xl sm:text-3xl font-bold text-gray-900 truncate">{statistics.emergency}</p>
              <p className="text-xs sm:text-sm text-red-600 font-medium mt-1">طارئ</p>
            </div>
            <div className="p-2 sm:p-3 bg-white/50 rounded-lg flex-shrink-0">
              <AlertCircle className="text-red-600" size={20} />
            </div>
          </div>
        </Card>

        <Card className="p-4 sm:p-5 bg-gradient-to-br from-amber-50 to-amber-100 border-amber-200">
          <div className="flex items-center justify-between gap-2">
            <div className="min-w-0">
              <p className="text-2xl sm:text-3xl font-bold text-gray-900 truncate">{statistics.inProgress}</p>
              <p className="text-xs sm:text-sm text-amber-600 font-medium mt-1">قيد التنفيذ</p>
            </div>
            <div className="p-2 sm:p-3 bg-white/50 rounded-lg flex-shrink-0">
              <Clock className="text-amber-600" size={20} />
            </div>
          </div>
        </Card>

        <Card className="p-4 sm:p-5 bg-gradient-to-br from-emerald-50 to-emerald-100 border-emerald-200">
          <div className="flex items-center justify-between gap-2">
            <div className="min-w-0">
              <p className="text-2xl sm:text-3xl font-bold text-gray-900 truncate">{statistics.completed}</p>
              <p className="text-xs sm:text-sm text-emerald-600 font-medium mt-1">مكتمل</p>
            </div>
            <div className="p-2 sm:p-3 bg-white/50 rounded-lg flex-shrink-0">
              <CheckCircle className="text-emerald-600" size={20} />
            </div>
          </div>
        </Card>

        <Card className="p-4 sm:p-5 bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
          <div className="flex items-center justify-between gap-2">
            <div className="min-w-0">
              <p className="text-2xl sm:text-3xl font-bold text-gray-900 truncate">{statistics.pending}</p>
              <p className="text-xs sm:text-sm text-purple-600 font-medium mt-1">معلق</p>
            </div>
            <div className="p-2 sm:p-3 bg-white/50 rounded-lg flex-shrink-0">
              <Clock className="text-purple-600" size={20} />
            </div>
          </div>
        </Card>
      </div>

      {/* قائمة طلبات الصيانة */}
      {paginationData.currentItems.length === 0 ? (
        <Card className="shadow-sm">
          <EmptyState
            icon={<FileText className="w-12 h-12 sm:w-16 sm:h-16 text-gray-300" />}
            title="لا توجد طلبات"
            description="لم يتم العثور على طلبات مطابقة لبحثك"
            actionLabel="إنشاء طلب جديد"
            onAction={() => setShowAddModal(true)}
          />
        </Card>
      ) : (
        <>
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6">
            {paginationData.currentItems.map((request) => {
              const statusColor = getStatusColor(request.status);
              const priorityColor = getPriorityColor(request.priority);
              const hasReport = !!request.report;
              const timeSinceCreation = getTimeDifference(new Date(request.createdAt), new Date());

              return (
                <Card key={request.id} className="shadow-sm hover:shadow-lg transition-all duration-300">
                  <div className="p-4 sm:p-6">
                    {/* العنوان والأيقونات */}
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <div className="flex items-center gap-1 mb-1">
                          <Hash size={14} className="text-gray-400 flex-shrink-0" />
                          <h3 className="font-bold text-gray-900 text-sm sm:text-base truncate">
                            {request.referenceNumber}
                          </h3>
                        </div>
                        <p className="text-xs sm:text-sm text-gray-500 flex items-center gap-1">
                          <CalendarClock size={12} />
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

                    {/* معلومات العميل */}
                    <div className="mb-4 p-3 bg-blue-50 rounded-lg border-r-4 border-blue-400">
                      <div className="flex items-center gap-2 mb-2">
                        <User size={14} className="text-blue-600 flex-shrink-0" />
                        <span className="text-xs sm:text-sm font-medium text-blue-800">العميل</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                          <User size={12} className="text-blue-600" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="font-bold text-gray-900 text-xs sm:text-sm truncate">
                            {request.client?.user?.fullName || request.clientName || 'غير معروف'}
                          </p>
                          {request.client?.user?.phoneNumber && (
                            <p className="text-[10px] sm:text-xs text-gray-600 mt-0.5 flex items-center gap-1 truncate">
                              <Phone size={10} />
                              {request.client.user.phoneNumber}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* معلومات الفني المعين */}
                    {request.assignedTechnician ? (
                      <div className="mb-4 p-3 bg-green-50 rounded-lg border-r-4 border-green-400">
                        <div className="flex items-center gap-2 mb-2">
                          <Wrench size={14} className="text-green-600 flex-shrink-0" />
                          <span className="text-xs sm:text-sm font-medium text-green-800">الفني المعين</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                            <Wrench size={12} className="text-green-600" />
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="font-bold text-gray-900 text-xs sm:text-sm truncate">
                              {request.assignedTechnician.user?.fullName || request.technicianName || 'فني غير معروف'}
                            </p>
                            {request.assignedTechnician.user?.phoneNumber && (
                              <p className="text-[10px] sm:text-xs text-gray-600 mt-0.5 flex items-center gap-1 truncate">
                                <Phone size={10} />
                                {request.assignedTechnician.user.phoneNumber}
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="mb-4 p-3 bg-gray-100 rounded-lg border-r-4 border-gray-300">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center flex-shrink-0">
                            <User size={12} className="text-gray-500" />
                          </div>
                          <div>
                            <p className="text-xs sm:text-sm font-medium text-gray-700">لم يتم تعيين فني</p>
                            <p className="text-[10px] sm:text-xs text-gray-500 mt-0.5">في انتظار التعيين</p>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* معلومات المصعد */}
                    <div className="mb-4 sm:mb-6 p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center gap-2 mb-2">
                        <MapPin size={14} className="text-gray-500 flex-shrink-0" />
                        <span className="text-xs sm:text-sm font-medium text-gray-700">معلومات المصعد</span>
                      </div>
                      <div className="space-y-1.5 sm:space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] sm:text-xs text-gray-600">الموديل:</span>
                          <span className="text-xs sm:text-sm font-medium text-gray-900 truncate">
                            {request.elevator?.modelNumber || request.elevatorModel || 'بدون موديل'}
                          </span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] sm:text-xs text-gray-600">التسلسلي:</span>
                          <span className="text-xs sm:text-sm font-medium text-gray-900 truncate">
                            {request.elevator?.serialNumber || request.elevatorSerial || 'بدون رقم تسلسلي'}
                          </span>
                        </div>
                        <div className="flex items-center gap-1">
                          <MapPin size={10} className="text-gray-400 flex-shrink-0" />
                          <span className="text-[10px] sm:text-xs text-gray-600 truncate">
                            {request.elevator?.locationAddress || request.locationAddress || 'لا يوجد عنوان'}
                          </span>
                        </div>
                      </div>
                    </div>

                    {request.description && (
                      <div className="mb-4 sm:mb-6 pt-3 sm:pt-4 border-t border-gray-200">
                        <div className="flex items-center gap-2 mb-1.5 sm:mb-2">
                          <FileText size={14} className="text-gray-400 flex-shrink-0" />
                          <span className="text-xs sm:text-sm font-medium text-gray-700">وصف المشكلة</span>
                        </div>
                        <p className="text-xs sm:text-sm text-gray-600 line-clamp-2 bg-gray-50 p-2 sm:p-3 rounded text-right">
                          {request.description}
                        </p>
                      </div>
                    )}

                    {/* الإحصائيات */}
                    <div className="grid grid-cols-3 gap-2 sm:gap-4 pt-3 sm:pt-4 border-t border-gray-200">
                      <div className="text-center">
                        <div className="text-base sm:text-lg font-bold text-gray-900">
                          {timeSinceCreation}
                        </div>
                        <p className="text-[10px] sm:text-xs text-gray-500 mt-0.5 sm:mt-1">منذ الإنشاء</p>
                      </div>

                      <div className="text-center">
                        <div className="text-base sm:text-lg font-bold text-gray-900">
                          {hasReport ? 'نعم' : 'لا'}
                        </div>
                        <p className="text-[10px] sm:text-xs text-gray-500 mt-0.5 sm:mt-1">تقرير</p>
                      </div>

                      <div className="text-center">
                        <div className={`text-base sm:text-lg font-bold ${request.assignedTechnician ? 'text-green-600' : 'text-red-600'}`}>
                          {request.assignedTechnician ? 'مُعين' : 'غير معين'}
                        </div>
                        <p className="text-[10px] sm:text-xs text-gray-500 mt-0.5 sm:mt-1">حالة التعيين</p>
                      </div>
                    </div>

                    {/* الأزرار */}
                    <div className="flex gap-2 mt-4 sm:mt-6">
                      <Button
                        variant="outline"
                        className="flex-1 text-blue-600 border-blue-200 hover:bg-blue-50 text-xs sm:text-sm py-2"
                        onClick={() => handleViewDetails(request)}
                      >
                        <Eye size={12} className="ml-1 sm:ml-2" />
                        التفاصيل
                      </Button>

                      {request.status === 'PENDING' && (
                        <Button
                          variant="outline"
                          className="flex-1 text-green-600 border-green-200 hover:bg-green-50 text-xs sm:text-sm py-2"
                          onClick={() => handleOpenAssignModal(request)}
                        >
                          <User size={12} className="ml-1 sm:ml-2" />
                          تعيين
                        </Button>
                      )}

                      {['ASSIGNED', 'ON_WAY', 'IN_PROGRESS'].includes(request.status) && (
                        <Button
                          variant="outline"
                          className="text-purple-600 border-purple-200 hover:bg-purple-50 w-9 h-9 sm:w-10 sm:h-10 p-0"
                          onClick={() => handleOpenStatusModal(request)}
                          title="تحديث الحالة"
                        >
                          <Clock size={14} />
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

      {/* Modals */}
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

      {/* Status Update Modal */}
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
        <div className="space-y-4 sm:space-y-6">
          <div className="bg-gray-50 p-3 sm:p-4 rounded-lg">
            <div className="flex items-center justify-between gap-2">
              <div className="min-w-0 flex-1">
                <p className="text-xs sm:text-sm text-gray-600">رقم المرجع</p>
                <p className="font-bold text-gray-900 text-sm sm:text-base truncate">
                  {requestToUpdateStatus?.referenceNumber}
                </p>
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
              <span className="font-medium text-sm sm:text-base">{getStatusArabic(requestToUpdateStatus?.status)}</span>
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
                options.push({ value: 'IN_PROGRESS', label: 'إعادة فتح' });
              } else if (currentStatus === 'CANCELLED') {
                options.push({ value: 'PENDING', label: 'إعادة فتح' });
              }

              return options;
            })()}
            required
          />

          {selectedStatus === 'COMPLETED' && (
            <div className="bg-emerald-50 border border-emerald-200 p-3 sm:p-4 rounded-lg">
              <div className="flex items-start gap-2">
                <CheckCircle size={16} className="text-emerald-600 flex-shrink-0 mt-0.5" />
                <div className="min-w-0">
                  <p className="font-medium text-emerald-800 text-sm sm:text-base">سيتم إغلاق الطلب</p>
                  <p className="text-xs sm:text-sm text-emerald-700 mt-1">
                    سيتم تسجيل وقت إتمام العمل وإشعار العميل
                  </p>
                </div>
              </div>
            </div>
          )}

          <div className="flex gap-2 sm:gap-3 justify-end pt-3 sm:pt-4 border-t border-gray-200">
            <Button
              variant="outline"
              onClick={() => {
                setShowStatusModal(false);
                setRequestToUpdateStatus(null);
                setSelectedStatus('');
              }}
              className="text-sm"
            >
              إلغاء
            </Button>
            <Button
              variant="primary"
              onClick={handleUpdateStatus}
              disabled={!selectedStatus || selectedStatus === requestToUpdateStatus?.status}
              className="bg-blue-600 hover:bg-blue-700 text-sm"
            >
              تحديث الحالة
            </Button>
          </div>
        </div>
      </Modal>

      {/* Details Modal */}
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
            <div className="space-y-4 sm:space-y-6">
              <Card>
                <div className="p-4 sm:p-6">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 sm:mb-6 gap-3">
                    <div className="min-w-0">
                      <h3 className="font-bold text-lg sm:text-xl text-gray-900 truncate">
                        {selectedRequest.referenceNumber}
                      </h3>
                      <div className="flex flex-wrap gap-2 mt-2">
                        <Badge variant={getStatusColor(selectedRequest.status)}>
                          {getStatusArabic(selectedRequest.status)}
                        </Badge>
                        <Badge variant={getPriorityColor(selectedRequest.priority)}>
                          {getPriorityArabic(selectedRequest.priority)}
                        </Badge>
                      </div>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <p className="text-xs sm:text-sm text-gray-500">تاريخ الإنشاء</p>
                      <p className="font-medium text-gray-900 text-sm sm:text-base">
                        {formatDateTime(selectedRequest.createdAt)}
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                    <div className="space-y-3 sm:space-y-4">
                      <h4 className="font-bold text-gray-900 border-b pb-2 text-sm sm:text-base">معلومات العميل</h4>
                      <div className="space-y-2 sm:space-y-3">
                        <div className="flex items-center gap-2">
                          <User size={14} className="text-gray-400 flex-shrink-0" />
                          <div className="min-w-0 flex-1">
                            <p className="font-medium text-gray-900 text-sm sm:text-base truncate">
                              {selectedRequest.client?.user?.fullName || selectedRequest.clientName}
                            </p>
                            <p className="text-xs sm:text-sm text-gray-500">العميل</p>
                          </div>
                        </div>

                        {selectedRequest.client?.user?.phoneNumber && (
                          <div className="flex items-center gap-2">
                            <Phone size={14} className="text-gray-400 flex-shrink-0" />
                            <div className="min-w-0 flex-1">
                              <p className="font-medium text-gray-900 text-sm sm:text-base">
                                {selectedRequest.client.user.phoneNumber}
                              </p>
                              <p className="text-xs sm:text-sm text-gray-500">رقم الهاتف</p>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="space-y-3 sm:space-y-4">
                      <h4 className="font-bold text-gray-900 border-b pb-2 text-sm sm:text-base">معلومات المصعد</h4>
                      <div className="space-y-2 sm:space-y-3">
                        <div>
                          <p className="font-medium text-gray-900 text-sm sm:text-base truncate">
                            {selectedRequest.elevator?.modelNumber || selectedRequest.elevatorModel}
                          </p>
                          <p className="text-xs sm:text-sm text-gray-500">رقم الموديل</p>
                        </div>

                        <div className="flex items-center gap-2">
                          <MapPin size={14} className="text-gray-400 flex-shrink-0" />
                          <div className="min-w-0 flex-1">
                            <p className="font-medium text-gray-900 text-sm sm:text-base truncate">
                              {selectedRequest.elevator?.locationAddress || selectedRequest.locationAddress}
                            </p>
                            <p className="text-xs sm:text-sm text-gray-500">العنوان</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {selectedRequest.description && (
                    <div className="mt-4 sm:mt-6 pt-4 sm:pt-6 border-t border-gray-200">
                      <h4 className="font-bold text-gray-900 mb-2 sm:mb-3 text-sm sm:text-base">وصف المشكلة</h4>
                      <p className="text-gray-600 bg-gray-50 p-3 sm:p-4 rounded-lg text-xs sm:text-sm">
                        {selectedRequest.description}
                      </p>
                    </div>
                  )}
                </div>
              </Card>

              <div className="flex gap-2 sm:gap-3 justify-end pt-3 sm:pt-4 border-t border-gray-200">
                <Button
                  variant="outline"
                  onClick={() => {
                    setShowDetailsModal(false);
                    setSelectedRequest(null);
                  }}
                  className="text-sm"
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
                    className="bg-blue-600 hover:bg-blue-700 text-sm"
                  >
                    <User size={14} className="ml-1 sm:ml-2" />
                    تعيين فني
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