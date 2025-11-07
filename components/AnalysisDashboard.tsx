import React, { useState } from 'react';
import { type AnalysisResult } from '../types';
import { FileIcon } from './icons/FileIcon';
import { NetworkIcon } from './icons/NetworkIcon';
import { RegistryIcon } from './icons/RegistryIcon';

const copyToClipboard = (text: string, callback: () => void) => {
    navigator.clipboard.writeText(text).then(callback);
};

const IOCList: React.FC<{ title: string; items: string[] | undefined }> = ({ title, items }) => {
    const [copiedItem, setCopiedItem] = useState<string | null>(null);

    const handleCopy = (item: string) => {
        copyToClipboard(item, () => {
            setCopiedItem(item);
            setTimeout(() => setCopiedItem(null), 2000);
        });
    };

    if (!items || items.length === 0) return null;

    return (
        <div>
            <h4 className="text-md font-semibold text-gray-300 mb-2">{title}</h4>
            <ul className="space-y-1">
                {items.map((item, index) => (
                    <li key={index} className="flex items-center justify-between bg-gray-900/70 p-2 rounded-md font-mono text-xs text-gray-400 group">
                        <span className="break-all mr-2">{item}</span>
                        <button
                            onClick={() => handleCopy(item)}
                            className="text-gray-500 hover:text-cyan-400 text-xs font-semibold px-2 py-1 rounded-md bg-gray-700/50 group-hover:opacity-100 opacity-50 transition-all"
                            title={`复制 ${item}`}
                        >
                            {copiedItem === item ? '已复制!' : '复制'}
                        </button>
                    </li>
                ))}
            </ul>
        </div>
    );
};

const AnalysisDashboard: React.FC<{ analysis: AnalysisResult }> = ({ analysis }) => {
    const {
        malware_family_guess,
        summary,
        key_behaviors,
        mitre_attack_techniques,
        indicators_of_compromise
    } = analysis;

    return (
        <div className="space-y-6 text-gray-200">
            {/* Header Section */}
            <div className="p-4 bg-gray-800 rounded-lg border border-gray-700">
                <h3 className="text-xl font-bold text-cyan-400">{malware_family_guess}</h3>
                <p className="mt-2 text-sm text-gray-400 leading-relaxed">{summary}</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Key Behaviors */}
                <div className="p-4 bg-gray-800 rounded-lg border border-gray-700 space-y-4">
                    <h3 className="text-lg font-semibold text-white border-b border-gray-600 pb-2">关键行为</h3>
                    
                    <div className="flex items-start space-x-3">
                        <FileIcon className="w-5 h-5 text-cyan-400 mt-1 flex-shrink-0" />
                        <div>
                            <h4 className="font-semibold">文件系统</h4>
                            <ul className="list-disc list-inside text-sm text-gray-400 mt-1">
                                {key_behaviors.file_system.map((b, i) => <li key={i}>{b}</li>)}
                            </ul>
                        </div>
                    </div>
                     <div className="flex items-start space-x-3">
                        <RegistryIcon className="w-5 h-5 text-cyan-400 mt-1 flex-shrink-0" />
                        <div>
                            <h4 className="font-semibold">注册表</h4>
                            <ul className="list-disc list-inside text-sm text-gray-400 mt-1">
                                {key_behaviors.registry.map((b, i) => <li key={i}>{b}</li>)}
                            </ul>
                        </div>
                    </div>
                     <div className="flex items-start space-x-3">
                        <NetworkIcon className="w-5 h-5 text-cyan-400 mt-1 flex-shrink-0" />
                        <div>
                            <h4 className="font-semibold">网络</h4>
                            <ul className="list-disc list-inside text-sm text-gray-400 mt-1">
                                {key_behaviors.network.map((b, i) => <li key={i}>{b}</li>)}
                            </ul>
                        </div>
                    </div>
                </div>
                
                {/* Indicators of Compromise */}
                <div className="p-4 bg-gray-800 rounded-lg border border-gray-700 space-y-4">
                    <h3 className="text-lg font-semibold text-white border-b border-gray-600 pb-2">入侵指标 (IOCs)</h3>
                     <IOCList title="文件" items={indicators_of_compromise.files} />
                     <IOCList title="域名" items={indicators_of_compromise.domains} />
                     <IOCList title="IP 地址" items={indicators_of_compromise.ips} />
                     <IOCList title="注册表项" items={indicators_of_compromise.registry_keys} />
                </div>
            </div>

            {/* MITRE ATT&CK Techniques */}
            <div className="p-4 bg-gray-800 rounded-lg border border-gray-700">
                <h3 className="text-lg font-semibold text-white mb-3">MITRE ATT&CK&reg; 技术映射</h3>
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left text-gray-400">
                        <thead className="text-xs text-gray-300 uppercase bg-gray-700/50">
                            <tr>
                                <th scope="col" className="px-4 py-3">ID</th>
                                <th scope="col" className="px-4 py-3">技术名称</th>
                                <th scope="col" className="px-4 py-3">描述</th>
                            </tr>
                        </thead>
                        <tbody>
                            {mitre_attack_techniques.map((tech, index) => (
                                <tr key={index} className="border-b border-gray-700 hover:bg-gray-700/30">
                                    <td className="px-4 py-3 font-mono">
                                        <a 
                                          href={`https://attack.mitre.org/techniques/${tech.technique_id.replace('.', '/')}`} 
                                          target="_blank" 
                                          rel="noopener noreferrer"
                                          className="text-cyan-400 hover:underline"
                                        >
                                            {tech.technique_id}
                                        </a>
                                    </td>
                                    <td className="px-4 py-3 font-semibold text-gray-200">{tech.technique_name}</td>
                                    <td className="px-4 py-3">{tech.description}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default AnalysisDashboard;
