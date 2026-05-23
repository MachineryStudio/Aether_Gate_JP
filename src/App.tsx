import React, { useState, useEffect } from 'react';
import {
  Globe,
  PlusCircle,
  RefreshCw,
  Search,
  Wifi,
  CloudLightning,
  Monitor,
  Activity,
  ArrowRight,
  ShieldAlert,
  HardDrive,
  ExternalLink,
  Laptop
} from 'lucide-react';
import { Device, Language, RouterConfig } from './types';
import { translations } from './translations';
import { LighthouseLogo } from './components/LighthouseLogo';
import { HikariTanChatbot } from './components/HikariTanChatbot';
import { NetworkScanner } from './components/NetworkScanner';
import { SimulatedDesktop } from './components/SimulatedDesktop';
import { InstallGuide } from './components/InstallGuide';

const initialDevices: Device[] = [
  { id: '1', name: 'ROUTER-GATEWAY', ip: '192.168.1.1', mac: 'C0:56:27:01:BC:AA', os: 'RouterOS', status: 'Online', latency: 1, uptime: '72d 12h', agentVersion: 'v6.49' },
  { id: '2', name: 'DESKTOP-PC', ip: '192.168.1.45', mac: 'BC:85:56:D4:FF:67', os: 'Windows', status: 'Online', latency: 4, uptime: '3d 4h', agentVersion: 'v2.4.0' },
  { id: '3', name: 'WORK-LAPTOP', ip: '192.168.1.67', mac: '00:1C:42:F2:12:3C', os: 'macOS', status: 'Online', latency: 12, uptime: '5h 12m', agentVersion: 'v2.3.8' },
  { id: '4', name: 'NAS-SERVER', ip: '192.168.1.99', mac: 'E0:F8:47:AA:91:2B', os: 'Linux', status: 'Offline', latency: undefined, uptime: undefined, agentVersion: 'v2.1.2' },
  { id: '5', name: 'GAMING-RIG', ip: '192.168.1.23', mac: 'D4:3D:7E:15:BB:22', os: 'Windows', status: 'Online', latency: 2, uptime: '12h 44m', agentVersion: 'v2.4.1' },
];

export default function App() {
  const [currentLang, setCurrentLang] = useState<Language>('ja');
  const [devices, setDevices] = useState<Device[]>(initialDevices);
  const [searchQuery, setSearchQuery] = useState('');
  const [isChatOpen, setIsChatOpen] = useState(false);
  
  // Modals view states
  const [isScanning, setIsScanning] = useState(false);
  const [isGuideOpen, setIsGuideOpen] = useState(false);
  const [controlledDevice, setControlledDevice] = useState<Device | null>(null);

  // Router external IP variables
  const [routerConfig, setRouterConfig] = useState<RouterConfig>({
    externalIp: '---',
    upnpStatus: 'Enabled',
    dhcpLeaseCount: 5,
    model: 'MikroTik hEX S'
  });

  // Host Info Panel states
  const [hostInfo, setHostInfo] = useState<any>(null);
  const [isHostInfoLoading, setIsHostInfoLoading] = useState(false);
  const [copiedIp, setCopiedIp] = useState<string | null>(null);

  useEffect(() => {
    setIsHostInfoLoading(true);
    fetch('/api/host-info')
      .then(res => res.json())
      .then(data => {
        setHostInfo(data);
        setIsHostInfoLoading(false);
      })
      .catch(err => {
        console.error('Failed to load host information:', err);
        setIsHostInfoLoading(false);
      });
  }, []);

  // Action listeners from chatbot commands
  const handleActionTriggered = (action: string) => {
    console.log(`[Action Dispatcher] Executing trigger: ${action}`);
    
    if (action === 'RESCAN_LAN') {
      setIsScanning(true);
    } else if (action === 'LIST_HOSTS') {
      // Focus dashboard, highlight list
      setSearchQuery('');
    } else if (action === 'GET_PUBLIC_IP') {
      setRouterConfig(prev => ({
        ...prev,
        externalIp: '203.0.113.14' // Simulated public IP address
      }));
    } else if (action === 'ROUTER_SCAN') {
      // simulate scanning router
      setIsScanning(true);
    } else if (action === 'SHOW_INSTALL_GUIDE') {
      setIsGuideOpen(true);
    } else if (action === 'REFRESH_STATUS') {
      // Refresh status latency numbers
      setDevices(prev =>
        prev.map(d => {
          if (d.status === 'Online') {
            return { ...d, latency: Math.floor(Math.random() * 5) + 2 };
          }
          return d;
        })
      );
    } else if (action === 'SHOW_HELP') {
      setIsGuideOpen(true);
    } else if (action.startsWith('CONTROL:')) {
      const target = action.split(':')[1].toUpperCase();
      const match = devices.find(
        d => d.name.toUpperCase() === target || d.ip === target
      );
      if (match && match.status === 'Online') {
        setControlledDevice(match);
      }
    }
  };

  const handleManualScanComplete = (discovered: Device[]) => {
    setDevices(discovered);
    setRouterConfig(prev => ({
      ...prev,
      dhcpLeaseCount: discovered.length
    }));
    setIsScanning(false);
  };

  // Filter machines based on search string
  const filteredDevices = devices.filter(
    d =>
      d.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      d.ip.includes(searchQuery)
  );

  return (
    <div className="min-h-screen bg-[#F4F9FA] flex flex-col relative overflow-x-hidden font-sans text-slate-800">
      
      {/* Anime floating clouds backgrounds - Styled beautifully with CSS wiggles */}
      <div className="absolute top-16 left-[5%] opacity-[0.14] pointer-events-none select-none z-0">
        <svg viewBox="0 0 100 40" className="w-48 h-auto animate-pulse" fill="#287A9E">
          <path d="M 10 30 Q 30 10, 50 30 Q 70 10, 90 30 Z" />
        </svg>
      </div>
      <div className="absolute top-72 right-[8%] opacity-[0.08] pointer-events-none select-none z-0">
        <svg viewBox="0 0 120 50" className="w-64 h-auto" fill="#287A9E" style={{ animation: 'float 6s ease-in-out infinite' }}>
          <path d="M 15 35 Q 40 10, 65 35 Q 90 10, 115 35 Z" />
        </svg>
      </div>

      {/* Primary header */}
      <header className="bg-white/80 backdrop-blur-md border-b-4 border-[#0F4C81] sticky top-0 z-30 select-none">
        <div className="max-w-7xl mx-auto px-4 py-3 flex flex-col sm:flex-row gap-4 items-center justify-between">
          <LighthouseLogo height={42} />

          {/* Action buttons & language select */}
          <div className="flex flex-wrap items-center gap-3">
            {/* Lang dropdown switcher */}
            <div className="flex items-center gap-1.5 bg-[#E6F7F9] border-2 border-[#0F4C81] rounded-full px-3 py-1 text-xs font-bold text-[#0F4C81] shadow-sm">
              <Globe className="w-3.5 h-3.5" />
              <select
                value={currentLang}
                onChange={e => setCurrentLang(e.target.value as Language)}
                className="bg-transparent outline-none cursor-pointer font-bold border-none"
              >
                <option value="ja">日本語</option>
                <option value="en">English</option>
                <option value="es">Español</option>
                <option value="fr">Français</option>
                <option value="zh">简体中文</option>
              </select>
            </div>

            {/* Install Helper shortcut */}
            <button
              onClick={() => setIsGuideOpen(true)}
              className="flex items-center gap-1.5 bg-[#009FB7] hover:bg-[#00899E] text-white border-2 border-[#09223B] rounded-full px-4 py-1 text-xs font-bold transition-all shadow-sm focus:outline-none"
            >
              <PlusCircle className="w-3.5 h-3.5" />
              <span>{translations[currentLang].installAgent}</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Container Layout */}
      <main className="flex-1 max-w-7xl mx-auto px-4 py-6 w-full grid grid-cols-1 lg:grid-cols-12 gap-6 z-10 relative">
        
        {/* LEFT COMPONENT: Diagnostics, IP Status & Quick Controls (4 Cols) */}
        <div className="lg:col-span-4 flex flex-col gap-6 select-none shrink-0">
          
          {/* LAN Diagnostics Status Board */}
          <div className="bg-[#E6F7F9] border-4 border-[#0F4C81] p-5 rounded-3xl shadow-sm relative overflow-hidden">
            <h3 className="font-sans font-black text-[#0F4C81] text-base mb-4 flex items-center gap-2 uppercase tracking-wide leading-none">
              <Activity className="w-5 h-5 text-[#E52323] animate-pulse" />
              LAN DIAGNOSTICS
            </h3>

            <div className="space-y-4 font-mono text-xs">
              <div className="flex justify-between items-center border-b border-[#0F4C81]/15 pb-2">
                <span className="text-slate-600 font-sans font-semibold">Active Hosts</span>
                <span className="text-[#0F4C81] font-bold text-sm">
                  {devices.filter(d => d.status === 'Online').length} / {devices.length}
                </span>
              </div>

              <div className="flex justify-between items-center border-b border-[#0F4C81]/15 pb-2">
                <span className="text-slate-600 font-sans font-semibold">UPnP Status</span>
                <span className="bg-emerald-100 text-emerald-800 border border-emerald-500/30 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase">
                  {routerConfig.upnpStatus}
                </span>
              </div>

              <div className="flex justify-between items-center border-b border-[#0F4C81]/15 pb-2">
                <span className="text-slate-600 font-sans font-semibold">Public WAN IP</span>
                <span className="text-slate-800 font-bold transition-all">
                  {routerConfig.externalIp}
                </span>
              </div>

              <div className="flex justify-between items-center pb-1">
                <span className="text-slate-600 font-sans font-semibold">Gateway Switch</span>
                <span className="text-slate-800 font-bold">{routerConfig.model}</span>
              </div>
            </div>

            {/* Quick Action cluster buttons */}
            <div className="mt-5 grid grid-cols-2 gap-2 text-center">
              <button
                onClick={() => setIsScanning(true)}
                className="flex items-center justify-center gap-1.5 py-2 bg-white border-2 border-[#0F4C81] text-[#0F4C81] hover:bg-[#D4F1F5] font-sans font-bold text-[11px] rounded-full transition-all focus:outline-none"
              >
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                <span>{translations[currentLang].rescanLan}</span>
              </button>
              <button
                onClick={() => handleActionTriggered('GET_PUBLIC_IP')}
                className="flex items-center justify-center gap-1 py-2 bg-[#0F4C81] hover:bg-[#1D3B5C] border-2 border-[#09223B] text-white font-sans font-bold text-[11px] rounded-full transition-all focus:outline-none"
              >
                <Wifi className="w-3.5 h-3.5" />
                <span>{translations[currentLang].scanRouter}</span>
              </button>
            </div>
          </div>

          {/* Current Host / Server IP Panel */}
          <div className="bg-white border-4 border-[#0F4C81] p-5 rounded-3xl shadow-sm relative overflow-hidden" id="host-ip-panel">
            <div className="absolute top-0 right-0 w-12 h-12 bg-[#E6F7F9] rounded-bl-3xl flex items-center justify-center border-l-2 border-b-2 border-[#0F4C81]/20 select-none">
              <Globe className="w-4 h-4 text-[#009FB7]" />
            </div>

            <h3 className="font-sans font-black text-[#0F4C81] text-xs mb-3.5 uppercase tracking-wide flex items-center gap-1.5 leading-none select-none">
              <HardDrive className="w-4 h-4 text-[#0F4C81]" />
              {currentLang === 'ja' ? '接続ホスト IP 情報' : 'CURRENT HOST IP INFO'}
            </h3>

            {isHostInfoLoading ? (
              <div className="flex flex-col items-center gap-2 py-6 justify-center">
                <RefreshCw className="w-5 h-5 text-[#009FB7] animate-spin" />
                <span className="text-[10px] text-slate-400 font-mono tracking-wider">RETRIEVING ADAPTERS...</span>
              </div>
            ) : hostInfo ? (
              <div className="space-y-3.5">
                {/* Target/Server hostname */}
                <div className="bg-[#F4F9FA] rounded-2xl p-3 border border-[#0F4C81]/10 select-none">
                  <div className="flex justify-between items-center text-[10px] sm:text-xs font-mono mb-1.5 text-slate-500">
                    <span>{currentLang === 'ja' ? 'ホスト名:' : 'Hostname:'}</span>
                    <span className="text-[#0F4C81] font-bold truncate max-w-[150px]">{hostInfo.hostname}</span>
                  </div>
                  <div className="flex justify-between items-center text-[10px] sm:text-xs font-mono text-slate-500">
                    <span>{currentLang === 'ja' ? 'システム型:' : 'OS Type:'}</span>
                    <span className="text-slate-700 capitalize font-medium">{hostInfo.platform} ({hostInfo.arch})</span>
                  </div>
                </div>

                {/* Primary Host IPs listing */}
                <div>
                  <h4 className="text-[9px] font-black uppercase text-[#287A9E] mb-2 tracking-wider select-none">
                    {currentLang === 'ja' ? 'ネットワークアダプター IP 一覧' : 'NETWORK INTERFACE IPS'}
                  </h4>
                  <div className="max-h-[140px] overflow-y-auto space-y-1.5 pr-0.5 custom-scrollbar">
                    {hostInfo.addresses && hostInfo.addresses.filter((addr: any) => !addr.internal && addr.family === 'IPv4').slice(0, 5).map((addr: any, idx: number) => (
                      <div key={idx} className="flex items-center justify-between bg-slate-50 border border-slate-100 hover:border-[#0F4C81]/30 p-2 rounded-xl text-xs transition-all">
                        <span className="font-mono text-[9px] bg-[#E6F7F9] text-[#0F4C81] border border-[#0F4C81]/20 px-1.5 py-0.5 rounded font-bold truncate max-w-[70px]" title={addr.name}>
                          {addr.name}
                        </span>
                        <div className="flex items-center gap-1.5">
                          <span className="font-mono font-bold text-slate-800">{addr.ip}</span>
                          <button
                            onClick={() => {
                              navigator.clipboard.writeText(addr.ip);
                              setCopiedIp(addr.ip);
                              setTimeout(() => setCopiedIp(null), 1500);
                            }}
                            title="Copy IP"
                            className="p-1 hover:bg-[#E6F7F9] text-slate-400 hover:text-[#0F4C81] rounded-lg transition-all"
                          >
                            {copiedIp === addr.ip ? (
                              <span className="text-[8px] font-extrabold text-emerald-600 bg-emerald-50 px-1 py-0.5 rounded">COPIED</span>
                            ) : (
                              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
                              </svg>
                            )}
                          </button>
                        </div>
                      </div>
                    ))}

                    {/* Fallback local server standard if none external */}
                    {(!hostInfo.addresses || hostInfo.addresses.filter((addr: any) => !addr.internal && addr.family === 'IPv4').length === 0) && (
                      <div className="flex items-center justify-between bg-zinc-50 p-2 rounded-xl text-xs border border-zinc-100 select-none">
                        <span className="font-mono text-[9px] bg-zinc-100 text-zinc-600 px-1.5 py-0.5 rounded font-bold">
                          localhost
                        </span>
                        <span className="font-mono text-slate-700">127.0.0.1</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Your connected remote client IP */}
                <div className="pt-2.5 border-t border-slate-100 flex items-center justify-between text-xs select-none">
                  <span className="text-slate-500 font-semibold">
                    {currentLang === 'ja' ? '接続元クライアント IP:' : 'Client Remote IP:'}
                  </span>
                  <span className="font-mono font-extrabold text-[#0D4B80] bg-[#E6F7F9] border border-[#0F4C81]/10 px-2.5 py-1 rounded-full text-[11px]">
                    {hostInfo.clientIp || '127.0.0.1'}
                  </span>
                </div>
              </div>
            ) : (
              <div className="text-xs text-rose-500 text-center py-2 select-none">
                {currentLang === 'ja' ? 'IP情報の取得に失敗しました' : 'Failed to query host IP metrics'}
              </div>
            )}
          </div>

          {/* Setup Python walkthrough prompt */}
          <div className="bg-white border-4 border-slate-300 p-5 rounded-3xl relative overflow-hidden bg-gradient-to-br from-white to-[#F4F9FA]">
            <CloudLightning className="w-8 h-8 text-[#009FB7] mb-2" />
            <h4 className="font-sans font-black text-sm text-[#0F4C81] uppercase tracking-wide">
              {currentLang === 'ja' ? '⚡️ ローカルでPCを登録する' : '⚡️ ENROLL REAL PC AGENTS'}
            </h4>
            <p className="font-sans text-xs text-slate-600 leading-normal mt-1 mb-4 font-medium">
              {currentLang === 'ja'
                ? 'Pythonエージェントをダウンロード＆実行するだけで、このダッシュボードに自動追加して、目の前で本物のリモートが動きます！'
                : 'Run our small PyAutoGUI Python agent locally on your laptop to mirror target keyboard operations automatically.'}
            </p>
            <button
              onClick={() => setIsGuideOpen(true)}
              className="text-xs font-sans font-bold text-[#0F4C81] hover:text-[#009FB7] flex items-center gap-1 transition-colors"
            >
              <span>{translations[currentLang].guideTitle}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* RIGHT COMPONENT: Host List Dashboard View (8 Cols) */}
        <div className="lg:col-span-8 flex flex-col gap-6">
          
          {/* Header & Filter Search line */}
          <div className="flex flex-col sm:flex-row gap-4 items-center justify-between select-none">
            <div>
              <h1 className="font-sans font-black text-2xl text-[#0F4C81] leading-none tracking-tight">
                遠天神 / AetherGate
              </h1>
              <p className="text-xs text-slate-500 font-sans font-medium mt-1">
                {translations[currentLang].subtitle}
              </p>
            </div>

            {/* Filter Input search form */}
            <div className="relative w-full sm:w-72">
              <input
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder={translations[currentLang].searchPlaceholder}
                className="w-full text-xs sm:text-sm pl-9 pr-4 py-2 border-2 border-[#0F4C81] rounded-full outline-none focus:bg-white bg-[#E6F7F9]/40 font-medium transition-all"
              />
              <Search className="absolute left-3 top-2.5 w-4 h-4 text-[#0F4C81] pointer-events-none" />
            </div>
          </div>

          {/* Grid loop of Equipment Cards */}
          <div id="lan-equipment-grid" className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredDevices.map(device => {
              const matchesOs = device.os;
              const isOnline = device.status === 'Online';

              return (
                <div
                  key={device.id}
                  className={`bg-white border-4 rounded-3xl p-5 shadow-sm transition-all flex flex-col justify-between ${
                    isOnline
                      ? 'border-[#0F4C81] hover:shadow-md hover:translate-y-[-2px]'
                      : 'border-slate-200 opacity-60'
                  }`}
                  style={{ borderRadius: '24px' }}
                >
                  <div>
                    {/* Upper Meta line: OS type, Name */}
                    <div className="flex justify-between items-start mb-3 select-none">
                      <div className="flex items-center gap-2.5">
                        <div className="p-2 bg-[#E6F7F9] rounded-xl text-[#0F4C81] border border-[#0F4C81]/30">
                          <Laptop className="w-4 h-4" />
                        </div>
                        <div>
                          <h4 className="font-sans font-black text-sm text-[#0a2540] tracking-tight truncate max-w-[140px]">
                            {device.name}
                          </h4>
                          <span className="font-mono text-[9px] text-[#287A9E] leading-none">
                            {device.os} • {device.agentVersion || 'None'}
                          </span>
                        </div>
                      </div>

                      {/* Status indicator badge */}
                      <span
                        className={`font-sans font-extrabold text-[9px] px-2.5 py-0.5 rounded-full uppercase tracking-wider flex items-center gap-1 border ${
                          isOnline
                            ? 'bg-emerald-50 text-emerald-800 border-emerald-400'
                            : 'bg-slate-50 text-slate-500 border-slate-300'
                        }`}
                      >
                        <span className={`w-1.5 h-1.5 rounded-full ${isOnline ? 'bg-emerald-500 animate-pulse' : 'bg-slate-400'}`} />
                        {isOnline ? translations[currentLang].statusOnline : translations[currentLang].statusOffline}
                      </span>
                    </div>

                    {/* Tech details panel */}
                    <div className="space-y-1.5 border-t border-slate-100 pt-3 select-none">
                      <div className="flex justify-between text-[11px] font-mono text-slate-500">
                        <span>IP:</span>
                        <span className="text-slate-800 font-semibold">{device.ip}</span>
                      </div>
                      <div className="flex justify-between text-[11px] font-mono text-slate-500">
                        <span>MAC:</span>
                        <span className="text-slate-800">{device.mac}</span>
                      </div>
                      {isOnline && (
                        <>
                          <div className="flex justify-between text-[11px] font-mono text-slate-500">
                            <span>{translations[currentLang].latency}:</span>
                            <span className="text-emerald-600 font-medium">~{device.latency}ms</span>
                          </div>
                          <div className="flex justify-between text-[11px] font-mono text-slate-500">
                            <span>{translations[currentLang].uptime}:</span>
                            <span className="text-slate-800">{device.uptime}</span>
                          </div>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Remote access trigger button */}
                  <div className="mt-5 select-none text-center">
                    {isOnline ? (
                      <button
                        onClick={() => setControlledDevice(device)}
                        className="w-full flex items-center justify-center gap-1.5 py-2 hover:bg-[#00899E] bg-[#009FB7] border-2 border-[#09223B] text-white font-sans font-black text-xs rounded-full transition-all shadow focus:outline-none cursor-pointer"
                      >
                        <Monitor className="w-4 h-4" />
                        <span>{translations[currentLang].btnControl}</span>
                      </button>
                    ) : (
                      <button
                        disabled
                        className="w-full py-2 bg-slate-100 border-2 border-slate-200 text-slate-400 font-sans font-bold text-xs rounded-full cursor-not-allowed uppercase"
                      >
                        {translations[currentLang].btnOffline}
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* In case no results are filtered */}
          {filteredDevices.length === 0 && (
            <div className="bg-white border-4 border-dashed border-slate-300 px-5 py-12 rounded-3xl text-center select-none">
              <p className="text-slate-400 text-xs sm:text-sm font-sans font-semibold italic">
                {currentLang === 'ja' ? '該当するホストが見つかりません。' : 'No LAN hosts matching filters.'}
              </p>
            </div>
          )}

          {/* DHCP list footer message block info */}
          <div className="bg-[#E6F7F9]/40 border-2 border-[#0F4C81]/30 p-4 rounded-2xl flex items-center gap-3 select-none">
            <Wifi className="w-5 h-5 text-[#0F4C81] shrink-0" />
            <p className="font-mono text-[10px] sm:text-xs text-[#287A9E] leading-snug">
              {translations[currentLang].routerScanLabel.replace('{count}', filteredDevices.length.toString())}
            </p>
          </div>
        </div>
      </main>

      {/* Floating Animated Character (Hikari-tan UI overlay) */}
      <HikariTanChatbot
        currentLang={currentLang}
        onActionTriggered={handleActionTriggered}
        isChatOpen={isChatOpen}
        setIsChatOpen={setIsChatOpen}
      />

      {/* 2. Scanning Progress Modal */}
      {isScanning && (
        <NetworkScanner
          currentLang={currentLang}
          onScanComplete={handleManualScanComplete}
          onClose={() => setIsScanning(false)}
        />
      )}

      {/* 3. Simulated Remote Screen Overlay */}
      {controlledDevice && (
        <SimulatedDesktop
          device={controlledDevice}
          currentLang={currentLang}
          onClose={() => setControlledDevice(null)}
        />
      )}

      {/* 4. Instructions Guide Window */}
      {isGuideOpen && (
        <InstallGuide
          currentLang={currentLang}
          onClose={() => setIsGuideOpen(false)}
        />
      )}

      <footer className="bg-slate-900 border-t-4 border-slate-950 py-5 text-center text-slate-400 text-[10px] font-mono mt-12 select-none">
        <p>© 2026 LIGHTHOUSE 橋 - PROTOTYPE SOFTWARE PIPELINE</p>
        <p className="mt-1 opacity-70">AetherGate: 遠天神マウス v2.4.0 (Japanese-English / Spanish / French / Mandarin Ready)</p>
      </footer>
    </div>
  );
}
