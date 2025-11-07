import React from 'react';

const Header: React.FC = () => {
  return (
    <header className="bg-gray-800/50 backdrop-blur-sm shadow-lg border-b border-cyan-500/20 sticky top-0 z-50">
      <div className="container mx-auto px-4 py-4">
        <h1 className="text-3xl md:text-4xl font-bold text-center">
          <span className="text-cyan-400">AI 驱动的</span> 恶意软件分析
        </h1>
        <p className="text-center text-gray-400 mt-1">
          一个用于实现 VirusTotal 相似性解决方案的交互式指南
        </p>
      </div>
    </header>
  );
};

export default Header;