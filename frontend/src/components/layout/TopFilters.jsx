export default function TopFilters({ filters, onChange, chartView, onChartViewChange, zoom, onZoomChange }) {
  return (
    <div className="flex items-center gap-3 border-b border-slate-800 bg-slate-900 px-4 py-3">
      <select
        value={filters.floor}
        onChange={(e) => onChange({ ...filters, floor: e.target.value })}
        className="rounded bg-slate-800 px-2 py-1"
      >
        <option value="">All Floors</option>
        <option value="L1">L1</option>
        <option value="L2">L2</option>
        <option value="L3">L3</option>
      </select>
      <select
        value={filters.mepType}
        onChange={(e) => onChange({ ...filters, mepType: e.target.value })}
        className="rounded bg-slate-800 px-2 py-1"
      >
        <option value="">All MEP Types</option>
        <option value="Electrical">Electrical</option>
        <option value="HVAC">HVAC</option>
        <option value="Plumbing">Plumbing</option>
      </select>
      <select
        value={chartView}
        onChange={(e) => onChartViewChange(e.target.value)}
        className="rounded bg-slate-800 px-2 py-1"
      >
        <option value="day">Day View</option>
        <option value="week">Week View</option>
        <option value="month">Month View</option>
      </select>
      <label className="ml-auto flex items-center gap-2 text-xs text-slate-300">
        Zoom
        <input
          type="range"
          min="0.7"
          max="1.8"
          step="0.1"
          value={zoom}
          onChange={(e) => onZoomChange(Number(e.target.value))}
        />
      </label>
    </div>
  );
}
