import { useEffect, useRef, useState } from "react";

const CURSOR_COLORS = [
  "#ff0000",
  "#00ff00",
  "#0000ff",
  "#ff00ff",
  "#00ffff",
  "#ffa500",
  "#800080",
  "#008000",
];

export default function UserCursors({ remoteCursors }) {
  const overlayRef = useRef(null);
  const [canvasRect, setCanvasRect] = useState({
    left: 0,
    top: 0,
    width: 1,
    height: 1,
  });

  useEffect(() => {
    const updateRect = () => {
      const canvas = document.querySelector("canvas");
      if (canvas) {
        const parent = canvas.offsetParent;
        const canvasRect = canvas.getBoundingClientRect();
        const parentRect = parent
          ? parent.getBoundingClientRect()
          : { left: 0, top: 0 };
        setCanvasRect({
          left: canvasRect.left - parentRect.left,
          top: canvasRect.top - parentRect.top,
          width: canvasRect.width,
          height: canvasRect.height,
        });
      }
    };
    updateRect();
    window.addEventListener("resize", updateRect);
    window.addEventListener("scroll", updateRect, true);
    return () => {
      window.removeEventListener("resize", updateRect);
      window.removeEventListener("scroll", updateRect, true);
    };
  }, []);

  const now = Date.now();
  const cursors = Object.entries(remoteCursors || {}).filter(
    ([, v]) => now - v.lastSeen < 5000
  );

  const CANVAS_WIDTH = 800;
  const CANVAS_HEIGHT = 500;

  return (
    <div
      ref={overlayRef}
      className="pointer-events-none absolute z-50"
      style={{
        left: `${canvasRect.left}px`,
        top: `${canvasRect.top}px`,
        width: `${canvasRect.width}px`,
        height: `${canvasRect.height}px`,
        pointerEvents: "none",
      }}
    >
      {cursors.map(([socketId, { x, y }], idx) => {
        const scaledX = (x / CANVAS_WIDTH) * canvasRect.width;
        const scaledY = (y / CANVAS_HEIGHT) * canvasRect.height;
        return (
          <div
            key={socketId}
            className="absolute"
            style={{
              transform: `translate(${scaledX - 8}px, ${scaledY - 8}px)`,
              transition: "transform 0.05s linear",
              zIndex: 100,
            }}
          >
            <div
              className="w-4 h-4 rounded-full border-2 shadow cursor-none"
              style={{
                background: CURSOR_COLORS[idx % CURSOR_COLORS.length],
                borderColor: "#fff",
                boxShadow: "0 0 2px #000",
              }}
              title={`User: ${socketId}`}
            />
          </div>
        );
      })}
    </div>
  );
}
