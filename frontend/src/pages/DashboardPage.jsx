import { useEffect, useMemo, useState } from "react";
import Sidebar from "../components/layout/Sidebar";
import TopFilters from "../components/layout/TopFilters";
import TaskFormDrawer from "../components/tasks/TaskFormDrawer";
import GanttChart from "../components/gantt/GanttChart";
import ProjectFormModal from "../components/projects/ProjectFormModal";
import { api } from "../services/api";

export default function DashboardPage() {
  const [projects, setProjects] = useState([]);
  const [selectedProjectId, setSelectedProjectId] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [dependencies, setDependencies] = useState([]);
  const [criticalPathTaskIds, setCriticalPathTaskIds] = useState([]);
  const [filters, setFilters] = useState({ floor: "", mepType: "" });
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [projectModalOpen, setProjectModalOpen] = useState(false);
  const [chartView, setChartView] = useState("week");
  const [zoom, setZoom] = useState(1);
  const [error, setError] = useState("");

  async function loadProjects() {
    try {
      const list = await api.getProjects();
      setProjects(list);
      if (!selectedProjectId && list.length) setSelectedProjectId(list[0].id);
    } catch (e) {
      setError(e.message);
    }
  }

  async function loadGantt(projectId, nextFilters = filters) {
    if (!projectId) return;
    try {
      const data = await api.getGanttData(projectId, {
        floor: nextFilters.floor || undefined,
        mepType: nextFilters.mepType || undefined
      });
      setTasks(data.tasks || []);
      setDependencies(data.dependencies || []);
      setCriticalPathTaskIds(data.criticalPathTaskIds || []);
    } catch (e) {
      setError(e.message);
    }
  }

  useEffect(() => {
    loadProjects();
  }, []);

  useEffect(() => {
    loadGantt(selectedProjectId);
  }, [selectedProjectId]);

  const selectedProject = useMemo(
    () => projects.find((project) => project.id === selectedProjectId) || null,
    [projects, selectedProjectId]
  );

  async function onCreateTask(form) {
    await api.createTask(selectedProjectId, form);
    setDrawerOpen(false);
    await loadGantt(selectedProjectId);
  }

  async function onApplyTemplate(mepType) {
    await api.applyTemplate(selectedProjectId, mepType, { floor: "L1", startDate: "2026-05-01" });
    await loadGantt(selectedProjectId);
  }

  async function onFiltersChange(nextFilters) {
    setFilters(nextFilters);
    await loadGantt(selectedProjectId, nextFilters);
  }

  async function onCreateProject(form) {
    const created = await api.createProject(form);
    await loadProjects();
    setSelectedProjectId(created.id);
  }

  return (
    <div className="flex h-screen w-screen bg-slate-950 text-slate-100">
      <Sidebar
        projects={projects}
        selectedProjectId={selectedProjectId}
        onSelectProject={setSelectedProjectId}
        tasks={tasks}
        onOpenTaskForm={() => setDrawerOpen(true)}
        onApplyTemplate={onApplyTemplate}
        onOpenProjectForm={() => setProjectModalOpen(true)}
      />
      <main className="relative flex-1 overflow-hidden">
        <TopFilters
          filters={filters}
          onChange={onFiltersChange}
          chartView={chartView}
          onChartViewChange={setChartView}
          zoom={zoom}
          onZoomChange={setZoom}
        />
        <section className="h-[calc(100%-56px)] overflow-auto p-4">
          <div className="mb-3 text-sm text-slate-300">
            {selectedProject ? `${selectedProject.name} (${selectedProject.type})` : "No project selected"}
          </div>
          {error ? <p className="mb-2 text-sm text-rose-300">{error}</p> : null}
          <div className="rounded border border-slate-800 bg-slate-900 p-2">
            <GanttChart
              tasks={tasks}
              dependencies={dependencies}
              criticalPathTaskIds={criticalPathTaskIds}
              chartView={chartView}
              zoom={zoom}
            />
          </div>
        </section>
        <TaskFormDrawer open={drawerOpen} onClose={() => setDrawerOpen(false)} onSubmit={onCreateTask} />
        <ProjectFormModal
          open={projectModalOpen}
          onClose={() => setProjectModalOpen(false)}
          onSubmit={onCreateProject}
        />
      </main>
    </div>
  );
}
