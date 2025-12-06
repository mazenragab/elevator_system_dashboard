import { useState, useEffect } from 'react';
import Modal from '../ui/Modal';
import Button from '../ui/Button';
import Card from '../ui/Card';
import Badge from '../ui/Badge';
import { 
  Shield, 
  CheckCircle, 
  XCircle, 
  Clock, 
  Calendar,
  AlertTriangle,
  Info,
  MapPin,
  Package
} from 'lucide-react';

const CoverageCheck = ({ coverageInfo, onClose }) => {
  const [coverageData, setCoverageData] = useState(coverageInfo || {});

  useEffect(() => {
    setCoverageData(coverageInfo || {});
  }, [coverageInfo]);

  if (!coverageData) {
    return (
      <Modal isOpen={true} onClose={onClose} title="التحقق من التغطية">
        <div className="text-center py-12">
          <p className="text-gray-500">لا توجد بيانات للتغطية</p>
        </div>
      </Modal>
    );
  }

  const {
    covered = false,
    message = '',
    sla = {},
    contract = {},
    elevator = {}
  } = coverageData;

  const formatDate = (dateString) => {
    if (!dateString) return 'غير محدد';
    return new Date(dateString).toLocaleDateString('ar-SA', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const calculateDaysRemaining = (endDate) => {
    if (!endDate) return 0;
    const now = new Date();
    const end = new Date(endDate);
    const days = Math.ceil((end - now) / (1000 * 60 * 60 * 24));
    return days > 0 ? days : 0;
  };

  const daysRemaining = calculateDaysRemaining(contract.endDate);

  return (
    <Modal isOpen={true} onClose={onClose} title="التحقق من التغطية" size="lg">
      <div className="space-y-6">
        {/* نتيجة التحقق */}
        <Card className={`p-6 ${covered ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className={`p-3 rounded-full ${covered ? 'bg-green-100' : 'bg-red-100'}`}>
                {covered ? (
                  <CheckCircle className="text-green-600" size={24} />
                ) : (
                  <XCircle className="text-red-600" size={24} />
                )}
              </div>
              <div>
                <h3 className={`text-lg font-bold ${covered ? 'text-green-800' : 'text-red-800'}`}>
                  {covered ? 'المصعد مغطى' : 'المصعد غير مغطى'}
                </h3>
                <p className={`text-sm ${covered ? 'text-green-600' : 'text-red-600'}`}>
                  {message}
                </p>
              </div>
            </div>
            <Badge 
              variant={covered ? "success" : "danger"} 
              className="px-3 py-1 text-lg"
            >
              {covered ? 'مغطى ✓' : 'غير مغطى ✗'}
            </Badge>
          </div>
        </Card>

        {/* معلومات العقد */}
        <Card className="p-6 border border-blue-200">
          <div className="flex items-center gap-3 mb-4">
            <Shield className="text-blue-500" size={20} />
            <h4 className="font-medium text-gray-900">معلومات العقد</h4>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-500 mb-1">رقم العقد</label>
              <p className="font-medium">{contract.contractNumber || 'غير محدد'}</p>
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
              <label className="block text-sm font-medium text-gray-500 mb-1">فترة العقد</label>
              <div className="flex items-center gap-4">
                <div>
                  <p className="text-sm font-medium">من</p>
                  <p className="text-gray-600">{formatDate(contract.startDate)}</p>
                </div>
                <div>
                  <p className="text-sm font-medium">إلى</p>
                  <p className="text-gray-600">{formatDate(contract.endDate)}</p>
                </div>
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-500 mb-1">الحالة</label>
              <div className="flex items-center gap-2">
                {contract.isActive ? (
                  <>
                    <CheckCircle size={16} className="text-green-500" />
                    <span className="text-green-600 font-medium">نشط</span>
                  </>
                ) : (
                  <>
                    <XCircle size={16} className="text-red-500" />
                    <span className="text-red-600 font-medium">غير نشط</span>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* المتبقي من العقد */}
          {contract.endDate && (
            <div className="mt-4 p-3 bg-amber-50 border border-amber-200 rounded-lg">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Clock size={16} className="text-amber-500" />
                  <span className="text-sm font-medium text-amber-800">المتبقي</span>
                </div>
                <div className={`text-lg font-bold ${daysRemaining <= 30 ? 'text-red-600' : 'text-green-600'}`}>
                  {daysRemaining} يوم
                </div>
              </div>
              {daysRemaining <= 30 && daysRemaining > 0 && (
                <p className="text-xs text-amber-600 mt-1">
                  ⚠️ العقد سينتهي خلال {daysRemaining} يوم
                </p>
              )}
              {daysRemaining <= 0 && (
                <p className="text-xs text-red-600 mt-1">
                  ⚠️ العقد منتهي الصلاحية
                </p>
              )}
            </div>
          )}
        </Card>

        {/* معلومات المصعد */}
        <Card className="p-6 border border-gray-200">
          <div className="flex items-center gap-3 mb-4">
            <Package className="text-gray-500" size={20} />
            <h4 className="font-medium text-gray-900">معلومات المصعد</h4>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-500 mb-1">رقم الموديل</label>
              <p className="font-medium">{elevator.modelNumber || 'غير محدد'}</p>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-500 mb-1">الرقم التسلسلي</label>
              <p className="font-medium">{elevator.serialNumber || 'غير محدد'}</p>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-500 mb-1">العنوان</label>
              <div className="flex items-center gap-2">
                <MapPin size={14} className="text-gray-400" />
                <p className="text-gray-600">{elevator.locationAddress || 'غير محدد'}</p>
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-500 mb-1">الحالة</label>
              <Badge 
                variant={
                  elevator.status === 'ACTIVE' ? 'success' :
                  elevator.status === 'MAINTENANCE_SCHEDULED' ? 'warning' :
                  elevator.status === 'OUT_OF_SERVICE' ? 'danger' : 'gray'
                }
                className="mt-1"
              >
                {elevator.status === 'ACTIVE' ? 'نشط' :
                 elevator.status === 'MAINTENANCE_SCHEDULED' ? 'قيد الصيانة' :
                 elevator.status === 'OUT_OF_SERVICE' ? 'غير نشط' : elevator.status}
              </Badge>
            </div>
          </div>
        </Card>

        {/* معلومات SLA */}
        {covered && sla && (
          <Card className="p-6 border border-emerald-200">
            <div className="flex items-center gap-3 mb-4">
              <Clock className="text-emerald-500" size={20} />
              <h4 className="font-medium text-gray-900">ضمان مستوى الخدمة (SLA)</h4>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="text-center p-4 bg-emerald-50 rounded-lg">
                <div className="text-3xl font-bold text-emerald-600">
                  {sla.responseTimeHours || 'غير محدد'}
                </div>
                <div className="text-sm text-emerald-800 font-medium mt-1">ساعة للاستجابة</div>
                <p className="text-xs text-emerald-600 mt-2">
                  أقصى وقت للوصول للموقع
                </p>
              </div>
              
              {sla.resolutionTimeHours && (
                <div className="text-center p-4 bg-blue-50 rounded-lg">
                  <div className="text-3xl font-bold text-blue-600">
                    {sla.resolutionTimeHours}
                  </div>
                  <div className="text-sm text-blue-800 font-medium mt-1">ساعة للحل</div>
                  <p className="text-xs text-blue-600 mt-2">
                    أقصى وقت لإكمال الصيانة
                  </p>
                </div>
              )}
            </div>
            
            <div className="mt-4 p-3 bg-gray-50 border border-gray-200 rounded-lg">
              <div className="flex items-start gap-2">
                <Info size={16} className="text-gray-400 mt-0.5" />
                <div>
                  <p className="text-sm text-gray-600">
                    ضمان مستوى الخدمة يضمن لك سرعة الاستجابة والإصلاح حسب العقد الموقع
                  </p>
                </div>
              </div>
            </div>
          </Card>
        )}

        {/* تحذيرات وإرشادات */}
        <Card className="p-6 border border-yellow-200">
          <div className="flex items-center gap-3 mb-4">
            <AlertTriangle className="text-yellow-500" size={20} />
            <h4 className="font-medium text-gray-900">ملاحظات وإرشادات</h4>
          </div>
          
          <div className="space-y-3">
            {!covered ? (
              <>
                <div className="flex items-start gap-2">
                  <div className="w-2 h-2 bg-red-500 rounded-full mt-2"></div>
                  <p className="text-sm text-gray-600">
                    هذا المصعد غير مغطى بالعقد الحالي ولا يمكن تقديم خدمات صيانة له
                  </p>
                </div>
                <div className="flex items-start gap-2">
                  <div className="w-2 h-2 bg-red-500 rounded-full mt-2"></div>
                  <p className="text-sm text-gray-600">
                    يمكنك إضافة المصعد للعقد من صفحة تعديل العقد
                  </p>
                </div>
              </>
            ) : (
              <>
                <div className="flex items-start gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
                  <p className="text-sm text-gray-600">
                    المصعد مغطى بالعقد ويمكن تقديم خدمات الصيانة له
                  </p>
                </div>
                {daysRemaining <= 30 && (
                  <div className="flex items-start gap-2">
                    <div className="w-2 h-2 bg-amber-500 rounded-full mt-2"></div>
                    <p className="text-sm text-gray-600">
                      العقد سينتهي خلال {daysRemaining} يوم. يرجى تجديد العقد لاستمرار التغطية
                    </p>
                  </div>
                )}
              </>
            )}
            
            <div className="flex items-start gap-2">
              <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
              <p className="text-sm text-gray-600">
                للحصول على مساعدة فورية، اتصل بالدعم الفني على الرقم: 0123456789
              </p>
            </div>
          </div>
        </Card>

        {/* أزرار الإجراءات */}
        <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
          <Button variant="outline" onClick={onClose}>
            إغلاق
          </Button>
          {!covered && (
            <Button variant="primary" onClick={() => window.location.href = `/contracts/${contract.id}/edit`}>
              إضافة المصعد للعقد
            </Button>
          )}
        </div>
      </div>
    </Modal>
  );
};

export default CoverageCheck;