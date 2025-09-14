import React, { useEffect, useRef, useState } from 'react';

export default function DrawingCanvas({
  socket,
  tool,
  color,
  strokeWidth,
  clearSignal,
  drawingData = []
}) {
  const canvasRef = useRef(null);
  const [drawing, setDrawing] = useState(false);
  const [lastPoint, setLastPoint] = useState(null);
  const remoteStrokes = useRef({}); // { socketId: { lastPoint, color, strokeWidth, tool } }

  useEffect(() => {
    if (!socket) return;

    socket.on("draw-start", ({ socketId, x, y, color, strokeWidth, tool }) => {
      remoteStrokes.current[socketId] = {
        lastPoint: { x, y },
        color,
        strokeWidth,
        tool
      };
    });

    socket.on("draw-move", ({ socketId, x, y }) => {
      const stroke = remoteStrokes.current[socketId];
      if (!stroke) return;
      const ctx = canvasRef.current.getContext('2d');
      ctx.strokeStyle = stroke.color;
      ctx.lineWidth = stroke.strokeWidth;
      ctx.lineCap = "round";
      ctx.lineJoin = "round";
      ctx.globalAlpha = stroke.tool === "pencil" ? 0.7 : 1.0;
      ctx.beginPath();
      ctx.moveTo(stroke.lastPoint.x, stroke.lastPoint.y);
      ctx.lineTo(x, y);
      ctx.stroke();
      stroke.lastPoint = { x, y };
    });

    socket.on("draw-end", ({ socketId }) => {
      delete remoteStrokes.current[socketId];
    });

    socket.on("clear-canvas", () => {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      ctx.clearRect(0, 0, canvas.width, canvas.height);
    });

    return () => {
      socket.off("draw-start");
      socket.off("draw-move");
      socket.off("draw-end");
      socket.off("clear-canvas");
    };
  }, [socket]);

  useEffect(() => {
    if (clearSignal) {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      ctx.clearRect(0, 0, canvas.width, canvas.height);
    }
  }, [clearSignal]);

  useEffect(() => {
    if (!drawingData || drawingData.length === 0) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    const tempStrokes = {};
    drawingData.forEach(cmd => {
      if (cmd.type === "clear") {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
      } else if (cmd.type === "stroke-start") {
        tempStrokes[cmd.data.socketId] = {
          lastPoint: { x: cmd.data.x, y: cmd.data.y },
          color: cmd.data.color,
          strokeWidth: cmd.data.strokeWidth,
          tool: cmd.data.tool
        };
      } else if (cmd.type === "stroke-move") {
        const stroke = tempStrokes[cmd.data.socketId];
        if (stroke) {
          ctx.strokeStyle = stroke.color;
          ctx.lineWidth = stroke.strokeWidth;
          ctx.lineCap = "round";
          ctx.lineJoin = "round";
          ctx.globalAlpha = stroke.tool === "pencil" ? 0.7 : 1.0;
          ctx.beginPath();
          ctx.moveTo(stroke.lastPoint.x, stroke.lastPoint.y);
          ctx.lineTo(cmd.data.x, cmd.data.y);
          ctx.stroke();
          stroke.lastPoint = { x: cmd.data.x, y: cmd.data.y };
        }
      } else if (cmd.type === "stroke-end") {
        delete tempStrokes[cmd.data.socketId];
      }
    });
  }, [drawingData]);

  const getPointer = (e) => {
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;
    const x = (clientX - rect.left) * scaleX;
    const y = (clientY - rect.top) * scaleY;
    return { x, y };
  };

  const handlePointerDown = (e) => {
    setDrawing(true);
    const pt = getPointer(e);
    setLastPoint(pt);
    if (socket) {
      socket.emit("draw-start", {
        x: pt.x,
        y: pt.y,
        color,
        strokeWidth,
        tool
      });
    }
  };

  const handlePointerMove = (e) => {
    if (!drawing) return;
    const pt = getPointer(e);
    const ctx = canvasRef.current.getContext('2d');
    ctx.strokeStyle = color;
    ctx.lineWidth = strokeWidth;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.globalAlpha = tool === "pencil" ? 0.7 : 1.0;
    if (lastPoint) {
      ctx.beginPath();
      ctx.moveTo(lastPoint.x, lastPoint.y);
      ctx.lineTo(pt.x, pt.y);
      ctx.stroke();
    }
    setLastPoint(pt);
    if (socket) {
      socket.emit("draw-move", {
        x: pt.x,
        y: pt.y
      });
    }

    if (socket) {
      socket.emit("cursor-move", {
        x: pt.x,
        y: pt.y
      });
    }
  };

  const handlePointerUp = () => {
    setDrawing(false);
    setLastPoint(null);
    if (socket) {
      socket.emit("draw-end", {});
    }
  };

  const handleMouseMove = (e) => {
    if (!drawing && socket) {
      const pt = getPointer(e);
      socket.emit("cursor-move", {
        x: pt.x,
        y: pt.y
      });
    }
    handlePointerMove(e);
  };

  const handleTouchMove = (e) => {
    if (!drawing && socket) {
      const pt = getPointer(e);
      socket.emit("cursor-move", {
        x: pt.x,
        y: pt.y
      });
    }
    handlePointerMove(e);
  };

  return (
    <canvas
      ref={canvasRef}
      className='touch-auto w-full h-[600px] cursor-crosshair bg-white touch-pinch-zoom border'
      width={800}
      height={500}
      onMouseDown={handlePointerDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handlePointerUp}
      onMouseLeave={handlePointerUp}
      onTouchStart={handlePointerDown}
      onTouchMove={handleTouchMove}
      onTouchEnd={handlePointerUp}
    />
  );
}
