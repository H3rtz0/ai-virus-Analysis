import React from 'react';
import Header from './components/Header';
import GuideStep from './components/GuideStep';
import InteractiveDemo from './components/InteractiveDemo';
import { GUIDE_STEPS } from './constants';

const App: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-900 text-gray-200 font-sans">
      <Header />
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <p className="text-center text-lg text-gray-400 mb-12">
            本指南将引导您实现并验证 AI 驱动的恶意软件分析解决方案。请按照以下步骤操作，并使用交互式演示来体验 Gemini 的强大功能。
          </p>

          <div className="space-y-8">
            {GUIDE_STEPS.map((step, index) => (
              <GuideStep 
                key={index}
                stepNumber={index + 1}
                title={step.title}
                icon={step.icon}
              >
                {step.description}
              </GuideStep>
            ))}
          </div>

          <div className="mt-16">
            <h2 className="text-3xl font-bold text-center text-cyan-400 mb-8">交互式演示</h2>
            <InteractiveDemo />
          </div>
        </div>
      </main>
      <footer className="text-center py-6 mt-12 border-t border-gray-700">
        <p className="text-gray-500">&copy; 2024 AI 恶意软件分析实现器. 版权所有.</p>
      </footer>
    </div>
  );
};

export default App;