import React, { useState, useCallback, useRef } from 'react';
import * as geminiService from '../services/geminiService';
import * as dashscopeService from '../services/dashscopeService';
import * as customModelService from '../services/customModelService';
import * as virusTotalService from '../services/virusTotalService';
import { type AnalysisResult } from '../types';
import Loader from './Loader';
import CodeBlock from './CodeBlock';
import { SimilarityIcon } from './icons/SimilarityIcon';
import { UploadIcon } from './icons/UploadIcon';
import { AnalysisIcon } from './icons/AnalysisIcon';
import AnalysisDashboard from './AnalysisDashboard';

type AiModel = 'gemini' | 'dashscope' | 'custom';
type InputMode = 'upload' | 'hash';

const InteractiveDemo: React.FC = () => {
  const [report, setReport] = useState<string>('');
  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null);
  const [yaraRule, setYaraRule] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [fileHash, setFileHash] = useState<string>('');
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Input Mode
  const [inputMode, setInputMode] = useState<InputMode>('upload');
  const [inputHash, setInputHash] = useState<string>('');

  // API Key states
  const [selectedModel, setSelectedModel] = useState<AiModel>('gemini');
  const [geminiApiKey, setGeminiApiKey] = useState<string>('');
  const [dashscopeApiKey, setDashscopeApiKey] = useState<string>('');
  const [customModelUrl, setCustomModelUrl] = useState<string>('');
  const [customModelApiKey, setCustomModelApiKey] = useState<string>('');
  const [vtApiKey, setVtApiKey] = useState<string>('');

  const resetState = () => {
    setReport('');
    setAnalysis(null);
    setYaraRule('');
    setError('');
    setFileHash('');
    setSelectedFile(null);
  };
  
  const handleFileUpload = async (file: File) => {
    resetState();
    setInputHash('');
    setSelectedFile(file);

    if (!vtApiKey) {
        setError("请输入您的 VirusTotal API 密钥以自动获取报告。");
        return;
    }

    setIsLoading(true);
    try {
      const hash = await virusTotalService.calculateFileHash(file);
      setFileHash(hash);
      const vtResponse = await virusTotalService.getVirusTotalReport(hash, vtApiKey);
      const formattedReport = virusTotalService.formatVirusTotalReport(vtResponse);
      setReport(formattedReport);
    } catch (err) {
      setError(err instanceof Error ? err.message : '从 VirusTotal 获取数据时出错。');
    } finally {
        setIsLoading(false);
    }
  };

  const handleHashQuery = async () => {
    if (!inputHash.trim()) {
        setError("请输入有效的哈希值。");
        return;
    }
     if (!vtApiKey) {
        setError("请输入您的 VirusTotal API 密钥以查询报告。");
        return;
    }

    resetState();
    setIsLoading(true);
    setFileHash(inputHash.trim()); // Show the queried hash

    try {
        const vtResponse = await virusTotalService.getVirusTotalReport(inputHash.trim(), vtApiKey);
        const formattedReport = virusTotalService.formatVirusTotalReport(vtResponse);
        setReport(formattedReport);
    } catch (err) {
        setError(err instanceof Error ? err.message : '从 VirusTotal 获取数据时出错。');
    } finally {
        setIsLoading(false);
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

  const clearSelection = () => {
    resetState();
    setInputHash('');
    setInputMode('upload');
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
      let analysisResult: AnalysisResult;
      let rule: string;

      if (selectedModel === 'gemini') {
        analysisResult = await geminiService.analyzeMalwareReport(report, geminiApiKey);
        setAnalysis(analysisResult);
        rule = await geminiService.generateYaraRule(analysisResult, geminiApiKey);
      } else if (selectedModel === 'dashscope') {
        analysisResult = await dashscopeService.analyzeMalwareReport(report, dashscopeApiKey);
        setAnalysis(analysisResult);
        rule = await dashscopeService.generateYaraRule(analysisResult, dashscopeApiKey);
      } else { // custom
        analysisResult = await customModelService.analyzeMalwareReport(report, customModelUrl, customModelApiKey);
        setAnalysis(analysisResult);
        rule = await customModelService.generateYaraRule(analysisResult, customModelUrl, customModelApiKey);
      }
      
      setYaraRule(rule);
    } catch (err) {
      setError(err instanceof Error ? err.message : '发生未知错误。');
    } finally {
      setIsLoading(false);
    }
  }, [report, selectedModel, geminiApiKey, dashscopeApiKey, customModelUrl, customModelApiKey]);

  const isAnalyzeButtonDisabled = () => {
    if (isLoading || !report.trim()) return true;
    switch (selectedModel) {
        case 'gemini': return !geminiApiKey;
        case 'dashscope': return !dashscopeApiKey;
        case 'custom': return !customModelUrl || !customModelApiKey;
        default: return true;
    }
  };
  
  const getModelName = () => {
    switch (selectedModel) {
        case 'gemini': return 'Gemini';
        case 'dashscope': return '通义千问';
        case 'custom': return '自定义模型';
        default: return 'AI';
    }
  }

  return (
    <div className="bg-gray-800 p-6 rounded-xl border border-gray-700 shadow-2xl">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Input Column */}
        <div className="flex flex-col space-y-4">
          
          {/* Step 0: API Key Config */}
          <div>
            <h3 className="text-lg font-semibold text-gray-200 mb-2 flex items-center">
              <span className="flex items-center justify-center w-6 h-6 bg-cyan-600 text-white rounded-full text-sm font-bold mr-3">0</span>
              AI 模型配置
            </h3>
            <div className="bg-gray-900/50 p-4 rounded-lg border border-gray-700 space-y-3">
                <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">选择 AI 模型</label>
                    <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
                        <label className="flex items-center cursor-pointer">
                            <input type="radio" name="model" value="gemini" checked={selectedModel === 'gemini'} onChange={() => setSelectedModel('gemini')} className="form-radio h-4 w-4 text-cyan-600 bg-gray-700 border-gray-600 focus:ring-cyan-500" />
                            <span className="ml-2 text-gray-200">Google Gemini</span>
                        </label>
                        <label className="flex items-center cursor-pointer">
                            <input type="radio" name="model" value="dashscope" checked={selectedModel === 'dashscope'} onChange={() => setSelectedModel('dashscope')} className="form-radio h-4 w-4 text-cyan-600 bg-gray-700 border-gray-600 focus:ring-cyan-500" />
                            <span className="ml-2 text-gray-200">通义千问</span>
                        </label>
                        <label className="flex items-center cursor-pointer">
                            <input type="radio" name="model" value="custom" checked={selectedModel === 'custom'} onChange={() => setSelectedModel('custom')} className="form-radio h-4 w-4 text-cyan-600 bg-gray-700 border-gray-600 focus:ring-cyan-500" />
                            <span className="ml-2 text-gray-200">自定义模型</span>
                        </label>
                    </div>
                </div>
                {selectedModel === 'gemini' && (
                    <input type="password" placeholder="输入您的 Google Gemini API Key" value={geminiApiKey} onChange={(e) => setGeminiApiKey(e.target.value)} className="w-full p-2 bg-gray-800 text-gray-300 font-mono text-sm border border-gray-600 rounded-md focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition" />
                )}
                {selectedModel === 'dashscope' && (
                    <input type="password" placeholder="输入您的 DashScope API Key" value={dashscopeApiKey} onChange={(e) => setDashscopeApiKey(e.target.value)} className="w-full p-2 bg-gray-800 text-gray-300 font-mono text-sm border border-gray-600 rounded-md focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition" />
                )}
                {selectedModel === 'custom' && (
                    <div className="space-y-2">
                         <input type="text" placeholder="输入模型 API URL (兼容 OpenAI)" value={customModelUrl} onChange={(e) => setCustomModelUrl(e.target.value)} className="w-full p-2 bg-gray-800 text-gray-300 font-mono text-sm border border-gray-600 rounded-md focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition" />
                         <input type="password" placeholder="输入模型 API Key" value={customModelApiKey} onChange={(e) => setCustomModelApiKey(e.target.value)} className="w-full p-2 bg-gray-800 text-gray-300 font-mono text-sm border border-gray-600 rounded-md focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition" />
                    </div>
                )}
            </div>
          </div>
          
          {/* Step 1: Upload / Hash Input */}
          <div>
            <h3 className="text-lg font-semibold text-gray-200 mb-2 flex items-center">
              <span className={`flex items-center justify-center w-6 h-6 ${fileHash ? 'bg-cyan-600' : 'bg-gray-600'} text-white rounded-full text-sm font-bold mr-3 transition-colors`}>1</span>
              提供样本
            </h3>
            <div className="bg-gray-900/50 p-4 rounded-lg border border-gray-700 space-y-3">
                <div className="space-y-1">
                  <label htmlFor="vt-key" className="block text-sm font-medium text-gray-300">VirusTotal API Key</label>
                  <input 
                      id="vt-key"
                      type="password" 
                      placeholder="在此输入您的 VT Key 以自动获取报告" 
                      value={vtApiKey} 
                      onChange={(e) => setVtApiKey(e.target.value)} 
                      className="w-full p-2 bg-gray-800 text-gray-300 font-mono text-sm border border-gray-600 rounded-md focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition" 
                  />
                </div>
                
                <div className="flex items-center space-x-4 pt-2">
                    <label className="flex items-center cursor-pointer">
                        <input type="radio" name="inputMode" value="upload" checked={inputMode === 'upload'} onChange={() => setInputMode('upload')} className="form-radio h-4 w-4 text-cyan-600 bg-gray-700 border-gray-600 focus:ring-cyan-500" />
                        <span className="ml-2 text-gray-200">上传文件</span>
                    </label>
                    <label className="flex items-center cursor-pointer">
                        <input type="radio" name="inputMode" value="hash" checked={inputMode === 'hash'} onChange={() => setInputMode('hash')} className="form-radio h-4 w-4 text-cyan-600 bg-gray-700 border-gray-600 focus:ring-cyan-500" />
                        <span className="ml-2 text-gray-200">输入哈希</span>
                    </label>
                </div>

                {inputMode === 'upload' && (
                    <div>
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
                            className={`flex flex-col items-center justify-center p-8 border-2 border-dashed rounded-lg transition-colors duration-300 cursor-pointer ${isDragging ? 'border-cyan-400 bg-gray-700/50' : 'border-gray-600 hover:border-gray-500 bg-gray-900/50'}`}
                          >
                            <UploadIcon className="w-10 h-10 text-gray-500 mb-3" />
                            <p className="text-gray-400">拖放文件或 <span className="font-semibold text-cyan-400">点击上传</span></p>
                          </div>
                        ) : (
                          <div className="bg-gray-700 p-4 rounded-lg">
                            <p className="font-bold text-white">文件已选择:</p>
                            <div className="flex justify-between items-center mt-2">
                                <span className="font-mono text-cyan-300 truncate">{selectedFile.name}</span>
                                <button onClick={clearSelection} className="text-sm text-red-400 hover:text-red-300 font-semibold ml-4">清除</button>
                            </div>
                          </div>
                        )}
                    </div>
                )}
                {inputMode === 'hash' && (
                    <div className="space-y-2">
                        <input 
                            type="text"
                            placeholder="在此输入 SHA-256 哈希值"
                            value={inputHash}
                            onChange={(e) => setInputHash(e.target.value)}
                            className="w-full p-2 bg-gray-800 text-gray-300 font-mono text-sm border border-gray-600 rounded-md focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition"
                        />
                         <button
                            onClick={handleHashQuery}
                            disabled={!inputHash.trim() || !vtApiKey || isLoading}
                            className="w-full bg-cyan-600 hover:bg-cyan-700 disabled:bg-gray-600 text-white font-bold py-2 px-4 rounded-md flex items-center justify-center transition"
                         >
                             {isLoading ? <Loader /> : '查询报告'}
                         </button>
                    </div>
                )}
                 {fileHash && (
                  <div className="mt-3 pt-3 border-t border-gray-600">
                      <p className="text-sm text-gray-300">样本 SHA-256 哈希:</p>
                      <p className="font-mono text-xs text-yellow-300 break-all">{fileHash}</p>
                      {selectedFile && <button onClick={clearSelection} className="text-xs text-red-400 hover:text-red-300 font-semibold mt-2">清除文件</button>}
                  </div>
                )}
            </div>
          </div>

          {/* Step 2: Review Report */}
          <div>
              <h3 className="text-lg font-semibold text-gray-200 mb-2 flex items-center justify-between">
                <div className='flex items-center'>
                  <span className={`flex items-center justify-center w-6 h-6 ${report.trim() ? 'bg-cyan-600' : 'bg-gray-600'} text-white rounded-full text-sm font-bold mr-3 transition-colors`}>2</span>
                  行为报告
                </div>
              </h3>
              <div className="relative">
                <textarea
                  id="malware-report"
                  rows={15}
                  onChange={(e) => setReport(e.target.value)}
                  className="w-full p-3 bg-gray-900 text-gray-300 font-mono text-sm border border-gray-600 rounded-md focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition"
                  value={report}
                  placeholder={isLoading && !report ? "正在从 VirusTotal 获取报告..." : "提供样本后，其报告将在此自动填充..."}
                />
              </div>
          </div>

          {/* Step 3: Analyze */}
          <div>
            <h3 className="text-lg font-semibold text-gray-200 mb-2 flex items-center">
                <span className={`flex items-center justify-center w-6 h-6 ${!isAnalyzeButtonDisabled() ? 'bg-cyan-600' : 'bg-gray-600'} text-white rounded-full text-sm font-bold mr-3 transition-colors`}>3</span>
                触发 AI 分析
            </h3>
            <button
              onClick={handleAnalysis}
              disabled={isAnalyzeButtonDisabled()}
              className="w-full bg-cyan-600 hover:bg-cyan-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white font-bold py-3 px-4 rounded-md flex items-center justify-center transition-all duration-300 transform hover:scale-105 disabled:scale-100"
            >
              {isLoading && !analysis ? <Loader /> : `使用 ${getModelName()} 进行分析`}
            </button>
          </div>
        </div>
        
        {/* Output Column */}
        <div className="flex flex-col">
          <h3 className="text-lg font-semibold text-gray-200 mb-2 flex items-center">
              <span className={`flex items-center justify-center w-6 h-6 ${analysis ? 'bg-cyan-600' : 'bg-gray-600'} text-white rounded-full text-sm font-bold mr-3 transition-colors`}>4</span>
              查看分析结果
          </h3>
          <div className="flex-grow bg-gray-900/70 border border-gray-600 rounded-md p-4 flex flex-col justify-center min-h-[400px]">
            {isLoading && !analysis && <div className="text-center text-gray-400 flex flex-col items-center"><Loader /><span className="mt-2">正在生成分析结果...</span></div>}
            {error && <div className="text-center text-red-400 p-4 bg-red-900/50 rounded-md whitespace-pre-wrap"><b>错误:</b> {error}</div>}
            
            {!isLoading && !error && !analysis && (
              <div className="text-center text-gray-500">
                <AnalysisIcon className="w-12 h-12 mx-auto mb-4" />
                您的 AI 生成的分析和检测规则将显示在这里。
              </div>
            )}

            {analysis && (
              <div className="space-y-6 overflow-y-auto h-[calc(100vh-250px)] min-h-[600px] p-1">
                <AnalysisDashboard analysis={analysis} />
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