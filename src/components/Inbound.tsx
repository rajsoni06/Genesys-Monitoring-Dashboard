import { useState, useEffect } from "react";
import {
  PhoneIncoming,
  PhoneOutgoing,
  Server,
  MessageSquare,
  Headphones,
  ClipboardList,
  BarChart2,
  Cloud,
  Wifi,
  User,
  HardDrive,
  AlertCircle,
  List,
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
  curveType?: "downward" | "upward" | "auto";
  label?: string;
  showDots?: boolean;
}

const Inbound = () => {
  const [hoveredNode, setHoveredNode] = useState<string | null>(null);
  const [pulsePhase, setPulsePhase] = useState(0);
  const [pulsatingTextColor, setPulsatingTextColor] = useState("white");

  useEffect(() => {
    const interval = setInterval(() => {
      setPulsePhase((prev) => (prev + 1) % 60);
      setPulsatingTextColor((prevColor) =>
        prevColor === "white" ? "rgb(156 163 175)" : "white"
      );
    }, 100);
    return () => clearInterval(interval);
  }, []);

  const nodeToStepMap: { [key: string]: string } = {
    customer: "1. Call Initiation",
    provider: "2. SIP Trunk Routing",
    genesys: "3. DID-Based Routing",
    siebel: "5. CRM Backend",
    dialogflow: "4. IVR & COF Auth",
    queues: "6. Queue Assignment",
    agent: "7. Agent Interaction",
    "post-call-survey": "8. Post-Call Survey",
    pureinsights: "9. Quality Evaluation & Reporting",
    backup: "10. Recording Storage",
  };

  const nodes: NodeType[] = [
    {
      id: "customer",
      title: "Customer",
      icon: <User className="w-6 h-6 text-green-400" />,
      description:
        "The starting point of the inbound call journey. The customer initiates the call using a Toll-Free Number (TFN) or a Direct Inward Dialing (DID) number. TFN is free for the caller and often used for nationwide support, while DID is region or department-specific. The caller’s phone number is captured using Automatic Number Identification (ANI) for record matching and personalization.",
      position: "left-[7%] top-[50%]",
      color: "border-green-400",
      stepText: nodeToStepMap["customer"],
    },
    {
      id: "provider",
      title: "Telecom / Broadband Provider",
      icon: (
        <Wifi
          className="w-6 h-6 text-blue-400"
          style={{
            animation: "wifiPulse 2.6s infinite ease-in-out",
          }}
        />
      ),
      description:
        "Carriers like Airtel, Vodafone, or AT&T receive the customer’s call and route it via secure SIP trunks to Genesys Cloud. SIP (Session Initiation Protocol) replaces traditional lines with VoIP, enabling advanced features and scalability. Trunks act as the backbone — if they are down, calls cannot be connected.",
      position: "left-[18%] top-[50%]",
      color: "border-blue-400",
      stepText: nodeToStepMap["provider"],
    },
    {
      id: "genesys",
      title: "Genesys Cloud",
      icon: <PhoneIncoming className="w-6 h-6 text-red-400" />,
      description:
        "Genesys Cloud is the core contact center platform handling inbound voice. It receives SIP calls from the telecom provider, identifies ANI (caller ID) and DNIS (dialed number) to determine the correct DID, and routes the call into Architect IVR flows. Within these flows, Genesys can invoke Google Dialogflow CX for NLU, perform IVR logic, and decide whether to keep the call in self-service, validate customer details via Siebel, or transfer it to an ACD queue.",
      position: "left-[35%] top-[50%]",
      color: "border-red-400",
      stepText: nodeToStepMap["genesys"],
    },
    {
      id: "dialogflow",
      title: "Google Dialogflow (GDF)",
      icon: <MessageSquare className="w-6 h-6 text-purple-400" />,
      description:
        "Google Dialogflow CX is embedded within Genesys Architect IVR flows as a virtual agent. It provides natural language understanding (NLU), menu navigation, and customer intent recognition. It can manage language selection (via DTMF or speech) and support Customer Onboarding Form (COF) authentication. When deeper CRM lookups are required, Genesys routes requests to Siebel, while Dialogflow focuses purely on conversation handling.",
      position: "left-[50%] top-[20%]",
      color: "border-purple-400",
      stepText: nodeToStepMap["dialogflow"],
    },
    {
      id: "siebel",
      title: "Oracle Siebel CRM",
      icon: <Server className="w-6 h-6 text-orange-400" />,
      description:
        "Siebel CRM acts as the backend system of record for customer data, authentication, and case management. During IVR flows, Genesys sends API requests to Siebel for COF validation, account details, or eligibility checks. When a call is connected to an agent, Siebel IWS (Interaction Workspace) provides a screen-pop with customer data. After wrap-up, agents log notes, outcomes, and tickets directly into Siebel, ensuring all interaction history is stored in one centralized system.",
      position: "left-[58%] top-[50%]",
      color: "border-orange-400",
      stepText: nodeToStepMap["siebel"],
    },
    {
      id: "queues",
      title: "ACD Queues",
      icon: <List className="w-6 h-6 text-yellow-400" />,
      description:
        "Automatic Call Distribution (ACD) queues in Genesys Cloud assign calls to the right agents based on skills, proficiency, priority, and business rules. If self-service through Dialogflow or IVR cannot resolve the issue, calls are placed into these queues. Once connected, the assigned agent has full context, including Siebel CRM data, previous interactions, and IVR journey details, ensuring efficient resolution and improved customer experience.",
      position: "left-[50%] top-[77%]",
      color: "border-yellow-400",
      stepText: nodeToStepMap["queues"],
    },
    {
      id: "agent",
      title: "Agent Desktop (Siebel + GCBA)",
      icon: <User className="w-6 h-6 text-cyan-400" />,
      description:
        "Agents use the Siebel Interaction Workspace integrated with Genesys Cloud via GCBA. When a call connects, GCBA triggers screen recording and auto-populates customer data from Siebel. Agents can view account history and update wrap-up codes, notes, or cases, which are written back into Siebel in real time, ensuring bidirectional sync and making Siebel the system of record.",
      position: "left-[78%] top-[77%]",
      color: "border-cyan-400",
      stepText: nodeToStepMap["agent"],
    },
    {
      id: "pureinsights",
      title: "PureInsights Reporting",
      icon: <BarChart2 className="w-6 h-6 text-indigo-400" />,
      description:
        "PureInsights provides operational and strategic reports on call volumes, agent efficiency, abandonment, and Customer Satisfaction (CSAT). It integrates Success KPIs to evaluate Average Handle Time (AHT), compliance, and performance, giving QA teams actionable insights for continuous improvement.",
      position: "left-[78%] top-[18%]",
      color: "border-indigo-400",
      stepText: nodeToStepMap["pureinsights"],
    },
    {
      id: "backup",
      title: "Call & Screen Recording Storage",
      icon: <HardDrive className="w-6 h-6 text-gray-400" />,
      description:
        "Inbound calls are recorded and stored for QA and compliance. Outbound call data, screen recordings, dialer files, and backups are stored in AWS S3 for 2 years, as per PepsiCo’s retention policy.",
      position: "left-[92%] top-[50%]",
      color: "border-gray-400",
      stepText: nodeToStepMap["backup"],
    },
    {
      id: "trunks",
      title: "SIP Trunks",
      icon: <Cloud className="w-6 h-6 text-red-300" />,
      description:
        "The bridge between the telecom provider and Genesys Cloud. If trunks are down, all inbound and outbound communication stops. SIP trunking provides digital connectivity, scalability, and cost efficiency over legacy systems.",
      position: "left-[21%] top-[20%]",
      color: "border-red-300",
    },
    {
      id: "post-call-survey",
      title: "Post-Call Survey",
      icon: <ClipboardList className="w-6 h-6 text-teal-400" />,
      description:
        "After each call, Genesys Cloud automatically collects customer feedback through post-call surveys. This data flows to Success KPIs where QA teams evaluate call recordings against performance metrics, ensuring quality and compliance. Final insights are reported in PureInsights for operational analysis and continuous improvement.",
      position: "left-[78%] top-[50%]",
      color: "border-teal-400",
      stepText: nodeToStepMap["post-call-survey"],
    },
    {
      id: "pureinsights-kpis",
      title: "Success KPIs",
      icon: <ClipboardList className="w-4 h-4 text-pink-400" />,
      description:
        "Success KPIs, embedded under PureInsights, measure agent performance using Genesys call and survey data. Key metrics include Average Handle Time (AHT), compliance adherence, and Customer Satisfaction (CSAT). These evaluations support quality assurance and continuous improvement.",
      position: "left-[78%] top-[28%]", // placed just under PureInsights
      color: "border-pink-400",
    },
  ];

  const connections: ConnectionType[] = [
    {
      from: "customer",
      to: "provider",
      animated: true,
      label: "",
      showDots: true,
    },
    {
      from: "provider",
      to: "genesys",
      animated: true,
      label: "",
      showDots: true,
    },
    {
      from: "siebel",
      to: "dialogflow",
      label: "",
      animated: true,
      curve: true,
    },
    {
      from: "dialogflow",
      to: "genesys",
      label: "",
      curve: true,
      animated: true,
      curveType: "upward",
    },
    {
      from: "genesys",
      to: "dialogflow",
      label: "",
      curve: true,
      animated: true,
      curveType: "downward",
    },
    {
      from: "genesys",
      to: "queues",
      animated: false,
      label: "",
      showDots: true,
    },
    {
      from: "queues",
      to: "agent",
      animated: false,
      label: "",
      showDots: true,
    },

    {
      from: "siebel",
      to: "genesys",
      animated: true,
      label: "",
      showDots: true,
    },
    {
      from: "agent",
      to: "backup",
      animated: false,
      label: "",
      showDots: true,
    },
    {
      from: "provider",
      to: "trunks",
      dashed: true,
      label: "",
      animated: false,
      showDots: true, // Enabled showDots
    },
    {
      from: "trunks",
      to: "genesys",
      dashed: true,
      animated: false,
      showDots: true, // Enabled showDots
    },
    {
      from: "agent",
      to: "siebel",
      animated: true,
      label: "",
      showDots: true,
    },
    {
      from: "post-call-survey",
      to: "pureinsights",
      label: "",
      showDots: true,
    },
    {
      from: "agent",
      to: "pureinsights",
      dashed: true,
      label: "",
      showDots: true,
    },
  ];

  const calculatePath = (
    fromId: string,
    toId: string,
    curve?: boolean,
    curveType?: "downward" | "upward" | "auto",
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
      let controlY;
      const midX = (from.x + to.x) / 2;

      if (curveType === "downward") {
        controlY = Math.max(from.y, to.y) + 2;
      } else if (curveType === "upward") {
        controlY = Math.min(from.y, to.y) - 4;
      } else if (fromId === "dialogflow" && toId === "siebel") {
        controlY = (from.y + to.y) / 2 - 15; // Keep existing custom logic
      } else {
        controlY = from.y < to.y ? from.y + 30 : from.y - 30;
      }
      return {
        path: `M ${from.x} ${from.y} Q ${midX} ${controlY}, ${to.x} ${to.y}`,
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
    <div className="mt-[-1rem] p-4 font-sans bg-slate-900 text-white">
      <div className="flex flex-col items-center mb-1">
        <h1 className="text-xl font-bold text-white">
          Inbound Call Flow Architecture
        </h1>
        <p className="text-center text-xs text-slate-400">
          Genesys Cloud, Google Dialogflow, Siebel Integration, and PureInsights
          Reporting
        </p>
        <p
          className="text-center text-xs mt-1"
          style={{
            animation: "pulseColor 2s infinite",
            color: "#94a3b8", // initial slate-400 color
          }}
        >
          Hover over the icons to view descriptions.
        </p>

        <style>
          {`
@keyframes pulseColor {
  0%   { color: #94a3b8; }   /* slate-400 */
  50%  { color: #22d3ee; }   /* cyan-400 */
  100% { color: #94a3b8; }   /* slate-400 */
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
              conn.curve,
              conn.curveType
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
                    {/* Base path for the dots to follow (invisible) */}
                    <path
                      id={`dot-path-${index}`}
                      d={path}
                      fill="none"
                      stroke="transparent"
                      strokeWidth="10"
                    />
                    {/* Moving dots */}
                    <ellipse rx="0.3" ry="0.5" fill="#4FD1C5">
                      <animateMotion
                        dur={
                          conn.from === "provider" && conn.to === "trunks"
                            ? "4s"
                            : conn.from === "trunks" && conn.to === "genesys"
                            ? "4s"
                            : "8s"
                        }
                        repeatCount="indefinite"
                        path={path}
                        begin={
                          conn.from === "trunks" && conn.to === "genesys"
                            ? "4s"
                            : "0s"
                        }
                      />
                    </ellipse>
                    <ellipse rx="0.3" ry="0.5" fill="#4FD1C5">
                      <animateMotion
                        dur={
                          conn.from === "provider" && conn.to === "trunks"
                            ? "4s"
                            : conn.from === "trunks" && conn.to === "genesys"
                            ? "4s"
                            : "8s"
                        }
                        repeatCount="indefinite"
                        path={path}
                        begin={
                          conn.from === "trunks" && conn.to === "genesys"
                            ? "5s"
                            : "1s"
                        }
                      />
                    </ellipse>
                    <ellipse rx="0.3" ry="0.5" fill="#4FD1C5">
                      <animateMotion
                        dur={
                          conn.from === "provider" && conn.to === "trunks"
                            ? "4s"
                            : conn.from === "trunks" && conn.to === "genesys"
                            ? "4s"
                            : "8s"
                        }
                        repeatCount="indefinite"
                        path={path}
                        begin={
                          conn.from === "trunks" && conn.to === "genesys"
                            ? "6s"
                            : "2s"
                        }
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
                    strokeDasharray={
                      conn.from === "dialogflow" && conn.to === "queues"
                        ? "5,5"
                        : "10, 10"
                    }
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
            className={`absolute transform -translate-x-1/2 -translate-y-1/2 ${node.position} ${
              hoveredNode === node.id ? "z-20" : "z-10"
            }`}
          >
            <div
              onMouseEnter={() => setHoveredNode(node.id)}
              onMouseLeave={() => setHoveredNode(null)}
              className={`bg-slate-800/80 p-1 rounded-lg border ${node.color} ${
                node.id === "pureinsights"
                  ? "w-32"
                  : node.id === "pureinsights-kpis"
                  ? "w-24"
                  : "w-24"
              } text-center shadow-md hover:ring-1 hover:ring-cyan-400 transition-all`}
            >
              {node.stepText && (
                <div className="absolute top-[-20px] left-1/2 transform -translate-x-1/2 text-[11px] text-white whitespace-nowrap">
                  {node.stepText}
                </div>
              )}
              <div className="mb-0.5 mx-auto w-min">{node.icon}</div>
              <h3 className="text-[10px] font-bold leading-tight">
                {node.title}
              </h3>
              {hoveredNode === node.id && (
                <div
                  className={`absolute z-50 w-48 p-2 text-xs bg-slate-950 border border-cyan-500/50 rounded-md shadow-lg ${
                    ["provider", "backup"].includes(node.id)
                      ? "top-full mt-2 left-1/2 transform -translate-x-1/2"
                      : ["siebel", "genesys", "customer"].includes(node.id)
                      ? "bottom-full mb-2 left-1/2 transform -translate-x-1/2"
                      : ["queues"].includes(node.id)
                      ? "bottom-full mb-2 left-1/2 transform -translate-x-1/2"
                      : node.id === "agent"
                      ? "bottom-full mb-2 left-1/2 transform -translate-x-1/2"
                      : "right-full mr-2 top-1/2 transform -translate-y-1/2"
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

export default Inbound;
