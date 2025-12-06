import { useState, useEffect } from 'react';
import Button from '../ui/Button';
import Input from '../forms/Input';
import Select from '../forms/Select';
import { Search, Plus, Trash2, Check, X } from 'lucide-react';
import apiClient from '../../services/apiClient';

const AddContractForm = ({ onSubmit, isLoading, error, onCancel }) => {
  const [formData, setFormData] = useState({
    clientId: '',
    contractNumber: '',
    contractType: 'FULL_MAINTENANCE',
    startDate: '',
    endDate: '',
    slaResponseTimeHours: 24,
    slaResolutionTimeHours: '',
    isActive: true
  });

  const [clients, setClients] = useState([]);
  const [elevators, setElevators] = useState([]);
  const [availableElevators, setAvailableElevators] = useState([]);
  const [selectedElevators, setSelectedElevators] = useState([]);
  const [searchClient, setSearchClient] = useState('');
  const [searchElevator, setSearchElevator] = useState('');
  const [loadingClients, setLoadingClients] = useState(false);
  const [loadingElevators, setLoadingElevators] = useState(false);

  // Fetch clients on mount
  useEffect(() => {
    fetchClients();
  }, []);

  // Fetch elevators when client changes
  useEffect(() => {
    if (formData.clientId) {
      fetchElevatorsByClient(formData.clientId);
    } else {
      setAvailableElevators([]);
      setSelectedElevators([]);
    }
  }, [formData.clientId]);

  const fetchClients = async () => {
    try {
      setLoadingClients(true);
      const response = await apiClient.get('/clients');
      // إصلاح: جلب البيانات من المكان الصحيح
      const clientsData = response.data?.data || response.data || [];
      setClients(Array.isArray(clientsData) ? clientsData : []);
    } catch (err) {
      console.error('Error fetching clients:', err);
    } finally {
      setLoadingClients(false);
    }
  };

  const fetchElevatorsByClient = async (clientId) => {
    try {
      setLoadingElevators(true);
      const response = await apiClient.get(`elevators/clients/${clientId}/`);
      console.log('Elevators response:', response.data);
      
      // إصلاح: جلب المصاعد من الاستجابة الصحيحة
      const elevatorsData = response.data?.data?.elevators || response.data?.elevators || [];
      
      // تأكد من أن البيانات مصفوفة
      if (Array.isArray(elevatorsData)) {
        setElevators(elevatorsData);
        setAvailableElevators(elevatorsData);
      } else {
        console.error('Elevators data is not an array:', elevatorsData);
        setElevators([]);
        setAvailableElevators([]);
      }
    } catch (err) {
      console.error('Error fetching elevators:', err);
      setElevators([]);
      setAvailableElevators([]);
    } finally {
      setLoadingElevators(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleDateChange = (name, date) => {
    setFormData(prev => ({
      ...prev,
      [name]: date
    }));
  };

  const handleAddElevator = (elevator) => {
    if (!selectedElevators.find(e => e.id === elevator.id)) {
      setSelectedElevators(prev => [...prev, elevator]);
      setAvailableElevators(prev => prev.filter(e => e.id !== elevator.id));
      setSearchElevator('');
    }
  };

  const handleRemoveElevator = (elevator) => {
    setSelectedElevators(prev => prev.filter(e => e.id !== elevator.id));
    setAvailableElevators(prev => [...prev, elevator]);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (selectedElevators.length === 0) {
      alert('يجب اختيار مصعد واحد على الأقل');
      return;
    }

    onSubmit({
      ...formData,
      elevatorIds: selectedElevators.map(e => e.id),
      startDate: new Date(formData.startDate).toISOString(),
      endDate: new Date(formData.endDate).toISOString(),
      slaResolutionTimeHours: formData.slaResolutionTimeHours || null
    });
  };

  const filteredClients = clients.filter(client =>
    client.user?.fullName?.toLowerCase().includes(searchClient.toLowerCase()) ||
    client.user?.email?.toLowerCase().includes(searchClient.toLowerCase())
  );

  // تأكد من أن availableElevators مصفوفة قبل استخدام filter
  const filteredAvailableElevators = Array.isArray(availableElevators) 
    ? availableElevators.filter(elevator =>
        elevator.modelNumber?.toLowerCase().includes(searchElevator.toLowerCase()) ||
        elevator.serialNumber?.toLowerCase().includes(searchElevator.toLowerCase()) ||
        elevator.locationAddress?.toLowerCase().includes(searchElevator.toLowerCase())
      )
    : [];

  const calculateEndDate = (startDate, months = 12) => {
    if (!startDate) return '';
    const date = new Date(startDate);
    date.setMonth(date.getMonth() + months);
    return date.toISOString().split('T')[0];
  };

  const handleStartDateChange = (date) => {
    setFormData(prev => ({
      ...prev,
      startDate: date,
      endDate: calculateEndDate(date, 12)
    }));
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-red-600 text-sm">{error}</p>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* العميل */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            العميل *
          </label>
          <div className="relative">
            <Input
              placeholder="ابحث عن العميل..."
              value={searchClient}
              onChange={(e) => setSearchClient(e.target.value)}
              leftIcon={<Search size={16} />}
            />
            {loadingClients && (
              <div className="absolute right-3 top-3">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
              </div>
            )}
          </div>
          
          <div className="mt-2 max-h-60 overflow-y-auto border border-gray-200 rounded-lg">
            {filteredClients.length === 0 ? (
              <div className="p-4 text-center text-gray-500">
                {loadingClients ? 'جاري التحميل...' : 'لا توجد عملاء'}
              </div>
            ) : (
              <div className="divide-y divide-gray-100">
                {filteredClients.map(client => (
                  <div
                    key={client.id}
                    className={`p-3 cursor-pointer hover:bg-gray-50 ${
                      formData.clientId === client.id ? 'bg-blue-50 border-r-4 border-r-blue-500' : ''
                    }`}
                    onClick={() => {
                      setFormData(prev => ({ ...prev, clientId: client.id }));
                      setSearchClient(client.user?.fullName || '');
                    }}
                  >
                    <div className="font-medium text-gray-900">{client.user?.fullName}</div>
                    <div className="text-sm text-gray-500">{client.user?.email}</div>
                    <div className="text-xs text-gray-400">{client.user?.phoneNumber}</div>
                  </div>
                ))}
              </div>
            )}
          </div>
          
          {formData.clientId && (
            <div className="mt-2 p-3 bg-green-50 border border-green-200 rounded-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-green-800">
                    {clients.find(c => c.id === formData.clientId)?.user?.fullName}
                  </p>
                  <p className="text-xs text-green-600">
                    {clients.find(c => c.id === formData.clientId)?.user?.email}
                  </p>
                </div>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setFormData(prev => ({ ...prev, clientId: '' }));
                    setSelectedElevators([]);
                    setAvailableElevators([]);
                  }}
                >
                  <X size={14} />
                </Button>
              </div>
            </div>
          )}
        </div>

        {/* رقم العقد */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            رقم العقد *
          </label>
          <Input
            name="contractNumber"
            value={formData.contractNumber}
            onChange={handleInputChange}
            placeholder="مثال: CTR-2024-001"
            required
          />
          <p className="text-xs text-gray-500 mt-1">
            يجب أن يكون رقم العقد فريداً
          </p>
        </div>

        {/* نوع العقد */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            نوع العقد *
          </label>
          {/* إصلاح: أزل leftIcon من Select أو عدّل مكون Select */}
          <Select
            name="contractType"
            value={formData.contractType}
            onChange={handleInputChange}
            options={[
              { value: 'FULL_MAINTENANCE', label: 'صيانة كاملة' },
              { value: 'PREVENTIVE_ONLY', label: 'صيانة وقائية' },
              { value: 'ON_DEMAND', label: 'حسب الطلب' }
            ]}
            required
          />
        </div>

        {/* وقت الاستجابة SLA */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            وقت الاستجابة (ساعة) *
          </label>
          <Select
            name="slaResponseTimeHours"
            value={formData.slaResponseTimeHours}
            onChange={handleInputChange}
            options={[
              { value: 1, label: '1 ساعة' },
              { value: 2, label: '2 ساعة' },
              { value: 4, label: '4 ساعات' },
              { value: 8, label: '8 ساعات' },
              { value: 24, label: '24 ساعة' },
              { value: 48, label: '48 ساعة' }
            ]}
            required
          />
        </div>

        {/* تاريخ البدء */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            تاريخ البدء *
          </label>
          <Input
            type="date"
            name="startDate"
            value={formData.startDate}
            onChange={(e) => handleStartDateChange(e.target.value)}
            required
            min={new Date().toISOString().split('T')[0]}
          />
        </div>

        {/* تاريخ الإنتهاء */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            تاريخ الإنتهاء *
          </label>
          <Input
            type="date"
            name="endDate"
            value={formData.endDate}
            onChange={(e) => handleDateChange('endDate', e.target.value)}
            required
            min={formData.startDate}
          />
          <div className="flex gap-2 mt-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => {
                if (formData.startDate) {
                  const endDate = calculateEndDate(formData.startDate, 6);
                  setFormData(prev => ({ ...prev, endDate }));
                }
              }}
            >
              6 أشهر
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => {
                if (formData.startDate) {
                  const endDate = calculateEndDate(formData.startDate, 12);
                  setFormData(prev => ({ ...prev, endDate }));
                }
              }}
            >
              سنة
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => {
                if (formData.startDate) {
                  const endDate = calculateEndDate(formData.startDate, 24);
                  setFormData(prev => ({ ...prev, endDate }));
                }
              }}
            >
              سنتين
            </Button>
          </div>
        </div>

        {/* وقت الحل SLA */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            وقت الحل (ساعة)
          </label>
          <Select
            name="slaResolutionTimeHours"
            value={formData.slaResolutionTimeHours}
            onChange={handleInputChange}
            options={[
              { value: '', label: 'اختياري' },
              { value: 24, label: '24 ساعة' },
              { value: 48, label: '48 ساعة' },
              { value: 72, label: '72 ساعة' },
              { value: 168, label: 'أسبوع (168 ساعة)' }
            ]}
          />
        </div>
      </div>

      {/* اختيار المصاعد */}
      <div className="border-t pt-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-lg font-medium text-gray-900">اختيار المصاعد *</h3>
            <p className="text-sm text-gray-500">
              يجب اختيار مصعد واحد على الأقل
            </p>
          </div>
          <div className="text-sm text-gray-500">
            {selectedElevators.length} مصاعد مختارة
          </div>
        </div>

        {/* بحث المصاعد */}
        <div className="mb-4">
          <div className="relative">
            <Input
              placeholder="ابحث عن المصاعد..."
              value={searchElevator}
              onChange={(e) => setSearchElevator(e.target.value)}
              leftIcon={<Search size={16} />}
              disabled={!formData.clientId}
            />
            {loadingElevators && (
              <div className="absolute right-3 top-3">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
              </div>
            )}
          </div>
          {!formData.clientId && (
            <p className="text-sm text-red-500 mt-1">
              يجب اختيار عميل أولاً
            </p>
          )}
        </div>

        {/* المصاعد المتاحة */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div>
            <h4 className="text-sm font-medium text-gray-700 mb-3">المصاعد المتاحة</h4>
            <div className="border border-gray-200 rounded-lg max-h-64 overflow-y-auto">
              {filteredAvailableElevators.length === 0 ? (
                <div className="p-8 text-center text-gray-500">
                  {loadingElevators ? 'جاري تحميل المصاعد...' : 
                   formData.clientId ? 'لا توجد مصاعد متاحة' : 'اختر عميل أولاً'}
                </div>
              ) : (
                <div className="divide-y divide-gray-100">
                  {filteredAvailableElevators.map(elevator => (
                    <div
                      key={elevator.id}
                      className="p-4 hover:bg-gray-50 cursor-pointer"
                      onClick={() => handleAddElevator(elevator)}
                    >
                      <div className="flex items-start justify-between">
                        <div>
                          <div className="font-medium text-gray-900">
                            {elevator.modelNumber}
                          </div>
                          <div className="text-sm text-gray-500 mt-1">
                            {elevator.serialNumber}
                          </div>
                          <div className="text-xs text-gray-400 mt-1">
                            {elevator.locationAddress}
                          </div>
                          <div className="flex items-center gap-2 mt-2">
                            <span className={`px-2 py-1 text-xs rounded-full ${
                              elevator.status === 'ACTIVE' ? 'bg-green-100 text-green-800' :
                              elevator.status === 'MAINTENANCE_SCHEDULED' ? 'bg-yellow-100 text-yellow-800' :
                              'bg-red-100 text-red-800'
                            }`}>
                              {elevator.status === 'ACTIVE' ? 'نشط' :
                               elevator.status === 'MAINTENANCE_SCHEDULED' ? 'قيد الصيانة' :
                               'غير نشط'}
                            </span>
                          </div>
                        </div>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleAddElevator(elevator);
                          }}
                        >
                          <Plus size={14} />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* المصاعد المختارة */}
          <div>
            <h4 className="text-sm font-medium text-gray-700 mb-3">المصاعد المختارة</h4>
            <div className="border border-gray-200 rounded-lg max-h-64 overflow-y-auto">
              {selectedElevators.length === 0 ? (
                <div className="p-8 text-center text-gray-500">
                  لم يتم اختيار أي مصاعد
                </div>
              ) : (
                <div className="divide-y divide-gray-100">
                  {selectedElevators.map(elevator => (
                    <div key={elevator.id} className="p-4 hover:bg-gray-50">
                      <div className="flex items-start justify-between">
                        <div>
                          <div className="font-medium text-gray-900">
                            {elevator.modelNumber}
                          </div>
                          <div className="text-sm text-gray-500 mt-1">
                            {elevator.serialNumber}
                          </div>
                          <div className="text-xs text-gray-400 mt-1">
                            {elevator.locationAddress}
                          </div>
                        </div>
                        <Button
                          type="button"
                          variant="danger"
                          size="sm"
                          onClick={() => handleRemoveElevator(elevator)}
                        >
                          <Trash2 size={14} />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* تفاصيل المصاعد المختارة */}
        {selectedElevators.length > 0 && (
          <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">
                  {selectedElevators.length}
                </div>
                <div className="text-blue-800">عدد المصاعد</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">
                  {selectedElevators.filter(e => e.status === 'ACTIVE').length}
                </div>
                <div className="text-blue-800">نشط</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">
                  {selectedElevators.filter(e => e.status !== 'ACTIVE').length}
                </div>
                <div className="text-blue-800">قيد الصيانة</div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* الحالة */}
      <div className="flex items-center">
        <input
          type="checkbox"
          id="isActive"
          name="isActive"
          checked={formData.isActive}
          onChange={(e) => setFormData(prev => ({ ...prev, isActive: e.target.checked }))}
          className="h-4 w-4 text-blue-600 rounded border-gray-300"
        />
        <label htmlFor="isActive" className="mr-2 text-sm text-gray-700">
          تفعيل العقد تلقائياً
        </label>
      </div>

      {/* أزرار الإجراءات */}
      <div className="flex gap-3 justify-end pt-6 border-t border-gray-200">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          disabled={isLoading}
        >
          إلغاء
        </Button>
        <Button
          type="submit"
          variant="primary"
          disabled={isLoading || !formData.clientId || selectedElevators.length === 0}
          className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800"
        >
          {isLoading ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              جاري الإضافة...
            </>
          ) : (
            <>
              <Check size={18} className="mr-2" />
              إضافة العقد
            </>
          )}
        </Button>
      </div>

      {/* ملاحظات */}
      <div className="mt-4 p-4 bg-gray-50 border border-gray-200 rounded-lg">
        <h4 className="text-sm font-medium text-gray-700 mb-2">ملاحظات:</h4>
        <ul className="text-xs text-gray-600 space-y-1 list-disc pr-4">
          <li>جميع الحقول مع علامة (*) إلزامية</li>
          <li>يجب اختيار مصعد واحد على الأقل</li>
          <li>تاريخ الإنتهاء يجب أن يكون بعد تاريخ البدء</li>
          <li>يمكن تفعيل أو تعطيل العقد لاحقاً</li>
          <li>رقم العقد يجب أن يكون فريداً</li>
        </ul>
      </div>
    </form>
  );
};

export default AddContractForm;