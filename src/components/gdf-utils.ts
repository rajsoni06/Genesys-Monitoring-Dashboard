import { NodeType } from "./gdf-data";

export const calculatePath = (fromId: string, toId: string, curve?: boolean, nodes?: NodeType[]) => {
    if (!nodes) return { path: "", labelPos: { x: 0, y: 0 } };
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
      labelPos: { x: (from.x + to.x) / 2, y: (from.y + to.y) / 2 },
    };
  };

  export const getPulseOffset = (index: number, pulsePhase: number) => (pulsePhase + index * 10) % 60;
