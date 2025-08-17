import { MessageSquare, Server, User, Headphones, Cloud, HardDrive, ClipboardList, BarChart2, Wifi, AlertCircle, ChevronRight, ChevronDown } from 'lucide-react';

export interface NodeType {
  id: string;
  title: string;
  icon: React.ReactNode;
  description: string;
  position: string;
  color: string;
  children?: string[];
  expanded?: boolean;
}

export interface ConnectionType {
  from: string;
  to: string;
  dashed?: boolean;
  animated?: boolean;
  curve?: boolean;
  label?: string;
  showDots?: boolean;
}

export const nodes: NodeType[] = [
    {
      id: "portal",
      title: "PepsiCo Portal",
      icon: <User className="w-6 h-6 text-blue-400" />,
      description:
        "Entry point hosting Genesys Messenger script. Environment URLs:\n- Dev: https://dev2.pepsicopartners.com/\n- UAT: https://qa3.pepsicopartners.com/\n- Prod: https://www.pepsicopartners.com/",
      position: "left-[10%] top-[50%]",
      color: "border-blue-400",
    },
    {
      id: "messenger",
      title: "Genesys Messenger",
      icon: <MessageSquare className="w-6 h-6 text-purple-400" />,
      description:
        "Web messaging widget that renders chat UI and binds to Architect flows. Configurable visual style and behaviors must be defined before deployment.",
      position: "left-[25%] top-[50%]",
      color: "border-purple-400",
    },
    {
      id: "architect",
      title: "Architect Flows",
      icon: <Cloud className="w-6 h-6 text-cyan-400" />,
      description:
        "Inbound Message Flows handling chat routing:\n- PepsiPartners_Bot_Flow_PreLogin\n- PepsiPartners_Bot_Flow_PostLogin\nManages transfers to Dialogflow and agent queues.",
      position: "left-[40%] top-[50%]",
      color: "border-cyan-400",
    },
    {
      id: "dialogflow",
      title: "Dialogflow CX",
      icon: <MessageSquare className="w-6 h-6 text-green-400" />,
      description:
        "Google Dialogflow CX agents driving bot logic:\n\nEnvironments:\n- Dev: pdgenesys-gc\n- FIT: pepsifit-gc\n- Prod: pepsiprod-gc\n\nAgents:\n- Pre-Login: Genesys_Prelogin_Chat\n- Post-Login: Genesys_chat",
      position: "left-[55%] top-[50%]",
      color: "border-green-400",
      children: ["prelogin-flow", "postlogin-flow"],
      expanded: false,
    },
    {
      id: "prelogin-flow",
      title: "Pre-Login Flow",
      icon: <ChevronRight className="w-5 h-5 text-yellow-400" />,
      description:
        "Handles unauthenticated users:\n- Default Start\n- Self-register\n- Issue Not Listed\nTimeout: 1 min inactivity → popup",
      position: "left-[55%] top-[40%]",
      color: "border-yellow-300",
      expanded: false,
    },
    {
      id: "postlogin-flow",
      title: "Post-Login Flow",
      icon: <ChevronRight className="w-5 h-5 text-orange-400" />,
      description:
        "Authenticated user flows:\n- Order & Delivery\n- Account Information\n- Issue Not Listed\nFallback: 2 invalid inputs → agent",
      position: "left-[55%] top-[60%]",
      color: "border-orange-300",
      expanded: false,
    },
    {
      id: "tibco",
      title: "TIBCO Middleware",
      icon: <Server className="w-6 h-6 text-indigo-400" />,
      description:
        "Integration layer for CRM data:\n- Normalizes APIs for Genesys\n- Handles Siebel orchestration\n- Centralizes authentication",
      position: "left-[70%] top-[50%]",
      color: "border-indigo-400",
    },
    {
      id: "siebel",
      title: "Siebel CRM",
      icon: <HardDrive className="w-6 h-6 text-red-400" />,
      description:
        "Stores interaction history and tickets:\n- Real-time case management\n- Chat transcripts\n- Customer data integration",
      position: "left-[85%] top-[50%]",
      color: "border-red-400",
    },
    {
      id: "queue",
      title: "Agent Queue",
      icon: <Headphones className="w-6 h-6 text-pink-400" />,
      description:
        "Live agent escalation:\n- Queue: PP_Chat_Q\n- Transfer param: gen_agent_transfer\n- Next available agent routing",
      position: "left-[70%] top-[70%]",
      color: "border-pink-400",
    },
    {
      id: "observability",
      title: "Observability",
      icon: <BarChart2 className="w-6 h-6 text-teal-400" />,
      description:
        "Monitoring and logging:\n- Dialogflow Conversation History\n- Genesys Architect analytics\n- Cloud Logging integration",
      position: "left-[25%] top-[20%]",
      color: "border-teal-400",
    },
  ];

export const connections: ConnectionType[] = [
    { from: "portal", to: "messenger", animated: true, showDots: true },
    { from: "messenger", to: "architect", animated: true, showDots: true },
    { from: "architect", to: "dialogflow", animated: true, showDots: true },
    { from: "dialogflow", to: "prelogin-flow", animated: false, dashed: true },
    { from: "dialogflow", to: "postlogin-flow", animated: false, dashed: true },
    { from: "dialogflow", to: "tibco", animated: true, curve: true },
    { from: "tibco", to: "siebel", animated: true },
    {
      from: "dialogflow",
      to: "queue",
      animated: true,
      curve: true,
      label: "Escalation",
    },
    { from: "architect", to: "observability", animated: false, dashed: true },
  ];
