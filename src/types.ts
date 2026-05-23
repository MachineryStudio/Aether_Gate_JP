export interface Device {
  id: string;
  name: string;
  ip: string;
  mac: string;
  os: 'Windows' | 'macOS' | 'Linux' | 'RouterOS' | 'Mobile';
  status: 'Online' | 'Offline';
  latency?: number;
  uptime?: string;
  agentVersion?: string;
}

export type Language = 'ja' | 'en' | 'es' | 'fr' | 'zh';

export interface ChatMessage {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  translatedText?: string;
  timestamp: Date;
  actionsTriggered?: string[];
}

export interface RouterConfig {
  externalIp: string;
  upnpStatus: 'Enabled' | 'Disabled';
  dhcpLeaseCount: number;
  model: string;
}
