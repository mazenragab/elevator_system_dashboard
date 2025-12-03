import { useState, useEffect } from 'react';
import { 
  Search, 
  Filter, 
  Download, 
  Plus,
  FileText,
  Calendar,
  User,
  ChevronLeft,
  Eye,
  Edit,
  Trash2,
  CheckCircle,
  XCircle,
  Clock
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
import { managerService } from '../../services/managerService';
import { formatArabicDate } from '../../utils/rtl';

const Contracts = () => {
  const { 
    contracts, 
    loading, 
    error,
    pagination,
    fetchContracts,
    fetchContractById,
    changePage,
    changeLimit,
    refetch
  } = useContracts();
  
  const { showToast } = useToast();
  
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedContract, setSelectedContract] = useState(null);
  const [contractDetails, setContractDetails] = useState(null);
  const [loadingDetails, setLoadingDetails] = useState(false);
  const [deleting, setDeleting] = useState(false);

  // تحميل العقود عند التحميل الأول
  useEffect(() => {
    fetchContracts();
  }, []);

  const handleSearch = () => {
    fetchContracts({
      search,
      status: filter !== 'all' ? filter : undefined
    });
  };

  const handleFilterChange = (e) => {
    setFilter(e.target.value);
    fetchContracts({
      search,
      status: e.target.value !== 'all' ? e.target.value : undefined
    });
  };

  const handleViewDetails = async (contract) => {
    setSelectedContract(contract);
    setLoadingDetails(true);
    
    try {
      const details = await fetchContractById(contract.id);
      setContractDetails(details);
      setShowDetailsModal(true);
    } catch (err) {
      showToast('فشل تحميل تفاصيل العقد', 'error');
    } finally {
      setLoadingDetails(false);
    }
  };

  const handleDeleteContract = async () => {
    if (!selectedContract) return;
    
    try {
      setDeleting(true);
      await managerService.deleteContract(selectedContract.id);
      showToast('تم حذف العقد بنجاح', 'success');
      setShowDeleteModal(false);
      refetch();
    } catch (err) {
      showToast('فشل حذف العقد', 'error');
    } finally {
      setDeleting(false);
    }
  };

  const handleExportContracts = async () => {
    try {
      const response = await managerService.generateReport({
        type: 'contracts',
        format: 'excel',
        startDate: new Date(new Date().setFullYear(new Date().getFullYear() - 1)).toISOString().split('T')[0],
        endDate: new Date().toISOString().split('T')[0]
      });
      
      if (response.data) {
        // تحميل الملف
        const url = window.URL.createObjectURL(new Blob([response.data]));
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', `contracts-${new Date().toISOString().split('T')[0]}.xlsx`);
        document.body.appendChild(link);
        link.click();
        link.remove();
        
        showToast('تم تصدير العقود بنجاح', 'success');
      }
    } catch (err) {
      showToast('فشل تصدير العقود', 'error');
    }
  };

  const getStatusBadge = (status, endDate) => {
    const now = new Date();
    const end = new Date(endDate);
    
    if (status === 'expired' || end < now) {
      return <Badge variant="danger">منتهي</Badge>;
    }
    
    const daysRemaining = Math.ceil((end - now) / (1000 * 60 * 60 * 24));
    
    if (daysRemaining <= 30) {
      return <Badge variant="warning">قريب الإنتهاء</Badge>;
    }
    
    return <Badge variant="success">نشط</Badge>;
  };

  const getDaysRemaining = (endDate) => {
    const now = new Date();
    const end = new Date(endDate);
    const days = Math.ceil((end - now) / (1000 * 60 * 60 * 24));
    return days > 0 ? days : 0;
  };

  const formatContractType = (type) => {
    const types = {
      'full': 'صيانة كاملة',
      'preventive': 'صيانة وقائية',
      'ondemand': 'حسب الطلب'
    };
    return types[type] || type;
  };

  if (loading && contracts.length === 0) {
    return <Loading fullScreen />;
  }

  if (error && contracts.length === 0) {
    return (
      <div className="flex items-center justify-center h-96">
        <EmptyState
          title="حدث خطأ"
          description={error}
          actionLabel="إعادة المحاولة"
          onAction={() => fetchContracts()}
        />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* العنوان والإجراءات */}
      <PageHeader
        title="العقود"
        subtitle="إدارة عقود صيانة المصاعد"
        actions={
          <div className="flex items-center gap-3">
            <Button 
              variant="outline" 
              leftIcon={<Download size={16} />}
              onClick={handleExportContracts}
            >
              تصدير
            </Button>
            <Button 
              leftIcon={<Plus size={16} />} 
              onClick={() => setShowCreateModal(true)}
            >
              عقد جديد
            </Button>
          </div>
        }
      />

      {/* الفلترة والبحث */}
      <Card className="p-6">
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
              { value: 'expiring', label: 'قريب الإنتهاء' },
              { value: 'expired', label: 'منتهي' },
            ]}
            leftIcon={<Filter size={18} />}
          />
          
          <Select
            placeholder="فرز حسب"
            options={[
              { value: 'newest', label: 'الأحدث' },
              { value: 'oldest', label: 'الأقدم' },
              { value: 'expiring', label: 'الأقرب للانتهاء' },
              { value: 'value', label: 'القيمة' },
            ]}
          />
        </div>
      </Card>

      {/* إحصائيات سريعة */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="text-center p-6">
          <div className="text-2xl font-bold text-gray-900">{contracts.length}</div>
          <div className="text-sm text-gray-500 mt-1">إجمالي العقود</div>
        </Card>
        <Card className="text-center p-6">
          <div className="text-2xl font-bold text-green-600">
            {contracts.filter(c => getDaysRemaining(c.endDate) > 30).length}
          </div>
          <div className="text-sm text-gray-500 mt-1">عقود نشطة</div>
        </Card>
        <Card className="text-center p-6">
          <div className="text-2xl font-bold text-yellow-600">
            {contracts.filter(c => getDaysRemaining(c.endDate) <= 30 && getDaysRemaining(c.endDate) > 0).length}
          </div>
          <div className="text-sm text-gray-500 mt-1">قريب الإنتهاء</div>
        </Card>
        <Card className="text-center p-6">
          <div className="text-2xl font-bold text-red-600">
            {contracts.filter(c => getDaysRemaining(c.endDate) <= 0).length}
          </div>
          <div className="text-sm text-gray-500 mt-1">منتهية</div>
        </Card>
      </div>

      {/* قائمة العقود */}
      {contracts.length === 0 ? (
        <EmptyState
          icon={<FileText className="w-12 h-12 text-gray-400" />}
          title="لا توجد عقود"
          description="لم يتم العثور على عقود تطابق معايير البحث"
          actionLabel="إنشاء عقد جديد"
          onAction={() => setShowCreateModal(true)}
        />
      ) : (
        <>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {contracts.map((contract) => (
              <Card key={contract.id} className="hover:shadow-lg transition-shadow">
                <div className="p-6">
                  {/* رأس البطاقة */}
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">
                        {contract.contractNumber}
                      </h3>
                      <p className="text-sm text-gray-500 mt-1">{contract.clientName}</p>
                    </div>
                    {getStatusBadge(contract.status, contract.endDate)}
                  </div>
                  
                  {/* معلومات العقد */}
                  <div className="space-y-3 mb-6">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">فترة العقد:</span>
                      <div className="flex items-center gap-2">
                        <Calendar size={14} className="text-gray-400" />
                        <span className="font-medium">
                          {formatArabicDate(contract.startDate)} - {formatArabicDate(contract.endDate)}
                        </span>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">نوع العقد:</span>
                      <span className="font-medium">{formatContractType(contract.contractType)}</span>
                    </div>
                    
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">مسؤول التواصل:</span>
                      <div className="flex items-center gap-2">
                        <User size={14} className="text-gray-400" />
                        <span className="font-medium">{contract.contactPerson}</span>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">المصاعد المشمولة:</span>
                      <span className="font-medium">{contract.elevatorsCount || 0} مصعد</span>
                    </div>
                    
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">المتبقي:</span>
                      <div className="flex items-center gap-2">
                        <Clock size={14} className="text-gray-400" />
                        <span className={`font-medium ${
                          getDaysRemaining(contract.endDate) <= 30 ? 'text-red-600' : 'text-green-600'
                        }`}>
                          {getDaysRemaining(contract.endDate)} يوم
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  {/* أزرار الإجراءات */}
                  <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        leftIcon={<Eye size={14} />}
                        onClick={() => handleViewDetails(contract)}
                      >
                        عرض
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        leftIcon={<Edit size={14} />}
                        onClick={() => window.location.href = `/contracts/${contract.id}/edit`}
                      >
                        تعديل
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        leftIcon={<Trash2 size={14} />}
                        onClick={() => {
                          setSelectedContract(contract);
                          setShowDeleteModal(true);
                        }}
                        className="text-red-600 border-red-200 hover:bg-red-50"
                      >
                        حذف
                      </Button>
                    </div>
                    
                    <span className="text-sm font-medium text-gray-900">
                      {contract.totalValue ? `${contract.totalValue} ج.م` : 'غير محدد'}
                    </span>
                  </div>
                </div>
              </Card>
            ))}
          </div>

          {/* الترقيم الصفحي */}
          {pagination.totalPages > 1 && (
            <Card className="p-6">
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
                      السابق
                    </Button>
                    
                    {[...Array(Math.min(5, pagination.totalPages))].map((_, i) => {
                      const pageNum = i + 1;
                      return (
                        <Button
                          key={pageNum}
                          variant={pagination.page === pageNum ? 'primary' : 'outline'}
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
                      التالي
                    </Button>
                  </div>
                </div>
              </div>
            </Card>
          )}
        </>
      )}

      {/* مودال تفاصيل العقد */}
      <Modal
        isOpen={showDetailsModal}
        onClose={() => {
          setShowDetailsModal(false);
          setContractDetails(null);
        }}
        title={`عقد ${selectedContract?.contractNumber}`}
        size="xl"
      >
        {loadingDetails ? (
          <div className="py-12">
            <Loading />
          </div>
        ) : contractDetails ? (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <div className="space-y-4">
                  <div>
                    <label className="text-sm text-gray-500">العميل</label>
                    <p className="font-medium text-lg">{contractDetails.clientName}</p>
                    <p className="text-sm text-gray-600 mt-1">{contractDetails.clientAddress}</p>
                  </div>
                  
                  <div>
                    <label className="text-sm text-gray-500">مسؤول التواصل</label>
                    <p className="font-medium">{contractDetails.contactPerson}</p>
                    <p className="text-sm text-gray-600">{contractDetails.contactPhone}</p>
                    <p className="text-sm text-gray-600">{contractDetails.contactEmail}</p>
                  </div>
                  
                  <div>
                    <label className="text-sm text-gray-500">نوع العقد</label>
                    <Badge variant="info" className="mt-1">
                      {formatContractType(contractDetails.contractType)}
                    </Badge>
                  </div>
                </div>
              </Card>
              
              <Card>
                <div className="space-y-4">
                  <div>
                    <label className="text-sm text-gray-500">فترة العقد</label>
                    <div className="flex items-center gap-4 mt-1">
                      <div>
                        <p className="font-medium">من</p>
                        <p className="text-gray-600">{formatArabicDate(contractDetails.startDate)}</p>
                      </div>
                      <ChevronLeft className="text-gray-400" />
                      <div>
                        <p className="font-medium">إلى</p>
                        <p className="text-gray-600">{formatArabicDate(contractDetails.endDate)}</p>
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <label className="text-sm text-gray-500">المتبقي</label>
                    <div className="flex items-center gap-2 mt-1">
                      <Clock size={16} className="text-gray-400" />
                      <span className={`text-lg font-bold ${
                        getDaysRemaining(contractDetails.endDate) <= 30 ? 'text-red-600' : 'text-green-600'
                      }`}>
                        {getDaysRemaining(contractDetails.endDate)} يوم
                      </span>
                    </div>
                  </div>
                  
                  <div>
                    <label className="text-sm text-gray-500">القيمة الإجمالية</label>
                    <p className="text-2xl font-bold text-gray-900 mt-1">
                      {contractDetails.totalValue ? `${contractDetails.totalValue} ج.م` : 'غير محدد'}
                    </p>
                  </div>
                </div>
              </Card>
            </div>
            
            {/* المصاعد المشمولة */}
            {contractDetails.elevators && contractDetails.elevators.length > 0 && (
              <Card title="المصاعد المشمولة">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-gray-200">
                        <th className="text-right py-3 px-4 text-sm font-medium text-gray-500">رقم المصعد</th>
                        <th className="text-right py-3 px-4 text-sm font-medium text-gray-500">الموقع</th>
                        <th className="text-right py-3 px-4 text-sm font-medium text-gray-500">النوع</th>
                        <th className="text-right py-3 px-4 text-sm font-medium text-gray-500">الحالة</th>
                      </tr>
                    </thead>
                    <tbody>
                      {contractDetails.elevators.map((elevator) => (
                        <tr key={elevator.id} className="border-b border-gray-100">
                          <td className="py-3 px-4">{elevator.serialNumber}</td>
                          <td className="py-3 px-4">{elevator.location}</td>
                          <td className="py-3 px-4">{elevator.type}</td>
                          <td className="py-3 px-4">
                            <Badge variant={
                              elevator.status === 'active' ? 'success' :
                              elevator.status === 'maintenance' ? 'warning' : 'danger'
                            }>
                              {elevator.status === 'active' ? 'نشط' :
                               elevator.status === 'maintenance' ? 'صيانة' : 'خارج الخدمة'}
                            </Badge>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </Card>
            )}
            
            {/* شروط العقد */}
            <Card title="شروط العقد">
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm text-gray-500">وقت الاستجابة</label>
                    <div className="flex items-center gap-2 mt-1">
                      <Clock size={16} className="text-gray-400" />
                      <span className="font-medium">{contractDetails.slaResponse || 24} ساعة</span>
                    </div>
                  </div>
                  
                  <div>
                    <label className="text-sm text-gray-500">وقت الإصلاح</label>
                    <div className="flex items-center gap-2 mt-1">
                      <Clock size={16} className="text-gray-400" />
                      <span className="font-medium">{contractDetails.slaResolution || 72} ساعة</span>
                    </div>
                  </div>
                </div>
                
                {contractDetails.terms && (
                  <div>
                    <label className="text-sm text-gray-500">شروط إضافية</label>
                    <p className="text-gray-700 mt-1 whitespace-pre-line">{contractDetails.terms}</p>
                  </div>
                )}
              </div>
            </Card>
            
            <div className="flex justify-end gap-3">
              <Button variant="outline" onClick={() => window.location.href = `/contracts/${contractDetails.id}/edit`}>
                تعديل العقد
              </Button>
              <Button onClick={() => window.open(`/contracts/${contractDetails.id}/documents`, '_blank')}>
                عرض المستندات
              </Button>
            </div>
          </div>
        ) : (
          <EmptyState
            title="لا توجد بيانات"
            description="فشل تحميل تفاصيل العقد"
          />
        )}
      </Modal>

      {/* مودال تأكيد الحذف */}
      <Modal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        title="تأكيد الحذف"
        size="sm"
      >
        <div className="text-center py-6">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Trash2 className="text-red-600" size={24} />
          </div>
          
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            هل أنت متأكد من حذف العقد؟
          </h3>
          
          <p className="text-gray-600 mb-6">
            العقد رقم: <span className="font-medium">{selectedContract?.contractNumber}</span>
            <br />
            لن تتمكن من استعادة هذه البيانات.
          </p>
          
          <div className="flex justify-center gap-3">
            <Button
              variant="outline"
              onClick={() => setShowDeleteModal(false)}
              disabled={deleting}
            >
              إلغاء
            </Button>
            <Button
              variant="danger"
              onClick={handleDeleteContract}
              loading={deleting}
              leftIcon={<Trash2 size={16} />}
            >
              نعم، احذف
            </Button>
          </div>
        </div>
      </Modal>

      {/* مودال إنشاء عقد جديد */}
      <Modal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        title="إنشاء عقد جديد"
        size="lg"
      >
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="رقم العقد"
              placeholder="CON-2024-XXX"
              required
            />
            
            <Input
              label="اسم العميل"
              placeholder="أدخل اسم العميل"
              required
            />
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="مسؤول التواصل"
              placeholder="أدخل اسم مسؤول التواصل"
              required
            />
            
            <Input
              label="البريد الإلكتروني"
              type="email"
              placeholder="email@example.com"
              required
            />
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="رقم الهاتف"
              placeholder="01XXXXXXXXX"
              required
            />
            
            <Select
              label="نوع العقد"
              options={[
                { value: 'full', label: 'صيانة كاملة' },
                { value: 'preventive', label: 'صيانة وقائية' },
                { value: 'ondemand', label: 'حسب الطلب' },
              ]}
              required
            />
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="تاريخ البدء"
              type="date"
              required
            />
            
            <Input
              label="تاريخ الانتهاء"
              type="date"
              required
            />
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="وقت الاستجابة (ساعة)"
              type="number"
              defaultValue="24"
            />
            
            <Input
              label="وقت الإصلاح (ساعة)"
              type="number"
              defaultValue="72"
            />
          </div>
          
          <Input
            label="القيمة الإجمالية"
            placeholder="أدخل قيمة العقد"
            type="number"
          />
          
          <div className="flex justify-end gap-3 pt-4">
            <Button variant="outline" onClick={() => setShowCreateModal(false)}>
              إلغاء
            </Button>
            <Button onClick={() => {
              // هنا سيتم إنشاء العقد
              showToast('تم إنشاء العقد بنجاح', 'success');
              setShowCreateModal(false);
              refetch();
            }}>
              حفظ العقد
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default Contracts;