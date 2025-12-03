import Breadcrumb from '../common/Breadcrumb';

const PageHeader = ({ 
  title, 
  subtitle,
  actions,
  showBreadcrumb = true 
}) => {
  return (
    <div className="mb-8">
      {showBreadcrumb && <Breadcrumb />}
      
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{title}</h1>
          {subtitle && (
            <p className="text-gray-600 mt-1">{subtitle}</p>
          )}
        </div>
        
        {actions && (
          <div className="flex items-center gap-3">
            {actions}
          </div>
        )}
      </div>
    </div>
  );
};

export default PageHeader;