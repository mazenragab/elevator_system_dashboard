const Loading = ({ size = 'md', fullScreen = false }) => {
  const sizes = {
    sm: 'w-6 h-6',
    md: 'w-8 h-8',
    lg: 'w-12 h-12',
  };

  if (fullScreen) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-white bg-opacity-75 z-50">
        <div className={`animate-spin rounded-full ${sizes[size]} border-b-2 border-gray-900`}></div>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center p-8">
      <div className={`animate-spin rounded-full ${sizes[size]} border-b-2 border-gray-900`}></div>
    </div>
  );
};

export default Loading;