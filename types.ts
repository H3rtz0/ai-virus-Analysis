// Fix: Import React to resolve 'Cannot find namespace React' error.
import React from 'react';

export interface AnalysisResult {
  malware_family_guess: string;
  summary: string;
  key_behaviors: {
    file_system: string[];
    registry: string[];
    network: string[];
  };
  mitre_attack_techniques: {
    technique_id: string;
    technique_name: string;
    description: string;
  }[];
  indicators_of_compromise: {
    files: string[];
    domains: string[];
    ips: string[];
    registry_keys: string[];
  };
}

export interface GuideStepContent {
    title: string;
    description: string;
    icon: React.ReactNode;
}