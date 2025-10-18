
import React from 'react';

interface EmptyStateProps {
  icon: React.ReactElement;
  title: string;
  message: string;
  action?: {
    label: string;
    onClick: () => void;
  };
}

export const EmptyState: React.FC<EmptyStateProps> = ({ icon, title, message, action }) => {
  return (
    <div className="text-center py-16 px-6 bg-gray-900 border-2 border-dashed border-gray-700 rounded-lg">
      <div className="mx-auto h-12 w-12 text-gray-500">{icon}</div>
      <h3 className="mt-4 text-xl font-semibold text-gray-200">{title}</h3>
      <p className="mt-2 text-base text-gray-400">{message}</p>
      {action && (
        <div className="mt-6">
          <button
            type="button"
            onClick={action.onClick}
            className="inline-flex items-center px-6 py-3 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-sky-600 hover:bg-sky-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-900 focus:ring-sky-500"
          >
            {action.label}
          </button>
        </div>
      )}
    </div>
  );
};