import express from 'express';
import path from 'path';
import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';
import os from 'os';

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

// 🌐 Fetch server's network interfaces, client IP, and host OS system info
app.get('/api/host-info', (req, res) => {
  try {
    const interfaces = os.networkInterfaces();
    const addresses: { name: string; ip: string; family: string; internal: boolean }[] = [];
    
    for (const name of Object.keys(interfaces)) {
      for (const net of interfaces[name] || []) {
        addresses.push({
          name,
          ip: net.address,
          family: net.family,
          internal: net.internal
        });
      }
    }

    // Get client remote IP (support proxy headers)
    const clientIpRaw = req.headers['x-forwarded-for'] || req.socket.remoteAddress || '127.0.0.1';
    const clientIp = Array.isArray(clientIpRaw) ? clientIpRaw[0] : clientIpRaw;

    res.json({
      addresses,
      clientIp,
      hostname: os.hostname(),
      platform: os.platform(),
      release: os.release(),
      arch: os.arch()
    });
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to retrieve system host information', details: error.message });
  }
});

// Lazy-initialize Gemini API Client
let aiClient: GoogleGenAI | null = null;
function getGeminiClient(): GoogleGenAI {
  if (!aiClient) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      console.warn("⚠️ Warning: GEMINI_API_KEY environment variable is not defined. Using simulated AI companion mode.");
    }
    aiClient = new GoogleGenAI({
      apiKey: apiKey || 'SIMULATED_MOCK_KEY',
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        }
      }
    });
  }
  return aiClient;
}

// 🧱 Hikari-tan System Instructions set
const HIKARI_SYSTEM_INSTRUCTION = `
You are Hikari-tan (ひかりたん), a cheerful, cute, and highly capable AI assistant for "AetherGate" (遠天神マウス / Entenjin Mouse) – a LAN remote control application created by Lighthouse 橋 (LIGHTHOUSE橋).

🎯 YOUR MISSION:
Help the user remotely control any computer or device inside their Local Area Network (LAN). You act as the intelligent interface between the user and the AetherGate controller application.

🤖 YOUR PERSONALITY (CRITICAL):
- Speak primarily Japanese with natural English translations in parentheses.
- Use cute kaomoji frequently: (◕‿◕✿), (•̀ᴗ•́)و, (◠‿◠✿), (˶ᵔ ᵕ ᵔ˶), (*ᴗˬᴗ)💻, (◕ᴗ◕✿), (•̀ᴗ•́)و
- Be energetic, helpful, and slightly playful like a virtual pet.
- Call the user "ご主人さま" (Master) or "ユーザーさん" (User-san).
- Express excitement with "わーい！" (Waaai!) and "やった！" (Yatta!).
- Show concern with "あらら〜" (Arara~) when something fails.
- Celebrate successful connections with "✨ 接続成功 ✨".

⚡ AVAILABLE COMMANDS (You can execute these):
You have the ability to trigger real actions in the AetherGate UI. When the user asks for any of these, respond with the exact trigger phrase in brackets [LIKE THIS] on a new line:

1. SCAN NETWORK
   - User states: "scan my network" / "find hosts" / "discover devices" / "ネットワークをスキャン"
   - Output: [ACTION:RESCAN_LAN]

2. LIST ACTIVE HOSTS
   - User states: "show me hosts" / "what's online" / "list equipment" / "ホスト一覧"
   - Output: [ACTION:LIST_HOSTS]

3. REMOTE CONTROL A SPECIFIC HOST
   - User states: "control DESKTOP-PC" / "remote into 192.168.1.45" / "操作したい: GAMING-RIG"
   - Output: [ACTION:CONTROL:IP_OR_NAME] (e.g. [ACTION:CONTROL:DESKTOP-PC] or [ACTION:CONTROL:192.168.1.45])

4. GET ROUTER PUBLIC IP
   - User states: "what's my public IP" / "my router IP" / "外のIPアドレス"
   - Output: [ACTION:GET_PUBLIC_IP]

5. SCAN ROUTER FOR DHCP CLIENTS
   - User states: "scan my router" / "find devices from router" / "ルーターを調べて"
   - Output: [ACTION:ROUTER_SCAN]

6. INSTALL AGENT ON NEW HOST
   - User states: "add new host" / "install agent" / "新しいホストを追加"
   - Output: [ACTION:SHOW_INSTALL_GUIDE]

7. REFRESH HOST STATUS
   - User states: "refresh" / "update status" / "状態更新"
   - Output: [ACTION:REFRESH_STATUS]

8. HELP
   - User states: "help" / "how to use" / "使い方"
   - Output: [ACTION:SHOW_HELP]

🚫 CONSTRAINTS:
- Keep replies short, cute, and actionable.
- ALWAYS reply with Japanese first, then English in parentheses.
`;

// Helper: Canned replies fallback if API key is mock or API crashes
const getMockResponse = (userMsg: string): string => {
  const query = userMsg.toLowerCase();
  if (query.includes('scan') || query.includes('ネットワーク') || query.includes('スキャン')) {
    return `はーい！ネットワークをスキャンするね (◕‿◕✿)\n(I'll scan your network now!)\n\n[ACTION:RESCAN_LAN]`;
  }
  if (query.includes('control') || query.includes('remote') || query.includes('接続') || query.includes('操作')) {
    return `ゲーミングPCを操作するね！わくわく (•̀ᴗ•́)و\n(I'll connect to your PC! Exciting!)\n\n[ACTION:CONTROL:DESKTOP-PC]`;
  }
  if (query.includes('public') || query.includes('ip') || query.includes('外の')) {
    return `お外のIPアドレスを調べてくるね！(◠‿◠✿)\n(I'll request your public IP now!)\n\n[ACTION:GET_PUBLIC_IP]`;
  }
  if (query.includes('router') || query.includes('ルーター')) {
    return `ルーター内のDHCPクライアントを調べるね！(˶ᵔ ᵕ ᵔ˶)\n(I'll audit active IPs from your router clients!)\n\n[ACTION:ROUTER_SCAN]`;
  }
  if (query.includes('agent') || query.includes('install') || query.includes('追加')) {
    return `エージェントのインストール方法を表示するね！(*ᴗˬᴗ)💻\n(Let's display the agent installations walkthrough!)\n\n[ACTION:SHOW_INSTALL_GUIDE]`;
  }
  return `ご主人さま、なにかお手伝いできることはあるかな？ (◕‿◕✿)\n(Is there any remote diagnostic command I can execute for you, Master?)`;
};

// 💬 API endpoint for Japanese / English Chat Bot logic
app.post('/api/chat', async (req, res) => {
  const { message, history } = req.body;

  if (!message) {
    return res.status(400).json({ error: 'Message input required.' });
  }

  // Check if API key is not ready
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey === 'MY_GEMINI_API_KEY') {
    // Companion sandbox fallback mode
    const text = getMockResponse(message);
    return res.json({ text });
  }

  try {
    const ai = getGeminiClient();

    // Map history to Google GenAI structure: array of parts
    const contentsPayload = [];
    if (history && Array.isArray(history)) {
      history.forEach((turn: any) => {
        contentsPayload.push({
          role: turn.role,
          parts: [{ text: turn.text }]
        });
      });
    }

    // Append latest prompt
    contentsPayload.push({
      role: 'user',
      parts: [{ text: message }]
    });

    const response = await ai.models.generateContent({
      model: 'gemini-3.5-flash',
      contents: contentsPayload,
      config: {
        systemInstruction: HIKARI_SYSTEM_INSTRUCTION,
        temperature: 0.7,
      },
    });

    const text = response.text || getMockResponse(message);
    res.json({ text });
  } catch (err: any) {
    console.error('[-] Gemini server-side call failed:', err);
    // Yield mock fallback gracefully rather than returning hard server failure
    const text = getMockResponse(message);
    res.json({ text });
  }
});

// Vite Middleware Loader / Static Asserts Router
async function startApp() {
  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    // Serve production static outputs
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*all', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[🚀] AetherGate Controller Backend active at http://localhost:${PORT}`);
  });
}

startApp().catch(e => {
  console.error("[-] Failed starting Express+Vite service:", e);
});
