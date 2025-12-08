const Footer = () => {
  return (
    <footer className="bg-white border-t border-gray-200 px-4 sm:px-6 py-3 sm:py-4">
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 sm:gap-4">
        {/* Copyright */}
        <div className="text-xs sm:text-sm text-gray-500 text-center sm:text-right order-2 sm:order-1">
          © 2024 نظام إدارة المصاعد. جميع الحقوق محفوظة.
        </div>
        
        {/* Links */}
        <div className="flex items-center gap-3 sm:gap-4 order-1 sm:order-2">
          <a 
            href="#" 
            className="text-xs sm:text-sm text-gray-500 hover:text-gray-900 transition-colors whitespace-nowrap"
          >
            الخصوصية
          </a>
          <span className="text-gray-300">•</span>
          <a 
            href="#" 
            className="text-xs sm:text-sm text-gray-500 hover:text-gray-900 transition-colors whitespace-nowrap"
          >
            الشروط
          </a>
          <span className="text-gray-300">•</span>
          <a 
            href="#" 
            className="text-xs sm:text-sm text-gray-500 hover:text-gray-900 transition-colors whitespace-nowrap"
          >
            الدعم
          </a>
        </div>
      </div>
    </footer>
  );
};

export default Footer;