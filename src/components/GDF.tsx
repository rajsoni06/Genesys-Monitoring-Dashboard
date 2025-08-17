import { useState, useEffect } from "react";
import {
  MessageSquare,
  Server,
  User,
  Headphones,
  Cloud,
  HardDrive,
  ClipboardList,
  BarChart2,
  Wifi,
  AlertCircle,
  List,
  Globe,
  MessageCircle,
  Workflow,
  Lock,
  Unlock,
  Activity,
  Database,
  Layers,
  Bot,
} from "lucide-react";

interface NodeType {
  id: string;
  title: string;
  icon: React.ReactNode;
  description: string;
  position: string;
  color: string;
  stepText?: string;
}

interface ConnectionType {
  from: string;
  to: string;
  dashed?: boolean;
  animated?: boolean;
  curve?: boolean;
  label?: string;
  showDots?: boolean;
}

const GDF = () => {
  const [hoveredNode, setHoveredNode] = useState<string | null>(null);
  const [pulsePhase, setPulsePhase] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setPulsePhase((prev) => (prev + 1) % 60);
    }, 100);
    return () => clearInterval(interval);
  }, []);

  const nodeToStepMap: { [key: string]: string } = {
    portal: "1. Portal Initiation",
    messenger: "2. Messenger Load",
    architect: "3. Architect Routing",
    dialogflow: "4. Dialogflow Processing",
    prelogin: "5. Pre-Login Flow",
    postlogin: "6. Post-Login Flow",
    tibco: "7. TIBCO Integration",
    siebel: "8. Siebel Storage",
    queue: "9. Agent Escalation",
    observability: "10. Monitoring",
  };

  const nodes: NodeType[] = [
    {
      id: "portal",
      title: "PepsiCo Partner Portal",
      icon: <Globe className="w-6 h-6 text-blue-400" />,
      description:
        "The PepsiCo Partner Portal acts as the single entry point for all chatbot sessions. When a user initiates a conversation, the portal loads the Genesys Messenger script that connects either to a pre-login or post-login flow. The portal is deployed in three environments—Dev, UAT, and Prod—ensuring a consistent chat experience across testing and production stages.",
      position: "left-[10%] top-[50%]",
      color: "border-blue-400",
      stepText: nodeToStepMap["portal"],
    },
    {
      id: "messenger",
      title: "Genesys Messenger",
      icon: <MessageCircle className="w-6 h-6 text-purple-400" />,
      description:
        "Genesys Messenger is the lightweight web messaging widget embedded in the portal. It renders the chat interface, captures user input, and connects seamlessly to the underlying Architect flows. Its behavior and appearance are fully configurable, allowing the business to tailor the customer experience before messages are routed into the Genesys ecosystem.",
      position: "left-[23%] top-[50%]",
      color: "border-purple-400",
      stepText: nodeToStepMap["messenger"],
    },
    {
      id: "architect",
      title: "Genesys Architect",
      icon: <Workflow className="w-6 h-6 text-cyan-400" />,
      description:
        "Genesys Architect orchestrates the conversation by mapping each incoming message to the appropriate flow. It manages both the Pre-Login and Post-Login chatbot flows, controls routing to Dialogflow CX, and handles timeouts, fallbacks, and escalations to live agents. Architect ensures that conversations follow consistent logic and business rules before handing them downstream.",
      position: "left-[38%] top-[50%]",
      color: "border-cyan-400",
      stepText: nodeToStepMap["architect"],
    },
    {
      id: "dialogflow",
      title: "Google Dialogflow CX",
      icon: <Bot className="w-6 h-6 text-green-400" />,
      description:
        "Dialogflow CX powers the natural language understanding behind the chatbot. It interprets user inputs, drives Pre-Login and Post-Login flows, and presents menus such as registration, account information, or order and delivery. Each environment—Dev, FIT, and Prod—runs its own Dialogflow agent with dedicated configurations, allowing PepsiCo to test, refine, and scale the chatbot logic.",
      position: "left-[54%] top-[50%]",
      color: "border-green-400",
      stepText: nodeToStepMap["dialogflow"],
    },
    {
      id: "prelogin",
      title: "Pre-Login Chat Flow",
      icon: <Lock className="w-5 h-5 text-yellow-400" />,
      description:
        "The Pre-Login chatbot flow supports unauthenticated users. It greets them with options such as self-registration and issue reporting, and it gracefully manages inactivity with a one-minute timeout popup. If a customer struggles to provide valid inputs, the flow eventually escalates the conversation to a live agent for assistance.",
      position: "left-[54%] top-[25%]",
      color: "border-yellow-400",
      stepText: nodeToStepMap["prelogin"],
    },
    {
      id: "postlogin",
      title: "Post-Login Chat Flow",
      icon: <Unlock className="w-5 h-5 text-orange-400" />,
      description:
        "Once authenticated, customers enter the Post-Login chatbot flow. Here they can check order and delivery details, access account information, or raise unlisted issues. To protect the experience, the system enforces rules such as escalation to a live agent after two invalid inputs, ensuring no customer is left stuck in a loop.",
      position: "left-[54%] top-[75%]",
      color: "border-orange-400",
      stepText: nodeToStepMap["postlogin"],
    },
    {
      id: "tibco",
      title: "TIBCO Middleware",
      icon: <Layers className="w-6 h-6 text-indigo-400" />,
      description:
        "TIBCO is the middleware between Genesys and Siebel. It standardizes APIs, handles authentication, and orchestrates data flow in both directions. When the chatbot or agent requests CRM info, data moves Genesys → TIBCO → Siebel. When Siebel responds, the return flow Siebel → TIBCO → Genesys ensures real-time updates while keeping the bot loosely coupled from Siebel.",
      position: "left-[74%] top-[50%]",
      color: "border-indigo-400",
      stepText: nodeToStepMap["tibco"],
    },
    {
      id: "siebel",
      title: "Siebel CRM",
      icon: <Database className="w-6 h-6 text-red-400" />,
      description:
        "Siebel CRM is the system of record for customer data, tickets, and case management. It works bidirectionally with Genesys through TIBCO—receiving requests for customer or order info, and sending responses back. This keeps transcripts, escalations, and historical context available in real time for agents.",
      position: "left-[88%] top-[50%]",
      color: "border-red-400",
      stepText: nodeToStepMap["siebel"],
    },
    {
      id: "queue",
      title: "Agent Queue",
      icon: <List className="w-6 h-6 text-yellow-400" />,
      description:
        "When automated resolution is not possible, Architect routes the chat to the dedicated agent queue. The PP_Chat_Q ensures that messages are transferred to the next available skilled agent, creating a smooth handoff from bot to human and preserving all conversation history for the agent to review.",
      position: "left-[74%] top-[75%]",
      color: "border-yellow-400",
      stepText: nodeToStepMap["queue"],
    },
    {
      id: "observability",
      title: "Monitoring & Analytics",
      icon: <Activity className="w-6 h-6 text-teal-400" />,
      description:
        "Observability is embedded throughout the chatbot ecosystem. Dialogflow logs conversation history and errors, Genesys tracks analytics from Architect and Messenger, and cloud logging services integrate these data points. This end-to-end monitoring ensures that teams can measure performance, troubleshoot issues, and refine both bot and human-assisted journeys.",
      position: "left-[38%] top-[20%]",
      color: "border-teal-400",
      stepText: nodeToStepMap["observability"],
    },
  ];

  const connections: ConnectionType[] = [
    {
      from: "portal",
      to: "messenger",
      animated: true,
      showDots: true,
    },
    {
      from: "messenger",
      to: "architect",
      animated: true,
      showDots: true,
    },
    {
      from: "architect",
      to: "dialogflow",
      animated: true,
      showDots: true,
    },
    {
      from: "dialogflow",
      to: "prelogin",
      animated: false,
      dashed: true,
    },
    {
      from: "dialogflow",
      to: "postlogin",
      animated: false,
      dashed: true,
    },
    {
      from: "dialogflow",
      to: "tibco",
      animated: true,
      curve: true,
    },
    {
      from: "tibco",
      to: "siebel",
      animated: true,
      showDots: true,
    },
    {
      from: "siebel",
      to: "tibco",
      animated: true,
      showDots: true,
    },
    {
      from: "dialogflow",
      to: "queue",
      animated: true,
      curve: true,
      label: "",
    },
    {
      from: "architect",
      to: "observability",
      animated: false,
      dashed: true,
    },
  ];

  const steps = [
    {
      id: "step1",
      text: "1. Portal Initiation",
      position: "left-[8%] top-[40%]",
    },
    {
      id: "step2",
      text: "2. Messenger Load",
      position: "left-[20%] top-[40%]",
    },
    {
      id: "step3",
      text: "3. Architect Routing",
      position: "left-[35%] top-[40%]",
    },
    {
      id: "step4",
      text: "4. Dialogflow Processing",
      position: "left-[50%] top-[40%]",
    },
    {
      id: "step5",
      text: "5. Pre-Login Flow",
      position: "left-[50%] top-[22%]",
    },
    {
      id: "step6",
      text: "6. Post-Login Flow",
      position: "left-[50%] top-[78%]",
    },
    {
      id: "step7",
      text: "7. TIBCO Integration",
      position: "left-[65%] top-[40%]",
    },
    {
      id: "step8",
      text: "8. Siebel Storage",
      position: "left-[80%] top-[40%]",
    },
    {
      id: "step9",
      text: "9. Agent Escalation",
      position: "left-[65%] top-[82%]",
    },
    {
      id: "step10",
      text: "10. Monitoring",
      position: "left-[20%] top-[12%]",
    },
  ];

  const calculatePath = (
    fromId: string,
    toId: string,
    curve?: boolean,
    labelPos?: number
  ) => {
    const fromNode = nodes.find((n) => n.id === fromId);
    const toNode = nodes.find((n) => n.id === toId);
    if (!fromNode || !toNode) return { path: "", labelPos: { x: 0, y: 0 } };

    const parse = (pos: string) => {
      const leftMatch = pos.match(/left-\[(\d+)%\]/);
      const topMatch = pos.match(/top-\[(\d+)%\]/);
      return {
        x: leftMatch ? parseInt(leftMatch[1]) : 0,
        y: topMatch ? parseInt(topMatch[1]) : 0,
      };
    };

    const from = parse(fromNode.position);
    const to = parse(toNode.position);

    if (curve) {
      const controlY = from.y < to.y ? from.y + 15 : from.y - 15;
      return {
        path: `M ${from.x} ${from.y} Q ${(from.x + to.x) / 2} ${controlY}, ${
          to.x
        } ${to.y}`,
        labelPos: {
          x: (from.x + to.x) / 2,
          y: (from.y + to.y) / 2 + (from.y < to.y ? 5 : -5),
        },
      };
    }
    return {
      path: `M ${from.x} ${from.y} L ${to.x} ${to.y}`,
      labelPos: {
        x: (from.x + to.x) / 2,
        y: (from.y + to.y) / 2,
      },
    };
  };

  const getPulseOffset = (index: number) => (pulsePhase + index * 10) % 60;

  return (
    <div className="p-4 font-sans bg-slate-900 text-white">
      <div className="flex flex-col items-center mb-1">
        <h1 className="text-xl font-bold text-white">
          PepsiCo Chatbot Architecture
        </h1>
        <p className="text-center text-xs text-slate-400">
          Genesys Messenger + Dialogflow CX + Siebel Integration
        </p>
        <p
          className="text-center text-xs mt-1"
          style={{
            animation: "pulseColor 2s infinite",
            color: "#94a3b8",
          }}
        >
          Hover over the icons to view descriptions.
        </p>

        <style>
          {`
@keyframes pulseColor {
  0%   { color: #94a3b8; }
  50%  { color: #22d3ee; }
  100% { color: #94a3b8; }
}
`}
        </style>
      </div>
      <div className="relative h-[500px] bg-slate-800/50 rounded-lg p-2">
        <svg
          width="100%"
          height="100%"
          className="absolute inset-0"
          viewBox="0 0 100 100"
          preserveAspectRatio="none"
        >
          <defs>
            <marker
              id="arrow"
              markerWidth="3"
              markerHeight="2"
              refX="2.5"
              refY="1"
              orient="auto"
            >
              <polygon points="0 0, 3 1, 0 2" fill="#4FD1C5" />
            </marker>
            <marker
              id="arrow-dashed"
              markerWidth="3"
              markerHeight="2"
              refX="2.5"
              refY="1"
              orient="auto"
            >
              <polygon points="0 0, 3 1, 0 2" fill="#81E6D9" />
            </marker>
            <linearGradient id="pulseGradient">
              <stop offset="0%" stopColor="#4FD1C5" stopOpacity="0" />
              <stop offset="50%" stopColor="#4FD1C5" stopOpacity="1" />
              <stop offset="100%" stopColor="#4FD1C5" stopOpacity="0" />
            </linearGradient>
          </defs>
          {connections.map((conn, index) => {
            const { path, labelPos } = calculatePath(
              conn.from,
              conn.to,
              conn.curve
            );
            const isHovered =
              hoveredNode === conn.from || hoveredNode === conn.to;
            return (
              <g key={`${conn.from}-${conn.to}`}>
                <path
                  d={path}
                  fill="none"
                  stroke={conn.dashed ? "#81E6D9" : "#4FD1C5"}
                  strokeWidth={isHovered ? 0.5 : 0.3}
                  strokeDasharray={conn.dashed ? "2,2" : "0"}
                  markerEnd={`url(#${conn.dashed ? "arrow-dashed" : "arrow"})`}
                />
                {conn.showDots && (
                  <>
                    <path
                      id={`dot-path-${index}`}
                      d={path}
                      fill="none"
                      stroke="transparent"
                      strokeWidth="10"
                    />
                    <ellipse rx="0.3" ry="0.5" fill="#4FD1C5">
                      <animateMotion
                        dur="8s"
                        repeatCount="indefinite"
                        path={path}
                      />
                    </ellipse>
                    <ellipse rx="0.3" ry="0.5" fill="#4FD1C5">
                      <animateMotion
                        dur="8s"
                        repeatCount="indefinite"
                        path={path}
                        begin="2s"
                      />
                    </ellipse>
                    <ellipse rx="0.3" ry="0.5" fill="#4FD1C5">
                      <animateMotion
                        dur="8s"
                        repeatCount="indefinite"
                        path={path}
                        begin="4s"
                      />
                    </ellipse>
                  </>
                )}
                {conn.animated && (
                  <path
                    d={path}
                    fill="none"
                    stroke="url(#pulseGradient)"
                    strokeWidth="0.6"
                    strokeDasharray="10, 10"
                    strokeDashoffset={getPulseOffset(index)}
                    strokeLinecap="round"
                  />
                )}
                {conn.label && (
                  <text
                    x={labelPos?.x || 0}
                    y={labelPos?.y || 0}
                    fontSize="0.7"
                    fill="#81E6D9"
                    textAnchor="middle"
                    dy="4"
                  >
                    {conn.label}
                  </text>
                )}
              </g>
            );
          })}
        </svg>
        {nodes.map((node) => (
          <div
            key={node.id}
            className={`absolute transform -translate-x-1/2 -translate-y-1/2 ${node.position}`}
          >
            {node.stepText && (
              <div className="absolute top-[-20px] left-1/2 transform -translate-x-1/2 text-[11px] text-white whitespace-nowrap">
                {node.stepText}
              </div>
            )}
            <div
              onMouseEnter={() => setHoveredNode(node.id)}
              onMouseLeave={() => setHoveredNode(null)}
              className={`bg-slate-800/80 p-1 rounded-lg border ${node.color} w-24 text-center shadow-md hover:ring-1 hover:ring-cyan-400 transition-all`}
            >
              <div className="mb-0.5 mx-auto w-min">{node.icon}</div>
              <h3 className="text-[10px] font-bold leading-tight">
                {node.title}
              </h3>
              {hoveredNode === node.id && (
                <div
                  className={`absolute z-50 w-48 p-2 text-xs bg-slate-950 border border-cyan-500/50 rounded-md shadow-lg ${
                    // Nodes that should appear above (portal, messenger)
                    ["portal", "messenger"].includes(node.id)
                      ? "bottom-full mb-2 left-1/2 transform -translate-x-1/2"
                      : // Nodes that should appear to the right (prelogin) - shifted up
                      ["prelogin"].includes(node.id)
                      ? "left-full ml-2 top-[25%] transform -translate-y-1/2"
                      : // Nodes that should appear to the right (queue) - original position
                      ["queue"].includes(node.id)
                      ? "left-full ml-2 top-1/2 transform -translate-y-1/2"
                      : // Nodes that should appear to the left (observability, postlogin)
                      ["observability", "postlogin"].includes(node.id)
                      ? "right-full mr-2 top-1/2 transform -translate-y-1/2"
                      : // Nodes that should appear below (siebel)
                      ["siebel"].includes(node.id)
                      ? "top-full mt-2 left-1/2 transform -translate-x-1/2"
                      : // Default (if any other node is added later) - keep as right-full for now
                        "right-full mr-2 top-1/2 transform -translate-y-1/2"
                  }`}
                >
                  {node.description}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default GDF;
