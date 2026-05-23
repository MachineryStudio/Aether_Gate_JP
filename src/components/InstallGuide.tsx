import React, { useState } from 'react';
import { Copy, Check, Download, FileCode, CheckCircle2 } from 'lucide-react';
import { Language } from '../types';
import { translations } from '../translations';

interface InstallGuideProps {
  currentLang: Language;
  onClose: () => void;
}

export const InstallGuide: React.FC<InstallGuideProps> = ({ currentLang, onClose }) => {
  const [activeTab, setActiveTab] = useState<'agent' | 'discover'>('agent');
  const [copied, setCopied] = useState(false);

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const agentCode = `import asyncio
import websockets
import pyautogui
import io
import http
from PIL import Image

# AetherGate Host Agent v2.4.0
# Requires: pip install pyautogui websockets pillow opencv-python

PORT = 3001

async def process_request(*args):
    # Support both old websockets (path, headers) and new websockets (connection, request)
    if len(args) < 2:
        return None
    
    second_arg = args[1]
    if hasattr(second_arg, "headers"):
        headers_obj = second_arg.headers
    else:
        headers_obj = second_arg

    upgrade_header = ""
    if hasattr(headers_obj, "get"):
        upgrade_header = headers_obj.get("Upgrade", "")
    elif isinstance(headers_obj, dict):
        upgrade_header = headers_obj.get("Upgrade", "")

    # Intercept non-websocket HTTP requests gracefully
    if "upgrade" not in upgrade_header.lower():
        headers_to_send = [
            ("Content-Type", "text/html; charset=utf-8"),
            ("Connection", "close"),
        ]
        body = """<!DOCTYPE html>
<html>
<head>
    <title>AetherGate Host Agent</title>
    <style>
        body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; background: #F4F9FA; color: #0F4C81; display: flex; align-items: center; justify-content: center; height: 100vh; margin: 0; }
        .card { background: white; margin: auto; padding: 2.5rem; border-radius: 24px; box-shadow: 0 15px 35px rgba(15,76,129,0.1); border: 4px solid #0F4C81; max-width: 420px; text-align: center; }
        h1 { font-size: 1.6rem; margin-top: 0; font-weight: 800; }
        p { color: #4A5568; font-size: 0.9rem; line-height: 1.6; margin: 0.8rem 0; }
        .badge { background: #E6F7F9; border: 2px solid #0F4C81; color: #0F4C81; font-weight: bold; padding: 4px 14px; border-radius: 99px; display: inline-block; font-size: 0.75rem; margin-bottom: 1.2rem; }
    </style>
</head>
<body>
    <div class="card">
        <div class="badge">🟢 AGENT STATUS: ACTIVE</div>
        <h1>📡 AetherGate Host Agent</h1>
        <p>Awesome! Your AetherGate background agent is running successfully on your machine and listening on Port 3001.</p>
        <p>Since this is a dedicated WebSocket portal, standard browser views are intercepted. Everything is working correctly!</p>
        <div style="margin-top: 1.5rem; padding: 1rem; background: #FFF8E6; border: 2.5px dashed #D97706; border-radius: 12px; text-align: left; font-size: 0.8rem; color: #78350F;">
            <strong style="color: #B45309; display: block; margin-bottom: 0.4rem;">🔑 Where is the Dashboard?</strong>
            The screen you see here is served by your active python back-end agent. To open the main management dashboard:<br><br>
            1. Ensure this <code style="background: #FEF3C7; padding: 2px 4px; border-radius: 4px; font-family: monospace;">agent.py</code> is set to run on Port 3001 (<code style="font-weight: bold;">PORT = 3001</code>) so Port 3000 is free.<br>
            2. Run your React frontend app locally on Port 3000 (<code style="background: #FEF3C7; padding: 2px 4px; border-radius: 4px; font-family: monospace;">npm run dev</code>).<br>
            3. Open <a href="http://127.0.0.1:3000" style="color: #0F4C81; font-weight: bold; text-decoration: underline;">http://127.0.0.1:3000</a> in a browser tab.<br>
            4. In the dashboard, click the blue <strong>"Remote Control"</strong> button on one of the online devices to trigger the live session toggle!
        </div>
    </div>
</body>
</html>""".encode("utf-8")
        import sys
        Response = None
        for mod_name in ["websockets.asyncio.server", "websockets.server", "websockets.http11", "websockets.http"]:
            if mod_name in sys.modules:
                mod = sys.modules[mod_name]
                if hasattr(mod, "Response"):
                    Response = getattr(mod, "Response")
                    break
        if Response is None:
            try:
                from websockets.http11 import Response
            except ImportError:
                pass

        if Response is not None:
            Headers = None
            for mod_name in ["websockets.datastructures", "websockets.http11", "websockets.http", "websockets.server"]:
                if mod_name in sys.modules:
                    mod = sys.modules[mod_name]
                    if hasattr(mod, "Headers"):
                        Headers = getattr(mod, "Headers")
                        break
            if Headers is None:
                try:
                    from websockets.datastructures import Headers
                except ImportError:
                    pass

            try:
                h = Headers(headers_to_send) if Headers is not None else headers_to_send
            except Exception:
                h = headers_to_send

            return Response(
                status_code=http.HTTPStatus.OK,
                reason_phrase="OK",
                headers=h,
                body=body
            )
        return http.HTTPStatus.OK, headers_to_send, body
    return None

async def handle_controller(websocket, path):
    print(f"[+] Controller connected from {websocket.remote_address}")
    try:
        async for message in websocket:
            if message == "screenshot":
                # Capture target desktop screen frame
                screen = pyautogui.screenshot()
                img_byte_arr = io.BytesIO()
                screen.save(img_byte_arr, format='JPEG', quality=65)
                # Dispatch raw byte binary back to WebRTC controller
                await websocket.send(img_byte_arr.getvalue())
                
            elif message.startswith("mouse_move:"):
                # Parse: "mouse_move:x,y"
                coords = message.split(":")[1].split(",")
                x, y = int(coords[0]), int(coords[1])
                pyautogui.moveTo(x, y)
                
            elif message.startswith("mouse_click:"):
                # Parse: "mouse_click:left" or "right"
                btn = message.split(":")[1]
                pyautogui.click(button=btn)
                
            elif message.startswith("key_press:"):
                # Key stroke command sequence
                key = message.split(":")[1]
                pyautogui.press(key)
    except Exception as e:
        print(f"[-] Remote session terminated: {e}")

async def start_server():
    print(f"[*] Starting AetherGate Host Agent on Port {PORT}...")
    server = await websockets.serve(
        handle_controller, 
        "0.0.0.0", 
        PORT, 
        process_request=process_request
    )
    await server.wait_closed()

if __name__ == "__main__":
    asyncio.run(start_server())
`;

  const discoverCode = `import socket
import time
import threading

# AetherGate mDNS/UDP Discovery Beacon
# Enables zero-config hostname lookup inside your LAN

DISCOVERY_PORT = 3001
UDP_BROADCAST_IP = "255.255.255.255"

def start_discovery_beacon():
    # Socket listens for controller UDP request
    sock = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
    sock.setsockopt(socket.SOL_SOCKET, socket.SO_REUSEADDR, 1)
    sock.bind(("0.0.0.0", DISCOVERY_PORT))
    
    print(f"[*] AetherGate network beacon listening on UDP Port {DISCOVERY_PORT}")
    
    while True:
        data, addr = sock.recvfrom(1024)
        if data == b"AETHERGATE_DISCOVERY":
            hostname = socket.gethostname()
            response = f"AETHERGATE_BEACON:{hostname}:{socket.gethostbyname(hostname)}"
            
            # Send hostname details directly back to controller
            sock.sendto(response.encode(), addr)
            print(f"[+] Responded to network scan scan request from {addr}")

if __name__ == "__main__":
    t = threading.Thread(target=start_discovery_beacon, daemon=True)
    t.start()
    while True:
        time.sleep(1)
`;

  const activeCode = activeTab === 'agent' ? agentCode : discoverCode;

  return (
    <div className="fixed inset-0 bg-[#0F4C81]/40 backdrop-blur-md z-40 flex items-center justify-center p-4">
      {/* Animestyled Board containing setup tabs */}
      <div
        className="bg-white border-4 border-[#0F4C81] w-full max-w-[620px] h-[550px] flex flex-col shadow-2xl overflow-hidden animate-in zoom-in-95 duration-150"
        style={{ borderRadius: '24px' }}
      >
        {/* Banner */}
        <div className="bg-[#E6F7F9] p-5 border-b-4 border-[#0F4C81] select-none text-center">
          <FileCode className="w-10 h-10 mx-auto text-[#0F4C81] mb-1.5" />
          <h2 className="font-sans font-black text-base text-[#0F4C81] uppercase tracking-wide">
            {translations[currentLang].guideTitle}
          </h2>
          <p className="text-xs text-[#287A9E] mt-1">
            {translations[currentLang].guideSub}
          </p>
        </div>

        {/* Action Steps walkthrough list */}
        <div className="p-4 border-b border-[#0F4C81]/15 leading-relaxed bg-[#F4F9FA]/60 text-slate-700 text-xs text-sans font-medium space-y-1.5">
          {translations[currentLang].guideSteps.map((step, idx) => (
            <div key={idx} className="flex gap-2">
              <CheckCircle2 className="w-4 h-4 text-[#009FB7] shrink-0" />
              <span>{step}</span>
            </div>
          ))}
        </div>

        {/* Source File tabs inside Code container */}
        <div className="flex-1 flex flex-col overflow-hidden bg-slate-900 border-b-4 border-[#0F4C81]">
          <div className="bg-slate-950 px-4 py-2 flex items-center justify-between border-b border-white/10 select-none">
            <div className="flex gap-2.5">
              <button
                onClick={() => setActiveTab('agent')}
                className={`font-mono text-[10px] font-bold px-2.5 py-1 rounded transition-colors ${
                  activeTab === 'agent' ? 'bg-[#0F4C81] text-white' : 'text-slate-400 hover:text-white'
                }`}
              >
                💾 agent.py
              </button>
              <button
                onClick={() => setActiveTab('discover')}
                className={`font-mono text-[10px] font-bold px-2.5 py-1 rounded transition-colors ${
                  activeTab === 'discover' ? 'bg-[#0F4C81] text-white' : 'text-slate-400 hover:text-white'
                }`}
              >
                📡 discover.py
              </button>
            </div>

            {/* Quick Actions (Copy / Download dummy) */}
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => copyToClipboard(activeCode)}
                className="flex items-center gap-1 font-sans text-[10px] font-bold text-slate-300 hover:text-white bg-slate-800 border border-white/10 px-2.5 py-1 rounded transition-all"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? 'Copied' : 'Copy Code'}</span>
              </button>
            </div>
          </div>

          {/* Raw Code listing syntax pre */}
          <div className="flex-1 overflow-auto p-4 font-mono text-[11px] text-emerald-400 select-text leading-relaxed">
            <pre className="whitespace-pre">{activeCode}</pre>
          </div>
        </div>

        {/* Close footer button */}
        <div className="px-5 py-3 flex bg-white justify-end shadow-inner select-none">
          <button
            onClick={onClose}
            className="bg-[#0F4C81] hover:bg-[#1D3B5C] border-2 border-[#09223B] text-white font-sans font-bold text-xs py-2 px-6 rounded-full transition-all shadow"
          >
            {translations[currentLang].backToDashboard}
          </button>
        </div>
      </div>
    </div>
  );
};
