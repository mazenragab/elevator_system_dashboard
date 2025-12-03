import { useState, useEffect, useMemo } from 'react';
import { 
  Search, 
  Plus, 
  Home, 
  Hash, 
  MapPin,
  Calendar,
  Wrench,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Eye,
  Edit,
  Trash2,
  Filter,
  ChevronLeft,
  ChevronRight,
  Users,
  Package,
  Clock,
  TrendingUp,
  Building,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import PageHeader from '../../components/layout/PageHeader';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Input from '../../components/forms/Input';
import Select from '../../components/forms/Select';
import Loading from '../../components/ui/Loading';
import EmptyState from '../../components/ui/EmptyState';
import Modal from '../../components/ui/Modal';
import { useElevators } from '../../hooks/useElevators';
import { useToast } from '../../hooks/useToast';
import AddElevatorModal from '../../components/models/AddElevatorModal';
import EditElevatorModal from '../../components/models/EditElevatorModal';
import { getSimpleLocationText } from '../../utils/location';

const Elevators = () => {
  const { 
    elevators, 
    loading, 
    error,
    clients,
    pagination,
    selectedElevatorDetails,
    fetchElevators,
    fetchElevatorById,
    createElevator,
    updateElevator,
    deleteElevator,
    setSelectedElevatorDetails
  } = useElevators();
  
  const { showToast } = useToast();
  
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all');
  const [sortBy, setSortBy] = useState('date');
  const [selectedElevator, setSelectedElevator] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showConfirmDeleteModal, setShowConfirmDeleteModal] = useState(false);
  const [elevatorToDelete, setElevatorToDelete] = useState(null);
  const [loadingDetails, setLoadingDetails] = useState(false);
  const [addElevatorLoading, setAddElevatorLoading] = useState(false);
  const [addElevatorError, setAddElevatorError] = useState(null);
  const [editingElevator, setEditingElevator] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [expandedStatus, setExpandedStatus] = useState('all');

  // دالة البحث والفلترة المحلية - إصلاح: التأكد أن elevators هو array
  const filteredElevators = useMemo(() => {
    if (!Array.isArray(elevators)) {
      console.log('Elevators is not an array:', elevators);
      return [];
    }
    
    let result = [...elevators];

    // البحث برقم الموديل أو الرقم التسلسلي
    if (search.trim()) {
      const searchLower = search.toLowerCase();
      result = result.filter(elevator =>
        elevator.modelNumber?.toLowerCase().includes(searchLower) ||
        elevator.serialNumber?.toLowerCase().includes(searchLower) ||
        elevator.locationAddress?.toLowerCase().includes(searchLower)
      );
    }

    // الفلترة حسب الحالة
    if (filter === 'active') {
      result = result.filter(elevator => elevator.status === 'ACTIVE');
    } else if (filter === 'maintenance_scheduled') {
      result = result.filter(elevator => elevator.status === 'MAINTENANCE_SCHEDULED');
    } else if (filter === 'out_of_service') {
      result = result.filter(elevator => elevator.status === 'OUT_OF_SERVICE');
    }

    // الترتيب
    if (sortBy === 'date') {
      result.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
    } else if (sortBy === 'date_oldest') {
      result.sort((a, b) => new Date(a.createdAt || 0) - new Date(b.createdAt || 0));
    } else if (sortBy === 'model') {
      result.sort((a, b) => (a.modelNumber || '').localeCompare(b.modelNumber || ''));
    } else if (sortBy === 'status') {
      const statusOrder = { 'ACTIVE': 1, 'MAINTENANCE_SCHEDULED': 2, 'OUT_OF_SERVICE': 3 };
      result.sort((a, b) => (statusOrder[a.status] || 99) - (statusOrder[b.status] || 99));
    }

    return result;
  }, [elevators, search, filter, sortBy]);

  const handleSearch = () => {
    // البحث المحلي، لا حاجة لاستدعاء API
  };

  const handleFilterChange = (e) => {
    setFilter(e.target.value);
  };

  const handleSortChange = (e) => {
    setSortBy(e.target.value);
  };

  const handleViewDetails = async (elevator) => {
    setSelectedElevator(elevator);
    setLoadingDetails(true);
    setSelectedElevatorDetails(null);
    
    try {
      // جلب بيانات المصعد التفصيلية من API
      const details = await fetchElevatorById(elevator.id);
      setShowDetailsModal(true);
    } catch (err) {
      showToast('فشل تحميل بيانات المصعد', 'error');
    } finally {
      setLoadingDetails(false);
    }
  };

  const handleEditElevator = (elevator) => {
    setEditingElevator(elevator);
    setShowEditModal(true);
  };

  // دالة فتح نافذة تأكيد الحذف
  const handleOpenDeleteModal = (elevator) => {
    setElevatorToDelete(elevator);
    setShowConfirmDeleteModal(true);
  };

  // دالة معالجة حذف المصعد
  const handleConfirmDelete = async () => {
    if (!elevatorToDelete) return;
    
    setDeleting(true);
    
    try {
      await deleteElevator(elevatorToDelete.id);
      showToast('تم حذف المصعد بنجاح', 'success');
      setShowConfirmDeleteModal(false);
      setElevatorToDelete(null);
      // إعادة تحميل البيانات
      fetchElevators();
    } catch (err) {
      showToast(err.message || 'فشل حذف المصعد', 'error');
    } finally {
      setDeleting(false);
    }
  };

  // دالة معالجة إضافة مصعد جديد
  const handleAddElevator = async (elevatorData) => {
    setAddElevatorLoading(true);
    setAddElevatorError(null);
    
    try {
      await createElevator(elevatorData);
      showToast('تم إضافة المصعد بنجاح', 'success');
      setShowAddModal(false);
    } catch (err) {
      setAddElevatorError(err.message || 'فشل إضافة المصعد');
      showToast('فشل إضافة المصعد', 'error');
    } finally {
      setAddElevatorLoading(false);
    }
  };

  // دالة معالجة تحديث المصعد
  const handleUpdateElevator = async (id, elevatorData) => {
    try {
      await updateElevator(id, elevatorData);
      showToast('تم تحديث بيانات المصعد بنجاح', 'success');
      setShowEditModal(false);
      setEditingElevator(null);
    } catch (err) {
      showToast(err.message || 'فشل تحديث المصعد', 'error');
    }
  };

  // دالة لتنسيق التاريخ
  const formatDate = (dateString) => {
    if (!dateString) return 'غير محدد';
    return new Date(dateString).toLocaleDateString('ar-SA', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const handlePageChange = (page) => {
    const params = {
      page,
      limit: pagination.limit,
    };
    fetchElevators(params);
  };

  // دالة للحصول على اسم العميل - إصلاح: استخدام clients بدلاً من elevators
  const getClientName = (clientId) => {
    if (!Array.isArray(clients)) return 'غير معروف';
    
    const client = clients.find(c => c.id === clientId);
    return client?.user?.fullName || 'غير معروف';
  };

  // حساب الإحصائيات الإجمالية - إصلاح: التأكد أن elevators هو array
  const totalStats = useMemo(() => {
    if (!Array.isArray(elevators)) {
      return {
        total: 0,
        active: 0,
        maintenanceScheduled: 0,
        outOfService: 0,
        last30Days: 0
      };
    }
    
    const stats = {
      total: elevators.length,
      active: elevators.filter(e => e.status === 'ACTIVE').length,
      maintenanceScheduled: elevators.filter(e => e.status === 'MAINTENANCE_SCHEDULED').length,
      outOfService: elevators.filter(e => e.status === 'OUT_OF_SERVICE').length,
      last30Days: elevators.filter(e => {
        if (!e.createdAt) return false;
        const date = new Date(e.createdAt);
        const now = new Date();
        const diffTime = Math.abs(now - date);
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        return diffDays <= 30;
      }).length
    };

    return stats;
  }, [elevators]);

  // مكون Pagination مبسط
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

  // مكون عرض حالة المصعد
  const StatusBadge = ({ status }) => {
    const statusConfig = {
      'ACTIVE': {
        color: 'bg-emerald-100 text-emerald-700',
        icon: <CheckCircle size={14} />,
        text: 'نشط'
      },
      'MAINTENANCE_SCHEDULED': {
        color: 'bg-amber-100 text-amber-700',
        icon: <Clock size={14} />,
        text: 'مجدول للصيانة'
      },
      'OUT_OF_SERVICE': {
        color: 'bg-rose-100 text-rose-700',
        icon: <XCircle size={14} />,
        text: 'خارج الخدمة'
      }
    };

    const config = statusConfig[status] || {
      color: 'bg-gray-100 text-gray-700',
      icon: null,
      text: status || 'غير محدد'
    };

    return (
      <div className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm ${config.color}`}>
        {config.icon}
        <span>{config.text}</span>
      </div>
    );
  };

  if (loading && (!Array.isArray(elevators) || elevators.length === 0)) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loading size="lg" />
      </div>
    );
  }

  if (error && (!Array.isArray(elevators) || elevators.length === 0)) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <EmptyState
          icon={<Home className="w-16 h-16 text-gray-300" />}
          title="حدث خطأ"
          description={error}
          actionLabel="إعادة المحاولة"
          onAction={() => fetchElevators()}
        />
      </div>
    );
  }

  // عرض رسالة إذا لم يكن هناك مصاعد
  if (!Array.isArray(elevators) || elevators.length === 0) {
    return (
      <div className="space-y-6 p-4 md:p-6">
        <PageHeader
          title="إدارة المصاعد"
          subtitle="إدارة مصاعد العملاء والمتعاملين"
          actions={
            <div className="flex flex-wrap gap-3">
              <Button 
                variant="primary"
                leftIcon={<Plus size={18} />}
                onClick={() => setShowAddModal(true)}
                className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800"
              >
                إضافة مصعد جديد
              </Button>
            </div>
          }
        />
        
        <Card className="shadow-sm">
          <EmptyState
            icon={<Home className="w-16 h-16 text-gray-300" />}
            title="لا توجد مصاعد"
            description="لم يتم العثور على مصاعد في النظام"
            actionLabel="إضافة مصعد جديد"
            onAction={() => setShowAddModal(true)}
          />
        </Card>

        {/* مودال إضافة مصعد جديد */}
        <AddElevatorModal
          isOpen={showAddModal}
          onClose={() => setShowAddModal(false)}
          onSubmit={handleAddElevator}
          isLoading={addElevatorLoading}
          error={addElevatorError}
          clients={clients}
        />
      </div>
    );
  }

  return (
    <div className="space-y-6 p-4 md:p-6">
      {/* العنوان والإجراءات */}
      <PageHeader
        title="إدارة المصاعد"
        subtitle="إدارة مصاعد العملاء والمتعاملين"
        actions={
          <div className="flex flex-wrap gap-3">
            <Button 
              variant="primary"
              leftIcon={<Plus size={18} />}
              onClick={() => setShowAddModal(true)}
              className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800"
            >
              إضافة مصعد جديد
            </Button>
          </div>
        }
      />

      {/* الفلترة والبحث */}
      <Card className="p-6 shadow-sm">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Input
            placeholder="ابحث برقم الموديل أو التسلسلي أو العنوان..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
            leftIcon={<Search size={18} />}
          />
          
          <Select
            value={filter}
            onChange={handleFilterChange}
            options={[
              { value: 'all', label: 'جميع المصاعد' },
              { value: 'active', label: 'نشط' },
              { value: 'maintenance_scheduled', label: 'مجدول للصيانة' },
              { value: 'out_of_service', label: 'خارج الخدمة' },
            ]}
          />
          
          <Select
            value={sortBy}
            onChange={handleSortChange}
            options={[
              { value: 'date', label: 'الأحدث' },
              { value: 'date_oldest', label: 'الأقدم' },
              { value: 'model', label: 'الموديل (أ-ي)' },
              { value: 'status', label: 'الحالة' },
            ]}
          />
        </div>
      </Card>

      {/* إحصائيات سريعة */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
        <Card className="p-6 shadow-sm bg-gradient-to-br from-blue-50 to-blue-100 border border-blue-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-3xl font-bold text-gray-900">{totalStats.total}</p>
              <p className="text-sm text-blue-600 font-medium mt-1">إجمالي المصاعد</p>
            </div>
            <div className="p-3 bg-white/50 rounded-xl">
              <Home className="text-blue-600" size={24} />
            </div>
          </div>
        </Card>
        
        <Card className="p-6 shadow-sm bg-gradient-to-br from-emerald-50 to-emerald-100 border border-emerald-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-3xl font-bold text-gray-900">{totalStats.active}</p>
              <p className="text-sm text-emerald-600 font-medium mt-1">نشط</p>
            </div>
            <div className="p-3 bg-white/50 rounded-xl">
              <CheckCircle className="text-emerald-600" size={24} />
            </div>
          </div>
        </Card>
        
        <Card className="p-6 shadow-sm bg-gradient-to-br from-amber-50 to-amber-100 border border-amber-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-3xl font-bold text-gray-900">{totalStats.maintenanceScheduled}</p>
              <p className="text-sm text-amber-600 font-medium mt-1">مجدول للصيانة</p>
            </div>
            <div className="p-3 bg-white/50 rounded-xl">
              <Clock className="text-amber-600" size={24} />
            </div>
          </div>
        </Card>
        
        <Card className="p-6 shadow-sm bg-gradient-to-br from-rose-50 to-rose-100 border border-rose-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-3xl font-bold text-gray-900">{totalStats.outOfService}</p>
              <p className="text-sm text-rose-600 font-medium mt-1">خارج الخدمة</p>
            </div>
            <div className="p-3 bg-white/50 rounded-xl">
              <XCircle className="text-rose-600" size={24} />
            </div>
          </div>
        </Card>
        
        <Card className="p-6 shadow-sm bg-gradient-to-br from-purple-50 to-purple-100 border border-purple-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-3xl font-bold text-gray-900">{totalStats.last30Days}</p>
              <p className="text-sm text-purple-600 font-medium mt-1">مضاف آخر 30 يوم</p>
            </div>
            <div className="p-3 bg-white/50 rounded-xl">
              <TrendingUp className="text-purple-600" size={24} />
            </div>
          </div>
        </Card>
      </div>

      {/* قائمة المصاعد */}
      {filteredElevators.length === 0 ? (
        <Card className="shadow-sm">
          <EmptyState
            icon={<Home className="w-16 h-16 text-gray-300" />}
            title="لا توجد مصاعد"
            description="لم يتم العثور على مصاعد مطابقة لبحثك"
            actionLabel="إضافة مصعد جديد"
            onAction={() => setShowAddModal(true)}
          />
        </Card>
      ) : (
        <>
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            {filteredElevators.map((elevator) => {
              const clientName = elevator.client?.user?.fullName || getClientName(elevator.clientId);
              
              return (
                <Card key={elevator.id} className="shadow-sm hover:shadow-lg transition-all duration-300">
                  <div className="p-6">
                    {/* رأس البطاقة */}
                    <div className="flex items-start justify-between mb-6">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-700 rounded-lg flex items-center justify-center">
                          <Home className="text-white" size={24} />
                        </div>
                        <div className="text-right">
                          <h3 className="font-bold text-gray-900">{elevator.modelNumber}</h3>
                          <p className="text-sm text-gray-500">#{elevator.serialNumber}</p>
                        </div>
                      </div>
                      <StatusBadge status={elevator.status} />
                    </div>

                    {/* معلومات المصعد */}
                    <div className="space-y-3 mb-6">
                      <div className="flex items-center justify-between text-sm">
                        <div className="flex items-center gap-2 text-gray-600">
                          <Hash size={16} className="text-gray-400 flex-shrink-0" />
                          <span>رقم الموديل</span>
                        </div>
                        <span className="font-medium text-gray-900">{elevator.modelNumber}</span>
                      </div>
                      
                      <div className="flex items-center justify-between text-sm">
                        <div className="flex items-center gap-2 text-gray-600">
                          <Hash size={16} className="text-gray-400 flex-shrink-0" />
                          <span>الرقم التسلسلي</span>
                        </div>
                        <span className="font-medium text-gray-900">{elevator.serialNumber}</span>
                      </div>
                      
                      <div className="flex items-center justify-between text-sm">
                        <div className="flex items-center gap-2 text-gray-600">
                          <MapPin size={16} className="text-gray-400 flex-shrink-0" />
                          <span>العنوان</span>
                        </div>
                        <span className="font-medium text-gray-900 truncate max-w-[150px]">
                          {elevator.locationAddress || 'غير محدد'}
                        </span>
                      </div>
                      
                      <div className="flex items-center justify-between text-sm">
                        <div className="flex items-center gap-2 text-gray-600">
                          <Users size={16} className="text-gray-400 flex-shrink-0" />
                          <span>العميل</span>
                        </div>
                        <span className="font-medium text-gray-900">{clientName}</span>
                      </div>
                      
                      <div className="flex items-center justify-between text-sm">
                        <div className="flex items-center gap-2 text-gray-600">
                          <Calendar size={16} className="text-gray-400 flex-shrink-0" />
                          <span>آخر صيانة</span>
                        </div>
                        <span className="font-medium text-gray-900">
                          {elevator.lastMaintenanceDate ? formatDate(elevator.lastMaintenanceDate) : 'لا توجد'}
                        </span>
                      </div>
                    </div>

                    {/* الإحصائيات */}
                    <div className="grid grid-cols-3 gap-4 pt-4 border-t border-gray-200">
                      <div className="text-center">
                        <div className="flex items-center justify-center gap-1">
                          <Wrench size={16} className="text-blue-500" />
                          <span className="font-bold">{elevator._count?.maintenanceRequests || 0}</span>
                        </div>
                        <p className="text-xs text-gray-500 mt-1">طلبات الصيانة</p>
                      </div>
                      
                      <div className="text-center">
                        <div className="flex items-center justify-center gap-1">
                          <Package size={16} className="text-emerald-500" />
                          <span className="font-bold">{elevator._count?.contracts || 0}</span>
                        </div>
                        <p className="text-xs text-gray-500 mt-1">العقود</p>
                      </div>
                      
                      <div className="text-center">
                        <div className="flex items-center justify-center gap-1">
                          <Clock size={16} className="text-amber-500" />
                          <span className="font-bold">{elevator._count?.reports || 0}</span>
                        </div>
                        <p className="text-xs text-gray-500 mt-1">التقارير</p>
                      </div>
                    </div>

                    {/* الأزرار */}
                    <div className="flex gap-2 mt-6">
                      <Button 
                        variant="outline" 
                        className="flex-1 text-blue-600 border-blue-200 hover:bg-blue-50"
                        onClick={() => handleViewDetails(elevator)}
                        leftIcon={<Eye size={16} />}
                      >
                        التفاصيل
                      </Button>
                      
                      <Button 
                        variant="outline"
                        className="flex-1 text-emerald-600 border-emerald-200 hover:bg-emerald-50"
                        onClick={() => handleEditElevator(elevator)}
                        leftIcon={<Edit size={16} />}
                      >
                        تعديل
                      </Button>
                      
                      <Button 
                        variant="danger"
                        className="flex-1 bg-gradient-to-r from-rose-600 to-rose-700 hover:from-rose-700 hover:to-rose-800"
                        onClick={() => handleOpenDeleteModal(elevator)}
                        leftIcon={<Trash2 size={16} />}
                      >
                        حذف
                      </Button>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>

          {/* الترقيم */}
          <PaginationComponent />
        </>
      )}

      {/* مودال إضافة مصعد جديد */}
      <AddElevatorModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        onSubmit={handleAddElevator}
        isLoading={addElevatorLoading}
        error={addElevatorError}
        clients={clients}
      />

      {/* مودال تعديل المصعد */}
      {editingElevator && (
        <EditElevatorModal
          isOpen={showEditModal}
          onClose={() => {
            setShowEditModal(false);
            setEditingElevator(null);
          }}
          elevator={editingElevator}
          onSubmit={handleUpdateElevator}
          clients={clients}
        />
      )}

      {/* مودال تفاصيل المصعد */}
      {selectedElevator && (
        <Modal
          isOpen={showDetailsModal}
          onClose={() => {
            setShowDetailsModal(false);
            setSelectedElevatorDetails(null);
          }}
          title="تفاصيل المصعد"
          size="lg"
        >
          {loadingDetails ? (
            <div className="flex items-center justify-center py-12">
              <Loading size="md" />
            </div>
          ) : selectedElevatorDetails ? (
            <div className="space-y-6">
              {/* معلومات المصعد الأساسية */}
              <Card className="shadow-sm">
                <div className="p-6">
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-4">
                      <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-700 rounded-xl flex items-center justify-center">
                        <Home className="text-white" size={32} />
                      </div>
                      <div className="text-right">
                        <h3 className="font-bold text-2xl text-gray-900">
                          {selectedElevatorDetails.modelNumber}
                        </h3>
                        <p className="text-sm text-gray-500">#{selectedElevatorDetails.serialNumber}</p>
                        <div className="mt-2">
                          <StatusBadge status={selectedElevatorDetails.status} />
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-500 mb-1">رقم الموديل</label>
                        <div className="flex items-center gap-2">
                          <Hash size={16} className="text-gray-400" />
                          <span className="text-gray-900 font-mono">{selectedElevatorDetails.modelNumber}</span>
                        </div>
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-500 mb-1">الرقم التسلسلي</label>
                        <div className="flex items-center gap-2">
                          <Hash size={16} className="text-gray-400" />
                          <span className="text-gray-900 font-mono">{selectedElevatorDetails.serialNumber}</span>
                        </div>
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-500 mb-1">العميل</label>
                        <div className="flex items-center gap-2">
                          <Users size={16} className="text-gray-400" />
                          <span className="text-gray-900">
                            {selectedElevatorDetails.client?.user?.fullName || getClientName(selectedElevatorDetails.clientId)}
                          </span>
                        </div>
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-500 mb-1">معرف المصعد</label>
                        <div className="p-3 bg-gray-50 rounded-lg">
                          <div className="text-gray-900 font-mono">{selectedElevatorDetails.id}</div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-500 mb-1">العنوان</label>
                        <div className="flex items-center gap-2">
                          <MapPin size={16} className="text-gray-400" />
                          <span className="text-gray-900">{selectedElevatorDetails.locationAddress}</span>
                        </div>
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-500 mb-1">الإحداثيات</label>
                        <div className="flex gap-4 text-sm">
                          <div className="flex items-center gap-1">
                            <span className="text-gray-500">عرض:</span>
                            <span className="text-gray-900 font-medium">
                              {selectedElevatorDetails.locationLat || 'غير متاح'}
                            </span>
                          </div>
                          <div className="flex items-center gap-1">
                            <span className="text-gray-500">طول:</span>
                            <span className="text-gray-900 font-medium">
                              {selectedElevatorDetails.locationLng || 'غير متاح'}
                            </span>
                          </div>
                        </div>
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-500 mb-1">تاريخ آخر صيانة</label>
                        <div className="flex items-center gap-2">
                          <Calendar size={16} className="text-gray-400" />
                          <span className="text-gray-900">
                            {selectedElevatorDetails.lastMaintenanceDate 
                              ? formatDate(selectedElevatorDetails.lastMaintenanceDate)
                              : 'لا توجد صيانة سابقة'
                            }
                          </span>
                        </div>
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-500 mb-1">تاريخ الإضافة</label>
                        <div className="flex items-center gap-2">
                          <Calendar size={16} className="text-gray-400" />
                          <span className="text-gray-900">
                            {formatDate(selectedElevatorDetails.createdAt)}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </Card>

              {/* إحصائيات المصعد */}
              <Card className="shadow-sm">
                <div className="p-6">
                  <h4 className="font-bold text-gray-900 mb-4">الإحصائيات</h4>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="text-center p-4 bg-blue-50 rounded-lg">
                      <div className="text-2xl font-bold text-blue-600">
                        {selectedElevatorDetails._count?.maintenanceRequests || 0}
                      </div>
                      <p className="text-sm text-gray-600 mt-1">طلبات الصيانة</p>
                    </div>
                    
                    <div className="text-center p-4 bg-emerald-50 rounded-lg">
                      <div className="text-2xl font-bold text-emerald-600">
                        {selectedElevatorDetails._count?.contracts || 0}
                      </div>
                      <p className="text-sm text-gray-600 mt-1">العقود</p>
                    </div>
                    
                    <div className="text-center p-4 bg-amber-50 rounded-lg">
                      <div className="text-2xl font-bold text-amber-600">
                        {selectedElevatorDetails._count?.reports || 0}
                      </div>
                      <p className="text-sm text-gray-600 mt-1">التقارير</p>
                    </div>
                    
                    <div className="text-center p-4 bg-purple-50 rounded-lg">
                      <div className="text-2xl font-bold text-purple-600">
                        {selectedElevatorDetails._count?.completedRequests || 0}
                      </div>
                      <p className="text-sm text-gray-600 mt-1">طلبات مكتملة</p>
                    </div>
                  </div>
                </div>
              </Card>

              {/* أزرار الإجراءات */}
              <div className="flex gap-3 justify-end pt-4 border-t border-gray-200">
                <Button
                  variant="outline"
                  onClick={() => {
                    setShowDetailsModal(false);
                    setSelectedElevatorDetails(null);
                  }}
                >
                  إغلاق
                </Button>
                <Button
                  variant="primary"
                  onClick={() => {
                    setShowDetailsModal(false);
                    handleEditElevator(selectedElevator);
                  }}
                >
                  تعديل البيانات
                </Button>
              </div>
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-gray-500">لا توجد بيانات تفصيلية للمصعد</p>
            </div>
          )}
        </Modal>
      )}

      {/* مودال تأكيد الحذف */}
      <Modal
        isOpen={showConfirmDeleteModal}
        onClose={() => {
          if (!deleting) {
            setShowConfirmDeleteModal(false);
            setElevatorToDelete(null);
          }
        }}
        title="تأكيد حذف المصعد"
      >
        <div className="space-y-4">
          <div className="flex items-center gap-3 text-amber-600 bg-amber-50 p-4 rounded-lg">
            <AlertTriangle size={24} />
            <div className="text-right">
              <h4 className="font-bold">تحذير!</h4>
              <p className="text-sm mt-1">هذا الإجراء لا يمكن التراجع عنه</p>
            </div>
          </div>
          
          <p className="text-gray-600">
            هل أنت متأكد من حذف المصعد 
            <span className="font-bold text-gray-900"> {elevatorToDelete?.modelNumber} </span>
            ؟
          </p>
          
          <div className="bg-gray-50 p-4 rounded-lg">
            <h5 className="font-bold text-sm text-gray-700 mb-2">تفاصيل المصعد:</h5>
            <div className="space-y-1 text-sm text-gray-600">
              <div>رقم الموديل: <span className="font-medium">{elevatorToDelete?.modelNumber}</span></div>
              <div>الرقم التسلسلي: <span className="font-medium">{elevatorToDelete?.serialNumber}</span></div>
              <div>العنوان: <span className="font-medium">{elevatorToDelete?.locationAddress}</span></div>
              <div>الحالة: <span className="font-medium">
                <StatusBadge status={elevatorToDelete?.status} />
              </span></div>
              <div>طلبات الصيانة: <span className="font-medium">{elevatorToDelete?._count?.maintenanceRequests || 0}</span></div>
              <div>العقود: <span className="font-medium">{elevatorToDelete?._count?.contracts || 0}</span></div>
            </div>
          </div>
          
          <p className="text-sm text-gray-500">
            • سيتم حذف جميع البيانات المرتبطة بالمصعد نهائياً
            <br />
            • لا يمكن استعادة البيانات بعد الحذف
            <br />
            • إذا كان المصعد مرتبطاً بعقود أو طلبات، قد يؤثر ذلك على العملاء
          </p>
          
          <div className="flex gap-3 justify-end pt-4 border-t border-gray-200">
            <Button
              variant="outline"
              onClick={() => {
                setShowConfirmDeleteModal(false);
                setElevatorToDelete(null);
              }}
              disabled={deleting}
            >
              إلغاء
            </Button>
            <Button
              variant="danger"
              onClick={handleConfirmDelete}
              disabled={deleting}
              className="bg-gradient-to-r from-rose-600 to-rose-700 hover:from-rose-700 hover:to-rose-800"
            >
              {deleting ? (
                <>
                  <span className="animate-spin mr-2">⟳</span>
                  جاري الحذف...
                </>
              ) : (
                'تأكيد الحذف'
              )}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default Elevators;