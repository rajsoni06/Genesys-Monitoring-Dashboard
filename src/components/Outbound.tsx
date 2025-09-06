import { useState, useEffect } from "react";
import {
  Server,
  Cloud,
  Cpu,
  PhoneOutgoing,
  PhoneForwarded,
  PhoneIncoming,
  Archive,
  Layers,
  User,
  AlertCircle,
  Database,
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

const Outbound = () => {
  const [hoveredNode, setHoveredNode] = useState<string | null>(null);
  const [pulsePhase, setPulsePhase] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setPulsePhase((prev) => (prev + 1) % 60);
    }, 100);
    return () => clearInterval(interval);
  }, []);

  const nodeToStepMap: { [key: string]: string } = {
    siebel: "1. File Preparation",
    tibco: "2. Data Flow & Transformation",
    "aws-sftp": "3. File Monitoring",
    "lambda-mdt": "4. Pre-Dial Checks",
    "genesys-direct": "5. DC Dialer Flow",
    "genesys-cloud": "7. Attempt Control",
    "siebel-iws": "8. Genesys Widget",
    "siebel-crm-sync": "10. Siebel CRM Sync",
    "past-due-records": "6. Past Due Records",
    "aws-backup": "9. Daily Backup",
  };

  const nodes: NodeType[] = [
    {
      id: "siebel",
      title: "Siebel CRM",
      icon: <Server className="w-6 h-6 text-purple-400" />,
      description:
        "Siebel CRM is the system of record for customer interactions. It generates dialer files (COT, Sales, CRT) with contact details and metadata, sending them to Tibco. After agent interactions, call outcomes (e.g., successful sale, callback) are immediately written back to Siebel, ensuring it remains the primary source of truth for customer updates and long-term tracking.",
      position: "left-[10%] top-[40%]",
      color: "border-purple-400",
      stepText: nodeToStepMap["siebel"],
    },
    {
      id: "tibco",
      title: "TIBCO Integration",
      icon: <Layers className="w-6 h-6 text-blue-400" />,
      description:
        "TIBCO acts as the middleware bus, orchestrating bidirectional data flow between Siebel, AWS, and Genesys. It transforms and routes dialer files from Siebel to AWS/Genesys. Crucially, for callbacks or campaign adjustments, Siebel updates flow back through TIBCO to AWS/Genesys, ensuring records are re-queued for subsequent attempts and maintaining synchronized data across systems.",
      position: "left-[25%] top-[40%]",
      color: "border-blue-400",
      stepText: nodeToStepMap["tibco"],
    },
    {
      id: "aws-sftp",
      title: "AWS SFTP + MDT Processing",
      icon: <Cloud className="w-6 h-6 text-cyan-400" />,
      description:
        "AWS Transfer Family SFTP endpoint that receives files from Tibco. Secures data in S3 landing bucket and triggers the MDT (Metadata Transformation) process to align formats and timezones with Genesys requirements.",
      position: "left-[40%] top-[40%]",
      color: "border-cyan-400",
      stepText: nodeToStepMap["aws-sftp"],
    },
    {
      id: "lambda-mdt",
      title: "Lambda (MDT)",
      icon: <Cpu className="w-6 h-6 text-yellow-400" />,
      description:
        "Core processing engine that scans files every 2 minutes. Validates, normalizes timezones to UTC, deduplicates, and transforms data to JSONL. Performs pre-dial checks and routes contacts to correct campaign based on PDSR/eligibility.",
      position: "left-[57%] top-[40%]",
      color: "border-yellow-400",
      stepText: nodeToStepMap["lambda-mdt"],
    },
    {
      id: "genesys-cloud",
      title: "Genesys Cloud",
      icon: (
        <PhoneOutgoing
          className="w-6 h-6 text-red-400"
          style={{
            animation: "glowPulse 2.0s infinite ease-in-out", // slower pulse (5s full cycle)
          }}
        />
      ),
      description:
        "Genesys Cloud manages all outbound dialing campaigns (Sales, CRT, COT, Max Dialer, Callbacks), enforcing attempt control and handling contact lists. It orchestrates call routing, retries, and dialer attempts. After interactions, campaign data is exported daily to AWS Backup, ensuring synchronization with Siebel CRM for comprehensive tracking and analysis.",
      position: "left-[75%] top-[40%]",
      color: "border-red-400",
      stepText: nodeToStepMap["genesys-cloud"],
    },
    {
      id: "genesys-direct",
      title: "DC Dialer",
      icon: <PhoneForwarded className="w-6 h-6 text-red-300" />,
      description:
        "Direct flow bypassing AWS where Tibco inserts contacts directly into Genesys 15 minutes before dial-out. Used for time-sensitive calls without Siebel call time data.",
      position: "left-[49%] top-[70%]",
      color: "border-red-300",
      stepText: nodeToStepMap["genesys-direct"],
    },
    {
      id: "siebel-iws",
      title: "Siebel IWS",
      icon: <PhoneIncoming className="w-6 h-6 text-purple-300" />,
      description:
        "Siebel IWS is the agent’s interface with an embedded Genesys widget. It provides screen pops with customer data during calls and lets agents record outcomes directly in Siebel CRM.",
      position: "left-[90%] top-[40%]",
      color: "border-purple-300",
      stepText: nodeToStepMap["siebel-iws"],
    },
    {
      id: "aws-backup",
      title: "AWS Backup",
      icon: <Archive className="w-6 h-6 text-gray-400" />,
      description:
        "AWS Backup stores daily exported dialer/campaign data, call outcomes, dispositions, and logs from Genesys. This ensures comprehensive data archival and synchronization with Siebel CRM, serving as a critical backup for long-term tracking and analytics. Data is managed with lifecycle policies, including movement to Glacier.",
      position: "left-[90%] top-[17%]",
      color: "border-gray-400",
      stepText: nodeToStepMap["aws-backup"],
    },
    {
      id: "past-due-records",
      title: "Past Due Records",
      icon: <AlertCircle className="w-6 h-6 text-orange-400" />,
      description:
        "Contacts not dialed during the day are marked as past due. These records are automatically carried forward to the next day's dialer file for retry in future campaigns.",
      position: "left-[75%] top-[70%]",
      color: "border-orange-400",
      stepText: nodeToStepMap["past-due-records"],
    },
    {
      id: "agent-experience",
      title: "Agent Experience",
      icon: <User className="w-6 h-6 text-indigo-400" />,
      description:
        "Agents use Siebel with integrated Genesys window for call handling. Features include: Answer calls, Transfer calls, View customer data via screen pops, and Access interaction history.",
      position: "left-[90%] top-[60%]",
      color: "border-indigo-400",
    },
    {
      id: "siebel-crm-sync",
      title: "Siebel CRM Sync",
      icon: <Database className="w-6 h-6 text-green-400" />,
      description:
        "After each call, agent updates like sales outcomes, callbacks, or wrong numbers are recorded in Siebel CRM. Siebel remains the source of truth, while TIBCO can relay updates via AWS and Genesys for future campaigns and retries.",
      position: "left-[90%] top-[86%]",
      color: "border-green-400",
      stepText: nodeToStepMap["siebel-crm-sync"],
    },
  ];

  const connections: ConnectionType[] = [
    {
      from: "siebel",
      to: "tibco",
      animated: true,
      label: "",
      showDots: true,
    },
    {
      from: "tibco",
      to: "aws-sftp",
      animated: true,
      label: "",
      showDots: true,
    },
    {
      from: "aws-sftp",
      to: "lambda-mdt",
      animated: true,
      label: "",
      showDots: true,
    },
    {
      from: "lambda-mdt",
      to: "genesys-cloud",
      animated: true,
      label: "",
      showDots: true,
    },
    {
      from: "genesys-direct",
      to: "tibco",
      dashed: true,
      label: "",
      animated: true,
    },
    {
      from: "genesys-cloud",
      to: "genesys-direct",
      dashed: true,
      label: "",
      animated: true,
    },
    {
      from: "genesys-cloud",
      to: "siebel-iws",
      animated: true,
      label: "",
      showDots: true,
    },
    {
      from: "aws-backup",
      to: "genesys-cloud",
      animated: true,
      label: "",
    },
    {
      from: "siebel-iws",
      to: "agent-experience",
      label: "",
      showDots: true,
    },
    {
      from: "past-due-records",
      to: "genesys-cloud",
      label: "",
      showDots: true,
    },
    {
      from: "aws-sftp",
      to: "genesys-cloud",
      label: "",
      showDots: true,
    },
    {
      from: "aws-sftp",
      to: "past-due-records",
      label: "",
      showDots: true,
      curve: true,
    },
    {
      from: "agent-experience",
      to: "siebel-crm-sync",
      animated: true,
      label: "",
      showDots: true,
    },
    {
      from: "siebel-crm-sync",
      to: "siebel",
      curve: true,
      label: "",
      showDots: true,
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

    const parse = (pos: string) => ({
      x: parseInt(pos.match(/left-\[(\d+)%\]/)?.[1] || "0"),
      y: parseInt(pos.match(/top-\[(\d+)%\]/)?.[1] || "0"),
    });

    const from = parse(fromNode.position);
    const to = parse(toNode.position);

    if (curve) {
      let controlY;
      if (
        (fromId === "siebel" && toId === "siebel-crm-sync") ||
        (fromId === "siebel-crm-sync" && toId === "siebel")
      ) {
        controlY = (from.y + to.y) / 2 + 39;
      } else {
        controlY = from.y < to.y ? from.y + 30 : from.y - 30;
      }

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
    <div className="mt-[-1.2rem] p-4 font-sans bg-slate-900 text-white">
      <div className="flex flex-col items-center mb-1">
        <h1 className="text-xl font-bold text-white">
          Outbound Call Flow Architecture
        </h1>
        <p className="text-center text-xs text-slate-400">
          Siebel, Tibco, AWS, and Genesys Cloud Integration
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
        <style>
          {`
@keyframes glowPulse {
  0%   { transform: scale(0.9); opacity: 0.9; }
  50%  { transform: scale(1.0); opacity: 1; }
  100% { transform: scale(0.9); opacity: 0.9; }
  0%   { color: #f87171; text-shadow: 0 0 0px #f87171; }
  100% { color: #f87171; text-shadow: 0 0 0px #f87171; }
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
            <filter id="pulse" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur
                in="SourceGraphic"
                stdDeviation="2"
                result="blur"
              />
              <feColorMatrix
                in="blur"
                mode="matrix"
                values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 0.8 0"
                result="pulse"
              />
              <feMerge>
                <feMergeNode in="pulse" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
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
                    strokeWidth="0.8"
                    strokeDasharray="8, 40"
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
                    className="text-[5px]"
                    dy="-2.5"
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
              className={`bg-slate-800/80 p-1 rounded-lg border ${node.color} ${
                node.id === "genesys-cloud" ? "w-36" : "w-24"
              } text-center shadow-md hover:ring-1 hover:ring-cyan-400 transition-all`}
            >
              <div className="mb-0.5 mx-auto w-min">{node.icon}</div>
              <h3 className="text-[10px] font-bold leading-tight">
                {node.title}
              </h3>
              {node.id === "genesys-cloud" && (
                <div className="mt-1 text-[11px] space-y-0.5">
                  <div className="font-extrabold text-cyan-400 text-xs">
                    Dialer Campaigns:
                  </div>
                  <div className="flex space-x-1">
                    <span className="rounded border border-gray-500 px-1 block whitespace-nowrap">
                      Sales Dialer
                    </span>
                    <span className="rounded border border-gray-500 px-1 block whitespace-nowrap">
                      CRT Dialer
                    </span>
                  </div>
                  <div className="flex space-x-1 mt-1">
                    <span className="rounded border border-gray-500 px-1 block">
                      COT Dialer
                    </span>
                    <span className="rounded border border-gray-500 px-1 block">
                      Max Dialer
                    </span>
                  </div>
                  <br />
                  <span className="rounded border border-pink-400 text-white-400 px-1 block mt-1">
                    Callback Dialers
                  </span>
                </div>
              )}
              {hoveredNode === node.id && (
                <div
                  className={`absolute z-50 w-48 p-2 text-xs bg-slate-950 border border-cyan-500/50 rounded-md shadow-lg ${
                    ["aws-sftp", "lambda-mdt", "siebel-crm-sync"].includes(
                      node.id
                    )
                      ? "bottom-full mb-2 left-1/2 transform -translate-x-1/2"
                      : ["siebel", "tibco"].includes(node.id)
                      ? "top-full mt-2 left-1/2 transform -translate-x-1/2"
                      : ["genesys-direct"].includes(node.id)
                      ? "right-full mr-2 top-1/2 transform -translate-y-1/2"
                      : node.id === "siebel-iws"
                      ? "right-[20%] pr-8 top-[5%] transform -translate-y-1/2"
                      : node.id === "genesys-cloud"
                      ? "right-full mr-2 top-1/2 transform -translate-y-1/2"
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

export default Outbound;
