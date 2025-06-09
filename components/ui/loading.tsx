import React from 'react';

const LoadingScreen: React.FC = () => {
  return (
    <div className="flex items-center justify-center h-screen bg-white">
      <div className="w-12 h-12 border-4 border-gray-200 border-t-transparent rounded-full animate-spin" />
    </div>
  );
};

export default LoadingScreen;
