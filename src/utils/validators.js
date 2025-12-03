export const isValidEmail = (email) => {
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return regex.test(email);
};

export const isValidPhone = (phone) => {
  const regex = /^01[0-2,5]{1}[0-9]{8}$/;
  return regex.test(phone);
};

export const isValidPassword = (password) => {
  return password.length >= 6;
};

export const validateContractForm = (data) => {
  const errors = {};
  
  if (!data.client_name?.trim()) {
    errors.client_name = 'اسم العميل مطلوب';
  }
  
  if (!data.contract_number?.trim()) {
    errors.contract_number = 'رقم العقد مطلوب';
  }
  
  if (!data.start_date) {
    errors.start_date = 'تاريخ البدء مطلوب';
  }
  
  if (!data.end_date) {
    errors.end_date = 'تاريخ الانتهاء مطلوب';
  }
  
  return errors;
};