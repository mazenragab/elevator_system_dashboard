const RTLWrapper = ({ children }) => {
  return (
    <div dir="rtl" className="font-arabic">
      {children}
    </div>
  );
};

export default RTLWrapper;