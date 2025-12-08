import Breadcrumb from '../common/Breadcrumb';

const PageHeader = ({ 
  title, 
  subtitle,
  actions,
  showBreadcrumb = true 
}) => {
  return (
    <div className="mb-4 sm:mb-6 md:mb-8">
      {showBreadcrumb && <Breadcrumb />}
      
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
        {/* Title and Subtitle */}
        <div className="flex-1 min-w-0">
          <h1 className="text-lg sm:text-xl md:text-2xl font-bold text-gray-900 truncate">
            {title}
          </h1>
          {subtitle && (
            <p className="text-xs sm:text-sm md:text-base text-gray-600 mt-0.5 sm:mt-1 line-clamp-2">
              {subtitle}
            </p>
          )}
        </div>
        
        {/* Actions */}
        {actions && (
          <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
            {actions}
          </div>
        )}
      </div>
    </div>
  );
};

export default PageHeader;