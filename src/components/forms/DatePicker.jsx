// src/components/forms/DatePicker.jsx
import { useState } from 'react';
import { Calendar } from 'lucide-react';

const DatePicker = ({ value, onChange, placeholder = "اختر التاريخ", disabled = false, minDate = '', maxDate = '' }) => {
  const [showCalendar, setShowCalendar] = useState(false);

  const handleDateChange = (e) => {
    onChange(e.target.value);
  };

  const today = new Date().toISOString().split('T')[0];

  return (
    <div className="relative">
      <div className="relative">
        <input
          type="date"
          value={value}
          onChange={handleDateChange}
          disabled={disabled}
          min={minDate || today}
          max={maxDate}
          className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
        />
        <div className="absolute left-3 top-1/2 transform -translate-y-1/2 pointer-events-none">
          <Calendar className="text-gray-400" size={18} />
        </div>
      </div>
    </div>
  );
};

export default DatePicker;