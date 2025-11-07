import React, { useState, useCallback, useRef } from 'react';
import { analyzeMalwareReport, generateYaraRule } from '../services/geminiService';
import { getVirusTotalReport } from '../services/virusTotalService';
import { type AnalysisResult } from '../types';
import Loader from './Loader';
import CodeBlock from './CodeBlock';
import { SimilarityIcon } from './icons/SimilarityIcon';
import { UploadIcon } from './icons/UploadIcon';
import { AnalysisIcon } from './icons/AnalysisIcon';

const InteractiveDemo: React.FC = () => {
  const [report, setReport] = useState<string>('');
  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null);
  const [yaraRule, setYaraRule] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false); // Gemini loading
  const [isVtLoading, setIsVtLoading] = useState<boolean>(false); // VT loading
  const [error, setError] = useState<string>('');
  const [vtError, setVtError] = useState<string>('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const handleFileUpload = async (file: File) => {
    setSelectedFile(file);
    // Reset everything
    setReport('');
    setAnalysis(null);
    setYaraRule('');
    setError('');
    setVtError('');
    setIsVtLoading(true);

    try {
      const vtReport = await getVirusTotalReport(file);
      setReport(vtReport);
    } catch (err) {
      setVtError(err instanceof Error ? err.message : '获取 VirusTotal 报告时发生未知错误。');
    } finally {
      setIsVtLoading(false);
    }
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      handleFileUpload(event.target.files[0]);
    }
  };
  
  const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.stopPropagation();
    setIsDragging(false);
    if (event.dataTransfer.files && event.dataTransfer.files[0]) {
      handleFileUpload(event.dataTransfer.files[0]);
    }
  };

  const handleDragEvents = (event: React.DragEvent<HTMLDivElement>) => {
      event.preventDefault();
      event.stopPropagation();
  };

  const handleDragEnter = (event: React.DragEvent<HTMLDivElement>) => {
      handleDragEvents(event);
      setIsDragging(true);
  };

  const handleDragLeave = (event: React.DragEvent<HTMLDivElement>) => {
      handleDragEvents(event);
      setIsDragging(false);
  };

  const triggerFileSelect = () => {
    fileInputRef.current?.click();
  };

  const clearFile = () => {
    setSelectedFile(null);
    setReport('');
    setAnalysis(null);
    setYaraRule('');
    setError('');
    setVtError('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };


  const handleAnalysis = useCallback(async () => {
    setIsLoading(true);
    setError('');
    setAnalysis(null);
    setYaraRule('');

    try {
      const analysisResult = await analyzeMalwareReport(report);
      setAnalysis(analysisResult);

      const rule = await generateYaraRule(analysisResult);
      setYaraRule(rule);
    } catch (err) {
      setError(err instanceof Error ? err.message : '发生未知错误。');
    } finally {
      setIsLoading(false);
    }
  }, [report]);
  
  return (
    <div className="bg-gray-800 p-6 rounded-xl border border-gray-700 shadow-2xl">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Input Column */}
        <div className="flex flex-col space-y-4">
          
          {/* Step 1: Upload */}
          <div>
            <h3 className="text-lg font-semibold text-gray-200 mb-2 flex items-center">
              <span className="flex items-center justify-center w-6 h-6 bg-cyan-600 text-white rounded-full text-sm font-bold mr-3">1</span>
              上传文件样本
            </h3>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              className="hidden"
            />
            {!selectedFile ? (
              <div
                onDrop={handleDrop}
                onDragOver={handleDragEvents}
                onDragEnter={handleDragEnter}
                onDragLeave={handleDragLeave}
                onClick={triggerFileSelect}
                className={`flex flex-col items-center justify-center p-8 border-2 border-dashed rounded-lg cursor-pointer transition-colors duration-300 ${isDragging ? 'border-cyan-400 bg-gray-700/50' : 'border-gray-600 hover:border-gray-500 bg-gray-900/50'}`}
              >
                <UploadIcon className="w-10 h-10 text-gray-500 mb-3" />
                <p className="text-gray-400">拖放文件或 <span className="font-semibold text-cyan-400">点击上传</span></p>
                <p className="text-xs text-gray-500 mt-1">应用将自动从 VirusTotal 获取报告</p>
              </div>
            ) : (
              <div className="bg-gray-700 p-4 rounded-lg">
                <p className="font-bold text-white">文件已选择:</p>
                <div className="flex justify-between items-center mt-2">
                    <span className="font-mono text-cyan-300 truncate">{selectedFile.name}</span>
                    <button onClick={clearFile} className="text-sm text-red-400 hover:text-red-300 font-semibold ml-4">清除</button>
                </div>
              </div>
            )}
          </div>

          {/* Step 2: Review Report */}
          <div>
              <h3 className="text-lg font-semibold text-gray-200 mb-2 flex items-center">
                <span className={`flex items-center justify-center w-6 h-6 ${report.trim() ? 'bg-cyan-600' : 'bg-gray-600'} text-white rounded-full text-sm font-bold mr-3 transition-colors`}>2</span>
                审查行为报告
              </h3>
              <div className="relative">
                <textarea
                  id="malware-report"
                  rows={15}
                  readOnly
                  className="w-full p-3 bg-gray-900 text-gray-300 font-mono text-sm border border-gray-600 rounded-md focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition"
                  value={report}
                  placeholder="上传文件后，其 VirusTotal 报告将显示在此处..."
                />
                {isVtLoading && (
                    <div className="absolute inset-0 bg-gray-900/80 flex flex-col items-center justify-center rounded-md">
                        <Loader/>
                        <span className="mt-2 text-gray-300">正在从 VirusTotal 获取报告...</span>
                    </div>
                )}
                {vtError && (
                     <div className="absolute inset-0 bg-red-900/90 flex flex-col items-center justify-center rounded-md p-4 text-center">
                        <p className="text-red-300 font-semibold">获取报告失败</p>
                        <p className="text-red-400 text-sm mt-2">{vtError}</p>
                    </div>
                )}
              </div>
          </div>

          {/* Step 3: Analyze */}
          <div>
            <h3 className="text-lg font-semibold text-gray-200 mb-2 flex items-center">
                <span className={`flex items-center justify-center w-6 h-6 ${report.trim() ? 'bg-cyan-600' : 'bg-gray-600'} text-white rounded-full text-sm font-bold mr-3 transition-colors`}>3</span>
                触发 AI 分析
            </h3>
            <button
              onClick={handleAnalysis}
              disabled={isLoading || isVtLoading || !report.trim()}
              className="w-full bg-cyan-600 hover:bg-cyan-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white font-bold py-3 px-4 rounded-md flex items-center justify-center transition-all duration-300 transform hover:scale-105 disabled:scale-100"
            >
              {isLoading ? <Loader /> : '使用 Gemini 进行分析'}
            </button>
          </div>
        </div>
        
        {/* Output Column */}
        <div className="flex flex-col">
          <h3 className="text-lg font-semibold text-gray-200 mb-2 flex items-center">
              <span className={`flex items-center justify-center w-6 h-6 ${analysis ? 'bg-cyan-600' : 'bg-gray-600'} text-white rounded-full text-sm font-bold mr-3 transition-colors`}>4</span>
              查看分析结果
          </h3>
          <div className="flex-grow bg-gray-900 border border-gray-600 rounded-md p-4 flex flex-col justify-center min-h-[400px]">
            {isLoading && <div className="text-center text-gray-400 flex flex-col items-center"><Loader /><span className="mt-2">正在生成分析结果...</span></div>}
            {error && <div className="text-center text-red-400 p-4 bg-red-900/50 rounded-md">错误: {error}</div>}
            
            {!isLoading && !error && !analysis && (
              <div className="text-center text-gray-500">
                <AnalysisIcon className="w-12 h-12 mx-auto mb-4" />
                您的 AI 生成的分析和检测规则将显示在这里。
              </div>
            )}

            {analysis && (
              <div className="space-y-4 overflow-y-auto max-h-[520px] pr-2">
                <CodeBlock language="JSON" code={JSON.stringify(analysis, null, 2)} title="结构化分析" />
                {yaraRule && <CodeBlock language="YARA" code={yaraRule} title="生成的 YARA 规则" />}
                <div className="bg-gray-800 p-4 rounded-lg border border-gray-700">
                    <h4 className="font-semibold text-cyan-400 flex items-center mb-2"><SimilarityIcon className="w-5 h-5 mr-2" />模拟相似度得分</h4>
                    <p className="text-sm text-gray-400">与已知的恶意软件家族进行比较...</p>
                    <div className="mt-3 space-y-2 text-sm">
                        <div className="flex justify-between"><span>Emotet</span><span className="font-mono text-green-400">78% 匹配</span></div>
                        <div className="flex justify-between"><span>TrickBot</span><span className="font-mono text-yellow-400">45% 匹配</span></div>
                        <div className="flex justify-between"><span>WannaCry</span><span className="font-mono text-red-400">12% 匹配</span></div>
                    </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default InteractiveDemo;