import React, { useState, useEffect, useRef } from 'react';
import { Camera, Monitor, X, Play, RefreshCw, Send, Terminal, FileText, Palette, Rocket, Loader2 } from 'lucide-react';
import { Device, Language } from '../types';

interface SimulatedDesktopProps {
  device: Device;
  currentLang: Language;
  onClose: () => void;
}

type ActiveApp = 'paint' | 'lander' | 'terminal' | 'files' | null;

export const SimulatedDesktop: React.FC<SimulatedDesktopProps> = ({ device, currentLang, onClose }) => {
  const [activeApp, setActiveApp] = useState<ActiveApp>('paint');
  const [latency, setLatency] = useState(device.latency || 4);
  const [isFullscreen, setIsFullscreen] = useState(false);

  // 1. Paint App States
  const [isDrawing, setIsDrawing] = useState(false);
  const [brushColor, setBrushColor] = useState('#E52323');
  const [brushSize, setBrushSize] = useState(4);
  const paintCanvasRef = useRef<HTMLCanvasElement>(null);

  // 2. Retro Lander Game States
  const landerCanvasRef = useRef<HTMLCanvasElement>(null);
  const [landerPos, setLanderPos] = useState({ x: 120, y: 30, vx: 0, vy: 0 });
  const [landerState, setLanderState] = useState<'flying' | 'landed' | 'crashed'>('flying');
  const [fuel, setFuel] = useState(100);
  const landerPosRef = useRef({ x: 120, y: 30, vx: 0, vy: 0 });

  // 3. Simulated Terminal States
  const [terminalLines, setTerminalLines] = useState<string[]>([
    `AetherGate Remote Terminal v2.4.0 (${device.os})`,
    `Connected to target machine at ${device.ip}:3000 via WebRTC Secure Stream.`,
    `Type 'help' to locate active agent operations.`,
    ''
  ]);
  const [terminalInput, setTerminalInput] = useState('');
  const terminalBottomRef = useRef<HTMLDivElement>(null);

  // 4. Live PC Agent WebSocket Session States
  const [isRealMode, setIsRealMode] = useState(false);
  const [wsUrl, setWsUrl] = useState(`ws://${device.ip === '192.168.1.45' || device.ip === '127.0.0.1' ? '127.0.0.1' : device.ip}:3001`);
  const [wsStatus, setWsStatus] = useState<'disconnected' | 'connecting' | 'connected' | 'error'>('disconnected');
  const [frameUrl, setFrameUrl] = useState<string | null>(null);
  const [typedChars, setTypedChars] = useState<string[]>([]);
  const wsRef = useRef<WebSocket | null>(null);

  // Live WebSocket Connection Loop
  useEffect(() => {
    if (!isRealMode) {
      if (wsRef.current) {
        wsRef.current.close();
      }
      return;
    }

    setWsStatus('connecting');
    let requestFrameTimeout: any;

    console.log(`[WebSocket Manager] Dialing: ${wsUrl}`);
    const ws = new WebSocket(wsUrl);
    ws.binaryType = 'blob';
    wsRef.current = ws;

    ws.onopen = () => {
      console.log('[WebSocket Manager] Connected to remote agent successfully!');
      setWsStatus('connected');
      ws.send('screenshot');
    };

    ws.onmessage = (event) => {
      if (event.data instanceof Blob) {
        const url = URL.createObjectURL(event.data);
        setFrameUrl(prev => {
          if (prev) URL.revokeObjectURL(prev);
          return url;
        });

        requestFrameTimeout = setTimeout(() => {
          if (ws.readyState === WebSocket.OPEN) {
            ws.send('screenshot');
          }
        }, 120);
      }
    };

    ws.onerror = (err) => {
      console.error('[WebSocket Manager] Connection error:', err);
      setWsStatus('error');
    };

    ws.onclose = () => {
      console.log('[WebSocket Manager] Connection closed.');
      setWsStatus('disconnected');
      setFrameUrl(null);
    };

    return () => {
      clearTimeout(requestFrameTimeout);
      if (wsRef.current) {
        wsRef.current.close();
      }
      if (frameUrl) {
        URL.revokeObjectURL(frameUrl);
      }
    };
  }, [isRealMode, wsUrl]);

  // Handle click coordinates and map to standard 1920x1080 resolution for PyAutoGUI
  const handleLiveInteraction = (e: React.MouseEvent<HTMLDivElement>, actionType: 'move' | 'click') => {
    if (wsStatus !== 'connected' || !wsRef.current) return;
    const rect = e.currentTarget.getBoundingClientRect();
    
    const clickX = Math.round(((e.clientX - rect.left) / rect.width) * 1920);
    const clickY = Math.round(((e.clientY - rect.top) / rect.height) * 1080);

    if (actionType === 'move') {
      wsRef.current.send(`mouse_move:${clickX},${clickY}`);
    } else if (actionType === 'click') {
      wsRef.current.send(`mouse_move:${clickX},${clickY}`);
      setTimeout(() => {
        if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
          wsRef.current.send(`mouse_click:left`);
        }
      }, 50);
    }
  };

  const sendLiveKey = (key: string) => {
    if (wsStatus === 'connected' && wsRef.current) {
      wsRef.current.send(`key_press:${key}`);
      setTypedChars(p => [...p.slice(-15), key]);
    }
  };

  // Jitter remote latency simulation
  useEffect(() => {
    const latInterval = setInterval(() => {
      setLatency(prev => {
        const delta = Math.floor(Math.random() * 3) - 1;
        return Math.max(1, prev + delta);
      });
    }, 2000);
    return () => clearInterval(latInterval);
  }, []);

  // Setup Paint App on loading/switching
  useEffect(() => {
    if (activeApp === 'paint' && paintCanvasRef.current) {
      const canvas = paintCanvasRef.current;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.fillStyle = '#FFFFFF';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        // Draw welcome grid on remote canvas
        ctx.strokeStyle = 'rgba(15, 76, 129, 0.15)';
        ctx.lineWidth = 1;
        for (let i = 0; i < canvas.width; i += 20) {
          ctx.beginPath();
          ctx.moveTo(i, 0);
          ctx.lineTo(i, canvas.height);
          ctx.stroke();
        }
        for (let j = 0; j < canvas.height; j += 20) {
          ctx.beginPath();
          ctx.moveTo(0, j);
          ctx.lineTo(canvas.width, j);
          ctx.stroke();
        }
      }
    }
  }, [activeApp]);

  // Paint handlers
  const handlePaintStart = (e: React.MouseEvent<HTMLCanvasElement>) => {
    setIsDrawing(true);
    drawOnCanvas(e);
  };
  const handlePaintEnd = () => {
    setIsDrawing(false);
    if (paintCanvasRef.current) {
      const ctx = paintCanvasRef.current.getContext('2d');
      ctx?.beginPath();
    }
  };
  const drawOnCanvas = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing || !paintCanvasRef.current) return;
    const canvas = paintCanvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * canvas.width;
    const y = ((e.clientY - rect.top) / rect.height) * canvas.height;

    ctx.lineWidth = brushSize;
    ctx.lineCap = 'round';
    ctx.strokeStyle = brushColor;

    ctx.lineTo(x, y);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(x, y);
  };

  const clearPaintCanvas = () => {
    if (paintCanvasRef.current) {
      const canvas = paintCanvasRef.current;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.fillStyle = '#FFFFFF';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
      }
    }
  };

  // 4. Retro Lander Physics Game Engine
  useEffect(() => {
    if (activeApp !== 'lander') return;
    landerPosRef.current = { x: 120, y: 30, vx: 0, vy: 0 };
    setLanderState('flying');
    setLanderPos({ x: 120, y: 30, vx: 0, vy: 0 });
    setFuel(100);

    const canvas = landerCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;
    const updatePhysics = () => {
      const gravity = 0.05;
      const current = landerPosRef.current;

      if (landerState === 'flying') {
        const nextVy = current.vy + gravity;
        const nextY = current.y + nextVy;
        const nextX = current.x + current.vx;

        // Check ground hit
        const groundY = 170;
        if (nextY >= groundY) {
          // Check collision speeds
          const safeLandingSpeed = 1.2;
          const padLeft = 80;
          const padRight = 160;

          if (nextX >= padLeft && nextX <= padRight && Math.abs(nextVy) <= safeLandingSpeed) {
            setLanderState('landed');
            landerPosRef.current = { x: nextX, y: groundY, vx: 0, vy: 0 };
          } else {
            setLanderState('crashed');
            landerPosRef.current = { x: nextX, y: groundY, vx: 0, vy: 0 };
          }
        } else {
          landerPosRef.current = {
            x: Math.max(10, Math.min(230, nextX)),
            y: nextY,
            vx: current.vx * 0.98,
            vy: nextVy
          };
        }
      }

      setLanderPos({ ...landerPosRef.current });

      // Draw game loop
      ctx.fillStyle = '#0F2027';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Stars
      ctx.fillStyle = '#FFF';
      ctx.fillRect(100, 20, 1.5, 1.5);
      ctx.fillRect(20, 70, 1.5, 1.5);
      ctx.fillRect(200, 80, 1.5, 1.5);
      ctx.fillRect(150, 120, 1.5, 1.5);

      // Draw landscape waves
      ctx.fillStyle = '#203A43';
      ctx.beginPath();
      ctx.moveTo(0, 180);
      ctx.quadraticCurveTo(50, 160, 80, 180);
      ctx.lineTo(80, 200);
      ctx.lineTo(0, 200);
      ctx.fill();

      ctx.beginPath();
      ctx.moveTo(160, 180);
      ctx.quadraticCurveTo(200, 150, 250, 180);
      ctx.lineTo(250, 200);
      ctx.lineTo(160, 200);
      ctx.fill();

      // Flat ocean landing pad
      ctx.fillStyle = '#00C9FF';
      ctx.fillRect(80, 178, 80, 6);
      ctx.fillStyle = '#FFF';
      ctx.font = '7px monospace';
      ctx.fillText('LAND HERE', 105, 192);

      // Draw lander module
      const rx = landerPosRef.current.x;
      const ry = landerPosRef.current.y;

      ctx.fillStyle = '#89E2FA';
      ctx.beginPath();
      // Capsule
      ctx.arc(rx, ry - 4, 6, 0, Math.PI * 2);
      ctx.fill();
      // Base frame
      ctx.fillStyle = '#A7BFE8';
      ctx.fillRect(rx - 8, ry - 2, 16, 4);
      // Leg lines
      ctx.strokeStyle = '#FFFFFF';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(rx - 6, ry);
      ctx.lineTo(rx - 10, ry + 6);
      ctx.moveTo(rx + 6, ry);
      ctx.lineTo(rx + 10, ry + 6);
      ctx.stroke();

      animId = requestAnimationFrame(updatePhysics);
    };

    animId = requestAnimationFrame(updatePhysics);
    return () => cancelAnimationFrame(animId);
  }, [activeApp, landerState]);

  const handleLanderThrust = (dir: 'up' | 'left' | 'right') => {
    if (landerState !== 'flying' || fuel <= 0) return;
    const current = landerPosRef.current;
    
    setFuel(f => Math.max(0, f - 4));
    
    if (dir === 'up') {
      landerPosRef.current.vy -= 0.6;
    } else if (dir === 'left') {
      landerPosRef.current.vx -= 0.3;
    } else if (dir === 'right') {
      landerPosRef.current.vx += 0.3;
    }
  };

  const handleResetLander = () => {
    landerPosRef.current = { x: 120, y: 20, vx: 0, vy: 0 };
    setFuel(100);
    setLanderState('flying');
  };

  // 5. Terminal inputs interpreter
  const handleTerminalSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const query = terminalInput.trim().toLowerCase();
    setTerminalInput('');

    if (!query) return;

    setTerminalLines(prev => [...prev, `user@aethergate:~$ ${query}`]);

    setTimeout(() => {
      let answers: string[] = [];
      if (query === 'help') {
        answers = [
          'Available diagnostics tools:',
          '  neofetch       Identify simulated computer hardware specs.',
          '  ping <ip>      Measure round-trip host latency.',
          '  ls             List direct directory folder holdings.',
          '  matrix         Activate visual digital rain matrix.',
          '  clear          Clear the scroll window context.',
        ];
      } else if (query === 'neofetch') {
        answers = [
          '   ,_,   AetherGate OS v2.4',
          '  (o,o)  ------------------',
          '  ({_})  OS: Aether OS (Japanese Linux x86_64)',
          '   "-"   Uptime: ' + (device.uptime || '12 hours'),
          '         CPU: Intel Xeon Broadwell E5 @ 2.40GHz',
          '         Memory: 16GB ECC DDR4 SDRAM',
          '         Broadcaster Agent: Port 3000 (websockets)',
        ];
      } else if (query.startsWith('ping')) {
        answers = [
          `PING ${device.ip} (56 bytes of data)`,
          `64 bytes from ${device.ip}: icmp_seq=1 ttl=64 time=${latency} ms`,
          `64 bytes from ${device.ip}: icmp_seq=2 ttl=64 time=${latency + 1} ms`,
          `--- ${device.ip} ping statistics ---`,
          '2 packets transmitted, 2 received, 0% packet loss',
        ];
      } else if (query === 'ls') {
        answers = [
          'agent.py      config.json     neofetch.sh',
          'readme.md     pictures/       build/',
        ];
      } else if (query === 'clear') {
        setTerminalLines([]);
        return;
      } else if (query === 'matrix') {
        answers = [
          '1001010100111000101110101010100',
          '0110101010110101000101110101010',
          '1011110101101101010111010110011',
          '0010101101111111111010110101001',
          'THE MATRIX REVEALED IN ETERU MAUSU'
        ];
      } else {
        answers = [`sh: command not found: '${query}'. Type 'help' for diagnostics.`];
      }

      setTerminalLines(prev => [...prev, ...answers, '']);
    }, 150);
  };

  useEffect(() => {
    terminalBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [terminalLines]);

  return (
    <div className="fixed inset-0 bg-slate-900 z-40 flex flex-col overflow-hidden">
      {/* Upper WebRTC Connection Quality Bar */}
      <div className="bg-[#0F4C81] border-b-4 border-slate-950 px-4 py-3 flex text-white justify-between items-center select-none shrink-0">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <span className="flex h-3 w-3 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#89E2FA] opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-[#E6F7F9]"></span>
            </span>
            <span className="font-sans font-black text-xs uppercase tracking-wider">
              {currentLang === 'ja' ? '遠隔制御セッション' : 'Active Remote Control Session'}
            </span>
          </div>

          <div className="hidden sm:flex items-center gap-1.5 bg-[#1B354C] px-2.5 py-0.5 border border-white/20 rounded-full font-mono text-[10px]">
            <Monitor className="w-3 h-3 text-[#79D2EC]" />
            <span>
              {device.name} ({device.ip})
            </span>
          </div>
        </div>

        {/* Quality Metadata indicators */}
        <div className="flex items-center gap-4">
          <div className="flex gap-4 text-xs font-mono">
            <div>
              <span className="text-[10px] text-sky-200 uppercase tracking-widest block leading-none">
                PROTOCOL
              </span>
              <span className="font-bold text-sky-50">WebRTC H.264</span>
            </div>
            <div>
              <span className="text-[10px] text-sky-200 uppercase tracking-widest block leading-none">
                {currentLang === 'ja' ? '遅延時間' : 'LATENCY'}
              </span>
              <span className="font-bold text-emerald-400">{latency} ms</span>
            </div>
            <div className="hidden sm:block">
              <span className="text-[10px] text-sky-200 uppercase tracking-widest block leading-none">
                FPS OUTPUT
              </span>
              <span className="font-bold">60.0 FPS</span>
            </div>
          </div>

          <button
            onClick={onClose}
            className="flex items-center gap-1 bg-[#E52323] hover:bg-red-700 text-white text-xs font-sans font-bold px-3.5 py-1.5 rounded-full border-2 border-slate-900 transition-all shadow-md focus:outline-none"
          >
            <X className="w-3.5 h-3.5" />
            <span>{currentLang === 'ja' ? '切断する' : 'Disconnect'}</span>
          </button>
        </div>
      </div>

      {/* Main Remote Viewport (Simulated monitor space) */}
      <div className="flex-1 bg-slate-950 p-4 sm:p-6 flex items-center justify-center relative overscroll-none overflow-hidden select-none">
        {/* Animated grid skyline for background wallpaper */}
        <div
          className="absolute inset-0 opacity-40 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(121,210,236,0.15),rgba(255,255,255,0))]"
          style={{
            backgroundImage: "url('data:image/svg+xml,%3Csvg width=\"30\" height=\"30\" viewBox=\"0 0 30 30\" fill=\"none\" xmlns=\"http://www.w3.org/2000/svg\"%3E%3Cpath d=\"M0 0h30v30H0z\" fill=\"none\"/%3E%3Cpath d=\"M30 0H0v30\" stroke=\"rgba(15,76,129,0.15)\" stroke-width=\"1\"/%3E%3C/svg%3E')"
          }}
        />

        {/* The Mock OS Desktop Workspace Container */}
        <div
          className="relative w-full max-w-4xl aspect-video bg-[#0D3043] border-8 border-slate-800 rounded-3xl flex flex-col shadow-2xl relative overflow-hidden select-none animate-in fade-in zoom-in-95 duration-300"
          style={{
            backgroundImage: "linear-gradient(135deg, #09203F 0%, #537895 100%)",
          }}
        >
          {/* Animated decorative clouds sliding across the virtual desktop wallpaper (Japanese ocean style!) */}
          <div className="absolute top-12 left-5 opacity-10 animate-pulse pointer-events-none">
            <svg viewBox="0 0 100 40" className="w-24 h-auto" fill="#FFFFFF">
              <path d="M 10 30 Q 30 10, 50 30 Q 70 10, 90 30 Z" />
            </svg>
          </div>
          <div className="absolute top-24 right-10 opacity-5 pointer-events-none">
            <svg viewBox="0 0 100 40" className="w-36 h-auto" fill="#FFFFFF">
              <path d="M 20 30 Q 40 10, 60 30 Q 80 10, 100 30 Z" />
            </svg>
          </div>

          {/* Workspace Tab Bar */}
          <div className="bg-slate-900/95 border-b border-white/10 px-4 py-1.5 flex items-center justify-between shrink-0 select-none z-10">
            <div className="flex gap-2">
              <button
                onClick={() => setIsRealMode(false)}
                className={`font-sans font-bold text-[10px] px-3.5 py-1 rounded-full border transition-all ${
                  !isRealMode
                    ? 'bg-[#E6F7F9] border-[#0F4C81] text-[#0F4C81] shadow'
                    : 'bg-slate-800 border-white/10 text-slate-300 hover:text-white'
                }`}
              >
                🌸 DEMO WORKSPACE (SIMULATOR)
              </button>
              <button
                onClick={() => setIsRealMode(true)}
                className={`font-sans font-bold text-[10px] px-3.5 py-1 rounded-full border transition-all flex items-center gap-1 ${
                  isRealMode
                    ? 'bg-emerald-500 border-emerald-600 text-white shadow'
                    : 'bg-slate-800 border-white/10 text-slate-300 hover:text-white'
                }`}
              >
                📡 LIVE LAN SESSION (CONNECT REAL PC)
              </button>
            </div>

            <div className="font-mono text-[9px] text-[#79D2EC]">
              {isRealMode ? '🔴 REAL AGENT ACTIVE BRIDGE' : '✨ LOCAL OS SANDBOX'}
            </div>
          </div>

          {isRealMode ? (
            <div className="flex-1 p-3 flex flex-col overflow-hidden z-10">
              {/* Live Connection Configuration Bar */}
              <div className="bg-slate-950/85 border-2 border-[#0F4C81] p-2.5 rounded-xl flex flex-wrap gap-3 items-center justify-between text-xs text-sans font-medium mb-3 shrink-0">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-[10px] text-slate-400">WS GATEWAY:</span>
                  <input
                    type="text"
                    value={wsUrl}
                    onChange={(e) => setWsUrl(e.target.value)}
                    disabled={wsStatus === 'connected' || wsStatus === 'connecting'}
                    className="font-mono text-[11px] bg-slate-900 border border-white/10 hover:border-sky-500 rounded px-2 py-1 outline-none text-emerald-400 w-48 disabled:opacity-60"
                  />
                  
                  {wsStatus === 'disconnected' && (
                    <button
                      onClick={() => {
                        // Re-trigger connecting effect
                        const cur = wsUrl;
                        setWsUrl('');
                        setTimeout(() => setWsUrl(cur), 5);
                      }}
                      className="bg-[#009FB7] hover:bg-[#007F94] text-white px-3 py-1 rounded font-bold font-sans text-[10px] transition-colors"
                    >
                      Connect
                    </button>
                  )}
                  {wsStatus === 'connecting' && (
                    <span className="text-amber-400 font-mono text-[10px] animate-pulse">Connecting...</span>
                  )}
                  {wsStatus === 'connected' && (
                    <button
                      onClick={() => {
                        if (wsRef.current) wsRef.current.close();
                      }}
                      className="bg-rose-600 hover:bg-rose-700 text-white px-3 py-1 rounded font-bold font-sans text-[10px] transition-colors"
                    >
                      Disconnect
                    </button>
                  )}
                  {wsStatus === 'error' && (
                    <div className="flex items-center gap-1.5">
                      <span className="text-rose-400 font-mono text-[10px] uppercase font-bold">Unreachable</span>
                      <button
                        onClick={() => {
                          const originalUrl = wsUrl;
                          setWsUrl('');
                          setTimeout(() => setWsUrl(originalUrl), 10);
                        }}
                        className="bg-amber-600 hover:bg-amber-700 text-white px-2 py-0.5 rounded text-[9px] transition-colors"
                      >
                        Retry
                      </button>
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-2 text-[10px]">
                  <span className="text-slate-400">AGENT PORT DECAY:</span>
                  <span className="font-mono font-bold text-orange-400 bg-orange-950/40 px-1.5 py-0.5 rounded border border-orange-500/20">3001</span>
                  
                  <span className="flex items-center gap-1">
                    <span className={`w-2 h-2 rounded-full ${
                      wsStatus === 'connected' ? 'bg-emerald-500 animate-ping' :
                      wsStatus === 'connecting' ? 'bg-amber-400 animate-pulse' :
                      wsStatus === 'error' ? 'bg-red-500' : 'bg-slate-400'
                    }`} />
                    <span className="font-mono text-slate-300 capitalize text-[10px]">{wsStatus}</span>
                  </span>
                </div>
              </div>

              {/* Main screen area or helpful connect panel */}
              {wsStatus !== 'connected' ? (
                <div className="flex-1 border-4 border-dashed border-[#0F4C81]/30 rounded-2xl flex flex-col justify-center items-center p-6 text-center text-slate-300">
                  <Monitor className="w-12 h-12 text-[#287A9E] mb-2.5 animate-bounce" />
                  <h3 className="font-sans font-black text-sm uppercase text-[#79D2EC] tracking-wide mb-1">
                    Ready to Connect Real PC Agent
                  </h3>
                  <p className="max-w-md text-xs text-slate-400 leading-relaxed mb-3">
                    Ensure your target host is running <code className="bg-slate-950 px-1 py-0.5 rounded text-emerald-400 text-[10px]">python agent.py</code> with <span className="text-amber-300 font-bold">PORT = 3001</span>.
                  </p>
                  
                  {window.location.protocol === 'https:' && (
                    <div className="max-w-md bg-amber-950/40 border border-amber-600/30 rounded-xl p-3 text-left">
                      <p className="text-[10px] text-amber-300 leading-normal">
                        ⚠️ <strong>Mixed Content Restriction:</strong> Your browser blocks connections from secure pages (HTTPS) to local LAN addresses (<code className="bg-slate-900/50 px-1 rounded text-orange-400">ws://</code>). To bypass this, launch your AetherGate frontend locally via <code className="bg-slate-900/50 px-1 rounded text-white font-mono">http://127.0.0.1:3000</code> or run a local secure web proxy.
                      </p>
                    </div>
                  )}
                  
                  <div className="mt-4 flex gap-2">
                    <button
                      onClick={() => {
                        setIsRealMode(false);
                      }}
                      className="bg-slate-800 hover:bg-slate-700 text-slate-300 font-sans font-bold text-[10px] px-4 py-1.5 rounded-full transition-all"
                    >
                      ← Back to Simulator
                    </button>
                    {wsStatus !== 'connecting' && (
                      <button
                        onClick={() => {
                          const currentUrl = wsUrl;
                          setIsRealMode(false);
                          setTimeout(() => {
                            setIsRealMode(true);
                          }, 10);
                        }}
                        className="bg-[#009FB7] hover:bg-[#007F94] text-white font-sans font-bold text-[10px] px-4 py-1.5 rounded-full transition-all flex items-center gap-1"
                      >
                        ⚡ Connect Now
                      </button>
                    )}
                  </div>
                </div>
              ) : (
                <div className="flex-1 flex gap-3 h-full overflow-hidden">
                  {/* Real Stream View Container */}
                  <div className="flex-1 bg-black border-2 border-[#0F4C81] rounded-2xl relative overflow-hidden flex flex-col items-center justify-center">
                    {frameUrl ? (
                      <div 
                        onMouseDown={(e) => handleLiveInteraction(e, 'click')}
                        className="relative cursor-crosshair w-full h-full flex items-center justify-center bg-zinc-950"
                        title="Click to interact with host desktop"
                      >
                        <img
                          src={frameUrl}
                          alt="Real PC Agent Desktop Screen"
                          referrerPolicy="no-referrer"
                          className="max-w-full max-h-full object-contain select-none"
                          draggable={false}
                        />
                        <div className="absolute top-2 right-2 bg-black/60 backdrop-blur border border-white/20 px-2 py-0.5 rounded font-mono text-[8px] text-emerald-400 tracking-wider">
                          LIVE STREAM (1920x1080 RENDERED)
                        </div>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center text-center p-4">
                        <Loader2 className="w-8 h-8 text-emerald-400 animate-spin mb-2" />
                        <span className="font-mono text-[10px] text-slate-400">Fetching first frame buffer output...</span>
                      </div>
                    )}
                  </div>

                  {/* Keyboard input / typing helper side panel */}
                  <div className="w-48 bg-slate-950/80 border-2 border-[#0F4C81]/50 rounded-2xl p-2.5 flex flex-col justify-between shrink-0 select-none">
                    <div>
                      <h4 className="font-sans font-black text-[9px] uppercase tracking-wider text-[#79D2EC] border-b border-white/10 pb-1.5 mb-2">
                        ⌨️ Keyboard Bridge
                      </h4>
                      
                      {/* Live text catcher */}
                      <div className="bg-slate-900 border border-white/10 rounded-lg p-2 mb-2">
                        <span className="font-sans text-[8px] uppercase font-bold text-[#287A9E] block mb-1">
                          Type characters here:
                        </span>
                        <input
                          type="text"
                          placeholder="Type keys..."
                          onKeyDown={(e) => {
                            let keyToSend = e.key;
                            if (keyToSend === ' ') keyToSend = 'space';
                            else if (keyToSend === 'Control') keyToSend = 'ctrl';
                            else if (keyToSend === 'Escape') keyToSend = 'esc';
                            else if (keyToSend === 'ArrowUp') keyToSend = 'up';
                            else if (keyToSend === 'ArrowDown') keyToSend = 'down';
                            else if (keyToSend === 'ArrowLeft') keyToSend = 'left';
                            else if (keyToSend === 'ArrowRight') keyToSend = 'right';
                            
                            sendLiveKey(keyToSend.toLowerCase());
                          }}
                          className="w-full text-[10px] font-mono bg-slate-950 rounded border border-white/10 px-1.5 py-0.5 text-white outline-none focus:border-sky-400"
                        />
                      </div>

                      {/* Keystrokes log */}
                      <div className="mb-2">
                        <span className="font-sans text-[8px] uppercase font-bold text-[#287A9E] block mb-1">
                          Sent Keystrokes Log
                        </span>
                        <div className="bg-slate-900/50 rounded p-1.5 font-mono text-[9px] text-[#A6C49A] h-10 overflow-hidden leading-tight border border-white/5">
                          {typedChars.length > 0 ? typedChars.join(' » ') : '(none sent)'}
                        </div>
                      </div>

                      {/* Quick Command Keypad */}
                      <div>
                        <span className="font-sans text-[8px] uppercase font-bold text-[#287A9E] block mb-1.5">
                          Virtual Keys
                        </span>
                        <div className="grid grid-cols-2 gap-1 font-mono text-[10px] select-none">
                          {['win', 'enter', 'space', 'tab', 'backspace', 'esc', 'up', 'down'].map((k) => (
                            <button
                              key={k}
                              onClick={() => sendLiveKey(k)}
                              className="bg-slate-800 hover:bg-slate-700 active:bg-[#009FB7] border border-white/10 text-white rounded py-0.5 px-1 hover:border-sky-400 text-[9px] font-bold text-center capitalize"
                            >
                              {k}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>

                    <div className="text-[8px] text-slate-400 leading-normal border-t border-white/10 pt-2 text-center">
                      Mapped to PyAutoGUI.
                    </div>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="flex-1 p-4 grid grid-cols-1 md:grid-cols-4 gap-4 relative overflow-hidden z-10">
              {/* LEFT RAIL: Desktop Icons / Shortcuts */}
              <div className="flex flex-row md:flex-col gap-3 justify-center md:justify-start">
                {/* Paint App button */}
                <button
                  onClick={() => setActiveApp('paint')}
                  className={`flex items-center gap-2 p-2.5 rounded-xl border-2 transition-all group ${
                    activeApp === 'paint'
                      ? 'bg-[#E6F7F9] border-[#0F4C81] text-[#0F4C81] shadow-md'
                      : 'bg-white/80 border-slate-300 text-slate-700 hover:bg-white hover:border-[#0F4C81]'
                  }`}
                >
                  <Palette className="w-5 h-5 text-amber-500 group-hover:scale-110 transition-transform" />
                  <span className="font-sans font-bold text-xs select-none">DrawPaint App</span>
                </button>

                {/* Game App button */}
                <button
                  onClick={() => setActiveApp('lander')}
                  className={`flex items-center gap-2 p-2.5 rounded-xl border-2 transition-all group ${
                    activeApp === 'lander'
                      ? 'bg-[#E6F7F9] border-[#0F4C81] text-[#0F4C81] shadow-md'
                      : 'bg-white/80 border-slate-300 text-slate-700 hover:bg-white hover:border-[#0F4C81]'
                  }`}
                >
                  <Rocket className="w-5 h-5 text-rose-500 group-hover:scale-110 transition-transform" />
                  <span className="font-sans font-bold text-xs select-none">Retro Lander</span>
                </button>

                {/* Diagnostic Terminal App button */}
                <button
                  onClick={() => setActiveApp('terminal')}
                  className={`flex items-center gap-2 p-2.5 rounded-xl border-2 transition-all group ${
                    activeApp === 'terminal'
                      ? 'bg-[#E6F7F9] border-[#0F4C81] text-[#0F4C81] shadow-md'
                      : 'bg-white/80 border-slate-300 text-slate-700 hover:bg-white hover:border-[#0F4C81]'
                  }`}
                >
                  <Terminal className="w-5 h-5 text-emerald-600 group-hover:scale-110 transition-transform" />
                  <span className="font-sans font-bold text-xs select-none">Interactive Shell</span>
                </button>
              </div>

              {/* RIGHT WORKPLACE CONTENT: Embedded interactive App display frame */}
              <div className="md:col-span-3 flex items-center justify-center p-1">
                {activeApp === 'paint' && (
                  <div className="bg-white/95 border-4 border-[#0F4C81] w-full max-w-[440px] rounded-2xl overflow-hidden shadow-lg flex flex-col">
                    <div className="bg-[#E6F7F9] px-4 py-2 border-b-2 border-[#0F4C81] flex justify-between select-none items-center">
                      <span className="text-xs font-sans font-black text-[#0F4C81] tracking-wide uppercase">
                        🎨 DrawPaint Canvas
                      </span>
                      <span className="text-[9px] font-mono font-black italic bg-amber-200 text-amber-900 px-1.5 py-0.5 rounded">
                        Live Input Node
                      </span>
                    </div>

                    <div className="p-3 bg-[#F4F9FA] flex-1 flex flex-col space-y-3">
                      {/* Brush color selector */}
                      <div className="flex items-center justify-between gap-1">
                        <div className="flex gap-1.5">
                          {['#E52323', '#009FB7', '#22C55E', '#111111', '#FF9F1C'].map(c => (
                            <button
                              key={c}
                              onClick={() => setBrushColor(c)}
                              className="w-5 h-5 rounded-full border-2 border-white cursor-pointer shadow transform hover:scale-110 transition-transform"
                              style={{ backgroundColor: c, ringColor: brushColor === c ? '#0F4C81' : '' }}
                            />
                          ))}
                        </div>
                        <button
                          onClick={clearPaintCanvas}
                          className="text-[10px] font-sans font-bold bg-white border border-[#E52323] text-[#E52323] hover:bg-red-50 px-2 py-1 rounded"
                        >
                          Reset Canvas
                        </button>
                      </div>

                      <canvas
                         ref={paintCanvasRef}
                         width={410}
                         height={200}
                         onMouseDown={handlePaintStart}
                         onMouseUp={handlePaintEnd}
                         onMouseLeave={handlePaintEnd}
                         onMouseMove={drawOnCanvas}
                         className="bg-white border-2 border-slate-300 rounded-lg cursor-crosshair w-full aspect-[2/1] shadow-inner"
                      />
                      <p className="font-mono text-[9px] text-[#4A607A] leading-normal text-center select-none">
                        Drag cursor to draft drawings. Mouse position inputs are mirrored directly back onto LAN.
                      </p>
                    </div>
                  </div>
                )}

                {activeApp === 'lander' && (
                  <div className="bg-slate-900 border-4 border-[#0F4C81] w-full max-w-[420px] rounded-2xl overflow-hidden shadow-lg flex flex-col">
                    <div className="bg-slate-800 px-4 py-2 border-b-2 border-[#0F4C81] flex justify-between select-none items-center text-white">
                      <span className="text-xs font-sans font-black tracking-wide uppercase text-sky-300">
                        🚀 Retro Space Lander
                      </span>
                      <span className="text-[9px] font-mono uppercase bg-rose-500/30 text-rose-300 px-2 rounded-full border border-rose-500/30">
                        Physics Engine demo
                      </span>
                    </div>

                    <div className="p-4 flex flex-col items-center gap-3">
                      <canvas
                        ref={landerCanvasRef}
                        width={240}
                        height={200}
                        className="border-2 border-slate-700 bg-[#0F2027] rounded-lg"
                      />

                      {/* HUD readouts */}
                      <div className="w-full flex justify-between text-[10px] text-slate-300 font-mono">
                        <span>FUEL: {fuel}%</span>
                        <span>SPEED (Y): {landerPos.vy.toFixed(1)} m/s</span>
                        <span className={landerState === 'landed' ? 'text-emerald-400 font-bold' : landerState === 'crashed' ? 'text-red-400 font-bold' : 'text-slate-400'}>
                          {landerState.toUpperCase()}
                        </span>
                      </div>

                      {/* Game Controls */}
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleLanderThrust('left')}
                          disabled={landerState !== 'flying'}
                          className="px-2.5 py-1.5 bg-slate-700 text-white font-mono text-xs rounded border border-slate-600 hover:bg-slate-600 active:translate-y-0.5"
                        >
                          ◀
                        </button>
                        <button
                          onClick={() => handleLanderThrust('up')}
                          disabled={landerState !== 'flying'}
                          className="px-4 py-1.5 bg-sky-600 text-white font-mono text-xs font-bold rounded-lg border border-sky-500 hover:bg-sky-500 active:translate-y-0.5"
                        >
                          🚀 THRUST
                        </button>
                        <button
                          onClick={() => handleLanderThrust('right')}
                          disabled={landerState !== 'flying'}
                          className="px-2.5 py-1.5 bg-slate-700 text-white font-mono text-xs rounded border border-slate-600 hover:bg-slate-600 active:translate-y-0.5"
                        >
                          ▶
                        </button>
                        <button
                          onClick={handleResetLander}
                          className="px-2.5 py-1.5 bg-red-800 text-red-200 font-mono text-xs rounded border border-red-700 hover:bg-red-700 active:translate-y-0.5"
                        >
                          RESTART
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {activeApp === 'terminal' && (
                  <div className="bg-[#1D2226] border-4 border-[#0F4C81] w-full max-w-[460px] rounded-2xl overflow-hidden shadow-lg flex flex-col text-slate-200">
                    <div className="bg-[#12161A] px-4 py-2 border-b-2 border-[#0F4C81] flex justify-between select-none items-center">
                      <span className="text-xs font-mono font-bold text-sky-400 flex items-center gap-1">
                        <Terminal className="w-3.5 h-3.5 inline text-emerald-400" />
                        Aether OS Unix Terminal
                      </span>
                      <span className="text-[8px] font-mono font-bold bg-[#1B354C] border border-white/10 px-2 rounded text-sky-100">
                        Interactive Shell
                      </span>
                    </div>

                    {/* Terminal stdout scroll pane */}
                    <div className="p-3 bg-[#0E1215] h-[180px] overflow-y-auto font-mono text-[9px] text-[#A6C49A] space-y-1">
                      {terminalLines.map((line, ix) => (
                        <p key={ix} className="whitespace-pre-wrap select-text leading-tight">
                          {line}
                        </p>
                      ))}
                      <div ref={terminalBottomRef} />
                    </div>

                    {/* Terminal Input strip */}
                    <form
                      onSubmit={handleTerminalSubmit}
                      className="flex bg-[#12161A] border-t-2 border-[#0F4C81]/40 px-3 py-1.5 gap-2 items-center"
                    >
                      <span className="font-mono text-[10px] text-sky-400 select-none">
                        $
                      </span>
                      <input
                        type="text"
                        value={terminalInput}
                        onChange={e => setTerminalInput(e.target.value)}
                        placeholder="Type 'help' to diagnostic hosts, or 'neofetch'..."
                        className="flex-1 font-mono text-[10px] bg-transparent outline-none border-none text-white placeholder-slate-500"
                      />
                      <button type="submit">
                        <Send className="w-3 h-3 text-[#79D2EC]" />
                      </button>
                    </form>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Lower Desktop Windows taskbar */}
          <div className="bg-[#E6F7F9] border-t-4 border-[#0F4C81] select-none h-11 px-4 flex items-center justify-between select-none shrink-0 z-10">
            {/* Start logotype */}
            <div className="flex items-center gap-2">
              <span className="font-sans font-black text-xs text-[#0F4C81] border-2 border-[#0F4C81] rounded-lg px-2 py-0.5 leading-none bg-white">
                遠 AETHER
              </span>
            </div>

            {/* Simulated Desktop System Hour clock */}
            <div className="font-mono text-[10px] bg-white border-2 border-[#0F4C81] text-[#0F4C81] px-3.5 py-0.5 rounded-full font-bold">
              🕒 2026-05-23 17:45 (UTC)
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
