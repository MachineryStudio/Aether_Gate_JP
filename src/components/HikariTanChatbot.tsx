import React, { useState, useEffect, useRef } from 'react';
import { Volume2, VolumeX, MessageCircle, X, Send, Sparkles } from 'lucide-react';
import { ChatMessage, Language } from '../types';
import { translations } from '../translations';

// Eteru Mausu Mascot Face Component
export const EteruMausuAvatar: React.FC<{
  size?: number;
  isThinking?: boolean;
  isSpeaking?: boolean;
}> = ({ size = 80, isThinking = false, isSpeaking = false }) => {
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [isBlinking, setIsBlinking] = useState(false);
  const avatarRef = useRef<HTMLDivElement>(null);

  // Eye-tracking cursor positions
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!avatarRef.current) return;
      const rect = avatarRef.current.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;
      
      const dx = e.clientX - centerX;
      const dy = e.clientY - centerY;
      const dist = Math.sqrt(dx * dx + dy * dy) || 1;
      
      // Max displacement is 5px
      const limit = 5;
      const moveX = (dx / dist) * Math.min(Math.abs(dx) * 0.05, limit);
      const moveY = (dy / dist) * Math.min(Math.abs(dy) * 0.05, limit);

      setMousePos({ x: moveX, y: moveY });
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  // Blinking cycle: random blink
  useEffect(() => {
    const blinkTimer = setInterval(() => {
      setIsBlinking(true);
      setTimeout(() => setIsBlinking(false), 150);
    }, Math.random() * 4000 + 2000);

    return () => clearInterval(blinkTimer);
  }, []);

  return (
    <div ref={avatarRef} className="relative select-none" style={{ width: size, height: size }}>
      <svg
        viewBox="0 0 160 160"
        className={`w-full h-full transition-transform duration-300 ${isThinking ? 'animate-bounce' : ''}`}
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Soft Shadow */}
        <ellipse cx="80" cy="145" rx="50" ry="10" fill="rgba(15, 76, 129, 0.15)" />

        {/* Outer body contour - Sky Blue with Japanese light ocean theme */}
        <path
          d="M 25 110 C 20 60, 40 35, 80 35 C 120 35, 140 60, 135 110 C 130 145, 30 145, 25 110 Z"
          fill="#89E2FA"
          stroke="#0F4C81"
          strokeWidth="4"
        />

        {/* Ears */}
        {/* Left Ear */}
        <circle cx="40" cy="40" r="18" fill="#89E2FA" stroke="#0F4C81" strokeWidth="4" />
        <circle cx="40" cy="40" r="11" fill="#FFCADA" />

        {/* Right Ear */}
        <circle cx="120" cy="40" r="18" fill="#89E2FA" stroke="#0F4C81" strokeWidth="4" />
        <circle cx="120" cy="40" r="11" fill="#FFCADA" />

        {/* Eyes (Glassy Anime Style) */}
        {isBlinking ? (
          <>
            {/* Blinking simple arch */}
            <path d="M 45 78 Q 55 75, 65 78" stroke="#111" strokeWidth="4" strokeLinecap="round" />
            <path d="M 95 78 Q 105 75, 115 78" stroke="#111" strokeWidth="4" strokeLinecap="round" />
          </>
        ) : (
          <>
            {/* Left Eye socket */}
            <circle cx="55" cy="78" r="15" fill="#111111" />
            {/* Left Pupils moving with mouse vector */}
            <circle cx={51 + mousePos.x} cy={74 + mousePos.y} r="5" fill="#FFFFFF" />
            <circle cx={58 + mousePos.x} cy={82 + mousePos.y} r="2.5" fill="#FFFFFF" />

            {/* Right Eye socket */}
            <circle cx="105" cy="78" r="15" fill="#111111" />
            {/* Right Pupils moving with mouse vector */}
            <circle cx={101 + mousePos.x} cy={74 + mousePos.y} r="5" fill="#FFFFFF" />
            <circle cx={108 + mousePos.x} cy={82 + mousePos.y} r="2.5" fill="#FFFFFF" />
          </>
        )}

        {/* Pink Blush Cheeks */}
        <ellipse cx="38" cy="95" rx="14" ry="7" fill="#FF8EA8" className="opacity-80" />
        <ellipse cx="122" cy="95" rx="14" ry="7" fill="#FF8EA8" className="opacity-80" />

        {/* Little lines over cheeks */}
        <line x1="32" y1="92" x2="36" y2="92" stroke="#4A0E18" strokeWidth="1.5" />
        <line x1="30" y1="95" x2="34" y2="95" stroke="#4A0E18" strokeWidth="1.5" />
        <line x1="124" y1="92" x2="128" y2="92" stroke="#4A0E18" strokeWidth="1.5" />
        <line x1="126" y1="95" x2="130" y2="95" stroke="#4A0E18" strokeWidth="1.5" />

        {/* Whiskers (Animated wiggles) */}
        {/* Left Side */}
        <line x1="18" y1="85" x2="2.5" y2="82" stroke="#111" strokeWidth="2.5" strokeLinecap="round" />
        <line x1="15" y1="95" x2="1" y2="95" stroke="#111" strokeWidth="2.5" strokeLinecap="round" />
        <line x1="18" y1="105" x2="3.5" y2="108" stroke="#111" strokeWidth="2.5" strokeLinecap="round" />

        {/* Right Side */}
        <line x1="142" y1="85" x2="157.5" y2="82" stroke="#111" strokeWidth="2.5" strokeLinecap="round" />
        <line x1="145" y1="95" x2="159" y2="95" stroke="#111" strokeWidth="2.5" strokeLinecap="round" />
        <line x1="142" y1="105" x2="156.5" y2="108" stroke="#111" strokeWidth="2.5" strokeLinecap="round" />

        {/* Mouth (Open when speaking, cute default w/3 curve normally) */}
        {isSpeaking ? (
          // Speak Pulse Circle
          <ellipse cx="80" cy="92" rx="6" ry="8" fill="#111111" className="animate-pulse" />
        ) : (
          // Cute 'w' Smile
          <path
            d="M 74 88 Q 77 92, 80 88 Q 83 92, 86 88"
            stroke="#111"
            strokeWidth="3.0"
            strokeLinecap="round"
            fill="none"
          />
        )}

        {/* Paws reaching cheeks */}
        <path
          d="M 45 110 C 45 102, 53 102, 53 110 C 53 118, 45 118, 45 110 Z"
          fill="#89E2FA"
          stroke="#0F4C81"
          strokeWidth="2.5"
        />
        <path
          d="M 115 110 C 115 102, 107 102, 107 110 C 107 118, 115 118, 115 110 Z"
          fill="#89E2FA"
          stroke="#0F4C81"
          strokeWidth="2.5"
        />
      </svg>
    </div>
  );
};

interface HikariTanChatbotProps {
  currentLang: Language;
  onActionTriggered: (action: string) => void;
  isChatOpen: boolean;
  setIsChatOpen: (open: boolean) => void;
}

export const HikariTanChatbot: React.FC<HikariTanChatbotProps> = ({
  currentLang,
  onActionTriggered,
  isChatOpen,
  setIsChatOpen,
}) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isThinking, setIsThinking] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [voiceEnabled, setVoiceEnabled] = useState(true);
  const chatEndRef = useRef<HTMLDivElement>(null);
  const ttsTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Speech helper to trigger native Speak in English or Japanese
  const speakText = (text: string) => {
    if (!voiceEnabled || !('speechSynthesis' in window)) return;
    
    // Stop any ongoing speech
    window.speechSynthesis.cancel();
    setIsSpeaking(true);

    // Clean text from Kaomojis & ACTIONS for natural read
    let cleanText = text
      .replace(/\[ACTION:[^\]]+\]/g, '')
      .replace(/\([^\)]+\)/g, '') // omit translation in parentheses to avoid duplicate sounding
      .replace(/[（\s\(][^a-zA-Z\d\s\p{P}][^）\)]*[）\)]/gu, '') // omit kaomoji
      .replace(/[◕‿✿°ᴗᴗ๑•ᴗ•́و\s]/gu, '') // strip emoji segments
      .trim();

    if (!cleanText) {
      setIsSpeaking(false);
      return;
    }

    const utterance = new SpeechSynthesisUtterance(cleanText);

    // Filter speech local language selection
    const voices = window.speechSynthesis.getVoices();
    // Try to find English or Japanese speaker
    let selectedVoice = null;
    if (currentLang === 'ja') {
      selectedVoice = voices.find(v => v.lang.startsWith('ja') || v.lang.startsWith('JP'));
    } else if (currentLang === 'zh') {
      selectedVoice = voices.find(v => v.lang.startsWith('zh') || v.lang.startsWith('CN'));
    } else if (currentLang === 'es') {
      selectedVoice = voices.find(v => v.lang.startsWith('es') || v.lang.startsWith('ES'));
    } else if (currentLang === 'fr') {
      selectedVoice = voices.find(v => v.lang.startsWith('fr') || v.lang.startsWith('FR'));
    }

    // Default to an English voice if nothing specific, or first English
    if (!selectedVoice) {
      selectedVoice = voices.find(v => v.lang.startsWith('en') || v.lang.startsWith('US') || v.lang.startsWith('GB'));
    }

    if (selectedVoice) {
      utterance.voice = selectedVoice;
    }
    
    // Set pitch/rate for cute voice style
    utterance.pitch = 1.35; // Cute cute tone height
    utterance.rate = 1.05;

    utterance.onend = () => {
      setIsSpeaking(false);
    };

    utterance.onerror = () => {
      setIsSpeaking(false);
    };

    window.speechSynthesis.speak(utterance);
  };

  // Prepopulate welcome chat on first open
  useEffect(() => {
    let welcomeText = '';
    let translationParens = '';
    
    switch (currentLang) {
      case 'ja':
        welcomeText = "こんにちは〜！(◕‿◕✿) Hikari-tanだよ！AetherGateへようこそ 🏮 私はあなたのLANリモコンアシスタントだよ！今日も楽しもうね！(*ᴗˬᴗ)";
        break;
      case 'en':
        welcomeText = "Hello! (◕‿◕✿) I'm Hikari-tan, your cute LAN Remote controller assistant for AetherGate! How can I help you manage your devices today? (•̀ᴗ•́)و";
        break;
      case 'es':
        welcomeText = "¡Hola! (◕‿◕✿) ¡Soy Hikari-tan, tu simpática asistente de control remoto LAN para AetherGate! ¿Cómo te gustaría gestionar tus equipos hoy? (•̀ᴗ•́)و";
        break;
      case 'fr':
        welcomeText = "Bonjour ! (◕‿◕✿) Je suis Hikari-tan, votre adorable assistante de contrôle à distance LAN pour AetherGate ! Que puis-je faire pour vos périphériques aujourd'hui ? (•̀ᴗ•́)و";
        break;
      case 'zh':
        welcomeText = "你好呀！(◕‿◕✿) 我是光酱（Hikari-tan）！我是你的 AetherGate 局域网遥控小管家。今天想遥控哪台设备呢？ (•̀ᴗ•́)و";
        break;
    }

    setMessages([
      {
        id: 'welcome',
        sender: 'assistant',
        text: welcomeText,
        timestamp: new Date(),
      },
    ]);
  }, [currentLang]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isThinking]);

  const handleSendMessage = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!inputValue.trim() || isThinking) return;

    const userMsgText = inputValue.trim();
    setInputValue('');

    const newUserMessage: ChatMessage = {
      id: Date.now().toString(),
      sender: 'user',
      text: userMsgText,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, newUserMessage]);
    setIsThinking(true);

    // Call server API for server-side Gemini invocation
    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: userMsgText,
          history: messages.map(m => ({
            role: m.sender === 'user' ? 'user' : 'model',
            text: m.text,
          })),
          lang: currentLang,
        }),
      });

      if (!response.ok) {
        throw new Error('API server unreachable');
      }

      const data = await response.json();
      const assistantText = data.text;

      // Extract actions in response (eg. [ACTION:RESCAN_LAN])
      const actions: string[] = [];
      const actionMatches = assistantText.match(/\[ACTION:[^\]]+\]/g);
      if (actionMatches) {
        actionMatches.forEach((m: string) => {
          actions.push(m);
          // Pass the trimmed action string up to the top level controller
          const cleanAction = m.replace('[ACTION:', '').replace(']', '');
          onActionTriggered(cleanAction);
        });
      }

      const newAssistantMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        sender: 'assistant',
        text: assistantText,
        timestamp: new Date(),
        actionsTriggered: actions,
      };

      setMessages(prev => [...prev, newAssistantMessage]);
      speakText(assistantText);
    } catch (err) {
      console.error(err);
      const errMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        sender: 'assistant',
        text: currentLang === 'ja'
          ? "あらら〜 (´；ω；`) サーバーがお返事できないみたい… インターネット接続を確認してみてね！"
          : "Oh no... (´；ω；`) I can't reach the celestial server right now. Let me test the cables!",
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, errMessage]);
    } finally {
      setIsThinking(false);
    }
  };

  const handleShortcutClick = (text: string) => {
    setInputValue(text);
  };

  return (
    <>
      {/* 1. Unexpanded Floating Head Click trigger */}
      {!isChatOpen && (
        <button
          id="btn-chatbot-float"
          onClick={() => setIsChatOpen(true)}
          className="fixed bottom-6 right-6 z-50 group flex flex-col items-center gap-1 focus:outline-none"
        >
          {/* Sparkly Cloud tag */}
          <span className="bg-white/95 border-2 border-[#0F4C81] text-[#0F4C81] scale-90 text-[10px] sm:text-xs font-bold font-sans py-1 px-3 rounded-full shadow-lg block leading-none transform group-hover:scale-100 transition-all">
            ✦ Hikari-tan ✦
          </span>
          <div className="relative p-1 bg-[#E6F7F9] rounded-full shadow-2xl border-4 border-white/80 group-hover:bg-[#D4F1F5] transition-all">
            <EteruMausuAvatar size={76} isThinking={isThinking} isSpeaking={isSpeaking} />
            {/* Small red dot meaning ONLINE */}
            <span className="absolute bottom-2 right-2 flex h-4 w-4">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-4 w-4 bg-emerald-500 border-2 border-white"></span>
            </span>
          </div>
        </button>
      )}

      {/* 2. Expanded Chat Panel Interface */}
      {isChatOpen && (
        <div
          id="chatbot-expanded-panel"
          className="fixed bottom-4 right-4 z-50 w-full max-w-[420px] h-[520px] bg-white border-4 border-[#0F4C81] rounded-25 flex flex-col overflow-hidden shadow-2xl animate-in fade-in slide-in-from-bottom-6 duration-200"
          style={{ borderRadius: '24px' }}
        >
          {/* Header */}
          <div className="bg-[#E6F7F9] px-4 py-3 border-b-4 border-[#0F4C81] flex items-center justify-between">
            <div className="flex items-center gap-3">
              <EteruMausuAvatar size={48} isSpeaking={isSpeaking} />
              <div>
                <h3 className="font-sans font-black text-[#0F4C81] text-base leading-tight">
                  ひかりたん / Hikari-tan ✦
                </h3>
                <span className="font-mono text-[9px] text-[#287A9E] leading-tight flex items-center gap-1">
                  <Sparkles className="w-2.5 h-2.5 inline text-amber-500 animate-spin" />
                  Gemini 3.5 AI Assistant
                </span>
              </div>
            </div>

            <div className="flex items-center gap-1.5">
              {/* TTS Toggle Voice */}
              <button
                onClick={() => {
                  const to = !voiceEnabled;
                  setVoiceEnabled(to);
                  if (!to) window.speechSynthesis.cancel();
                }}
                title={voiceEnabled ? translations[currentLang].voiceToggleOff : translations[currentLang].voiceToggleOn}
                className={`p-1.5 rounded-full border-2 border-[#0F4C81] transition-all ${
                  voiceEnabled ? 'bg-amber-100 text-amber-800' : 'bg-slate-100 text-slate-400'
                }`}
              >
                {voiceEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
              </button>
              {/* Minimize block */}
              <button
                onClick={() => setIsChatOpen(false)}
                className="p-1.5 rounded-full border-2 border-[#0F4C81] text-[#0F4C81] hover:bg-[#D4F1F5] transition-all"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Messages Loop Area */}
          <div className="flex-1 overflow-y-auto px-4 py-3 bg-[#F4F9FA] space-y-3">
            {messages.map(m => (
              <div
                key={m.id}
                className={`flex flex-col ${m.sender === 'user' ? 'items-end' : 'items-start'}`}
              >
                <div
                  className={`max-w-[85%] px-3 py-2 ${
                    m.sender === 'user'
                      ? 'bg-[#0F4C81] text-white rounded-[16px] rounded-tr-none border-2 border-[#09223B]'
                      : 'bg-white text-slate-800 rounded-[16px] rounded-tl-none border-2 border-[#0F4C81] shadow-sm'
                  }`}
                  style={{
                    wordBreak: 'break-word',
                    boxShadow: m.sender === 'user' ? '' : '2px 2px 0px rgba(15, 76, 129, 0.1)',
                  }}
                >
                  <p className="text-xs sm:text-sm font-sans font-medium whitespace-pre-wrap leading-relaxed">
                    {m.text}
                  </p>
                </div>
                <span className="font-mono text-[9px] text-[#556F8C] mt-1 px-1">
                  {m.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
            ))}
            {isThinking && (
              <div className="flex items-center gap-1.5 text-[#287A9E] px-2">
                <span className="w-2 h-2 rounded-full bg-[#0F4C81] animate-bounce [animation-delay:-0.3s]"></span>
                <span className="w-2 h-2 rounded-full bg-[#0F4C81] animate-bounce [animation-delay:-0.15s]"></span>
                <span className="w-2 h-2 rounded-full bg-[#0F4C81] animate-bounce"></span>
              </div>
            )}
            <div ref={chatEndRef} />
          </div>

          {/* Prompt Shortcuts */}
          <div className="bg-[#E6F7F9]/30 px-3 py-1.5 border-t border-[#0F4C81]/20 overflow-x-auto whitespace-nowrap flex gap-1.5 scrollbar-thin">
            <button
              onClick={() => handleShortcutClick(currentLang === 'ja' ? 'ネットワークをスキャンして' : 'scan my network')}
              className="text-[10px] font-sans font-bold text-[#0F4C81] hover:bg-white bg-[#E6F7F9] border border-[#0F4C81] px-2 py-0.5 rounded-full transition-all"
            >
              🔍 Scan LAN
            </button>
            <button
              onClick={() => handleShortcutClick(currentLang === 'ja' ? '新しいホストを追加したい' : 'add new host')}
              className="text-[10px] font-sans font-bold text-[#0F4C81] hover:bg-white bg-[#E6F7F9] border border-[#0F4C81] px-2 py-0.5 rounded-full transition-all"
            >
              🔌 Install Agent
            </button>
            <button
              onClick={() => handleShortcutClick(currentLang === 'ja' ? '外のIPアドレスを教えて' : "what's my public IP")}
              className="text-[10px] font-sans font-bold text-[#0F4C81] hover:bg-white bg-[#E6F7F9] border border-[#0F4C81] px-2 py-0.5 rounded-full transition-all"
            >
              🌐 Public IP
            </button>
          </div>

          {/* Form input */}
          <form
            onSubmit={handleSendMessage}
            className="border-t-4 border-[#0F4C81] p-3 flex gap-2 bg-white"
          >
            <input
              type="text"
              value={inputValue}
              onChange={e => setInputValue(e.target.value)}
              placeholder={translations[currentLang].chatPlaceholder}
              className="flex-1 outline-none text-xs sm:text-sm px-3 py-1.5 border-2 border-[#0F4C81] bg-[#F4F9FA] rounded-full focus:bg-white focus:ring-1 focus:ring-[#0F4C81] transition-all"
            />
            <button
              type="submit"
              disabled={isThinking || !inputValue.trim()}
              className="p-1.5 bg-[#0F4C81] text-white hover:bg-[#1D3B5C] disabled:bg-slate-200 disabled:text-slate-400 rounded-full border-2 border-[#05111F] transition-all"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      )}
    </>
  );
};
