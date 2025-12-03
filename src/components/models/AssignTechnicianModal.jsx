import { useState, useEffect } from 'react';
import {
  MapPin,
  Navigation,
  User,
  Clock,
  AlertCircle,
  Users
} from 'lucide-react';
import Modal from '../../components/ui/Modal';
import Select from '../../components/forms/Select';
import Button from '../../components/ui/Button';
import Loading from '../../components/ui/Loading';
import { technicianService } from '../../services/technicianService';
import { getDistanceFromLatLonInKm } from '../../utils/location';

const AssignTechnicianModal = ({
  isOpen,
  onClose,
  onSubmit,
  request
}) => {
  const [technicians, setTechnicians] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedTechnicianId, setSelectedTechnicianId] = useState('');
  const [selectedTechnician, setSelectedTechnician] = useState(null);
  const [distance, setDistance] = useState(null);

  // جلب الفنيين المتاحين
  useEffect(() => {
    const fetchAvailableTechnicians = async () => {
      if (!isOpen || !request) return;

      try {
        setLoading(true);
        const response = await technicianService.getAvailableTechnicians();
        if (response.data) {
          const availableTechs = response.data || [];
          
          // حساب المسافة لكل فني
          const techsWithDistance = availableTechs.map(tech => {
            let dist = null;
            if (request.locationLat && request.locationLng && 
                tech.currentLocationLat && tech.currentLocationLng) {
              dist = getDistanceFromLatLonInKm(
                parseFloat(request.locationLat),
                parseFloat(request.locationLng),
                parseFloat(tech.currentLocationLat),
                parseFloat(tech.currentLocationLng)
              );
            }
            return { ...tech, distance: dist };
          });

          // ترتيب حسب المسافة
          techsWithDistance.sort((a, b) => {
            if (a.distance === null && b.distance === null) return 0;
            if (a.distance === null) return 1;
            if (b.distance === null) return -1;
            return a.distance - b.distance;
          });

          setTechnicians(techsWithDistance);
        }
      } catch (err) {
        console.error('Error fetching technicians:', err);
        setTechnicians([]);
      } finally {
        setLoading(false);
      }
    };

    fetchAvailableTechnicians();
  }, [isOpen, request]);

  // تحديث الفني المختار
  useEffect(() => {
    if (selectedTechnicianId) {
      const tech = technicians.find(t => t.id === parseInt(selectedTechnicianId));
      setSelectedTechnician(tech);
      
      // حساب المسافة
      if (tech && request?.locationLat && request?.locationLng && 
          tech.currentLocationLat && tech.currentLocationLng) {
        const dist = getDistanceFromLatLonInKm(
          parseFloat(request.locationLat),
          parseFloat(request.locationLng),
          parseFloat(tech.currentLocationLat),
          parseFloat(tech.currentLocationLng)
        );
        setDistance(dist);
      } else {
        setDistance(null);
      }
    } else {
      setSelectedTechnician(null);
      setDistance(null);
    }
  }, [selectedTechnicianId, technicians, request]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!selectedTechnicianId) {
      alert('يرجى اختيار فني');
      return;
    }
    onSubmit(selectedTechnicianId);
  };

  const handleClose = () => {
    setSelectedTechnicianId('');
    setSelectedTechnician(null);
    setDistance(null);
    onClose();
  };

  if (!request) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="تعيين فني للطلب"
      size="lg"
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* معلومات الطلب */}
        <div className="bg-blue-50 border border-blue-200 p-4 rounded-lg">
          <h4 className="font-bold text-blue-800 mb-2">معلومات الطلب</h4>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-blue-600">رقم المرجع</p>
              <p className="font-medium">{request.referenceNumber}</p>
            </div>
            <div>
              <p className="text-sm text-blue-600">الموقع</p>
              <p className="text-sm truncate">{request.elevator?.locationAddress}</p>
            </div>
          </div>
        </div>

        {/* اختيار الفني */}
        <div className="space-y-4">
          <h4 className="font-bold text-gray-900">اختر الفني</h4>
          
          {loading ? (
            <div className="flex justify-center py-8">
              <Loading size="md" />
            </div>
          ) : technicians.length === 0 ? (
            <div className="bg-amber-50 border border-amber-200 p-6 rounded-lg text-center">
              <Users className="w-12 h-12 text-amber-400 mx-auto mb-3" />
              <p className="text-amber-700 font-medium">لا يوجد فنيون متاحون حالياً</p>
              <p className="text-sm text-amber-600 mt-1">جميع الفنيين مشغولون حالياً</p>
            </div>
          ) : (
            <>
              <Select
                label="الفني *"
                value={selectedTechnicianId}
                onChange={(e) => setSelectedTechnicianId(e.target.value)}
                options={[
                  { value: '', label: 'اختر الفني' },
                  ...technicians.map(tech => ({
                    value: tech.id,
                    label: `${tech.user?.fullName} ${
                      tech.distance !== null ? `(${tech.distance.toFixed(1)} كم)` : ''
                    } - ${tech.user?.phoneNumber}`
                  }))
                ]}
                required
                leftIcon={<User size={16} />}
              />

              {/* معلومات الفني المختار */}
              {selectedTechnician && (
                <div className="bg-gray-50 p-4 rounded-lg space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <h5 className="font-bold text-gray-900">
                        {selectedTechnician.user?.fullName}
                      </h5>
                      <p className="text-sm text-gray-600">{selectedTechnician.user?.phoneNumber}</p>
                    </div>
                    {distance !== null && (
                      <div className="text-right">
                        <p className="text-sm text-gray-500">المسافة</p>
                        <p className="font-bold text-blue-600">{distance.toFixed(1)} كم</p>
                      </div>
                    )}
                  </div>

                  {/* موقع الفني */}
                  {selectedTechnician.currentLocationLat && selectedTechnician.currentLocationLng && (
                    <div className="flex items-center gap-2">
                      <MapPin size={14} className="text-gray-400" />
                      <span className="text-sm text-gray-600">
                        الموقع الحالي: {selectedTechnician.currentLocationLat}, {selectedTechnician.currentLocationLng}
                      </span>
                      <a 
                        href={`https://maps.google.com/?q=${selectedTechnician.currentLocationLat},${selectedTechnician.currentLocationLng}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:text-blue-800 text-sm flex items-center gap-1"
                      >
                        <Navigation size={12} />
                        عرض على الخريطة
                      </a>
                    </div>
                  )}

                  {/* الإحصائيات */}
                  <div className="grid grid-cols-3 gap-2 pt-3 border-t border-gray-200">
                    <div className="text-center">
                      <p className="text-lg font-bold">{selectedTechnician._count?.assignedRequests || 0}</p>
                      <p className="text-xs text-gray-500">طلبات معينة</p>
                    </div>
                    <div className="text-center">
                      <p className="text-lg font-bold">{selectedTechnician._count?.reports || 0}</p>
                      <p className="text-xs text-gray-500">تقارير</p>
                    </div>
                    <div className="text-center">
                      <p className="text-lg font-bold">
                        {selectedTechnician._count?.ratings ? 
                          (selectedTechnician._count.ratings > 0 ? '⭐' : 'لا يوجد') : 
                          'لا يوجد'}
                      </p>
                      <p className="text-xs text-gray-500">تقييمات</p>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        {/* رسالة تحذير */}
        {selectedTechnician && distance !== null && distance > 20 && (
          <div className="bg-red-50 border border-red-200 p-4 rounded-lg">
            <div className="flex items-start gap-2">
              <AlertCircle size={18} className="text-red-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-medium text-red-800">تنبيه: مسافة كبيرة</p>
                <p className="text-sm text-red-700 mt-1">
                  الفني المختار يبعد {distance.toFixed(1)} كم عن موقع الطلب. 
                  قد يستغرق الوصول وقتاً طويلاً.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* أزرار الإجراءات */}
        <div className="flex gap-3 justify-end pt-4 border-t border-gray-200">
          <Button
            type="button"
            variant="outline"
            onClick={handleClose}
            disabled={loading}
          >
            إلغاء
          </Button>
          <Button
            type="submit"
            variant="primary"
            disabled={loading || !selectedTechnicianId || technicians.length === 0}
            className="bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800"
          >
            {loading ? (
              <>
                <span className="animate-spin mr-2">⟳</span>
                جاري التعيين...
              </>
            ) : (
              'تعيين الفني'
            )}
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default AssignTechnicianModal;