import { useState, useEffect } from 'react';
import {
  X,
  AlertCircle,
  Info,
  Calendar,
  Clock,
  MapPin,
  Building,
  User,
  Wrench
} from 'lucide-react';
import Modal from '../../components/ui/Modal';
import Input from '../../components/forms/Input';
import Select from '../../components/forms/Select';
import Button from '../../components/ui/Button';
import Loading from '../../components/ui/Loading';
import { clientService } from '../../services/clientService';
import { elevatorService } from '../../services/elevatorService';
import { contractService } from '../../services/contractService';

const AddMaintenanceRequestModal = ({
  isOpen,
  onClose,
  onSubmit,
  isLoading,
  error
}) => {
  const [formData, setFormData] = useState({
    clientId: '',
    elevatorId: '',
    contractId: '',
    priority: 'NORMAL',
    requestType: 'REGULAR',
    description: '',
    accessDetails: '',
    locationLat: '',
    locationLng: '',
    scheduledDate: '',
  });

  const [clients, setClients] = useState([]);
  const [elevators, setElevators] = useState([]);
  const [contracts, setContracts] = useState([]);
  const [loadingClients, setLoadingClients] = useState(false);
  const [loadingElevators, setLoadingElevators] = useState(false);
  const [loadingContracts, setLoadingContracts] = useState(false);
  const [selectedClient, setSelectedClient] = useState(null);

  // جلب العملاء
  useEffect(() => {
    const fetchClients = async () => {
      try {
        setLoadingClients(true);
        const response = await clientService.getAllClients();
        if (response.data) {
          setClients(response.data || []);
        }
      } catch (err) {
        console.error('Error fetching clients:', err);
      } finally {
        setLoadingClients(false);
      }
    };

    if (isOpen) {
      fetchClients();
    }
  }, [isOpen]);

  // جلب المصاعد عند اختيار عميل
  useEffect(() => {
    const fetchElevators = async () => {
      if (!formData.clientId) {
        setElevators([]);
        return;
      }

      try {
        setLoadingElevators(true);
        const response = await elevatorService.getClientElevators(formData.clientId);
        if (response.data?.success) {
          setElevators(response.data.data?.elevators || []);
          
          // البحث عن العميل المحدد
          const client = clients.find(c => c.id === parseInt(formData.clientId));
          setSelectedClient(client);
        }
      } catch (err) {
        console.error('Error fetching elevators:', err);
        setElevators([]);
      } finally {
        setLoadingElevators(false);
      }
    };

    fetchElevators();
  }, [formData.clientId, clients]);

  // جلب العقود عند اختيار عميل
  useEffect(() => {
    const fetchContracts = async () => {
      if (!formData.clientId) {
        setContracts([]);
        return;
      }

      try {
        setLoadingContracts(true);
        const response = await contractService.getClientContracts(formData.clientId);
        if (response.data?.success) {
          setContracts(response.data.data?.contracts || []);
        }
      } catch (err) {
        console.error('Error fetching contracts:', err);
        setContracts([]);
      } finally {
        setLoadingContracts(false);
      }
    };

    fetchContracts();
  }, [formData.clientId]);

  // تحديث الإحداثيات عند اختيار المصعد
  useEffect(() => {
    if (formData.elevatorId) {
      const selectedElevator = elevators.find(e => e.id === parseInt(formData.elevatorId));
      if (selectedElevator) {
        setFormData(prev => ({
          ...prev,
          locationLat: selectedElevator.locationLat || '',
          locationLng: selectedElevator.locationLng || '',
        }));
      }
    }
  }, [formData.elevatorId, elevators]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // التحقق من البيانات المطلوبة
    if (!formData.clientId || !formData.elevatorId || !formData.priority || !formData.requestType) {
      alert('يرجى ملء جميع الحقول المطلوبة');
      return;
    }

    onSubmit(formData);
  };

  const handleClose = () => {
    // إعادة تعيين النموذج
    setFormData({
      clientId: '',
      elevatorId: '',
      contractId: '',
      priority: 'NORMAL',
      requestType: 'REGULAR',
      description: '',
      accessDetails: '',
      locationLat: '',
      locationLng: '',
      scheduledDate: '',
    });
    setSelectedClient(null);
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="إنشاء طلب صيانة جديد"
      size="lg"
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-center gap-2">
            <AlertCircle size={18} />
            <span>{error}</span>
          </div>
        )}

        {/* معلومات العميل */}
        <div className="space-y-4">
          <h4 className="font-bold text-gray-900 flex items-center gap-2">
            <User size={18} />
            معلومات العميل
          </h4>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Select
              label="العميل *"
              name="clientId"
              value={formData.clientId}
              onChange={handleChange}
              options={[
                { value: '', label: 'اختر العميل' },
                ...clients.map(client => ({
                  value: client.id,
                  label: `${client.user?.fullName} - ${client.user?.phoneNumber}`
                }))
              ]}
              required
              disabled={loadingClients}
              leftIcon={loadingClients ? <Loading size={16} /> : <User size={16} />}
            />
            
            {selectedClient && (
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-sm text-gray-500">معلومات العميل المختار</p>
                <p className="font-medium">{selectedClient.user?.fullName}</p>
                <p className="text-sm text-gray-600">{selectedClient.user?.email}</p>
                <p className="text-sm text-gray-600">{selectedClient.user?.phoneNumber}</p>
              </div>
            )}
          </div>
        </div>

        {/* معلومات المصعد */}
        <div className="space-y-4">
          <h4 className="font-bold text-gray-900 flex items-center gap-2">
            <Building size={18} />
            معلومات المصعد
          </h4>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Select
              label="المصعد *"
              name="elevatorId"
              value={formData.elevatorId}
              onChange={handleChange}
              options={[
                { value: '', label: 'اختر المصعد' },
                ...elevators.map(elevator => ({
                  value: elevator.id,
                  label: `${elevator.modelNumber} - ${elevator.serialNumber}`
                }))
              ]}
              required
              disabled={loadingElevators || !formData.clientId}
              leftIcon={loadingElevators ? <Loading size={16} /> : <Building size={16} />}
            />
            
            {formData.elevatorId && (
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-sm text-gray-500">موقع المصعد</p>
                <div className="flex items-center gap-2">
                  <MapPin size={14} className="text-gray-400" />
                  <span className="text-sm">
                    {elevators.find(e => e.id === parseInt(formData.elevatorId))?.locationAddress || 'لا يوجد عنوان'}
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* معلومات العقد */}
        <div className="space-y-4">
          <h4 className="font-bold text-gray-900 flex items-center gap-2">
            <FileText size={18} />
            معلومات العقد
          </h4>
          
          <Select
            label="العقد (اختياري)"
            name="contractId"
            value={formData.contractId}
            onChange={handleChange}
            options={[
              { value: '', label: 'اختر العقد' },
              ...contracts.map(contract => ({
                value: contract.id,
                label: `${contract.contractNumber} - ${contract.contractType}`
              }))
            ]}
            disabled={loadingContracts || !formData.clientId}
            leftIcon={loadingContracts ? <Loading size={16} /> : <FileText size={16} />}
            helperText="اختياري - سيتم ربط الطلب بالعقد المحدد"
          />
        </div>

        {/* نوع الطلب والأولوية */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Select
            label="نوع الطلب *"
            name="requestType"
            value={formData.requestType}
            onChange={handleChange}
            options={[
              { value: 'EMERGENCY', label: 'طارئ' },
              { value: 'REGULAR', label: 'عادي' }
            ]}
            required
          />
          
          <Select
            label="الأولوية *"
            name="priority"
            value={formData.priority}
            onChange={handleChange}
            options={[
              { value: 'EMERGENCY', label: 'طارئ' },
              { value: 'URGENT', label: 'عاجل' },
              { value: 'NORMAL', label: 'عادي' }
            ]}
            required
          />
        </div>

        {/* الوصف */}
        <div className="space-y-4">
          <h4 className="font-bold text-gray-900 flex items-center gap-2">
            <Wrench size={18} />
            وصف المشكلة
          </h4>
          
          <Input
            label="وصف المشكلة *"
            name="description"
            value={formData.description}
            onChange={handleChange}
            type="textarea"
            rows={4}
            placeholder="صف المشكلة بالتفصيل..."
            required
          />
          
          <Input
            label="تفاصيل الوصول (اختياري)"
            name="accessDetails"
            value={formData.accessDetails}
            onChange={handleChange}
            type="textarea"
            rows={3}
            placeholder="تفاصيل الوصول للموقع، كلمات السر، أرقام الاتصال..."
            helperText="معلومات إضافية لمساعدة الفني في الوصول للموقع"
          />
        </div>

        {/* الموقع */}
        <div className="space-y-4">
          <h4 className="font-bold text-gray-900 flex items-center gap-2">
            <MapPin size={18} />
            الموقع
          </h4>
          
          <div className="bg-blue-50 border border-blue-200 p-4 rounded-lg">
            <div className="flex items-start gap-2">
              <Info size={18} className="text-blue-600 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-blue-700">
                سيتم استخدام إحداثيات الموقع من بيانات المصعد تلقائياً. يمكنك تعديلها إذا لزم الأمر.
              </p>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="خط العرض"
              name="locationLat"
              value={formData.locationLat}
              onChange={handleChange}
              placeholder="مثال: 31.2001"
              leftIcon={<MapPin size={16} />}
            />
            
            <Input
              label="خط الطول"
              name="locationLng"
              value={formData.locationLng}
              onChange={handleChange}
              placeholder="مثال: 29.9187"
              leftIcon={<MapPin size={16} />}
            />
          </div>
        </div>

        {/* التاريخ المقرر */}
        <div className="space-y-4">
          <h4 className="font-bold text-gray-900 flex items-center gap-2">
            <Calendar size={18} />
            التاريخ المقرر
          </h4>
          
          <Input
            label="التاريخ المقرر (اختياري)"
            name="scheduledDate"
            type="datetime-local"
            value={formData.scheduledDate}
            onChange={handleChange}
            leftIcon={<Calendar size={16} />}
            helperText="اتركه فارغاً إذا كان الطلب فورياً"
          />
        </div>

        {/* رسالة تحذير */}
        <div className="bg-amber-50 border border-amber-200 p-4 rounded-lg">
          <div className="flex items-start gap-2">
            <AlertCircle size={18} className="text-amber-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-medium text-amber-800">ملاحظة مهمة</p>
              <ul className="text-sm text-amber-700 mt-1 space-y-1">
                <li>• سيتم إنشاء رقم مرجعي فريد للطلب تلقائياً</li>
                <li>• سيتم تعيين حالة الطلب كـ "معلق" تلقائياً</li>
                <li>• يمكنك تعيين فني للطلب لاحقاً من خلال قائمة الطلبات</li>
                <li>• سيتم إشعار العميل بإنشاء الطلب الجديد</li>
              </ul>
            </div>
          </div>
        </div>

        {/* أزرار الإجراءات */}
        <div className="flex gap-3 justify-end pt-6 border-t border-gray-200">
          <Button
            type="button"
            variant="outline"
            onClick={handleClose}
            disabled={isLoading}
          >
            إلغاء
          </Button>
          <Button
            type="submit"
            variant="primary"
            disabled={isLoading}
            className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800"
          >
            {isLoading ? (
              <>
                <span className="animate-spin mr-2">⟳</span>
                جاري الإنشاء...
              </>
            ) : (
              'إنشاء الطلب'
            )}
          </Button>
        </div>
      </form>
    </Modal>
  );
};

// رمز أيقونة FileText إذا لم تكن موجودة
const FileText = ({ size, className }) => (
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    width={size} 
    height={size} 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="2" 
    strokeLinecap="round" 
    strokeLinejoin="round" 
    className={className}
  >
    <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" />
    <polyline points="14 2 14 8 20 8" />
    <line x1="16" y1="13" x2="8" y2="13" />
    <line x1="16" y1="17" x2="8" y2="17" />
    <line x1="10" y1="9" x2="8" y2="9" />
  </svg>
);

export default AddMaintenanceRequestModal;