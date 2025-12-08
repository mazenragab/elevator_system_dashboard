import { useState, useEffect, useMemo } from 'react';
import { 
  Search, 
  UserPlus, 
  Phone, 
  Mail, 
  MapPin,
  Star,
  Eye,
  Wrench,
  Calendar,
  Download,
  Users,
  UserCheck,
  FileText,
  ChevronLeft,
  ChevronRight,
  Clock,
  Navigation,
  Trash2,
  AlertCircle,
  CheckCircle
} from 'lucide-react';
import PageHeader from '../../components/layout/PageHeader';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Input from '../../components/forms/Input';
import Select from '../../components/forms/Select';
import Loading from '../../components/ui/Loading';
import EmptyState from '../../components/ui/EmptyState';
import Modal from '../../components/ui/Modal';
import { useTechnicians } from '../../hooks/useTechnicians';
import { useToast } from '../../hooks/useToast';
import AddTechnicianModal from '../../components/models/AddTechnicianModal';
import { getSimpleLocationText } from '../../utils/location';

const Technicians = () => {
  const { 
    technicians, 
    availableTechnicians,
    loading, 
    error,
    pagination,
    selectedTechnicianDetails,
    fetchTechnicians,
    fetchAvailableTechnicians,
    fetchTechnicianById,
    createTechnician,
    deleteTechnician,
    setSelectedTechnicianDetails
  } = useTechnicians();
  
  const { showToast } = useToast();
  
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all');
  const [sortBy, setSortBy] = useState('name');
  const [selectedTechnician, setSelectedTechnician] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showConfirmDeleteModal, setShowConfirmDeleteModal] = useState(false);
  const [technicianToDelete, setTechnicianToDelete] = useState(null);
  const [loadingDetails, setLoadingDetails] = useState(false);
  const [addTechnicianLoading, setAddTechnicianLoading] = useState(false);
  const [addTechnicianSuccess, setAddTechnicianSuccess] = useState(false);
  const [addTechnicianError, setAddTechnicianError] = useState(null);
  const [deleting, setDeleting] = useState(false);

  // دالة البحث والفلترة المحلية
  const filteredTechnicians = useMemo(() => {
    let result = [...technicians];

    // البحث بالاسم أو البريد
    if (search.trim()) {
      const searchLower = search.toLowerCase();
      result = result.filter(tech =>
        tech.user?.fullName?.toLowerCase().includes(searchLower) ||
        tech.user?.email?.toLowerCase().includes(searchLower) ||
        tech.user?.phoneNumber?.includes(search)
      );
    }

    // الفلترة حسب عدد الطلبات المعينة
    if (filter === 'available') {
      result = result.filter(tech => (tech._count?.assignedRequests || 0) === 0);
    } else if (filter === 'busy') {
      result = result.filter(tech => (tech._count?.assignedRequests || 0) > 0);
    }

    // الترتيب
    if (sortBy === 'name') {
      result.sort((a, b) => a.user?.fullName?.localeCompare(b.user?.fullName || '') || 0);
    } else if (sortBy === 'name_desc') {
      result.sort((a, b) => b.user?.fullName?.localeCompare(a.user?.fullName || '') || 0);
    } else if (sortBy === 'requests') {
      result.sort((a, b) => (b._count?.assignedRequests || 0) - (a._count?.assignedRequests || 0));
    } else if (sortBy === 'date') {
      result.sort((a, b) => new Date(b.user?.createdAt || 0) - new Date(a.user?.createdAt || 0));
    }

    return result;
  }, [technicians, search, filter, sortBy]);

  const handleSearch = () => {
    // البحث المحلي، لا حاجة لاستدعاء API
  };

  const handleFilterChange = (e) => {
    setFilter(e.target.value);
  };

  const handleSortChange = (e) => {
    setSortBy(e.target.value);
  };

  const handleViewDetails = async (technician) => {
    setSelectedTechnician(technician);
    setLoadingDetails(true);
    setSelectedTechnicianDetails(null);
    
    try {
      // جلب بيانات الفني التفصيلية من API
      const details = await fetchTechnicianById(technician.id);
      setShowDetailsModal(true);
    } catch (err) {
      showToast('فشل تحميل بيانات الفني', 'error');
    } finally {
      setLoadingDetails(false);
    }
  };

  // دالة فتح نافذة تأكيد الحذف
  const handleOpenDeleteModal = (technician) => {
    setTechnicianToDelete(technician);
    setShowConfirmDeleteModal(true);
  };

  // دالة معالجة حذف الفني
  const handleConfirmDelete = async () => {
    if (!technicianToDelete) return;
    
    setDeleting(true);
    
    try {
      await deleteTechnician(technicianToDelete.id);
      showToast('تم حذف الفني بنجاح', 'success');
      setShowConfirmDeleteModal(false);
      setTechnicianToDelete(null);
      // إعادة تحميل البيانات
      fetchTechnicians();
      fetchAvailableTechnicians();
    } catch (err) {
      showToast(err.message || 'فشل حذف الفني', 'error');
    } finally {
      setDeleting(false);
    }
  };

  // دالة معالجة إضافة فني جديد
  const handleAddTechnician = async (technicianData) => {
    setAddTechnicianLoading(true);
    setAddTechnicianError(null);
    setAddTechnicianSuccess(false);
    
    try {
      await createTechnician(technicianData);
      
      // إعادة تحميل بيانات الفنيين
      await fetchTechnicians();
      await fetchAvailableTechnicians();
      
      // عرض toast النجاح
      showToast('تم إضافة الفني بنجاح', 'success');
      setAddTechnicianSuccess(true);
      
      // إرجاع true للإشارة إلى النجاح
      return true;
    } catch (err) {
      setAddTechnicianError(err.message || 'فشل إضافة الفني');
      showToast('فشل إضافة الفني', 'error');
      
      // إرجاع false للإشارة إلى الفشل
      return false;
    } finally {
      setAddTechnicianLoading(false);
    }
  };

  // دالة إغلاق نافذة الإضافة
  const handleCloseAddModal = () => {
    setShowAddModal(false);
    setAddTechnicianError(null);
    setAddTechnicianSuccess(false);
  };

  // دالة لحساب متوسط التقييم
  const calculateRating = (technician) => {
    const ratingsCount = technician._count?.ratings || 0;
    
    if (ratingsCount === 0) return { average: 0, count: 0 };
    
    // قيمة افتراضية - يجب استبدالها ببيانات حقيقية من API
    const averageRating = 4.5;
    
    return { average: averageRating, count: ratingsCount };
  };

  // دالة لتنسيق التاريخ كما هو من السيرفر
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
    fetchTechnicians(params);
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

  if (loading && technicians.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loading size="lg" />
      </div>
    );
  }

  if (error && technicians.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <EmptyState
          icon={<Users className="w-16 h-16 text-gray-300" />}
          title="حدث خطأ"
          description={error}
          actionLabel="إعادة المحاولة"
          onAction={() => fetchTechnicians()}
        />
      </div>
    );
  }

  return (
    <div className="space-y-6 p-4 md:p-6">
      {/* العنوان والإجراءات */}
      <PageHeader
        title="إدارة الفنيين"
        subtitle="إدارة فنيي الصيانة والمتابعة"
        actions={
          <div className="flex flex-wrap gap-3">
            <Button 
              variant="primary"
              leftIcon={<UserPlus size={18} />}
              onClick={() => setShowAddModal(true)}
              className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800"
            >
              إضافة فني جديد
            </Button>
          </div>
        }
      />

      {/* الفلترة والبحث */}
      <Card className="p-6 shadow-sm">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Input
            placeholder="ابحث باسم الفني أو البريد..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
            leftIcon={<Search size={18} />}
          />
          
          <Select
            value={filter}
            onChange={handleFilterChange}
            options={[
              { value: 'all', label: 'جميع الفنيين' },
              { value: 'available', label: 'متاح' },
              { value: 'busy', label: 'مشغول' },
            ]}
          />
          
          <Select
            value={sortBy}
            onChange={handleSortChange}
            options={[
              { value: 'name', label: 'الاسم (أ-ي)' },
              { value: 'name_desc', label: 'الاسم (ي-أ)' },
              { value: 'requests', label: 'الطلبات (أكثر)' },
              { value: 'date', label: 'تاريخ الانضمام' },
            ]}
          />
        </div>
      </Card>

      {/* إحصائيات سريعة */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="p-6 shadow-sm bg-gradient-to-br from-blue-50 to-blue-100 border border-blue-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-3xl font-bold text-gray-900">{pagination.total}</p>
              <p className="text-sm text-blue-600 font-medium mt-1">إجمالي الفنيين</p>
            </div>
            <div className="p-3 bg-white/50 rounded-xl">
              <Users className="text-blue-600" size={24} />
            </div>
          </div>
        </Card>
        
        <Card className="p-6 shadow-sm bg-gradient-to-br from-emerald-50 to-emerald-100 border border-emerald-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-3xl font-bold text-gray-900">
                {availableTechnicians.length}
              </p>
              <p className="text-sm text-emerald-600 font-medium mt-1">متاحين الآن</p>
            </div>
            <div className="p-3 bg-white/50 rounded-xl">
              <UserCheck className="text-emerald-600" size={24} />
            </div>
          </div>
        </Card>
        
        <Card className="p-6 shadow-sm bg-gradient-to-br from-amber-50 to-amber-100 border border-amber-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-3xl font-bold text-gray-900">
                {technicians.reduce((sum, t) => sum + (t._count?.assignedRequests || 0), 0)}
              </p>
              <p className="text-sm text-amber-600 font-medium mt-1">طلبات معينة</p>
            </div>
            <div className="p-3 bg-white/50 rounded-xl">
              <Wrench className="text-amber-600" size={24} />
            </div>
          </div>
        </Card>
        
        <Card className="p-6 shadow-sm bg-gradient-to-br from-purple-50 to-purple-100 border border-purple-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-3xl font-bold text-gray-900">
                {technicians.reduce((sum, t) => sum + (t._count?.ratings || 0), 0)}
              </p>
              <p className="text-sm text-purple-600 font-medium mt-1">تقييمات</p>
            </div>
            <div className="p-3 bg-white/50 rounded-xl">
              <Star className="text-purple-600" size={24} />
            </div>
          </div>
        </Card>
      </div>

      {/* قائمة الفنيين */}
      {filteredTechnicians.length === 0 ? (
        <Card className="shadow-sm">
          <EmptyState
            icon={<Users className="w-16 h-16 text-gray-300" />}
            title="لا توجد فنيين"
            description="لم يتم العثور على فنيين مطابقين لبحثك"
            actionLabel="إضافة فني جديد"
            onAction={() => setShowAddModal(true)}
          />
        </Card>
      ) : (
        <>
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            {filteredTechnicians.map((tech) => {
              const rating = calculateRating(tech);
              const hasAssignedRequests = (tech._count?.assignedRequests || 0) > 0;
              
              return (
                <Card key={tech.id} className="shadow-sm hover:shadow-lg transition-all duration-300">
                  <div className="p-6">
                    {/* رأس البطاقة */}
                    <div className="flex items-start justify-between mb-6">
                      <div className="flex items-center gap-3">
                        <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-blue-700 rounded-full flex items-center justify-center">
                          <span className="font-bold text-white text-xl">
                            {tech.user?.fullName?.charAt(0) || 'ف'}
                          </span>
                        </div>
                        <div className="text-right">
                          <h3 className="font-bold text-gray-900">{tech.user?.fullName}</h3>
                          <p className="text-sm text-gray-500">#{tech.id}</p>
                        </div>
                      </div>
                    </div>

                    {/* معلومات الاتصال */}
                    <div className="space-y-3 mb-6">
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Mail size={16} className="text-gray-400 flex-shrink-0" />
                        <span className="truncate">{tech.user?.email}</span>
                      </div>
                      
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Phone size={16} className="text-gray-400 flex-shrink-0" />
                        <span>{tech.user?.phoneNumber}</span>
                      </div>
                      
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <MapPin size={16} className="text-gray-400 flex-shrink-0" />
                        <span className="truncate">
                          {getSimpleLocationText(tech.currentLocationLat, tech.currentLocationLng)}
                        </span>
                      </div>
                      
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Calendar size={16} className="text-gray-400 flex-shrink-0" />
                        <span>{formatDate(tech.user?.createdAt)}</span>
                      </div>
                    </div>

                    {/* الإحصائيات */}
                    <div className="grid grid-cols-4 gap-4 pt-4 border-t border-gray-200">
                      <div className="text-center">
                        <div className="flex items-center justify-center gap-1">
                          <Wrench size={16} className="text-blue-500" />
                          <span className="font-bold">{tech._count?.assignedRequests || 0}</span>
                        </div>
                        <p className="text-xs text-gray-500 mt-1">طلبات معينة</p>
                      </div>
                      
                      <div className="text-center">
                        <div className="flex items-center justify-center gap-1">
                          <Star size={16} className="text-yellow-500 fill-current" />
                          <span className="font-bold">{rating.average.toFixed(1)}</span>
                        </div>
                        <p className="text-xs text-gray-500 mt-1">التقييم ({rating.count})</p>
                      </div>
                      
                      <div className="text-center">
                        <div className="flex items-center justify-center gap-1">
                          <FileText size={16} className="text-purple-500" />
                          <span className="font-bold">{tech._count?.reports || 0}</span>
                        </div>
                        <p className="text-xs text-gray-500 mt-1">تقارير</p>
                      </div>
                      
                      <div className="text-center">
                        <div className="flex items-center justify-center gap-1">
                          <Clock size={16} className="text-emerald-500" />
                          <span className="font-bold">{tech._count?.ratings || 0}</span>
                        </div>
                        <p className="text-xs text-gray-500 mt-1">تقييمات</p>
                      </div>
                    </div>

                    {/* الأزرار */}
                    <div className="flex gap-2 mt-6">
                      <Button 
                        variant="outline" 
                        className="flex-1 text-blue-600 border-blue-200 hover:bg-blue-50"
                        onClick={() => handleViewDetails(tech)}
                        leftIcon={<Eye size={16} />}
                      >
                        التفاصيل
                      </Button>
                      
                      <Button 
                        variant="danger"
                        className="flex-1 bg-gradient-to-r from-rose-600 to-rose-700 hover:from-rose-700 hover:to-rose-800"
                        onClick={() => handleOpenDeleteModal(tech)}
                        disabled={hasAssignedRequests}
                        leftIcon={<Trash2 size={16} />}
                        title={hasAssignedRequests ? "لا يمكن حذف فني لديه طلبات معينة" : "حذف الفني"}
                      >
                        حذف
                      </Button>
                    </div>
                    
                    {hasAssignedRequests && (
                      <div className="mt-3 flex items-center gap-2 text-xs text-amber-600">
                        <AlertCircle size={14} />
                        <span>لا يمكن حذف فني لديه طلبات معينة</span>
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

      {/* مودال إضافة فني جديد */}
      <AddTechnicianModal
        isOpen={showAddModal}
        onClose={handleCloseAddModal}
        onSubmit={handleAddTechnician}
        isLoading={addTechnicianLoading}
        success={addTechnicianSuccess}
        error={addTechnicianError}
      />

      {/* مودال تفاصيل الفني */}
      {selectedTechnician && (
        <Modal
          isOpen={showDetailsModal}
          onClose={() => {
            setShowDetailsModal(false);
            setSelectedTechnicianDetails(null);
          }}
          title="تفاصيل الفني"
          size="lg"
        >
          {loadingDetails ? (
            <div className="flex items-center justify-center py-12">
              <Loading size="md" />
            </div>
          ) : selectedTechnicianDetails ? (
            <div className="space-y-6">
              {/* معلومات الفني الأساسية */}
              <Card className="shadow-sm">
                <div className="p-6">
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-4">
                      <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-blue-700 rounded-full flex items-center justify-center">
                        <span className="font-bold text-white text-2xl">
                          {selectedTechnicianDetails.user?.fullName?.charAt(0) || 'ف'}
                        </span>
                      </div>
                      <div className="text-right">
                        <h3 className="font-bold text-xl text-gray-900">
                          {selectedTechnicianDetails.user?.fullName}
                        </h3>
                        <p className="text-sm text-gray-500">#{selectedTechnicianDetails.id}</p>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-500 mb-1">البريد الإلكتروني</label>
                        <div className="flex items-center gap-2">
                          <Mail size={16} className="text-gray-400" />
                          <span className="text-gray-900">{selectedTechnicianDetails.user?.email}</span>
                        </div>
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-500 mb-1">رقم الهاتف</label>
                        <div className="flex items-center gap-2">
                          <Phone size={16} className="text-gray-400" />
                          <span className="text-gray-900">{selectedTechnicianDetails.user?.phoneNumber}</span>
                        </div>
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-500 mb-1">تاريخ الانضمام</label>
                        <div className="flex items-center gap-2">
                          <Calendar size={16} className="text-gray-400" />
                          <span className="text-gray-900">{formatDate(selectedTechnicianDetails.user?.createdAt)}</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-500 mb-1">الموقع الحالي</label>
                        <div className="flex items-center gap-2">
                          <MapPin size={16} className="text-gray-400" />
                          <span className="text-gray-900">
                            {getSimpleLocationText(
                              selectedTechnicianDetails.currentLocationLat, 
                              selectedTechnicianDetails.currentLocationLng
                            )}
                          </span>
                        </div>
                        {selectedTechnicianDetails.currentLocationLat && selectedTechnicianDetails.currentLocationLng && (
                          <a 
                            href={`https://maps.google.com/?q=${selectedTechnicianDetails.currentLocationLat},${selectedTechnicianDetails.currentLocationLng}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 text-sm text-blue-600 hover:text-blue-800 mt-2"
                          >
                            <Navigation size={14} />
                            عرض على الخريطة
                          </a>
                        )}
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-500 mb-1">الإحداثيات</label>
                        <div className="flex gap-2 text-sm">
                          <span className="text-gray-700">
                            عرض: {selectedTechnicianDetails.currentLocationLat || 'غير متاح'}
                          </span>
                          <span className="text-gray-700">
                            طول: {selectedTechnicianDetails.currentLocationLng || 'غير متاح'}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </Card>

              {/* إحصائيات الفني */}
              <Card className="shadow-sm">
                <div className="p-6">
                  <h4 className="font-bold text-gray-900 mb-4">الإحصائيات</h4>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="text-center p-4 bg-blue-50 rounded-lg">
                      <div className="text-2xl font-bold text-blue-600">
                        {selectedTechnicianDetails._count?.assignedRequests || 0}
                      </div>
                      <p className="text-sm text-gray-600 mt-1">طلبات معينة</p>
                    </div>
                    
                    <div className="text-center p-4 bg-purple-50 rounded-lg">
                      <div className="text-2xl font-bold text-purple-600">
                        {selectedTechnicianDetails._count?.reports || 0}
                      </div>
                      <p className="text-sm text-gray-600 mt-1">تقارير</p>
                    </div>
                    
                    <div className="text-center p-4 bg-yellow-50 rounded-lg">
                      <div className="text-2xl font-bold text-yellow-600">
                        {selectedTechnicianDetails._count?.ratings || 0}
                      </div>
                      <p className="text-sm text-gray-600 mt-1">تقييمات</p>
                    </div>
                    
                    <div className="text-center p-4 bg-emerald-50 rounded-lg">
                      <div className="text-2xl font-bold text-emerald-600">
                        {calculateRating(selectedTechnicianDetails).average.toFixed(1)}
                      </div>
                      <p className="text-sm text-gray-600 mt-1">متوسط التقييم</p>
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
                    setSelectedTechnicianDetails(null);
                  }}
                >
                  إغلاق
                </Button>
              </div>
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-gray-500">لا توجد بيانات تفصيلية للفني</p>
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
            setTechnicianToDelete(null);
          }
        }}
        title="تأكيد حذف الفني"
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
            هل أنت متأكد من حذف الفني 
            <span className="font-bold text-gray-900"> {technicianToDelete?.user?.fullName} </span>
            ؟
          </p>
          
          <div className="bg-gray-50 p-4 rounded-lg">
            <h5 className="font-bold text-sm text-gray-700 mb-2">تفاصيل الفني:</h5>
            <div className="space-y-1 text-sm text-gray-600">
              <div>البريد: <span className="font-medium">{technicianToDelete?.user?.email}</span></div>
              <div>رقم الهاتف: <span className="font-medium">{technicianToDelete?.user?.phoneNumber}</span></div>
              <div>الطلبات المعينة: <span className="font-medium">{technicianToDelete?._count?.assignedRequests || 0}</span></div>
            </div>
          </div>
          
          <p className="text-sm text-gray-500">
            • سيتم حذف جميع البيانات المرتبطة بالفني نهائياً
            <br />
            • لا يمكن استعادة البيانات بعد الحذف
            <br />
            • إذا كان الفني لديه طلبات معينة، لن يتمكن من الحذف
          </p>
          
          <div className="flex gap-3 justify-end pt-4 border-t border-gray-200">
            <Button
              variant="outline"
              onClick={() => {
                setShowConfirmDeleteModal(false);
                setTechnicianToDelete(null);
              }}
              disabled={deleting}
            >
              إلغاء
            </Button>
            <Button
              variant="danger"
              onClick={handleConfirmDelete}
              disabled={deleting || (technicianToDelete?._count?.assignedRequests || 0) > 0}
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
          
          {(technicianToDelete?._count?.assignedRequests || 0) > 0 && (
            <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-600 text-center">
                ⚠️ لا يمكن حذف فني لديه طلبات معينة حالياً
              </p>
            </div>
          )}
        </div>
      </Modal>
    </div>
  );
};

export default Technicians;