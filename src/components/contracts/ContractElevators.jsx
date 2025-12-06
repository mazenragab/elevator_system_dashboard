import { useState, useEffect } from 'react';
import Modal from '../ui/Modal';
import Button from '../ui/Button';
import Card from '../ui/Card';
import Badge from '../ui/Badge';
import Loading from '../ui/Loading';
import { 
  Home, 
  MapPin, 
  Wrench, 
  Calendar,
  AlertTriangle,
  Package,
  TrendingUp,
  Clock,
  CheckCircle,
  XCircle
} from 'lucide-react';
import apiClient from '../../services/apiClient';

const ContractElevators = ({ contract, elevators: initialElevators, onClose }) => {
  const [elevators, setElevators] = useState(initialElevators || []);
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    maintenance: 0,
    outOfService: 0,
    totalRequests: 0,
    avgRequestsPerElevator: 0
  });

  const [selectedElevator, setSelectedElevator] = useState(null);
  const [maintenanceHistory, setMaintenanceHistory] = useState([]);
  const [loadingHistory, setLoadingHistory] = useState(false);

  // Load elevator details and statistics
  useEffect(() => {
    if (initialElevators && initialElevators.length > 0) {
      setElevators(initialElevators);
      
      // Calculate statistics
      const total = initialElevators.length;
      const active = initialElevators.filter(e => 
        e.elevator?.status === 'ACTIVE' || e.status === 'ACTIVE'
      ).length;
      const maintenance = initialElevators.filter(e => 
        e.elevator?.status === 'MAINTENANCE_SCHEDULED' || e.status === 'MAINTENANCE_SCHEDULED'
      ).length;
      const outOfService = initialElevators.filter(e => 
        e.elevator?.status === 'OUT_OF_SERVICE' || e.status === 'OUT_OF_SERVICE'
      ).length;
      
      const totalRequests = initialElevators.reduce((sum, e) => 
        sum + (e.elevator?._count?.maintenanceRequests || e._count?.maintenanceRequests || 0), 0
      );

      setStats({
        total,
        active,
        maintenance,
        outOfService,
        totalRequests,
        avgRequestsPerElevator: total > 0 ? (totalRequests / total).toFixed(1) : 0
      });
    }
  }, [initialElevators]);

  const handleViewElevatorDetails = async (elevator) => {
    setSelectedElevator(elevator);
    setLoadingHistory(true);
    
    try {
      // Fetch maintenance history for this elevator
      const response = await apiClient.get(`/elevators/${elevator.elevatorId || elevator.id}/maintenance-requests`);
      setMaintenanceHistory(response.data || response.data || []);
    } catch (err) {
      console.error('Error fetching maintenance history:', err);
    } finally {
      setLoadingHistory(false);
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'ACTIVE':
        return <Badge variant="success" className="px-2 py-1 text-xs">نشط</Badge>;
      case 'MAINTENANCE_SCHEDULED':
        return <Badge variant="warning" className="px-2 py-1 text-xs">قيد الصيانة</Badge>;
      case 'OUT_OF_SERVICE':
        return <Badge variant="danger" className="px-2 py-1 text-xs">غير نشط</Badge>;
      default:
        return <Badge variant="gray" className="px-2 py-1 text-xs">غير معروف</Badge>;
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'غير محدد';
    return new Date(dateString).toLocaleDateString('ar-SA');
  };

  const getElevatorStatus = (elevator) => {
    return elevator.elevator?.status || elevator.status || 'UNKNOWN';
  };

  if (loading && elevators.length === 0) {
    return (
      <Modal isOpen={true} onClose={onClose} title="مصاعد العقد" size="lg">
        <div className="flex items-center justify-center py-12">
          <Loading size="lg" />
        </div>
      </Modal>
    );
  }

  return (
    <Modal isOpen={true} onClose={onClose} title="مصاعد العقد" size="xl">
      <div className="space-y-6">
        {/* معلومات العقد */}
        <Card className="p-6 bg-gradient-to-r from-blue-50 to-blue-100 border border-blue-200">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-bold text-xl text-gray-900">عقد #{contract.contractNumber}</h3>
              <p className="text-blue-600">
                {contract.client?.user?.fullName || 'غير محدد'}
              </p>
            </div>
            <div className="text-right">
              <div className="text-3xl font-bold text-blue-600">{stats.total}</div>
              <div className="text-blue-800">مصعد</div>
            </div>
          </div>
        </Card>

        {/* إحصائيات المصاعد */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card className="p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-3xl font-bold text-emerald-600">{stats.active}</p>
                <p className="text-sm text-emerald-600 font-medium mt-1">نشط</p>
              </div>
              <div className="p-3 bg-emerald-100 rounded-xl">
                <CheckCircle className="text-emerald-600" size={24} />
              </div>
            </div>
          </Card>
          
          <Card className="p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-3xl font-bold text-amber-600">{stats.maintenance}</p>
                <p className="text-sm text-amber-600 font-medium mt-1">قيد الصيانة</p>
              </div>
              <div className="p-3 bg-amber-100 rounded-xl">
                <Wrench className="text-amber-600" size={24} />
              </div>
            </div>
          </Card>
          
          <Card className="p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-3xl font-bold text-rose-600">{stats.outOfService}</p>
                <p className="text-sm text-rose-600 font-medium mt-1">غير نشط</p>
              </div>
              <div className="p-3 bg-rose-100 rounded-xl">
                <XCircle className="text-rose-600" size={24} />
              </div>
            </div>
          </Card>
          
          <Card className="p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-3xl font-bold text-purple-600">{stats.totalRequests}</p>
                <p className="text-sm text-purple-600 font-medium mt-1">طلبات الصيانة</p>
              </div>
              <div className="p-3 bg-purple-100 rounded-xl">
                <Package className="text-purple-600" size={24} />
              </div>
            </div>
          </Card>
        </div>

        {/* قائمة المصاعد */}
        {elevators.length === 0 ? (
          <Card className="p-12 text-center">
            <Home className="mx-auto text-gray-300" size={48} />
            <p className="text-gray-500 mt-4">لا توجد مصاعد مرتبطة بهذا العقد</p>
            <p className="text-sm text-gray-400 mt-1">يجب إضافة مصاعد للعقد أولاً</p>
          </Card>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {elevators.map((item, index) => {
              const elevator = item.elevator || item;
              const requestsCount = elevator._count?.maintenanceRequests || item._count?.maintenanceRequests || 0;
              const lastMaintenance = elevator.lastMaintenanceDate || item.lastMaintenanceDate;
              
              return (
                <Card key={elevator.id || index} className="hover:shadow-lg transition-shadow">
                  <div className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h4 className="font-bold text-lg text-gray-900">
                          {elevator.modelNumber || 'موديل غير محدد'}
                        </h4>
                        <p className="text-sm text-gray-500">
                          {elevator.serialNumber || 'رقم مسلسل غير محدد'}
                        </p>
                      </div>
                      {getStatusBadge(getElevatorStatus(elevator))}
                    </div>

                    <div className="space-y-3">
                      <div className="flex items-center gap-2 text-sm">
                        <MapPin size={16} className="text-gray-400" />
                        <span className="text-gray-600">{elevator.locationAddress || 'عنوان غير محدد'}</span>
                      </div>

                      <div className="flex items-center gap-2 text-sm">
                        <Package size={16} className="text-gray-400" />
                        <span className="text-gray-600">{requestsCount} طلبات صيانة</span>
                      </div>

                      {lastMaintenance && (
                        <div className="flex items-center gap-2 text-sm">
                          <Calendar size={16} className="text-gray-400" />
                          <span className="text-gray-600">
                            آخر صيانة: {formatDate(lastMaintenance)}
                          </span>
                        </div>
                      )}

                      {elevator.locationLat && elevator.locationLng && (
                        <div className="flex items-center gap-2 text-sm">
                          <MapPin size={16} className="text-gray-400" />
                          <span className="text-gray-600">
                            الإحداثيات: {elevator.locationLat}, {elevator.locationLng}
                          </span>
                        </div>
                      )}
                    </div>

                    <div className="mt-6 flex gap-2">
                      <Button
                        variant="outline"
                        className="flex-1"
                        onClick={() => handleViewElevatorDetails(item)}
                      >
                        التفاصيل
                      </Button>

                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        )}

        {/* تفاصيل المصعد المحدد */}
        {selectedElevator && (
          <Modal
            isOpen={!!selectedElevator}
            onClose={() => {
              setSelectedElevator(null);
              setMaintenanceHistory([]);
            }}
            title="تفاصيل المصعد"
            size="lg"
          >
            <div className="space-y-6">
              {loadingHistory ? (
                <div className="flex items-center justify-center py-12">
                  <Loading size="md" />
                </div>
              ) : (
                <>
                  <Card>
                    <div className="p-6">
                      <div className="flex items-center justify-between mb-6">
                        <div>
                          <h4 className="font-bold text-xl text-gray-900">
                            {selectedElevator.elevator?.modelNumber || selectedElevator.modelNumber}
                          </h4>
                          <p className="text-gray-500">
                            {selectedElevator.elevator?.serialNumber || selectedElevator.serialNumber}
                          </p>
                        </div>
                        {getStatusBadge(getElevatorStatus(selectedElevator.elevator || selectedElevator))}
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-500 mb-1">العنوان</label>
                            <p className="font-medium">
                              {selectedElevator.elevator?.locationAddress || selectedElevator.locationAddress}
                            </p>
                          </div>
                          
                          <div>
                            <label className="block text-sm font-medium text-gray-500 mb-1">الإحداثيات</label>
                            <div className="flex gap-2">
                              <span className="text-sm bg-gray-100 px-2 py-1 rounded">
                                {selectedElevator.elevator?.locationLat || selectedElevator.locationLat}
                              </span>
                              <span className="text-sm bg-gray-100 px-2 py-1 rounded">
                                {selectedElevator.elevator?.locationLng || selectedElevator.locationLng}
                              </span>
                            </div>
                          </div>
                        </div>
                        
                        <div className="space-y-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-500 mb-1">آخر صيانة</label>
                            <p className="font-medium">
                              {formatDate(selectedElevator.elevator?.lastMaintenanceDate || selectedElevator.lastMaintenanceDate) || 'غير محدد'}
                            </p>
                          </div>
                          
                          <div>
                            <label className="block text-sm font-medium text-gray-500 mb-1">تاريخ الإضافة للعقد</label>
                            <p className="font-medium">
                              {formatDate(selectedElevator.createdAt)}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </Card>

                  {/* سجل الصيانة */}
                  {maintenanceHistory.length > 0 && (
                    <Card>
                      <div className="p-6">
                        <h4 className="font-bold text-lg text-gray-900 mb-4">سجل الصيانة</h4>
                        <div className="overflow-x-auto">
                          <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                              <tr>
                                <th className="px-4 py-2 text-right text-xs font-medium text-gray-500">رقم الطلب</th>
                                <th className="px-4 py-2 text-right text-xs font-medium text-gray-500">النوع</th>
                                <th className="px-4 py-2 text-right text-xs font-medium text-gray-500">الحالة</th>
                                <th className="px-4 py-2 text-right text-xs font-medium text-gray-500">التاريخ</th>
                              </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                              {maintenanceHistory.slice(0, 5).map((request) => (
                                <tr key={request.id}>
                                  <td className="px-4 py-2 text-sm text-gray-900">
                                    {request.referenceNumber}
                                  </td>
                                  <td className="px-4 py-2">
                                    <span className={`px-2 py-1 text-xs rounded-full ${
                                      request.priority === 'EMERGENCY' ? 'bg-red-100 text-red-800' :
                                      request.priority === 'URGENT' ? 'bg-orange-100 text-orange-800' :
                                      'bg-blue-100 text-blue-800'
                                    }`}>
                                      {request.priority === 'EMERGENCY' ? 'طارئ' :
                                       request.priority === 'URGENT' ? 'عاجل' : 'عادي'}
                                    </span>
                                  </td>
                                  <td className="px-4 py-2">
                                    <span className={`px-2 py-1 text-xs rounded-full ${
                                      request.status === 'COMPLETED' ? 'bg-green-100 text-green-800' :
                                      request.status === 'IN_PROGRESS' ? 'bg-yellow-100 text-yellow-800' :
                                      'bg-gray-100 text-gray-800'
                                    }`}>
                                      {request.status === 'COMPLETED' ? 'مكتمل' :
                                       request.status === 'IN_PROGRESS' ? 'قيد التنفيذ' :
                                       request.status}
                                    </span>
                                  </td>
                                  <td className="px-4 py-2 text-sm text-gray-500">
                                    {formatDate(request.createdAt)}
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                        {maintenanceHistory.length > 5 && (
                          <p className="text-sm text-gray-500 text-center mt-4">
                            عرض 5 من {maintenanceHistory.length} طلب
                          </p>
                        )}
                      </div>
                    </Card>
                  )}
                </>
              )}

              <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
                <Button variant="outline" onClick={() => setSelectedElevator(null)}>
                  إغلاق
                </Button>
              </div>
            </div>
          </Modal>
        )}

        {/* ملاحظات */}
        <Card className="p-6 bg-yellow-50 border border-yellow-200">
          <div className="flex items-start gap-3">
            <AlertTriangle className="text-yellow-500 mt-1" size={20} />
            <div>
              <h4 className="text-sm font-medium text-yellow-800">ملاحظات هامة</h4>
              <ul className="text-xs text-yellow-600 mt-2 space-y-1 list-disc pr-4">
                <li>تغطية المصعد تعتمد على صلاحية العقد</li>
                <li>يمكن إضافة أو إزالة مصاعد من صفحة تعديل العقد</li>
                <li>المصاعد غير النشطة لا يمكنها طلب صيانة</li>
                <li>يجب تجديد العقد قبل انتهاء صلاحيته لاستمرار التغطية</li>
              </ul>
            </div>
          </div>
        </Card>

        {/* أزرار الإجراءات */}
        <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
          <Button variant="outline" onClick={onClose}>
            إغلاق
          </Button>
        </div>
      </div>
    </Modal>
  );
};

export default ContractElevators;