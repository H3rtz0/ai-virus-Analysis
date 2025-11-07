import React from 'react';

interface GuideStepProps {
  stepNumber: number;
  title: string;
  icon: React.ReactNode;
  children: React.ReactNode;
}

const GuideStep: React.FC<GuideStepProps> = ({ stepNumber, title, icon, children }) => {
  return (
    <div className="flex items-start space-x-4 p-6 bg-gray-800 rounded-lg border border-gray-700 shadow-md hover:bg-gray-700/50 hover:border-cyan-500/30 transition-all duration-300">
      <div className="flex-shrink-0 flex flex-col items-center">
        <span className="text-cyan-400 h-8 w-8">{icon}</span>
        <span className="mt-2 text-xs font-semibold text-gray-400">步骤 {stepNumber}</span>
      </div>
      <div>
        <h3 className="text-xl font-semibold text-white mb-2">{title}</h3>
        <p className="text-gray-400 leading-relaxed">
          {children}
        </p>
      </div>
    </div>
  );
};

export default GuideStep;