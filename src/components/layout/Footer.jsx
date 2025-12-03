const Footer = () => {
  return (
    <footer className="bg-white border-t border-gray-200 px-6 py-4">
      <div className="flex items-center justify-between">
        <div className="text-sm text-gray-500">
          © 2024 نظام إدارة المصاعد. جميع الحقوق محفوظة.
        </div>
        <div className="flex items-center gap-4">
          <a href="#" className="text-sm text-gray-500 hover:text-gray-900">
            الخصوصية
          </a>
          <a href="#" className="text-sm text-gray-500 hover:text-gray-900">
            الشروط
          </a>
          <a href="#" className="text-sm text-gray-500 hover:text-gray-900">
            الدعم
          </a>
        </div>
      </div>
    </footer>
  );
};

export default Footer;