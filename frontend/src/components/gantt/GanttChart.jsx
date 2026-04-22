import { useEffect, useRef } from "react";
import * as d3 from "d3";

const statusColor = {
  "Not Started": "#64748b",
  "In Progress": "#3b82f6",
  Completed: "#10b981"
};

function getViewPaddingDays(chartView) {
  if (chartView === "day") return 2;
  if (chartView === "month") return 24;
  return 10;
}

export default function GanttChart({ tasks, dependencies, criticalPathTaskIds, chartView, zoom }) {
  const svgRef = useRef(null);

  useEffect(() => {
    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove();
    if (!tasks.length) return;

    const width = Math.floor(1200 * zoom);
    const rowHeight = 36;
    const margin = { top: 40, right: 40, bottom: 30, left: 220 };
    const height = margin.top + margin.bottom + tasks.length * rowHeight;
    svg.attr("width", width).attr("height", height);

    const minDate = d3.min(tasks, (d) => new Date(d.start_date));
    const maxDate = d3.max(tasks, (d) => new Date(d.end_date));
    const viewPaddingDays = getViewPaddingDays(chartView);
    const timelineStart = d3.timeDay.offset(minDate, -viewPaddingDays);
    const timelineEnd = d3.timeDay.offset(maxDate, viewPaddingDays);

    const x = d3.scaleTime().domain([minDate, maxDate]).range([margin.left, width - margin.right]);
    x.domain([timelineStart, timelineEnd]);

    const rowKey = (task) => `${task.floor} | ${task.mep_type} | ${task.name}`;
    const y = d3
      .scaleBand()
      .domain(tasks.map(rowKey))
      .range([margin.top, height - margin.bottom])
      .padding(0.25);

    const axisGenerator =
      chartView === "day"
        ? d3.axisTop(x).ticks(Math.min(14, tasks.length + 8)).tickFormat(d3.timeFormat("%d %b"))
        : chartView === "month"
          ? d3.axisTop(x).ticks(d3.timeMonth.every(1)).tickFormat(d3.timeFormat("%b %Y"))
          : d3.axisTop(x).ticks(d3.timeWeek.every(1)).tickFormat(d3.timeFormat("%d %b"));

    svg
      .append("g")
      .attr("transform", `translate(0,${margin.top - 8})`)
      .call(axisGenerator.tickSizeOuter(0))
      .selectAll("text")
      .attr("fill", "#cbd5e1");

    svg
      .append("g")
      .attr("transform", `translate(${margin.left},0)`)
      .call(d3.axisLeft(y).tickSizeOuter(0))
      .selectAll("text")
      .attr("fill", "#cbd5e1")
      .style("font-size", "11px");

    const idToTask = new Map(tasks.map((t) => [t.id, t]));
    const criticalSet = new Set(criticalPathTaskIds);

    svg
      .append("g")
      .attr("stroke", "#1e293b")
      .selectAll("line")
      .data(x.ticks(chartView === "month" ? d3.timeMonth.every(1) : d3.timeWeek.every(1)))
      .join("line")
      .attr("x1", (date) => x(date))
      .attr("x2", (date) => x(date))
      .attr("y1", margin.top)
      .attr("y2", height - margin.bottom);

    svg
      .append("g")
      .selectAll("rect")
      .data(tasks)
      .join("rect")
      .attr("x", (d) => x(new Date(d.start_date)))
      .attr("y", (d) => y(rowKey(d)))
      .attr("width", (d) => Math.max(6, x(new Date(d.end_date)) - x(new Date(d.start_date))))
      .attr("height", y.bandwidth())
      .attr("rx", 4)
      .attr("fill", (d) => statusColor[d.status] || "#64748b")
      .attr("stroke", (d) => (criticalSet.has(d.id) ? "#f59e0b" : "none"))
      .attr("stroke-width", (d) => (criticalSet.has(d.id) ? 2 : 0));

    const today = new Date();
    if (today >= timelineStart && today <= timelineEnd) {
      svg
        .append("line")
        .attr("x1", x(today))
        .attr("x2", x(today))
        .attr("y1", margin.top - 4)
        .attr("y2", height - margin.bottom)
        .attr("stroke", "#ef4444")
        .attr("stroke-width", 1.5)
        .attr("stroke-dasharray", "4,4");
    }

    const arrowLayer = svg.append("g").attr("fill", "none").attr("stroke", "#94a3b8");
    dependencies.forEach((dep) => {
      const toTask = idToTask.get(dep.task_id);
      const fromTask = idToTask.get(dep.depends_on_task_id);
      if (!toTask || !fromTask) return;
      const x1 = x(new Date(fromTask.end_date));
      const y1 = y(rowKey(fromTask)) + y.bandwidth() / 2;
      const x2 = x(new Date(toTask.start_date));
      const y2 = y(rowKey(toTask)) + y.bandwidth() / 2;
      arrowLayer
        .append("path")
        .attr("d", `M${x1},${y1} C${x1 + 30},${y1} ${x2 - 30},${y2} ${x2},${y2}`)
        .attr("stroke-width", 1.4);
    });
  }, [tasks, dependencies, criticalPathTaskIds, chartView, zoom]);

  return <svg ref={svgRef} className="w-full h-full" />;
}
