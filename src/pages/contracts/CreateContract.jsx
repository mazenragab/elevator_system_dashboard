import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, Save, X } from 'lucide-react';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Input from '../../components/forms/Input';
import Select from '../../components/forms/Select';

const CreateContract = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    contractNumber: '',
    clientName: '',
    contactPerson: '',
    email: '',
    phone: '',
    startDate: '',
    endDate: '',
    contractType: '',
    value: '',
    elevators: [],
    slaResponse: '24',
    slaResolution: '72'
  });

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Handle form submission
    navigate('/contracts');
  };

  return (
    <div className="space-y-6">
      {/* العنوان والخطوات */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">إنشاء عقد جديد</h1>
        <p className="text-gray-600 mt-1">أدخل تفاصيل عقد الصيانة الجديد</p>
      </div>

      {/* خطوات التقدم */}
      <Card className="p-6">
        <div className="flex items-center justify-between">
          {[1, 2, 3].map((s) => (
            <div key={s} className="flex items-center">
              <div className={`
                w-8 h-8 rounded-full flex items-center justify-center font-medium
                ${s === step ? 'bg-gray-900 text-white' : 
                  s < step ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-400'}
              `}>
                {s}
              </div>
              {s < 3 && (
                <div className={`h-1 w-16 mx-2 ${s < step ? 'bg-green-500' : 'bg-gray-200'}`}></div>
              )}
            </div>
          ))}
        </div>
        
        <div className="flex justify-between mt-4">
          <span className="text-sm font-medium text-gray-900">معلومات أساسية</span>
          <span className="text-sm font-medium text-gray-900">المصاعد</span>
          <span className="text-sm font-medium text-gray-900">المراجعة</span>
        </div>
      </Card>

      {/* النموذج */}
      <form onSubmit={handleSubmit}>
        {step === 1 && (
          <Card title="المعلومات الأساسية">
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Input
                  label="رقم العقد"
                  value={formData.contractNumber}
                  onChange={(e) => handleChange('contractNumber', e.target.value)}
                  placeholder="CON-2024-XXX"
                  required
                />
                <Input
                  label="اسم العميل"
                  value={formData.clientName}
                  onChange={(e) => handleChange('clientName', e.target.value)}
                  placeholder="أدخل اسم العميل"
                  required
                />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Input
                  label="مسؤول التواصل"
                  value={formData.contactPerson}
                  onChange={(e) => handleChange('contactPerson', e.target.value)}
                  placeholder="أدخل اسم مسؤول التواصل"
                />
                <Input
                  label="البريد الإلكتروني"
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleChange('email', e.target.value)}
                  placeholder="email@example.com"
                />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Input
                  label="رقم الهاتف"
                  value={formData.phone}
                  onChange={(e) => handleChange('phone', e.target.value)}
                  placeholder="01XXXXXXXXX"
                />
                <Select
                  label="نوع العقد"
                  value={formData.contractType}
                  onChange={(e) => handleChange('contractType', e.target.value)}
                  options={[
                    { value: 'full', label: 'صيانة كاملة' },
                    { value: 'preventive', label: 'صيانة وقائية' },
                    { value: 'ondemand', label: 'حسب الطلب' },
                  ]}
                  required
                />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Input
                  label="تاريخ البدء"
                  type="date"
                  value={formData.startDate}
                  onChange={(e) => handleChange('startDate', e.target.value)}
                  required
                />
                <Input
                  label="تاريخ الانتهاء"
                  type="date"
                  value={formData.endDate}
                  onChange={(e) => handleChange('endDate', e.target.value)}
                  required
                />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Input
                  label="مدة الاستجابة (ساعة)"
                  value={formData.slaResponse}
                  onChange={(e) => handleChange('slaResponse', e.target.value)}
                  type="number"
                />
                <Input
                  label="مدة الحل (ساعة)"
                  value={formData.slaResolution}
                  onChange={(e) => handleChange('slaResolution', e.target.value)}
                  type="number"
                />
              </div>
              
              <Input
                label="القيمة الإجمالية"
                value={formData.value}
                onChange={(e) => handleChange('value', e.target.value)}
                placeholder="أدخل قيمة العقد"
              />
            </div>
          </Card>
        )}

        {step === 2 && (
          <Card title="المصاعد المشمولة">
            <div className="space-y-6">
              <p className="text-gray-600">أضف المصاعد المشمولة في هذا العقد</p>
              {/* سيتم إضافة قائمة المصاعد هنا */}
            </div>
          </Card>
        )}

        {step === 3 && (
          <Card title="مراجعة وتأكيد">
            <div className="space-y-6">
              <div className="bg-gray-50 p-6 rounded-lg">
                <h3 className="font-medium text-gray-900 mb-4">ملخص العقد</h3>
                <div className="space-y-3">
                  {Object.entries(formData).map(([key, value]) => (
                    value && (
                      <div key={key} className="flex justify-between">
                        <span className="text-gray-600">{key}</span>
                        <span className="font-medium">{value}</span>
                      </div>
                    )
                  ))}
                </div>
              </div>
            </div>
          </Card>
        )}

        {/* أزرار التنقل */}
        <div className="flex items-center justify-between pt-6">
          <Button
            type="button"
            variant="outline"
            onClick={() => step > 1 ? setStep(step - 1) : navigate('/contracts')}
          >
            {step === 1 ? 'إلغاء' : 'رجوع'}
          </Button>
          
          <div className="flex items-center gap-3">
            {step < 3 && (
              <Button
                type="button"
                onClick={() => setStep(step + 1)}
                leftIcon={<ArrowRight size={16} />}
              >
                التالي
              </Button>
            )}
            
            {step === 3 && (
              <Button
                type="submit"
                leftIcon={<Save size={16} />}
              >
                حفظ العقد
              </Button>
            )}
          </div>
        </div>
      </form>
    </div>
  );
};

export default CreateContract;