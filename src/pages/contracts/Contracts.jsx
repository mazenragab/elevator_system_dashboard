import { useState, useEffect, useMemo, useCallback } from 'react';
import { 
  Search, 
  Filter, 
  Download, 
  Plus,
  FileText,
  Calendar,
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
  TrendingUp,
  Upload,
  Shield,
  AlertTriangle,
  Building,
  Phone,
  Mail,
  MapPin,
  Users
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
import AddContractForm from '../../components/models/AddContractModal';
import EditContractForm from '../../components/models/EditContractModal';
import ContractDocuments from '../../components/contracts/ContractDocuments';
import ContractElevators from '../../components/contracts/ContractElevators';
import CoverageCheck from '../../components/contracts/CoverageCheck';

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
    activateContract,
    deactivateContract,
    getContractElevators,
    getContractDocuments,
    uploadContractDocument,
    deleteContractDocument,
    checkContractCoverage,
    setSelectedContractDetails,
    changePage,
    changeLimit
  } = useContracts();
  
  const { showToast } = useToast();
  
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all');
  const [sortBy, setSortBy] = useState('newest');
  const [selectedContract, setSelectedContract] = useState(null);
  const [activeTab, setActiveTab] = useState('all');
  
  // Modals state
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showConfirmDeleteModal, setShowConfirmDeleteModal] = useState(false);
  const [showDocumentsModal, setShowDocumentsModal] = useState(false);
  const [showElevatorsModal, setShowElevatorsModal] = useState(false);
  const [showCoverageModal, setShowCoverageModal] = useState(false);
  const [showExportModal, setShowExportModal] = useState(false);
  
  const [contractToDelete, setContractToDelete] = useState(null);
  const [loadingDetails, setLoadingDetails] = useState(false);
  const [addContractLoading, setAddContractLoading] = useState(false);
  const [addContractError, setAddContractError] = useState(null);
  const [editingContract, setEditingContract] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [documents, setDocuments] = useState([]);
  const [elevators, setElevators] = useState([]);
  const [coverageInfo, setCoverageInfo] = useState(null);
  const [filters, setFilters] = useState({
    clientId: '',
    isActive: '',
    contractType: '',
    search: ''
  });

  // Calculate days remaining - يتم تعريفه قبل useMemo
  const getDaysRemaining = useCallback((endDate) => {
    if (!endDate) return 0;
    const now = new Date();
    const end = new Date(endDate);
    const days = Math.ceil((end - now) / (1000 * 60 * 60 * 24));
    return days > 0 ? days : 0;
  }, []);

  // Format contract type
  const formatContractType = useCallback((type) => {
    const types = {
      'FULL_MAINTENANCE': 'صيانة كاملة',
      'PREVENTIVE_ONLY': 'صيانة وقائية',
      'ON_DEMAND': 'حسب الطلب'
    };
    return types[type] || type;
  }, []);

  // Format date
  const formatDate = useCallback((dateString) => {
    if (!dateString) return 'غير محدد';
    return new Date(dateString).toLocaleDateString('ar-SA', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }, []);

  // Filter contracts based on search and filters
  const filteredContracts = useMemo(() => {
    let result = [...contracts];

    // Apply search filter
    if (filters.search.trim()) {
      const searchLower = filters.search.toLowerCase();
      result = result.filter(contract =>
        contract.contractNumber?.toLowerCase().includes(searchLower) ||
        contract.client?.user?.fullName?.toLowerCase().includes(searchLower) ||
        contract.client?.user?.email?.toLowerCase().includes(searchLower) ||
        contract.client?.user?.phoneNumber?.includes(searchLower)
      );
    }

    // Apply client filter
    if (filters.clientId) {
      result = result.filter(contract => contract.clientId === parseInt(filters.clientId));
    }

    // Apply active status filter
    if (filters.isActive !== '') {
      result = result.filter(contract => contract.isActive === (filters.isActive === 'true'));
    }

    // Apply contract type filter
    if (filters.contractType) {
      result = result.filter(contract => contract.contractType === filters.contractType);
    }

    // Apply tab filter
    if (activeTab === 'active') {
      result = result.filter(contract => contract.isActive);
    } else if (activeTab === 'inactive') {
      result = result.filter(contract => !contract.isActive);
    } else if (activeTab === 'expiring') {
      result = result.filter(contract => {
        const daysRemaining = getDaysRemaining(contract.endDate);
        return contract.isActive && daysRemaining <= 30 && daysRemaining > 0;
      });
    } else if (activeTab === 'expired') {
      result = result.filter(contract => {
        const endDate = new Date(contract.endDate);
        const now = new Date();
        return endDate < now;
      });
    }

    // Apply sorting
    if (sortBy === 'newest') {
      result.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
    } else if (sortBy === 'oldest') {
      result.sort((a, b) => new Date(a.createdAt || 0) - new Date(b.createdAt || 0));
    } else if (sortBy === 'contract_number') {
      result.sort((a, b) => (a.contractNumber || '').localeCompare(b.contractNumber || ''));
    } else if (sortBy === 'client_name') {
      result.sort((a, b) => (a.client?.user?.fullName || '').localeCompare(b.client?.user?.fullName || ''));
    } else if (sortBy === 'expiring_soon') {
      result.sort((a, b) => {
        const aDays = getDaysRemaining(a.endDate);
        const bDays = getDaysRemaining(b.endDate);
        return aDays - bDays;
      });
    }

    return result;
  }, [contracts, filters, activeTab, sortBy, getDaysRemaining]);

  // Fetch contracts with filters
  const handleFetchContracts = () => {
    fetchContracts(filters);
  };

  // Reset filters
  const handleResetFilters = () => {
    setFilters({
      clientId: '',
      isActive: '',
      contractType: '',
      search: ''
    });
    setActiveTab('all');
    setSortBy('newest');
    fetchContracts();
  };

  // Handle search
  const handleSearch = () => {
    fetchContracts(filters);
  };

  // View contract details
  const handleViewDetails = async (contract) => {
    setSelectedContract(contract);
    setLoadingDetails(true);
    setSelectedContractDetails(null);
    setShowDetailsModal(true); // فتح الـ modal أولاً
    
    try {
      await fetchContractById(contract.id);
    } catch (err) {
      showToast('فشل تحميل تفاصيل العقد', 'error');
      setShowDetailsModal(false); // إغلاق الـ modal في حالة الخطأ
    } finally {
      setLoadingDetails(false);
    }
  };

  // Edit contract
  const handleEditContract = (contract) => {
    setEditingContract(contract);
    setShowEditModal(true);
  };

  // Delete contract
  const handleDeleteContract = async (contract) => {
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
      // إعادة تحميل البيانات
      await fetchContracts(filters);
    } catch (err) {
      showToast(err.message || 'فشل حذف العقد', 'error');
    } finally {
      setDeleting(false);
    }
  };

  // Add new contract
  const handleAddContract = async (contractData) => {
    setAddContractLoading(true);
    setAddContractError(null);
    
    try {
      // Format dates
      const formattedData = {
        ...contractData,
        startDate: new Date(contractData.startDate).toISOString(),
        endDate: new Date(contractData.endDate).toISOString(),
        elevatorIds: contractData.elevatorIds || [],
        slaResolutionTimeHours: contractData.slaResolutionTimeHours || null
      };

      await createContract(formattedData);
      showToast('تم إضافة العقد بنجاح', 'success');
      setShowAddModal(false);
      // إعادة تحميل البيانات
      await fetchContracts(filters);
    } catch (err) {
      setAddContractError(err.message || 'فشل إضافة العقد');
      showToast(err.message || 'فشل إضافة العقد', 'error');
    } finally {
      setAddContractLoading(false);
    }
  };

  // Update contract
  const handleUpdateContract = async (id, contractData) => {
    try {
      const formattedData = {
        ...contractData,
        startDate: contractData.startDate ? new Date(contractData.startDate).toISOString() : undefined,
        endDate: contractData.endDate ? new Date(contractData.endDate).toISOString() : undefined
      };

      await updateContract(id, formattedData);
      showToast('تم تحديث بيانات العقد بنجاح', 'success');
      setShowEditModal(false);
      setEditingContract(null);
      // إعادة تحميل البيانات
      await fetchContracts(filters);
    } catch (err) {
      showToast(err.message || 'فشل تحديث العقد', 'error');
    }
  };

  // Load contract documents
  const handleLoadDocuments = async (contractId) => {
    const contract = contracts.find(c => c.id === contractId);
    if (!contract) return;
    
    setSelectedContract(contract);
    setShowDocumentsModal(true); // فتح الـ modal أولاً
    
    try {
      const result = await getContractDocuments(contractId);
      setDocuments(result || []);
    } catch (err) {
      showToast(err.message || 'فشل تحميل المستندات', 'error');
      setShowDocumentsModal(false); // إغلاق الـ modal في حالة الخطأ
    }
  };

  // Load contract elevators
  const handleLoadElevators = async (contractId) => {
    const contract = contracts.find(c => c.id === contractId);
    if (!contract) return;
    
    setSelectedContract(contract);
    setShowElevatorsModal(true); // فتح الـ modal أولاً
    
    try {
      const result = await getContractElevators(contractId);
      setElevators(result);
    } catch (err) {
      showToast(err.message || 'فشل تحميل المصاعد', 'error');
      setShowElevatorsModal(false); // إغلاق الـ modal في حالة الخطأ
    }
  };

  // Check coverage
  const handleCheckCoverage = async (contractId) => {
    try {
      const elevatorId = prompt('الرجاء إدخال رقم المصعد للتحقق من التغطية:');
      if (elevatorId) {
        const result = await checkContractCoverage(contractId, parseInt(elevatorId));
        setCoverageInfo(result);
        setShowCoverageModal(true);
      }
    } catch (err) {
      showToast(err.message || 'فشل التحقق من التغطية', 'error');
    }
  };

  // Toggle contract activation
  const handleToggleActivation = async (contract) => {
    const action = contract.isActive ? 'تعطيل' : 'تفعيل';
    const confirmMessage = `هل تريد ${action} العقد ${contract.contractNumber}؟`;
    
    if (window.confirm(confirmMessage)) {
      try {
        if (contract.isActive) {
          await deactivateContract(contract.id);
          showToast('تم تعطيل العقد بنجاح', 'success');
        } else {
          await activateContract(contract.id);
          showToast('تم تفعيل العقد بنجاح', 'success');
        }
        // إعادة تحميل البيانات
        await fetchContracts(filters);
      } catch (err) {
        showToast(err.message || `فشل ${action} العقد`, 'error');
      }
    }
  };

  // Get status badge
  const getStatusBadge = useCallback((contract) => {
    const now = new Date();
    const end = new Date(contract.endDate);
    
    if (!contract.isActive) {
      return <Badge variant="gray" className="px-3 py-1">غير نشط</Badge>;
    }
    
    if (end < now) {
      return <Badge variant="danger" className="px-3 py-1">منتهي</Badge>;
    }
    
    const daysRemaining = getDaysRemaining(contract.endDate);
    
    if (daysRemaining <= 30) {
      return <Badge variant="warning" className="px-3 py-1">قريب الإنتهاء</Badge>;
    }
    
    return <Badge variant="success" className="px-3 py-1">نشط</Badge>;
  }, [getDaysRemaining]);

  // Calculate statistics
  const stats = useMemo(() => {
    const result = {
      total: contracts.length,
      active: contracts.filter(c => c.isActive).length,
      inactive: contracts.filter(c => !c.isActive).length,
      expiring: contracts.filter(c => c.isActive && getDaysRemaining(c.endDate) <= 30 && getDaysRemaining(c.endDate) > 0).length,
      expired: contracts.filter(c => {
        const endDate = new Date(c.endDate);
        const now = new Date();
        return endDate < now;
      }).length,
      totalElevators: contracts.reduce((sum, contract) => sum + (contract.contractElevators?.length || 0), 0),
      totalRequests: contracts.reduce((sum, contract) => sum + (contract._count?.maintenanceRequests || 0), 0),
      avgElevatorsPerContract: contracts.length > 0 ? 
        (contracts.reduce((sum, contract) => sum + (contract._count?.contractElevators || 0), 0) / contracts.length).toFixed(1) : 0
    };
    
    return result;
  }, [contracts, getDaysRemaining]);

  // If loading
  if (loading && contracts.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loading size="lg" />
      </div>
    );
  }

  // If error
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
      {/* Header */}
      <PageHeader
        title="إدارة العقود"
        subtitle="إدارة عقود صيانة المصاعد"
        actions={
          <div className="flex flex-wrap gap-3">
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

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <div className="flex space-x-2 rtl:space-x-reverse overflow-x-auto">
          <Button
            variant={activeTab === 'all' ? 'primary' : 'outline'}
            onClick={() => setActiveTab('all')}
            className="px-4 py-2 whitespace-nowrap"
          >
            الكل ({stats.total})
          </Button>
          <Button
            variant={activeTab === 'active' ? 'primary' : 'outline'}
            onClick={() => setActiveTab('active')}
            className="px-4 py-2 whitespace-nowrap"
          >
            نشط ({stats.active})
          </Button>
          <Button
            variant={activeTab === 'inactive' ? 'primary' : 'outline'}
            onClick={() => setActiveTab('inactive')}
            className="px-4 py-2 whitespace-nowrap"
          >
            غير نشط ({stats.inactive})
          </Button>
          <Button
            variant={activeTab === 'expiring' ? 'primary' : 'outline'}
            onClick={() => setActiveTab('expiring')}
            className="px-4 py-2 whitespace-nowrap"
          >
            قريب الإنتهاء ({stats.expiring})
          </Button>
          <Button
            variant={activeTab === 'expired' ? 'primary' : 'outline'}
            onClick={() => setActiveTab('expired')}
            className="px-4 py-2 whitespace-nowrap"
          >
            منتهي ({stats.expired})
          </Button>
        </div>
      </div>

      {/* Filters */}
      <Card className="p-6 shadow-sm">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Input
            placeholder="ابحث برقم العقد أو اسم العميل..."
            value={filters.search}
            onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
            onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
            leftIcon={<Search size={18} />}
          />
          
          <Select
            value={filters.contractType}
            onChange={(e) => setFilters(prev => ({ ...prev, contractType: e.target.value }))}
            options={[
              { value: '', label: 'جميع الأنواع' },
              { value: 'FULL_MAINTENANCE', label: 'صيانة كاملة' },
              { value: 'PREVENTIVE_ONLY', label: 'صيانة وقائية' },
              { value: 'ON_DEMAND', label: 'حسب الطلب' }
            ]}
            icon={<FileText size={18} />}
          />
          
          <Select
            value={filters.isActive}
            onChange={(e) => setFilters(prev => ({ ...prev, isActive: e.target.value }))}
            options={[
              { value: '', label: 'جميع الحالات' },
              { value: 'true', label: 'نشط' },
              { value: 'false', label: 'غير نشط' }
            ]}
            icon={<CheckCircle size={18} />}
          />
          
          <div className="flex gap-2">
            <Button
              variant="primary"
              onClick={handleSearch}
              className="flex-1"
            >
              بحث
            </Button>
          </div>
        </div>
      </Card>

      {/* Statistics */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
        <Card className="p-6 shadow-sm bg-gradient-to-br from-blue-50 to-blue-100 border border-blue-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-3xl font-bold text-gray-900">{stats.total}</p>
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
              <p className="text-3xl font-bold text-gray-900">{stats.active}</p>
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
              <p className="text-3xl font-bold text-gray-900">{stats.expiring}</p>
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
              <p className="text-3xl font-bold text-gray-900">{stats.expired}</p>
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
              <p className="text-3xl font-bold text-gray-900">{stats.totalElevators}</p>
              <p className="text-sm text-cyan-600 font-medium mt-1">المصاعد المشمولة</p>
            </div>
            <div className="p-3 bg-white/50 rounded-xl">
              <Home className="text-cyan-600" size={24} />
            </div>
          </div>
        </Card>
      </div>

      {/* Contracts List */}
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
                <Card key={contract.id} className="shadow-sm hover:shadow-lg transition-all duration-300 border-l-4 border-l-blue-500">
                  <div className="p-6">
                    {/* Header */}
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
                    
                    {/* Contract Info */}
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
                        <Badge variant="info" className="text-xs">
                          {formatContractType(contract.contractType)}
                        </Badge>
                      </div>
                      
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-600">المصاعد:</span>
                        <div className="flex items-center gap-2">
                          <Home size={14} className="text-gray-400" />
                          <span className="font-medium">{contract._count?.contractElevators || 0}</span>
                        </div>
                      </div>
                      
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-600">المتبقي:</span>
                        <div className="flex items-center gap-2">
                          <Clock size={14} className="text-gray-400" />
                          <span className={`font-medium ${daysRemaining <= 30 ? 'text-red-600' : 'text-green-600'}`}>
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
                    
                    {/* Action Buttons */}
                    <div className="flex flex-wrap gap-2 mt-6">
                      <Button 
                        variant="outline" 
                        size="sm"
                        className="flex-1 text-blue-600 border-blue-200 hover:bg-blue-50"
                        onClick={() => handleViewDetails(contract)}
                        leftIcon={<Eye size={14} />}
                      >
                        التفاصيل
                      </Button>
                      
                      <Button 
                        variant="outline"
                        size="sm"
                        className="flex-1 text-emerald-600 border-emerald-200 hover:bg-emerald-50"
                        onClick={() => handleEditContract(contract)}
                        leftIcon={<Edit size={14} />}
                      >
                        تعديل
                      </Button>
                      
                      <Button 
                        variant="outline"
                        size="sm"
                        className="flex-1 text-amber-600 border-amber-200 hover:bg-amber-50"
                        onClick={() => handleLoadDocuments(contract.id)}
                        leftIcon={<FileText size={14} />}
                      >
                        مستندات
                      </Button>
                      
                      <Button 
                        variant="outline"
                        size="sm"
                        className="flex-1 text-purple-600 border-purple-200 hover:bg-purple-50"
                        onClick={() => handleLoadElevators(contract.id)}
                        leftIcon={<Home size={14} />}
                      >
                        مصاعد
                      </Button>
                      
                      <Button 
                        variant={contract.isActive ? "warning" : "success"}
                        size="sm"
                        className="flex-1"
                        onClick={() => handleToggleActivation(contract)}
                        leftIcon={contract.isActive ? <XCircle size={14} /> : <CheckCircle size={14} />}
                      >
                        {contract.isActive ? 'تعطيل' : 'تفعيل'}
                      </Button>
                      
                      <Button 
                        variant="danger"
                        size="sm"
                        className="flex-1 bg-gradient-to-r from-rose-600 to-rose-700 hover:from-rose-700 hover:to-rose-800"
                        onClick={() => handleDeleteContract(contract)}
                        disabled={hasElevators || hasRequests}
                        leftIcon={<Trash2 size={14} />}
                        title={(hasElevators || hasRequests) ? "لا يمكن حذف عقد لديه مصاعد أو طلبات" : "حذف العقد"}
                      >
                        حذف
                      </Button>
                    </div>
                    
                    {/* Warning */}
                    {(hasElevators || hasRequests) && (
                      <div className="mt-3 flex items-center gap-2 text-xs text-amber-600">
                        <AlertTriangle size={14} />
                        <span>لا يمكن حذف عقد لديه مصاعد أو طلبات</span>
                      </div>
                    )}
                  </div>
                </Card>
              );
            })}
          </div>

          {/* Pagination */}
          {pagination.totalPages > 1 && (
            <Card className="p-6 mt-6">
              <div className="flex flex-col md:flex-row items-center justify-between gap-4">
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
                      <span className="px-3 py-1 text-gray-500">...</span>
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

      {/* Add Contract Modal */}
      <Modal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        title="إضافة عقد جديد"
        size="lg"
      >
        <AddContractForm
          onSubmit={handleAddContract}
          isLoading={addContractLoading}
          error={addContractError}
          onCancel={() => setShowAddModal(false)}
        />
      </Modal>

      {/* Edit Contract Modal */}
      {editingContract && (
        <Modal
          isOpen={showEditModal}
          onClose={() => {
            setShowEditModal(false);
            setEditingContract(null);
          }}
          title={`تعديل العقد ${editingContract.contractNumber}`}
          size="lg"
        >
          <EditContractForm
            contract={editingContract}
            onSubmit={handleUpdateContract}
            onCancel={() => {
              setShowEditModal(false);
              setEditingContract(null);
            }}
          />
        </Modal>
      )}

      {/* Contract Details Modal */}
      {selectedContract && (
        <Modal
          isOpen={showDetailsModal}
          onClose={() => {
            setShowDetailsModal(false);
            setSelectedContract(null);
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
              {/* Contract Details */}
              <ContractDetailsView 
                contract={selectedContractDetails} 
                getDaysRemaining={getDaysRemaining}
                formatDate={formatDate}
              />
              
              {/* Action Buttons */}
              <div className="flex gap-3 justify-end pt-4 border-t border-gray-200">
                <Button
                  variant="outline"
                  onClick={() => {
                    setShowDetailsModal(false);
                    setSelectedContract(null);
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

      {/* Documents Modal */}
      {showDocumentsModal && selectedContract && (
        <ContractDocuments
          contract={selectedContract}
          documents={documents}
          onClose={() => {
            setShowDocumentsModal(false);
            setSelectedContract(null);
            setDocuments([]);
          }}
          onUpload={async (formData) => {
            try {
              const result = await uploadContractDocument(selectedContract.id, formData);
              setDocuments(prev => [...prev, result]);
              return result;
            } catch (err) {
              throw err;
            }
          }}
          onDelete={async (documentId) => {
            try {
              await deleteContractDocument(selectedContract.id, documentId);
              setDocuments(prev => prev.filter(doc => doc.id !== documentId));
            } catch (err) {
              throw err;
            }
          }}
        />
      )}

      {/* Elevators Modal */}
      {showElevatorsModal && selectedContract && (
        <ContractElevators
          contract={selectedContract}
          elevators={elevators}
          onClose={() => {
            setShowElevatorsModal(false);
            setSelectedContract(null);
            setElevators([]);
          }}
        />
      )}

      {/* Coverage Check Modal */}
      {showCoverageModal && coverageInfo && (
        <CoverageCheck
          coverageInfo={coverageInfo}
          onClose={() => {
            setShowCoverageModal(false);
            setCoverageInfo(null);
          }}
        />
      )}

      {/* Delete Confirmation Modal */}
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
        {contractToDelete && (
          <DeleteConfirmation
            contract={contractToDelete}
            onConfirm={handleConfirmDelete}
            onCancel={() => {
              setShowConfirmDeleteModal(false);
              setContractToDelete(null);
            }}
            isLoading={deleting}
          />
        )}
      </Modal>
    </div>
  );
};

// Helper Components
const ContractDetailsView = ({ contract, getDaysRemaining, formatDate }) => (
  <div className="space-y-6">
    <Card className="shadow-sm">
      <div className="p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="font-bold text-xl text-gray-900">
              {contract.contractNumber}
            </h3>
            <p className="text-sm text-gray-500">ID: {contract.id}</p>
          </div>
          <Badge variant={contract.isActive ? "success" : "gray"} className="px-3 py-1">
            {contract.isActive ? 'نشط' : 'غير نشط'}
          </Badge>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-500 mb-1">العميل</label>
              <div className="flex items-center gap-2">
                <Users className="text-gray-400" size={18} />
                <p className="font-medium text-lg">
                  {contract.client?.user?.fullName || 'غير محدد'}
                </p>
              </div>
              <div className="mt-2 space-y-1">
                <p className="text-sm text-gray-600 flex items-center gap-2">
                  <Mail size={14} />
                  {contract.client?.user?.email || 'غير محدد'}
                </p>
                <p className="text-sm text-gray-600 flex items-center gap-2">
                  <Phone size={14} />
                  {contract.client?.user?.phoneNumber || 'غير محدد'}
                </p>
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-500 mb-1">نوع العقد</label>
              <Badge variant="info" className="mt-1">
                {contract.contractType === 'FULL_MAINTENANCE' ? 'صيانة كاملة' :
                 contract.contractType === 'PREVENTIVE_ONLY' ? 'صيانة وقائية' :
                 contract.contractType === 'ON_DEMAND' ? 'حسب الطلب' : contract.contractType}
              </Badge>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-500 mb-1">وقت الاستجابة SLA</label>
              <div className="flex items-center gap-2">
                <Clock size={16} className="text-gray-400" />
                <span className="font-medium">{contract.slaResponseTimeHours} ساعة</span>
              </div>
            </div>
          </div>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-500 mb-1">فترة العقد</label>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="font-medium text-sm">من</p>
                  <p className="text-gray-600 flex items-center gap-2 mt-1">
                    <Calendar size={14} />
                    {contract.startDate ? formatDate(contract.startDate) : 'غير محدد'}
                  </p>
                </div>
                <div>
                  <p className="font-medium text-sm">إلى</p>
                  <p className="text-gray-600 flex items-center gap-2 mt-1">
                    <Calendar size={14} />
                    {contract.endDate ? formatDate(contract.endDate) : 'غير محدد'}
                  </p>
                </div>
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-500 mb-1">المتبقي</label>
              <div className="flex items-center gap-2">
                <Clock size={16} className="text-gray-400" />
                <span className={`text-lg font-bold ${
                  getDaysRemaining(contract.endDate) <= 30 
                    ? 'text-red-600' 
                    : 'text-green-600'
                }`}>
                  {getDaysRemaining(contract.endDate)} يوم
                </span>
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-500 mb-1">وقت الحل SLA</label>
              <div className="flex items-center gap-2">
                <Clock size={16} className="text-gray-400" />
                <span className="font-medium">{contract.slaResolutionTimeHours || 'غير محدد'} ساعة</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Card>

    {/* Statistics Card */}
    <Card className="shadow-sm">
      <div className="p-6">
        <h4 className="font-bold text-gray-900 mb-4">الإحصائيات</h4>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          <div className="text-center p-4 bg-blue-50 rounded-lg">
            <div className="text-2xl font-bold text-blue-600">
              {contract.contractElevators?.length || 0}
            </div>
            <p className="text-sm text-gray-600 mt-1">المصاعد المشمولة</p>
          </div>
          
          <div className="text-center p-4 bg-amber-50 rounded-lg">
            <div className="text-2xl font-bold text-amber-600">
              {contract._count?.maintenanceRequests || 0}
            </div>
            <p className="text-sm text-gray-600 mt-1">طلبات الصيانة</p>
          </div>
          
          <div className="text-center p-4 bg-emerald-50 rounded-lg">
            <div className="text-2xl font-bold text-emerald-600">
              {contract._count?.documents || 0}
            </div>
            <p className="text-sm text-gray-600 mt-1">المستندات</p>
          </div>
        </div>
      </div>
    </Card>
  </div>
);

const DeleteConfirmation = ({ contract, onConfirm, onCancel, isLoading }) => {
  const getDaysRemaining = (endDate) => {
    if (!endDate) return 0;
    const now = new Date();
    const end = new Date(endDate);
    const days = Math.ceil((end - now) / (1000 * 60 * 60 * 24));
    return days > 0 ? days : 0;
  };

  const hasElevators = (contract._count?.contractElevators || 0) > 0;
  const hasRequests = (contract._count?.maintenanceRequests || 0) > 0;
  const daysRemaining = getDaysRemaining(contract.endDate);

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3 text-amber-600 bg-amber-50 p-4 rounded-lg">
        <AlertTriangle size={24} />
        <div className="text-right">
          <h4 className="font-bold">تحذير!</h4>
          <p className="text-sm mt-1">هذا الإجراء لا يمكن التراجع عنه</p>
        </div>
      </div>
      
      <p className="text-gray-600">
        هل أنت متأكد من حذف العقد 
        <span className="font-bold text-gray-900"> {contract.contractNumber} </span>
        ؟
      </p>
      
      <div className="bg-gray-50 p-4 rounded-lg">
        <h5 className="font-bold text-sm text-gray-700 mb-2">تفاصيل العقد:</h5>
        <div className="space-y-1 text-sm text-gray-600">
          <div>العميل: <span className="font-medium">{contract.client?.user?.fullName || 'غير محدد'}</span></div>
          <div>النوع: <span className="font-medium">
            {contract.contractType === 'FULL_MAINTENANCE' ? 'صيانة كاملة' :
             contract.contractType === 'PREVENTIVE_ONLY' ? 'صيانة وقائية' :
             contract.contractType === 'ON_DEMAND' ? 'حسب الطلب' : contract.contractType}
          </span></div>
          <div>المصاعد: <span className="font-medium">{contract.contractElevators?.length || 0}</span></div>
          <div>طلبات الصيانة: <span className="font-medium">{contract._count?.maintenanceRequests || 0}</span></div>
          <div>المتبقي: <span className="font-medium">{daysRemaining} يوم</span></div>
        </div>
      </div>
      
      <p className="text-sm text-gray-500">
        • سيتم حذف جميع البيانات المرتبطة بالعقد نهائياً
        <br />
        • لا يمكن استعادة البيانات بعد الحذف
      </p>
      
      <div className="flex gap-3 justify-end pt-4 border-t border-gray-200">
        <Button
          variant="outline"
          onClick={onCancel}
          disabled={isLoading}
        >
          إلغاء
        </Button>
        <Button
          variant="danger"
          onClick={onConfirm}
          disabled={isLoading || hasElevators || hasRequests}
          className="bg-gradient-to-r from-rose-600 to-rose-700 hover:from-rose-700 hover:to-rose-800 min-w-[120px]"
        >
          {isLoading ? (
            <div className="flex items-center justify-center gap-2">
              <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
              <span>جاري الحذف...</span>
            </div>
          ) : (
            'تأكيد الحذف'
          )}
        </Button>
      </div>
      
      {(hasElevators || hasRequests) && (
        <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-sm text-red-600 text-center">
            ⚠️ لا يمكن حذف عقد لديه مصاعد أو طلبات صيانة حالياً
          </p>
        </div>
      )}
    </div>
  );
};

export default Contracts;