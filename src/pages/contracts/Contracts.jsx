import { useState, useEffect, useMemo } from 'react';
import { 
  Search, 
  Filter, 
  Download, 
  Plus,
  FileText,
  Calendar,
  User,
  ChevronLeft,
  ChevronRight,
  Eye,
  Edit,
  Trash2,
  CheckCircle,
  XCircle,
  Clock,
  Home,
  Package,
  TrendingUp
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
import { useContracts } from '../../hooks/useContracts';
import { useToast } from '../../hooks/useToast';
import AddContractModal from '../../components/models/AddContractModal';
import EditContractModal from '../../components/models/EditContractModal';
import { formatArabicDate } from '../../utils/rtl';

const Contracts = () => {
  const { 
    contracts, 
    loading, 
    error,
    pagination,
    selectedContractDetails,
    fetchContracts,
    fetchContractById,
    createContract,
    updateContract,
    deleteContract,
    setSelectedContractDetails,
    changePage,
    changeLimit
  } = useContracts();
  
  const { showToast } = useToast();
  
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all');
  const [sortBy, setSortBy] = useState('newest');
  const [selectedContract, setSelectedContract] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showConfirmDeleteModal, setShowConfirmDeleteModal] = useState(false);
  const [contractToDelete, setContractToDelete] = useState(null);
  const [loadingDetails, setLoadingDetails] = useState(false);
  const [addContractLoading, setAddContractLoading] = useState(false);
  const [addContractError, setAddContractError] = useState(null);
  const [editingContract, setEditingContract] = useState(null);
  const [deleting, setDeleting] = useState(false);

  // دالة البحث والفلترة المحلية
  const filteredContracts = useMemo(() => {
    let result = [...contracts];

    // البحث برقم العقد أو اسم العميل
    if (search.trim()) {
      const searchLower = search.toLowerCase();
      result = result.filter(contract =>
        contract.contractNumber?.toLowerCase().includes(searchLower) ||
        contract.client?.user?.fullName?.toLowerCase().includes(searchLower)
      );
    }

    // الفلترة حسب الحالة
    if (filter === 'active') {
      result = result.filter(contract => contract.isActive);
    } else if (filter === 'inactive') {
      result = result.filter(contract => !contract.isActive);
    } else if (filter === 'expiring') {
      result = result.filter(contract => {
        const endDate = new Date(contract.endDate);
        const now = new Date();
        const daysRemaining = Math.ceil((endDate - now) / (1000 * 60 * 60 * 24));
        return daysRemaining <= 30 && daysRemaining > 0;
      });
    } else if (filter === 'expired') {
      result = result.filter(contract => {
        const endDate = new Date(contract.endDate);
        const now = new Date();
        return endDate < now;
      });
    } else if (filter === 'full_maintenance') {
      result = result.filter(contract => contract.contractType === 'FULL_MAINTENANCE');
    } else if (filter === 'preventive_only') {
      result = result.filter(contract => contract.contractType === 'PREVENTIVE_ONLY');
    } else if (filter === 'on_demand') {
      result = result.filter(contract => contract.contractType === 'ON_DEMAND');
    }

    // الترتيب
    if (sortBy === 'newest') {
      result.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
    } else if (sortBy === 'oldest') {
      result.sort((a, b) => new Date(a.createdAt || 0) - new Date(b.createdAt || 0));
    } else if (sortBy === 'contract_number') {
      result.sort((a, b) => a.contractNumber?.localeCompare(b.contractNumber || '') || 0);
    } else if (sortBy === 'client_name') {
      result.sort((a, b) => a.client?.user?.fullName?.localeCompare(b.client?.user?.fullName || '') || 0);
    } else if (sortBy === 'expiring_soon') {
      result.sort((a, b) => {
        const aDays = getDaysRemaining(a.endDate);
        const bDays = getDaysRemaining(b.endDate);
        return aDays - bDays;
      });
    }

    return result;
  }, [contracts, search, filter, sortBy]);

  const handleSearch = () => {
    // البحث المحلي
  };

  const handleFilterChange = (e) => {
    setFilter(e.target.value);
  };

  const handleSortChange = (e) => {
    setSortBy(e.target.value);
  };

  const handleViewDetails = async (contract) => {
    setSelectedContract(contract);
    setLoadingDetails(true);
    setSelectedContractDetails(null);
    
    try {
      await fetchContractById(contract.id);
      setShowDetailsModal(true);
    } catch (err) {
      showToast('فشل تحميل تفاصيل العقد', 'error');
    } finally {
      setLoadingDetails(false);
    }
  };

  const handleEditContract = (contract) => {
    setEditingContract(contract);
    setShowEditModal(true);
  };

  const handleOpenDeleteModal = (contract) => {
    setContractToDelete(contract);
    setShowConfirmDeleteModal(true);
  };

  const handleConfirmDelete = async () => {
    if (!contractToDelete) return;
    
    setDeleting(true);
    
    try {
      await deleteContract(contractToDelete.id);
      showToast('تم حذف العقد بنجاح', 'success');
      setShowConfirmDeleteModal(false);
      setContractToDelete(null);
      fetchContracts();
    } catch (err) {
      showToast(err.message || 'فشل حذف العقد', 'error');
    } finally {
      setDeleting(false);
    }
  };

  const handleAddContract = async (contractData) => {
    setAddContractLoading(true);
    setAddContractError(null);
    
    try {
      await createContract(contractData);
      showToast('تم إضافة العقد بنجاح', 'success');
      setShowAddModal(false);
      fetchContracts();
    } catch (err) {
      setAddContractError(err.message || 'فشل إضافة العقد');
      showToast('فشل إضافة العقد', 'error');
    } finally {
      setAddContractLoading(false);
    }
  };

  const handleUpdateContract = async (id, contractData) => {
    try {
      await updateContract(id, contractData);
      showToast('تم تحديث بيانات العقد بنجاح', 'success');
      setShowEditModal(false);
      setEditingContract(null);
      fetchContracts();
    } catch (err) {
      showToast(err.message || 'فشل تحديث العقد', 'error');
    }
  };

  const getDaysRemaining = (endDate) => {
    if (!endDate) return 0;
    const now = new Date();
    const end = new Date(endDate);
    const days = Math.ceil((end - now) / (1000 * 60 * 60 * 24));
    return days > 0 ? days : 0;
  };

  const getStatusBadge = (contract) => {
    const now = new Date();
    const end = new Date(contract.endDate);
    
    if (!contract.isActive) {
      return <Badge variant="gray">غير نشط</Badge>;
    }
    
    if (end < now) {
      return <Badge variant="danger">منتهي</Badge>;
    }
    
    const daysRemaining = getDaysRemaining(contract.endDate);
    
    if (daysRemaining <= 30) {
      return <Badge variant="warning">قريب الإنتهاء</Badge>;
    }
    
    return <Badge variant="success">نشط</Badge>;
  };

  const formatContractType = (type) => {
    const types = {
      'FULL_MAINTENANCE': 'صيانة كاملة',
      'PREVENTIVE_ONLY': 'صيانة وقائية',
      'ON_DEMAND': 'حسب الطلب'
    };
    return types[type] || type;
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'غير محدد';
    return new Date(dateString).toLocaleDateString('ar-SA', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  // حساب الإحصائيات الإجمالية
  const totalStats = useMemo(() => {
    const stats = {
      totalElevators: 0,
      totalRequests: 0,
      activeContracts: 0,
      expiringContracts: 0,
      expiredContracts: 0,
      avgElevatorsPerContract: 0
    };

    if (contracts.length > 0) {
      stats.totalElevators = contracts.reduce((sum, contract) => 
        sum + (contract._count?.contractElevators || 0), 0);
      stats.totalRequests = contracts.reduce((sum, contract) => 
        sum + (contract._count?.maintenanceRequests || 0), 0);
      stats.activeContracts = contracts.filter(c => c.isActive && getDaysRemaining(c.endDate) > 30).length;
      stats.expiringContracts = contracts.filter(c => c.isActive && getDaysRemaining(c.endDate) <= 30 && getDaysRemaining(c.endDate) > 0).length;
      stats.expiredContracts = contracts.filter(c => !c.isActive || getDaysRemaining(c.endDate) <= 0).length;
      stats.avgElevatorsPerContract = contracts.length > 0 ? 
        (stats.totalElevators / contracts.length).toFixed(1) : 0;
    }

    return stats;
  }, [contracts]);

  if (loading && contracts.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loading size="lg" />
      </div>
    );
  }

  if (error && contracts.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <EmptyState
          icon={<FileText className="w-16 h-16 text-gray-300" />}
          title="حدث خطأ"
          description={error}
          actionLabel="إعادة المحاولة"
          onAction={() => fetchContracts()}
        />
      </div>
    );
  }

  return (
    <div className="space-y-6 p-4 md:p-6">
      {/* العنوان والإجراءات */}
      <PageHeader
        title="إدارة العقود"
        subtitle="إدارة عقود صيانة المصاعد"
        actions={
          <div className="flex flex-wrap gap-3">
            <Button 
              variant="outline" 
              leftIcon={<Download size={18} />}
              onClick={() => {/* handle export */}}
            >
              تصدير
            </Button>
            <Button 
              variant="primary"
              leftIcon={<Plus size={18} />} 
              onClick={() => setShowAddModal(true)}
              className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800"
            >
              عقد جديد
            </Button>
          </div>
        }
      />

      {/* الفلترة والبحث */}
      <Card className="p-6 shadow-sm">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Input
            placeholder="ابحث برقم العقد أو اسم العميل..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
            leftIcon={<Search size={18} />}
          />
          
          <Select
            value={filter}
            onChange={handleFilterChange}
            options={[
              { value: 'all', label: 'جميع العقود' },
              { value: 'active', label: 'نشط' },
              { value: 'inactive', label: 'غير نشط' },
              { value: 'expiring', label: 'قريب الإنتهاء' },
              { value: 'expired', label: 'منتهي' },
              { value: 'full_maintenance', label: 'صيانة كاملة' },
              { value: 'preventive_only', label: 'صيانة وقائية' },
              { value: 'on_demand', label: 'حسب الطلب' },
            ]}
            leftIcon={<Filter size={18} />}
          />
          
          <Select
            value={sortBy}
            onChange={handleSortChange}
            options={[
              { value: 'newest', label: 'الأحدث' },
              { value: 'oldest', label: 'الأقدم' },
              { value: 'contract_number', label: 'رقم العقد' },
              { value: 'client_name', label: 'اسم العميل' },
              { value: 'expiring_soon', label: 'الأقرب للانتهاء' },
            ]}
          />
        </div>
      </Card>

      {/* إحصائيات سريعة */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
        <Card className="p-6 shadow-sm bg-gradient-to-br from-blue-50 to-blue-100 border border-blue-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-3xl font-bold text-gray-900">{pagination.total}</p>
              <p className="text-sm text-blue-600 font-medium mt-1">إجمالي العقود</p>
            </div>
            <div className="p-3 bg-white/50 rounded-xl">
              <FileText className="text-blue-600" size={24} />
            </div>
          </div>
        </Card>
        
        <Card className="p-6 shadow-sm bg-gradient-to-br from-emerald-50 to-emerald-100 border border-emerald-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-3xl font-bold text-gray-900">{totalStats.activeContracts}</p>
              <p className="text-sm text-emerald-600 font-medium mt-1">عقود نشطة</p>
            </div>
            <div className="p-3 bg-white/50 rounded-xl">
              <CheckCircle className="text-emerald-600" size={24} />
            </div>
          </div>
        </Card>
        
        <Card className="p-6 shadow-sm bg-gradient-to-br from-amber-50 to-amber-100 border border-amber-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-3xl font-bold text-gray-900">{totalStats.expiringContracts}</p>
              <p className="text-sm text-amber-600 font-medium mt-1">قريب الإنتهاء</p>
            </div>
            <div className="p-3 bg-white/50 rounded-xl">
              <Clock className="text-amber-600" size={24} />
            </div>
          </div>
        </Card>
        
        <Card className="p-6 shadow-sm bg-gradient-to-br from-rose-50 to-rose-100 border border-rose-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-3xl font-bold text-gray-900">{totalStats.expiredContracts}</p>
              <p className="text-sm text-rose-600 font-medium mt-1">منتهية</p>
            </div>
            <div className="p-3 bg-white/50 rounded-xl">
              <XCircle className="text-rose-600" size={24} />
            </div>
          </div>
        </Card>
        
        <Card className="p-6 shadow-sm bg-gradient-to-br from-cyan-50 to-cyan-100 border border-cyan-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-3xl font-bold text-gray-900">{totalStats.totalElevators}</p>
              <p className="text-sm text-cyan-600 font-medium mt-1">المصاعد المشمولة</p>
            </div>
            <div className="p-3 bg-white/50 rounded-xl">
              <Home className="text-cyan-600" size={24} />
            </div>
          </div>
        </Card>
      </div>

      {/* قائمة العقود */}
      {filteredContracts.length === 0 ? (
        <Card className="shadow-sm">
          <EmptyState
            icon={<FileText className="w-16 h-16 text-gray-300" />}
            title="لا توجد عقود"
            description="لم يتم العثور على عقود مطابقة لبحثك"
            actionLabel="إضافة عقد جديد"
            onAction={() => setShowAddModal(true)}
          />
        </Card>
      ) : (
        <>
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            {filteredContracts.map((contract) => {
              const daysRemaining = getDaysRemaining(contract.endDate);
              const hasElevators = (contract._count?.contractElevators || 0) > 0;
              const hasRequests = (contract._count?.maintenanceRequests || 0) > 0;
              
              return (
                <Card key={contract.id} className="shadow-sm hover:shadow-lg transition-all duration-300">
                  <div className="p-6">
                    {/* رأس البطاقة */}
                    <div className="flex items-start justify-between mb-6">
                      <div>
                        <h3 className="text-lg font-bold text-gray-900">
                          {contract.contractNumber}
                        </h3>
                        <p className="text-sm text-gray-500 mt-1">
                          {contract.client?.user?.fullName || 'عميل غير محدد'}
                        </p>
                      </div>
                      {getStatusBadge(contract)}
                    </div>
                    
                    {/* معلومات العقد */}
                    <div className="space-y-3 mb-6">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-600">فترة العقد:</span>
                        <div className="flex items-center gap-2">
                          <Calendar size={14} className="text-gray-400" />
                          <span className="font-medium">
                            {formatDate(contract.startDate)} - {formatDate(contract.endDate)}
                          </span>
                        </div>
                      </div>
                      
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-600">نوع العقد:</span>
                        <span className="font-medium">{formatContractType(contract.contractType)}</span>
                      </div>
                      
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-600">المصاعد المشمولة:</span>
                        <div className="flex items-center gap-2">
                          <Home size={14} className="text-gray-400" />
                          <span className="font-medium">{contract._count?.contractElevators || 0} مصعد</span>
                        </div>
                      </div>
                      
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-600">المتبقي:</span>
                        <div className="flex items-center gap-2">
                          <Clock size={14} className="text-gray-400" />
                          <span className={`font-medium ${
                            daysRemaining <= 30 ? 'text-red-600' : 'text-green-600'
                          }`}>
                            {daysRemaining} يوم
                          </span>
                        </div>
                      </div>
                      
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-600">طلبات الصيانة:</span>
                        <div className="flex items-center gap-2">
                          <Package size={14} className="text-gray-400" />
                          <span className="font-medium">{contract._count?.maintenanceRequests || 0}</span>
                        </div>
                      </div>
                    </div>
                    
                    {/* أزرار الإجراءات */}
                    <div className="flex gap-2 mt-6">
                      <Button 
                        variant="outline" 
                        className="flex-1 text-blue-600 border-blue-200 hover:bg-blue-50"
                        onClick={() => handleViewDetails(contract)}
                        leftIcon={<Eye size={16} />}
                      >
                        التفاصيل
                      </Button>
                      
                      <Button 
                        variant="outline"
                        className="flex-1 text-emerald-600 border-emerald-200 hover:bg-emerald-50"
                        onClick={() => handleEditContract(contract)}
                        leftIcon={<Edit size={16} />}
                      >
                        تعديل
                      </Button>
                      
                      <Button 
                        variant="danger"
                        className="flex-1 bg-gradient-to-r from-rose-600 to-rose-700 hover:from-rose-700 hover:to-rose-800"
                        onClick={() => handleOpenDeleteModal(contract)}
                        disabled={hasElevators || hasRequests}
                        leftIcon={<Trash2 size={16} />}
                        title={(hasElevators || hasRequests) ? "لا يمكن حذف عقد لديه مصاعد أو طلبات" : "حذف العقد"}
                      >
                        حذف
                      </Button>
                    </div>
                    
                    {(hasElevators || hasRequests) && (
                      <div className="mt-3 flex items-center gap-2 text-xs text-amber-600">
                        <Clock size={14} />
                        <span>لا يمكن حذف عقد لديه مصاعد أو طلبات</span>
                      </div>
                    )}
                  </div>
                </Card>
              );
            })}
          </div>

          {/* الترقيم */}
          {pagination.totalPages > 1 && (
            <Card className="p-6 mt-6">
              <div className="flex items-center justify-between">
                <div className="text-sm text-gray-700">
                  عرض <span className="font-medium">{(pagination.page - 1) * pagination.limit + 1}</span> إلى{' '}
                  <span className="font-medium">
                    {Math.min(pagination.page * pagination.limit, pagination.total)}
                  </span> من{' '}
                  <span className="font-medium">{pagination.total}</span> نتيجة
                </div>
                
                <div className="flex items-center gap-2">
                  <Select
                    value={pagination.limit}
                    onChange={(e) => changeLimit(parseInt(e.target.value))}
                    className="w-24"
                    options={[
                      { value: 10, label: '10' },
                      { value: 25, label: '25' },
                      { value: 50, label: '50' },
                      { value: 100, label: '100' },
                    ]}
                  />
                  
                  <div className="flex items-center gap-1">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => changePage(pagination.page - 1)}
                      disabled={pagination.page === 1}
                    >
                      <ChevronLeft size={16} />
                    </Button>
                    
                    {[...Array(Math.min(5, pagination.totalPages))].map((_, i) => {
                      const pageNum = i + 1;
                      return (
                        <Button
                          key={pageNum}
                          variant={pagination.page === pageNum ? "primary" : "outline"}
                          size="sm"
                          onClick={() => changePage(pageNum)}
                        >
                          {pageNum}
                        </Button>
                      );
                    })}
                    
                    {pagination.totalPages > 5 && (
                      <span className="px-3 py-1">...</span>
                    )}
                    
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => changePage(pagination.page + 1)}
                      disabled={pagination.page === pagination.totalPages}
                    >
                      <ChevronRight size={16} />
                    </Button>
                  </div>
                </div>
              </div>
            </Card>
          )}
        </>
      )}

      {/* مودال إضافة عقد جديد */}
      <AddContractModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        onSubmit={handleAddContract}
        isLoading={addContractLoading}
        error={addContractError}
      />

      {/* مودال تعديل العقد */}
      {editingContract && (
        <EditContractModal
          isOpen={showEditModal}
          onClose={() => {
            setShowEditModal(false);
            setEditingContract(null);
          }}
          contract={editingContract}
          onSubmit={handleUpdateContract}
        />
      )}

      {/* مودال تفاصيل العقد */}
      {selectedContract && (
        <Modal
          isOpen={showDetailsModal}
          onClose={() => {
            setShowDetailsModal(false);
            setSelectedContractDetails(null);
          }}
          title={`عقد ${selectedContract.contractNumber}`}
          size="xl"
        >
          {loadingDetails ? (
            <div className="flex items-center justify-center py-12">
              <Loading size="md" />
            </div>
          ) : selectedContractDetails ? (
            <div className="space-y-6">
              {/* معلومات العقد الأساسية */}
              <Card className="shadow-sm">
                <div className="p-6">
                  <div className="flex items-center justify-between mb-6">
                    <div>
                      <h3 className="font-bold text-xl text-gray-900">
                        {selectedContractDetails.contractNumber}
                      </h3>
                      <p className="text-sm text-gray-500">ID: {selectedContractDetails.id}</p>
                    </div>
                    {getStatusBadge(selectedContractDetails)}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-500 mb-1">العميل</label>
                        <p className="font-medium text-lg">
                          {selectedContractDetails.client?.user?.fullName || 'غير محدد'}
                        </p>
                        <p className="text-sm text-gray-600 mt-1">
                          {selectedContractDetails.client?.user?.email || 'غير محدد'}
                        </p>
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-500 mb-1">نوع العقد</label>
                        <Badge variant="info" className="mt-1">
                          {formatContractType(selectedContractDetails.contractType)}
                        </Badge>
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-500 mb-1">وقت الاستجابة</label>
                        <div className="flex items-center gap-2">
                          <Clock size={16} className="text-gray-400" />
                          <span className="font-medium">{selectedContractDetails.slaResponseTimeHours} ساعة</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-500 mb-1">فترة العقد</label>
                        <div className="flex items-center gap-4">
                          <div>
                            <p className="font-medium">من</p>
                            <p className="text-gray-600">{formatDate(selectedContractDetails.startDate)}</p>
                          </div>
                          <div>
                            <p className="font-medium">إلى</p>
                            <p className="text-gray-600">{formatDate(selectedContractDetails.endDate)}</p>
                          </div>
                        </div>
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-500 mb-1">المتبقي</label>
                        <div className="flex items-center gap-2">
                          <Clock size={16} className="text-gray-400" />
                          <span className={`text-lg font-bold ${
                            getDaysRemaining(selectedContractDetails.endDate) <= 30 ? 'text-red-600' : 'text-green-600'
                          }`}>
                            {getDaysRemaining(selectedContractDetails.endDate)} يوم
                          </span>
                        </div>
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-500 mb-1">الحالة</label>
                        <p className="font-medium">
                          {selectedContractDetails.isActive ? 'نشط' : 'غير نشط'}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </Card>

              {/* إحصائيات العقد */}
              <Card className="shadow-sm">
                <div className="p-6">
                  <h4 className="font-bold text-gray-900 mb-4">الإحصائيات</h4>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    <div className="text-center p-4 bg-blue-50 rounded-lg">
                      <div className="text-2xl font-bold text-blue-600">
                        {selectedContractDetails._count?.contractElevators || 0}
                      </div>
                      <p className="text-sm text-gray-600 mt-1">المصاعد المشمولة</p>
                    </div>
                    
                    <div className="text-center p-4 bg-amber-50 rounded-lg">
                      <div className="text-2xl font-bold text-amber-600">
                        {selectedContractDetails._count?.maintenanceRequests || 0}
                      </div>
                      <p className="text-sm text-gray-600 mt-1">طلبات الصيانة</p>
                    </div>
                    
                    <div className="text-center p-4 bg-emerald-50 rounded-lg">
                      <div className="text-2xl font-bold text-emerald-600">
                        {selectedContractDetails._count?.contractDocuments || 0}
                      </div>
                      <p className="text-sm text-gray-600 mt-1">المستندات</p>
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
                    setSelectedContractDetails(null);
                  }}
                >
                  إغلاق
                </Button>
                <Button
                  variant="primary"
                  onClick={() => {
                    setShowDetailsModal(false);
                    handleEditContract(selectedContract);
                  }}
                >
                  تعديل العقد
                </Button>
              </div>
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-gray-500">لا توجد بيانات تفصيلية للعقد</p>
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
            setContractToDelete(null);
          }
        }}
        title="تأكيد حذف العقد"
      >
        <div className="space-y-4">
          <div className="flex items-center gap-3 text-amber-600 bg-amber-50 p-4 rounded-lg">
            <Clock size={24} />
            <div className="text-right">
              <h4 className="font-bold">تحذير!</h4>
              <p className="text-sm mt-1">هذا الإجراء لا يمكن التراجع عنه</p>
            </div>
          </div>
          
          <p className="text-gray-600">
            هل أنت متأكد من حذف العقد 
            <span className="font-bold text-gray-900"> {contractToDelete?.contractNumber} </span>
            ؟
          </p>
          
          <div className="bg-gray-50 p-4 rounded-lg">
            <h5 className="font-bold text-sm text-gray-700 mb-2">تفاصيل العقد:</h5>
            <div className="space-y-1 text-sm text-gray-600">
              <div>العميل: <span className="font-medium">{contractToDelete?.client?.user?.fullName || 'غير محدد'}</span></div>
              <div>النوع: <span className="font-medium">{formatContractType(contractToDelete?.contractType)}</span></div>
              <div>المصاعد: <span className="font-medium">{contractToDelete?._count?.contractElevators || 0}</span></div>
              <div>طلبات الصيانة: <span className="font-medium">{contractToDelete?._count?.maintenanceRequests || 0}</span></div>
              <div>المتبقي: <span className="font-medium">{getDaysRemaining(contractToDelete?.endDate)} يوم</span></div>
            </div>
          </div>
          
          <p className="text-sm text-gray-500">
            • سيتم حذف جميع البيانات المرتبطة بالعقد نهائياً
            <br />
            • لا يمكن استعادة البيانات بعد الحذف
            <br />
            • إذا كان العقد لديه مصاعد أو طلبات، لن يتمكن من الحذف
          </p>
          
          <div className="flex gap-3 justify-end pt-4 border-t border-gray-200">
            <Button
              variant="outline"
              onClick={() => {
                setShowConfirmDeleteModal(false);
                setContractToDelete(null);
              }}
              disabled={deleting}
            >
              إلغاء
            </Button>
            <Button
              variant="danger"
              onClick={handleConfirmDelete}
              disabled={deleting || 
                (contractToDelete?._count?.contractElevators || 0) > 0 || 
                (contractToDelete?._count?.maintenanceRequests || 0) > 0}
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
          
          {(contractToDelete?._count?.contractElevators || 0) > 0 || 
           (contractToDelete?._count?.maintenanceRequests || 0) > 0 && (
            <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-600 text-center">
                ⚠️ لا يمكن حذف عقد لديه مصاعد أو طلبات صيانة حالياً
              </p>
            </div>
          )}
        </div>
      </Modal>
    </div>
  );
};

export default Contracts;