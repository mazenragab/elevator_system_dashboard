import { Calendar, User, FileText, Clock, ChevronLeft } from 'lucide-react';
import Badge from '../ui/Badge';

const ContractCard = ({ contract, onClick }) => {
  const getStatusBadge = (status) => {
    switch (status) {
      case 'active':
        return <Badge variant="success">نشط</Badge>;
      case 'expired':
        return <Badge variant="danger">منتهي</Badge>;
      case 'pending':
        return <Badge variant="warning">قيد المراجعة</Badge>;
      default:
        return <Badge>غير معروف</Badge>;
    }
  };

  return (
    <div 
      className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-all cursor-pointer group"
      onClick={() => onClick && onClick(contract)}
    >
      <div className="flex items-start justify-between mb-4">
        <div>
          <h3 className="text-lg font-semibold text-gray-900 group-hover:text-gray-700">
            {contract.contractNumber}
          </h3>
          <p className="text-sm text-gray-500 mt-1">{contract.clientName}</p>
        </div>
        {getStatusBadge(contract.status)}
      </div>
      
      <div className="space-y-3">
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <Calendar size={16} className="text-gray-400" />
          <span>من {contract.startDate}</span>
          <span className="mx-1">-</span>
          <span>إلى {contract.endDate}</span>
        </div>
        
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <User size={16} className="text-gray-400" />
          <span>العميل: {contract.contactPerson}</span>
        </div>
        
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <FileText size={16} className="text-gray-400" />
          <span>نوع العقد: {contract.type}</span>
        </div>
        
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <Clock size={16} className="text-gray-400" />
          <span>متبقي {contract.daysRemaining} يوم</span>
        </div>
      </div>
      
      <div className="flex items-center justify-between mt-6 pt-4 border-t border-gray-100">
        <span className="text-sm font-medium text-gray-900">
          {contract.elevatorsCount} مصاعد
        </span>
        <ChevronLeft size={16} className="text-gray-400 group-hover:text-gray-600" />
      </div>
    </div>
  );
};

export default ContractCard;