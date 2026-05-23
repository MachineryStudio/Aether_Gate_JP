import { Language } from './types';

export const translations: Record<Language, {
  appTitle: string;
  subtitle: string;
  searchPlaceholder: string;
  statusOnline: string;
  statusOffline: string;
  btnControl: string;
  btnOffline: string;
  routerScanLabel: string;
  rescanLan: string;
  aiCommand: string;
  scanRouter: string;
  installAgent: string;
  refreshStatus: string;
  showHelp: string;
  guideTitle: string;
  backToDashboard: string;
  chatPlaceholder: string;
  voiceToggleOn: string;
  voiceToggleOff: string;
  guideSub: string;
  guideSteps: string[];
  connecting: string;
  remoteSession: string;
  latency: string;
  uptime: string;
  os: string;
  agentVersion: string;
}> = {
  ja: {
    appTitle: "AetherGate — 遠天神マウス 🏮",
    subtitle: "操作するホストを選択してください",
    searchPlaceholder: "名前またはIPアドレスで検索...",
    statusOnline: "オンライン",
    statusOffline: "オフライン",
    btnControl: "操作する",
    btnOffline: "切断中",
    routerScanLabel: "ルータースキャン → {count} 台のアクティブなIPを発見",
    rescanLan: "LAN再スキャン",
    aiCommand: "AIアシスタント",
    scanRouter: "ルーター検索",
    installAgent: "ホスト登録",
    refreshStatus: "状態更新",
    showHelp: "ヘルプ",
    guideTitle: "新しいホストにエージェントをインストール",
    backToDashboard: "ダッシュボードに戻る",
    chatPlaceholder: "ひかりたんにメッセージを送信...",
    voiceToggleOn: "音声: オン",
    voiceToggleOff: "音声: オフ",
    guideSub: "AetherGate コントローラーでPCを操作するには、接続先PCで以下のPythonスクリプトを実行してください。",
    guideSteps: [
      "必要なPythonパッケージをインストールします: pip install pyautogui websockets opencv-python pillow",
      "以下のエージェントコードを `agent.py` として保存します。",
      "PC上で `python agent.py` を実行して、LAN内で待機を開始します。",
      "AetherGateの自動検出機能（またはひかりたん）が自動的にホストを検出します！"
    ],
    connecting: "WebRTC 接続中...",
    remoteSession: "リモートセッション",
    latency: "遅延時間",
    uptime: "稼働時間",
    os: "OSタイプ",
    agentVersion: "エージェントVer"
  },
  en: {
    appTitle: "AetherGate — Ether Mouse 🏮",
    subtitle: "Choose a host to control",
    searchPlaceholder: "Search by name or IP...",
    statusOnline: "Online",
    statusOffline: "Offline",
    btnControl: "Control",
    btnOffline: "Offline",
    routerScanLabel: "Router Scan → found {count} active IPs",
    rescanLan: "Rescan LAN",
    aiCommand: "AI Assistant",
    scanRouter: "Router Scan",
    installAgent: "Install Agent",
    refreshStatus: "Refresh Status",
    showHelp: "Help",
    guideTitle: "How to Install AetherGate Agent",
    backToDashboard: "Back to Dashboard",
    chatPlaceholder: "Type a message for Hikari-tan...",
    voiceToggleOn: "Voice: ON",
    voiceToggleOff: "Voice: OFF",
    guideSub: "To control a PC within your LAN, run the following Python agent script on the target computer.",
    guideSteps: [
      "Install required python packages: pip install pyautogui websockets opencv-python pillow",
      "Save the agent script as `agent.py` on your computer.",
      "Run the script: `python agent.py` to start broadcasting its availability.",
      "AetherGate Controller or Hikari-tan will auto-discover and list the host!"
    ],
    connecting: "Connecting WebRTC...",
    remoteSession: "Remote Session",
    latency: "Latency",
    uptime: "Uptime",
    os: "Operating System",
    agentVersion: "Agent version"
  },
  es: {
    appTitle: "AetherGate — Ether Mouse 🏮",
    subtitle: "Elige un host para controlar",
    searchPlaceholder: "Buscar por nombre o IP...",
    statusOnline: "En línea",
    statusOffline: "Desconectado",
    btnControl: "Controlar",
    btnOffline: "Inactivo",
    routerScanLabel: "Búsqueda del Router → {count} IPs activas encontradas",
    rescanLan: "Recargar LAN",
    aiCommand: "Asistente AI",
    scanRouter: "Escaneo Router",
    installAgent: "Instalar Agente",
    refreshStatus: "Actualizar Estados",
    showHelp: "Ayuda",
    guideTitle: "Cómo Instalar el Agente AetherGate",
    backToDashboard: "Volver al Panel",
    chatPlaceholder: "Escribe un mensaje para Hikari-tan...",
    voiceToggleOn: "Voz: ACTIVADA",
    voiceToggleOff: "Voz: APAGADA",
    guideSub: "Para controlar un PC dentro de tu LAN, ejecuta el siguiente script de agente Python en el ordenador de destino.",
    guideSteps: [
      "Instala los paquetes python requeridos: pip install pyautogui websockets opencv-python pillow",
      "Guarda el script de agente como `agent.py` en tu ordenador.",
      "Ejecuta el script: `python agent.py` para comenzar a transmitir su presencia.",
      "¡El controlador de AetherGate o Hikari-tan descubrirán y listarán el host automáticamente!"
    ],
    connecting: "Conectando WebRTC...",
    remoteSession: "Sesión Remota",
    latency: "Latencia",
    uptime: "Uptime",
    os: "Sistema Operativo",
    agentVersion: "Versión de Agente"
  },
  fr: {
    appTitle: "AetherGate — Ether Mouse 🏮",
    subtitle: "Sélectionnez un hôte à contrôler",
    searchPlaceholder: "Rechercher par nom ou IP...",
    statusOnline: "En ligne",
    statusOffline: "Hors ligne",
    btnControl: "Contrôler",
    btnOffline: "Inactif",
    routerScanLabel: "Scan du Routeur → {count} adresses IP trouvées",
    rescanLan: "Scanner le LAN",
    aiCommand: "Assistant IA",
    scanRouter: "Scanner Routeur",
    installAgent: "Installer l'agent",
    refreshStatus: "Actualiser",
    showHelp: "Aide",
    guideTitle: "Installer l'agent AetherGate",
    backToDashboard: "Retour au tableau de bord",
    chatPlaceholder: "Envoyer un message à Hikari-tan...",
    voiceToggleOn: "Voix: ACTIVER",
    voiceToggleOff: "Voix: DÉSACTIVER",
    guideSub: "Pour contrôler un PC dans votre réseau local, exécutez le script d'agent Python suivant sur le PC cible.",
    guideSteps: [
      "Installez les packages Python: pip install pyautogui websockets opencv-python pillow",
      "Enregistrez le script sous le nom `agent.py` sur l'ordinateur à contrôler.",
      "Démarrez l'agent: `python agent.py` pour commencer à diffuser sa présence.",
      "Le contrôleur AetherGate ou Hikari-tan détectera et affichera automatiquement l'hôte !"
    ],
    connecting: "Connexion WebRTC...",
    remoteSession: "Session à distance",
    latency: "Latence",
    uptime: "En activité",
    os: "Système d'exploitation",
    agentVersion: "Version de l'agent"
  },
  zh: {
    appTitle: "AetherGate — 远天神鼠标 🏮",
    subtitle: "选择要遥控的主机",
    searchPlaceholder: "输入名称或IP进行搜索...",
    statusOnline: "在线",
    statusOffline: "离线",
    btnControl: "点击遥控",
    btnOffline: "已离线",
    routerScanLabel: "路由器检索 → 发现 {count} 个活跃IP",
    rescanLan: "重新扫描局域网",
    aiCommand: "AI 助理（光酱）",
    scanRouter: "路由器发现",
    installAgent: "部署客户端",
    refreshStatus: "更新状态",
    showHelp: "使用说明",
    guideTitle: "如何部署 AetherGate 客户端",
    backToDashboard: "返回设备列表",
    chatPlaceholder: "给 Hikari-tan（光酱）发送消息...",
    voiceToggleOn: "语音: 开启",
    voiceToggleOff: "语音: 关闭",
    guideSub: "为了在局域网中远程控制您的电脑，请在目标客户端电脑中执行以下 Python 守护服务脚本：",
    guideSteps: [
      "安装依赖 Python 包: pip install pyautogui websockets opencv-python pillow",
      "将下方代码保存为本地电脑文件 `agent.py`。",
      "在命令行中运行: `python agent.py` 开启局域网监听广播。",
      "AetherGate 控制器或 Hikari-tan 会在局域网内自动扫描并识别出该主机！"
    ],
    connecting: "WebRTC 连接通道建立中...",
    remoteSession: "远程桌面会话",
    latency: "网络延时",
    uptime: "持续运行时间",
    os: "操作系统",
    agentVersion: "客户端版本"
  }
};
