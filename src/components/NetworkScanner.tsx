import React, { useState, useEffect } from 'react';
import { Search, Loader2 } from 'lucide-react';
import { Device, Language } from '../types';

interface NetworkScannerProps {
  currentLang: Language;
  onScanComplete: (devices: Device[]) => void;
  onClose: () => void;
}

export const NetworkScanner: React.FC<NetworkScannerProps> = ({ currentLang, onScanComplete, onClose }) => {
  const [currentIp, setCurrentIp] = useState('192.168.1.0');
  const [percent, setPercent] = useState(0);
  const [probeLog, setProbeLog] = useState<string[]>([]);
  const [foundDeviceNames, setFoundDeviceNames] = useState<string[]>([]);

  const mockDiscoveries: { ip: string; name: string; mac: string; os: Device['os']; ver: string }[] = [
    { ip: '192.168.1.1', name: 'ROUTER-GATEWAY', mac: 'C0:56:27:01:BC:AA', os: 'RouterOS', ver: 'v6.49' },
    { ip: '192.168.1.23', name: 'GAMING-RIG', mac: 'D4:3D:7E:15:BB:22', os: 'Windows', ver: 'v2.4.1' },
    { ip: '192.168.1.45', name: 'DESKTOP-PC', mac: 'BC:85:56:D4:FF:67', os: 'Windows', ver: 'v2.4.0' },
    { ip: '192.168.1.67', name: 'WORK-LAPTOP', mac: '00:1C:42:F2:12:3C', os: 'macOS', ver: 'v2.3.8' },
    { ip: '192.168.1.110', name: 'SMART-TV', mac: '78:BD:BC:3E:45:90', os: 'Mobile', ver: 'v1.0.4' },
  ];

  useEffect(() => {
    let index = 0;
    const interval = setInterval(() => {
      if (index <= 254) {
        const ip = `192.168.1.${index}`;
        setCurrentIp(ip);
        setPercent(Math.floor((index / 254) * 100));

        // Check if device matches
        const found = mockDiscoveries.find(d => d.ip === ip);
        if (found) {
          setFoundDeviceNames(p => [...p, `${found.name} (${found.ip})`]);
          setProbeLog(p => [
            `[ARP SCAN] Found host at ${ip} (${found.os}): MAC: ${found.mac}`,
            `[AETHER] Enrolled as AetherGate Host on port 3000...`,
            ...p
          ]);
        } else {
          // generic ping log
          if (index % 12 === 0) {
            setProbeLog(p => [`[PING] probing 192.168.1.${index}... no response`, ...p]);
          }
        }
        index += 3; // jump fast for good user experience
      } else {
        clearInterval(interval);
        setPercent(100);
        setCurrentIp('192.168.1.254');
        setTimeout(() => {
          // return full devices
          const resolved: Device[] = [
            { id: '1', name: 'ROUTER-GATEWAY', ip: '192.168.1.1', mac: 'C0:56:27:01:BC:AA', os: 'RouterOS', status: 'Online', latency: 1, uptime: '72d 12h', agentVersion: 'v6.49' },
            { id: '2', name: 'DESKTOP-PC', ip: '192.168.1.45', mac: 'BC:85:56:D4:FF:67', os: 'Windows', status: 'Online', latency: 4, uptime: '3d 4h', agentVersion: 'v2.4.0' },
            { id: '3', name: 'WORK-LAPTOP', ip: '192.168.1.67', mac: '00:1C:42:F2:12:3C', os: 'macOS', status: 'Online', latency: 12, uptime: '5h 12m', agentVersion: 'v2.3.8' },
            { id: '4', name: 'NAS-SERVER', ip: '192.168.1.99', mac: 'E0:F8:47:AA:91:2B', os: 'Linux', status: 'Offline', latency: undefined, uptime: undefined, agentVersion: 'v2.1.2' },
            { id: '5', name: 'GAMING-RIG', ip: '192.168.1.23', mac: 'D4:3D:7E:15:BB:22', os: 'Windows', status: 'Online', latency: 2, uptime: '12h 44m', agentVersion: 'v2.4.1' },
            { id: '6', name: 'SMART-TV', ip: '192.168.1.110', mac: '78:BD:BC:3E:45:90', os: 'Mobile', status: 'Online', latency: 18, uptime: '1d 1h', agentVersion: 'v1.0.4' },
          ];
          onScanComplete(resolved);
        }, 800);
      }
    }, 45);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="fixed inset-0 bg-[#0F4C81]/40 backdrop-blur-md z-50 flex items-center justify-center p-4">
      {/* Scanner Modal styled with cute anime edges */}
      <div
        className="bg-white border-4 border-[#0F4C81] w-full max-w-[550px] shadow-2xl flex flex-col overflow-hidden animate-in zoom-in-95 duration-150"
        style={{ borderRadius: '24px' }}
      >
        {/* Banner with ocean styling */}
        <div className="bg-[#E6F7F9] p-5 border-b-4 border-[#0F4C81] text-center relative overflow-hidden">
          {/* Animated decorative radar circle */}
          <div className="absolute inset-x-0 -bottom-12 flex justify-center opacity-10">
            <div className="w-32 h-32 border-4 border-[#0F4C81] rounded-full animate-ping" />
          </div>
          
          <Search className="w-10 h-10 mx-auto text-[#0F4C81] animate-bounce mb-2" />
          <h2 className="font-sans font-black text-lg text-[#0F4C81] uppercase tracking-wide">
            {currentLang === 'ja' ? '🏮 ネットワークをスキャン中' : '🏮 LAN ARP Rescan in Progress'}
          </h2>
          <p className="font-mono text-xs text-[#287A9E] mt-1">
            ARP Broadcasts {percent}% Complete
          </p>
        </div>

        {/* Scan Status Area */}
        <div className="p-5 flex-1 space-y-4">
          {/* Circular Progress & current IP */}
          <div className="flex items-center gap-4 bg-[#F4F9FA] p-3.5 border-2 border-[#0F4C81]/30 rounded-2xl">
            <Loader2 className="w-8 h-8 text-[#0F4C81] animate-spin shrink-0" />
            <div>
              <span className="text-[10px] uppercase font-mono font-bold tracking-wider text-[#287A9E]">
                Scanning Range
              </span>
              <p className="font-mono text-[#0F4C81] text-lg font-bold">{currentIp}/24</p>
            </div>
          </div>

          {/* List of Found devices so far */}
          <div>
            <h4 className="text-xs font-sans font-bold text-[#0F4C81] mb-2 uppercase tracking-wide">
              {currentLang === 'ja' ? `検出されたデバイス (${foundDeviceNames.length}台)` : `Discovered Hosts (${foundDeviceNames.length})`}
            </h4>
            <div className="flex flex-wrap gap-1.5 max-h-[85px] overflow-y-auto">
              {foundDeviceNames.map((name, i) => (
                <span
                  key={i}
                  className="bg-emerald-50 border border-emerald-500 text-emerald-800 text-[10px] font-mono font-bold px-2.5 py-1 rounded-full animate-bounce"
                >
                  🟢 {name}
                </span>
              ))}
              {foundDeviceNames.length === 0 && (
                <span className="text-slate-400 font-sans text-xs italic">
                  {currentLang === 'ja' ? 'ホスト探索中...' : 'Sniffing LAN broadcasts...'}
                </span>
              )}
            </div>
          </div>

          {/* Logs panel console */}
          <div>
            <h4 className="text-xs font-sans font-bold text-[#0F4C81] mb-2 uppercase tracking-wide">
              Terminal Trace
            </h4>
            <div className="bg-[#1D2D3D] text-emerald-400 border-2 border-[#0F4C81] h-[110px] font-mono text-[10px] p-2.5 overflow-y-auto rounded-xl space-y-1 scrollbar-thin select-none">
              {probeLog.map((log, index) => (
                <p key={index} className="leading-normal">
                  {log}
                </p>
              ))}
              <p className="animate-pulse font-bold text-slate-300">
                $ sudo arp-scan --localnet -I eth0...
              </p>
            </div>
          </div>
        </div>

        {/* Footer info loader */}
        <div className="bg-[#E6F7F9]/35 px-4 py-3 border-t border-[#0F4C81]/20 flex justify-between items-center bg-white px-5 py-4">
          <div className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />
            <span className="text-[10px] font-sans font-bold text-[#4A607A]">
              mDNS broadcast discovery on
            </span>
          </div>
          <button
            onClick={onClose}
            className="text-xs font-sans font-bold border-2 border-[#E52323] text-[#E52323] hover:bg-red-50 px-3 py-1 rounded-full transition-all"
          >
            {currentLang === 'ja' ? 'キャンセル' : 'Abort'}
          </button>
        </div>
      </div>
    </div>
  );
};
