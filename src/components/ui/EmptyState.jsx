import { FolderOpen } from 'lucide-react';
import Button from './Button';

const EmptyState = ({
  icon = <FolderOpen className="w-12 h-12 text-gray-400" />,
  title = 'لا توجد بيانات',
  description = 'لم يتم العثور على أي بيانات حتى الآن.',
  actionLabel,
  onAction,
  className = ''
}) => {
  return (
    <div className={`text-center py-12 ${className}`}>
      <div className="mx-auto w-12 h-12 text-gray-400">
        {icon}
      </div>
      <h3 className="mt-4 text-lg font-medium text-gray-900">{title}</h3>
      <p className="mt-2 text-sm text-gray-500 max-w-md mx-auto">
        {description}
      </p>
      {actionLabel && onAction && (
        <div className="mt-6">
          <Button onClick={onAction}>
            {actionLabel}
          </Button>
        </div>
      )}
    </div>
  );
};

export default EmptyState;