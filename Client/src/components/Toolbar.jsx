const TOOL_OPTIONS = [
  { label: "Pencil", value: "pencil" },
  { label: "Pen", value: "pen" }
];

const COLORS = [
  { label: "Black", value: "#000000" },
  { label: "Red", value: "#ff0000" },
  { label: "Green", value: "#00ff00" },
  { label: "Blue", value: "#0000ff" }
];

const Toolbar = ({
  tool,
  setTool,
  strokeWidth,
  setStrokeWidth,
  color,
  setColor,
  onClear
}) => {
  
  return (
    <div className="flex items-center gap-4 p-2 bg-gray-100 border-b">
      <div>
        <span className="mr-2">Tool:</span>
        {TOOL_OPTIONS.map(opt => (
          <button
            key={opt.value}
            className={`cursor-pointer px-2 py-1 rounded ${tool === opt.value ? "bg-blue-500 text-white" : "bg-white border"}`}
            onClick={() => setTool(opt.value)}
          >
            {opt.label}
          </button>
        ))}
      </div>
      <div>
        <span className="mr-2">Stroke:</span>
        <input
        className="cursor-pointer"
          type="range"
          min={1}
          max={20}
          value={strokeWidth}
          onChange={e => setStrokeWidth(Number(e.target.value))}
        />
        <span className="ml-2">{strokeWidth}px</span>
      </div>
      <div>
        <span className="mr-2">Color:</span>
        {COLORS.map(c => (
          <button
            key={c.value}
            className={`w-6 cursor-pointer h-6 rounded-full border-2 mx-1 ${color === c.value ? "border-black" : "border-gray-300"}`}
            style={{ backgroundColor: c.value }}
            onClick={() => setColor(c.value)}
          />
        ))}
      </div>
      <button
        className="ml-4 cursor-pointer px-3 py-1 bg-red-400 hover:bg-red-600 text-white rounded"
        onClick={onClear}
      >
        Clear
      </button>
    </div>
  );
};

export default Toolbar;
