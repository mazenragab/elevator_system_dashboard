import { useState, useEffect, useMemo } from 'react';
import { 
  Search, 
  UserPlus, 
  Phone, 
  Mail, 
  Building,
  User,
  FileText,
  Calendar,
  Eye,
  Trash2,
  Edit,
  AlertCircle,
  ChevronLeft,
  ChevronRight,
  Users,
  CheckCircle,
  Clock,
  Package,
  TrendingUp,
  Home
} from 'lucide-react';
import PageHeader from '../../components/layout/PageHeader';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Input from '../../components/forms/Input';
import Select from '../../components/forms/Select';
import Loading from '../../components/ui/Loading';
import EmptyState from '../../components/ui/EmptyState';
import Modal from '../../components/ui/Modal';
import { useClients } from '../../hooks/useClients';
import { useToast } from '../../hooks/useToast';
import AddClientModal from '../../components/models/AddClientModal';
import EditClientModal from '../../components/models/EditClientModal';
import { getSimpleLocationText } from '../../utils/location';

const Clients = () => {
  const { 
    clients, 
    loading, 
    error,
    pagination,
    selectedClientDetails,
    fetchClients,
    fetchClientById,
    createClient,
    updateClient,
    deleteClient,
    setSelectedClientDetails
  } = useClients();
  
  const { showToast } = useToast();
  
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all');
  const [sortBy, setSortBy] = useState('name');
  const [selectedClient, setSelectedClient] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showConfirmDeleteModal, setShowConfirmDeleteModal] = useState(false);
  const [clientToDelete, setClientToDelete] = useState(null);
  const [loadingDetails, setLoadingDetails] = useState(false);
  const [addClientLoading, setAddClientLoading] = useState(false);
  const [addClientError, setAddClientError] = useState(null);
  const [editingClient, setEditingClient] = useState(null);
  const [deleting, setDeleting] = useState(false);

  // دالة البحث والفلترة المحلية
  const filteredClients = useMemo(() => {
    let result = [...clients];

    // البحث بالاسم أو البريد أو رقم الهاتف
    if (search.trim()) {
      const searchLower = search.toLowerCase();
      result = result.filter(client =>
        client.user?.fullName?.toLowerCase().includes(searchLower) ||
        client.user?.email?.toLowerCase().includes(searchLower) ||
        client.user?.phoneNumber?.includes(search)
      );
    }

    // الفلترة حسب عدد المصاعد
    if (filter === 'few_elevators') {
      result = result.filter(client => (client._count?.elevators || 0) <= 2);
    } else if (filter === 'many_elevators') {
      result = result.filter(client => (client._count?.elevators || 0) > 2);
    } else if (filter === 'few_requests') {
      result = result.filter(client => (client._count?.maintenanceRequests || 0) <= 5);
    } else if (filter === 'many_requests') {
      result = result.filter(client => (client._count?.maintenanceRequests || 0) > 5);
    }

    // الترتيب
    if (sortBy === 'name') {
      result.sort((a, b) => a.user?.fullName?.localeCompare(b.user?.fullName || '') || 0);
    } else if (sortBy === 'name_desc') {
      result.sort((a, b) => b.user?.fullName?.localeCompare(a.user?.fullName || '') || 0);
    } else if (sortBy === 'date') {
      result.sort((a, b) => new Date(b.user?.createdAt || 0) - new Date(a.user?.createdAt || 0));
    } else if (sortBy === 'elevators') {
      result.sort((a, b) => (b._count?.elevators || 0) - (a._count?.elevators || 0));
    } else if (sortBy === 'requests') {
      result.sort((a, b) => (b._count?.maintenanceRequests || 0) - (a._count?.maintenanceRequests || 0));
    } else if (sortBy === 'contracts') {
      result.sort((a, b) => (b._count?.contracts || 0) - (a._count?.contracts || 0));
    }

    return result;
  }, [clients, search, filter, sortBy]);

  const handleSearch = () => {
    // البحث المحلي، لا حاجة لاستدعاء API
  };

  const handleFilterChange = (e) => {
    setFilter(e.target.value);
  };

  const handleSortChange = (e) => {
    setSortBy(e.target.value);
  };

  const handleViewDetails = async (client) => {
    setSelectedClient(client);
    setLoadingDetails(true);
    setSelectedClientDetails(null);
    
    try {
      // جلب بيانات العميل التفصيلية من API
      const details = await fetchClientById(client.id);
      setShowDetailsModal(true);
    } catch (err) {
      showToast('فشل تحميل بيانات العميل', 'error');
    } finally {
      setLoadingDetails(false);
    }
  };

  const handleEditClient = (client) => {
    setEditingClient(client);
    setShowEditModal(true);
  };

  // دالة فتح نافذة تأكيد الحذف
  const handleOpenDeleteModal = (client) => {
    setClientToDelete(client);
    setShowConfirmDeleteModal(true);
  };

  // دالة معالجة حذف العميل
  const handleConfirmDelete = async () => {
    if (!clientToDelete) return;
    
    setDeleting(true);
    
    try {
      await deleteClient(clientToDelete.id);
      showToast('تم حذف العميل بنجاح', 'success');
      setShowConfirmDeleteModal(false);
      setClientToDelete(null);
      // إعادة تحميل البيانات
      fetchClients();
    } catch (err) {
      showToast(err.message || 'فشل حذف العميل', 'error');
    } finally {
      setDeleting(false);
    }
  };

  // دالة معالجة إضافة عميل جديد
  const handleAddClient = async (clientData) => {
    setAddClientLoading(true);
    setAddClientError(null);
    
    try {
      await createClient(clientData);
      showToast('تم إضافة العميل بنجاح', 'success');
      setShowAddModal(false);
    } catch (err) {
      setAddClientError(err.message || 'فشل إضافة العميل');
      showToast('فشل إضافة العميل', 'error');
    } finally {
      setAddClientLoading(false);
    }
  };

  // دالة معالجة تحديث العميل
  const handleUpdateClient = async (id, clientData) => {
    try {
      await updateClient(id, clientData);
      showToast('تم تحديث بيانات العميل بنجاح', 'success');
      setShowEditModal(false);
      setEditingClient(null);
    } catch (err) {
      showToast(err.message || 'فشل تحديث العميل', 'error');
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
    fetchClients(params);
  };

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

  // حساب الإحصائيات الإجمالية
  const totalStats = useMemo(() => {
    const stats = {
      totalElevators: 0,
      totalRequests: 0,
      totalContracts: 0,
      avgElevatorsPerClient: 0,
      avgRequestsPerClient: 0
    };

    if (clients.length > 0) {
      stats.totalElevators = clients.reduce((sum, client) => sum + (client._count?.elevators || 0), 0);
      stats.totalRequests = clients.reduce((sum, client) => sum + (client._count?.maintenanceRequests || 0), 0);
      stats.totalContracts = clients.reduce((sum, client) => sum + (client._count?.contracts || 0), 0);
      stats.avgElevatorsPerClient = (stats.totalElevators / clients.length).toFixed(1);
      stats.avgRequestsPerClient = (stats.totalRequests / clients.length).toFixed(1);
    }

    return stats;
  }, [clients]);

  if (loading && clients.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loading size="lg" />
      </div>
    );
  }

  if (error && clients.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <EmptyState
          icon={<Users className="w-16 h-16 text-gray-300" />}
          title="حدث خطأ"
          description={error}
          actionLabel="إعادة المحاولة"
          onAction={() => fetchClients()}
        />
      </div>
    );
  }

  return (
    <div className="space-y-6 p-4 md:p-6">
      {/* العنوان والإجراءات */}
      <PageHeader
        title="إدارة العملاء"
        subtitle="إدارة عملاء المصاعد والمتعاملين"
        actions={
          <div className="flex flex-wrap gap-3">
            <Button 
              variant="primary"
              leftIcon={<UserPlus size={18} />}
              onClick={() => setShowAddModal(true)}
              className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800"
            >
              إضافة عميل جديد
            </Button>
          </div>
        }
      />

      {/* الفلترة والبحث */}
      <Card className="p-6 shadow-sm">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Input
            placeholder="ابحث باسم العميل أو البريد أو رقم الهاتف..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
            leftIcon={<Search size={18} />}
          />
          
          <Select
            value={filter}
            onChange={handleFilterChange}
            options={[
              { value: 'all', label: 'جميع العملاء' },
              { value: 'few_elevators', label: 'قليل المصاعد (≤ 2)' },
              { value: 'many_elevators', label: 'كثير المصاعد (> 2)' },
              { value: 'few_requests', label: 'قليل الطلبات (≤ 5)' },
              { value: 'many_requests', label: 'كثير الطلبات (> 5)' },
            ]}
          />
          
          <Select
            value={sortBy}
            onChange={handleSortChange}
            options={[
              { value: 'name', label: 'الاسم (أ-ي)' },
              { value: 'name_desc', label: 'الاسم (ي-أ)' },
              { value: 'date', label: 'تاريخ التسجيل' },
              { value: 'elevators', label: 'المصاعد (أكثر)' },
              { value: 'requests', label: 'الطلبات (أكثر)' },
              { value: 'contracts', label: 'العقود (أكثر)' },
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
              <p className="text-sm text-blue-600 font-medium mt-1">إجمالي العملاء</p>
            </div>
            <div className="p-3 bg-white/50 rounded-xl">
              <Users className="text-blue-600" size={24} />
            </div>
          </div>
        </Card>
        
        <Card className="p-6 shadow-sm bg-gradient-to-br from-emerald-50 to-emerald-100 border border-emerald-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-3xl font-bold text-gray-900">{totalStats.totalElevators}</p>
              <p className="text-sm text-emerald-600 font-medium mt-1">إجمالي المصاعد</p>
            </div>
            <div className="p-3 bg-white/50 rounded-xl">
              <Home className="text-emerald-600" size={24} />
            </div>
          </div>
        </Card>
        
        <Card className="p-6 shadow-sm bg-gradient-to-br from-amber-50 to-amber-100 border border-amber-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-3xl font-bold text-gray-900">{totalStats.totalRequests}</p>
              <p className="text-sm text-amber-600 font-medium mt-1">إجمالي طلبات الصيانة</p>
            </div>
            <div className="p-3 bg-white/50 rounded-xl">
              <Package className="text-amber-600" size={24} />
            </div>
          </div>
        </Card>
        
        <Card className="p-6 shadow-sm bg-gradient-to-br from-purple-50 to-purple-100 border border-purple-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-3xl font-bold text-gray-900">{totalStats.totalContracts}</p>
              <p className="text-sm text-purple-600 font-medium mt-1">إجمالي العقود</p>
            </div>
            <div className="p-3 bg-white/50 rounded-xl">
              <FileText className="text-purple-600" size={24} />
            </div>
          </div>
        </Card>
        
        <Card className="p-6 shadow-sm bg-gradient-to-br from-cyan-50 to-cyan-100 border border-cyan-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-3xl font-bold text-gray-900">{totalStats.avgElevatorsPerClient}</p>
              <p className="text-sm text-cyan-600 font-medium mt-1">متوسط مصاعد/عميل</p>
            </div>
            <div className="p-3 bg-white/50 rounded-xl">
              <TrendingUp className="text-cyan-600" size={24} />
            </div>
          </div>
        </Card>
      </div>

      {/* قائمة العملاء */}
      {filteredClients.length === 0 ? (
        <Card className="shadow-sm">
          <EmptyState
            icon={<Users className="w-16 h-16 text-gray-300" />}
            title="لا توجد عملاء"
            description="لم يتم العثور على عملاء مطابقين لبحثك"
            actionLabel="إضافة عميل جديد"
            onAction={() => setShowAddModal(true)}
          />
        </Card>
      ) : (
        <>
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            {filteredClients.map((client) => {
              const hasElevators = (client._count?.elevators || 0) > 0;
              const hasRequests = (client._count?.maintenanceRequests || 0) > 0;
              const hasContracts = (client._count?.contracts || 0) > 0;
              
              return (
                <Card key={client.id} className="shadow-sm hover:shadow-lg transition-all duration-300">
                  <div className="p-6">
                    {/* رأس البطاقة */}
                    <div className="flex items-start justify-between mb-6">
                      <div className="flex items-center gap-3">
                        <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-blue-700 rounded-full flex items-center justify-center">
                          <span className="font-bold text-white text-xl">
                            {client.user?.fullName?.charAt(0) || 'ع'}
                          </span>
                        </div>
                        <div className="text-right">
                          <h3 className="font-bold text-gray-900">{client.user?.fullName}</h3>
                          <p className="text-sm text-gray-500">ID: {client.id}</p>
                        </div>
                      </div>
                      <span className="px-3 py-1 text-xs bg-blue-100 text-blue-700 rounded-full">
                        #{client.userId}
                      </span>
                    </div>

                    {/* معلومات الاتصال */}
                    <div className="space-y-3 mb-6">
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Mail size={16} className="text-gray-400 flex-shrink-0" />
                        <span className="truncate">{client.user?.email}</span>
                      </div>
                      
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Phone size={16} className="text-gray-400 flex-shrink-0" />
                        <span>{client.user?.phoneNumber}</span>
                      </div>
                      
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Calendar size={16} className="text-gray-400 flex-shrink-0" />
                        <span>{formatDate(client.user?.createdAt)}</span>
                      </div>
                    </div>

                    {/* الإحصائيات */}
                    <div className="grid grid-cols-3 gap-4 pt-4 border-t border-gray-200">
                      <div className="text-center">
                        <div className="flex items-center justify-center gap-1">
                          <Home size={16} className="text-blue-500" />
                          <span className="font-bold">{client._count?.elevators || 0}</span>
                        </div>
                        <p className="text-xs text-gray-500 mt-1">مصاعد</p>
                      </div>
                      
                      <div className="text-center">
                        <div className="flex items-center justify-center gap-1">
                          <Package size={16} className="text-amber-500" />
                          <span className="font-bold">{client._count?.maintenanceRequests || 0}</span>
                        </div>
                        <p className="text-xs text-gray-500 mt-1">طلبات صيانة</p>
                      </div>
                      
                      <div className="text-center">
                        <div className="flex items-center justify-center gap-1">
                          <FileText size={16} className="text-emerald-500" />
                          <span className="font-bold">{client._count?.contracts || 0}</span>
                        </div>
                        <p className="text-xs text-gray-500 mt-1">عقود</p>
                      </div>
                    </div>

                    {/* الأزرار */}
                    <div className="flex gap-2 mt-6">
                      <Button 
                        variant="outline" 
                        className="flex-1 text-blue-600 border-blue-200 hover:bg-blue-50"
                        onClick={() => handleViewDetails(client)}
                        leftIcon={<Eye size={16} />}
                      >
                        التفاصيل
                      </Button>
                      
                      <Button 
                        variant="outline"
                        className="flex-1 text-emerald-600 border-emerald-200 hover:bg-emerald-50"
                        onClick={() => handleEditClient(client)}
                        leftIcon={<Edit size={16} />}
                      >
                        تعديل
                      </Button>
                      
                      <Button 
                        variant="danger"
                        className="flex-1 bg-gradient-to-r from-rose-600 to-rose-700 hover:from-rose-700 hover:to-rose-800"
                        onClick={() => handleOpenDeleteModal(client)}
                        disabled={hasElevators || hasRequests || hasContracts}
                        leftIcon={<Trash2 size={16} />}
                        title={(hasElevators || hasRequests || hasContracts) ? "لا يمكن حذف عميل لديه مصاعد أو طلبات أو عقود" : "حذف العميل"}
                      >
                        حذف
                      </Button>
                    </div>
                    
                    {(hasElevators || hasRequests || hasContracts) && (
                      <div className="mt-3 flex items-center gap-2 text-xs text-amber-600">
                        <AlertCircle size={14} />
                        <span>لا يمكن حذف عميل لديه مصاعد أو طلبات أو عقود</span>
                      </div>
                    )}
                  </div>
                </Card>
              );
            })}
          </div>

          {/* الترقيم */}
          <PaginationComponent />
        </>
      )}

      {/* مودال إضافة عميل جديد */}
      <AddClientModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        onSubmit={handleAddClient}
        isLoading={addClientLoading}
        error={addClientError}
      />

      {/* مودال تعديل العميل */}
      {editingClient && (
        <EditClientModal
          isOpen={showEditModal}
          onClose={() => {
            setShowEditModal(false);
            setEditingClient(null);
          }}
          client={editingClient}
          onSubmit={handleUpdateClient}
        />
      )}

      {/* مودال تفاصيل العميل */}
      {selectedClient && (
        <Modal
          isOpen={showDetailsModal}
          onClose={() => {
            setShowDetailsModal(false);
            setSelectedClientDetails(null);
          }}
          title="تفاصيل العميل"
          size="lg"
        >
          {loadingDetails ? (
            <div className="flex items-center justify-center py-12">
              <Loading size="md" />
            </div>
          ) : selectedClientDetails ? (
            <div className="space-y-6">
              {/* معلومات العميل الأساسية */}
              <Card className="shadow-sm">
                <div className="p-6">
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-4">
                      <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-blue-700 rounded-full flex items-center justify-center">
                        <span className="font-bold text-white text-2xl">
                          {selectedClientDetails.user?.fullName?.charAt(0) || 'ع'}
                        </span>
                      </div>
                      <div className="text-right">
                        <h3 className="font-bold text-xl text-gray-900">
                          {selectedClientDetails.user?.fullName}
                        </h3>
                        <p className="text-sm text-gray-500">ID: {selectedClientDetails.id}</p>
                        <div className="flex items-center gap-2 mt-2">
                          <span className="px-3 py-1 text-sm bg-blue-100 text-blue-700 rounded-full">
                            User ID: {selectedClientDetails.userId}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-500 mb-1">البريد الإلكتروني</label>
                        <div className="flex items-center gap-2">
                          <Mail size={16} className="text-gray-400" />
                          <span className="text-gray-900">{selectedClientDetails.user?.email}</span>
                        </div>
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-500 mb-1">رقم الهاتف</label>
                        <div className="flex items-center gap-2">
                          <Phone size={16} className="text-gray-400" />
                          <span className="text-gray-900">{selectedClientDetails.user?.phoneNumber}</span>
                        </div>
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-500 mb-1">تاريخ التسجيل</label>
                        <div className="flex items-center gap-2">
                          <Calendar size={16} className="text-gray-400" />
                          <span className="text-gray-900">{formatDate(selectedClientDetails.user?.createdAt)}</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-500 mb-1">معرف العميل</label>
                        <div className="p-3 bg-gray-50 rounded-lg">
                          <div className="text-gray-900 font-mono">{selectedClientDetails.id}</div>
                        </div>
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-500 mb-1">معرف المستخدم</label>
                        <div className="p-3 bg-gray-50 rounded-lg">
                          <div className="text-gray-900 font-mono">{selectedClientDetails.userId}</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </Card>

              {/* إحصائيات العميل */}
              <Card className="shadow-sm">
                <div className="p-6">
                  <h4 className="font-bold text-gray-900 mb-4">الإحصائيات</h4>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    <div className="text-center p-4 bg-blue-50 rounded-lg">
                      <div className="text-2xl font-bold text-blue-600">
                        {selectedClientDetails._count?.elevators || 0}
                      </div>
                      <p className="text-sm text-gray-600 mt-1">عدد المصاعد</p>
                    </div>
                    
                    <div className="text-center p-4 bg-amber-50 rounded-lg">
                      <div className="text-2xl font-bold text-amber-600">
                        {selectedClientDetails._count?.maintenanceRequests || 0}
                      </div>
                      <p className="text-sm text-gray-600 mt-1">طلبات الصيانة</p>
                    </div>
                    
                    <div className="text-center p-4 bg-emerald-50 rounded-lg">
                      <div className="text-2xl font-bold text-emerald-600">
                        {selectedClientDetails._count?.contracts || 0}
                      </div>
                      <p className="text-sm text-gray-600 mt-1">عدد العقود</p>
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
                    setSelectedClientDetails(null);
                  }}
                >
                  إغلاق
                </Button>
                <Button
                  variant="primary"
                  onClick={() => {
                    setShowDetailsModal(false);
                    handleEditClient(selectedClient);
                  }}
                >
                  تعديل البيانات
                </Button>
              </div>
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-gray-500">لا توجد بيانات تفصيلية للعميل</p>
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
            setClientToDelete(null);
          }
        }}
        title="تأكيد حذف العميل"
      >
        <div className="space-y-4">
          <div className="flex items-center gap-3 text-amber-600 bg-amber-50 p-4 rounded-lg">
            <AlertCircle size={24} />
            <div className="text-right">
              <h4 className="font-bold">تحذير!</h4>
              <p className="text-sm mt-1">هذا الإجراء لا يمكن التراجع عنه</p>
            </div>
          </div>
          
          <p className="text-gray-600">
            هل أنت متأكد من حذف العميل 
            <span className="font-bold text-gray-900"> {clientToDelete?.user?.fullName} </span>
            ؟
          </p>
          
          <div className="bg-gray-50 p-4 rounded-lg">
            <h5 className="font-bold text-sm text-gray-700 mb-2">تفاصيل العميل:</h5>
            <div className="space-y-1 text-sm text-gray-600">
              <div>البريد: <span className="font-medium">{clientToDelete?.user?.email}</span></div>
              <div>رقم الهاتف: <span className="font-medium">{clientToDelete?.user?.phoneNumber}</span></div>
              <div>المصاعد: <span className="font-medium">{clientToDelete?._count?.elevators || 0}</span></div>
              <div>طلبات الصيانة: <span className="font-medium">{clientToDelete?._count?.maintenanceRequests || 0}</span></div>
              <div>العقود: <span className="font-medium">{clientToDelete?._count?.contracts || 0}</span></div>
            </div>
          </div>
          
          <p className="text-sm text-gray-500">
            • سيتم حذف جميع البيانات المرتبطة بالعميل نهائياً
            <br />
            • لا يمكن استعادة البيانات بعد الحذف
            <br />
            • إذا كان العميل لديه مصاعد أو طلبات أو عقود، لن يتمكن من الحذف
          </p>
          
          <div className="flex gap-3 justify-end pt-4 border-t border-gray-200">
            <Button
              variant="outline"
              onClick={() => {
                setShowConfirmDeleteModal(false);
                setClientToDelete(null);
              }}
              disabled={deleting}
            >
              إلغاء
            </Button>
            <Button
              variant="danger"
              onClick={handleConfirmDelete}
              disabled={deleting || 
                (clientToDelete?._count?.elevators || 0) > 0 || 
                (clientToDelete?._count?.maintenanceRequests || 0) > 0 ||
                (clientToDelete?._count?.contracts || 0) > 0}
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
          
          {(clientToDelete?._count?.elevators || 0) > 0 || 
           (clientToDelete?._count?.maintenanceRequests || 0) > 0 ||
           (clientToDelete?._count?.contracts || 0) > 0 && (
            <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-600 text-center">
                ⚠️ لا يمكن حذف عميل لديه مصاعد أو طلبات أو عقود حالياً
              </p>
            </div>
          )}
        </div>
      </Modal>
    </div>
  );
};

export default Clients;