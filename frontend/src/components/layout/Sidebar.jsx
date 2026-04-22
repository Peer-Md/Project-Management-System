export default function Sidebar({
  projects,
  selectedProjectId,
  onSelectProject,
  tasks,
  onOpenTaskForm,
  onApplyTemplate,
  onOpenProjectForm
}) {
  return (
    <aside className="w-80 border-r border-slate-800 bg-slate-900 p-4 overflow-auto">
      <h2 className="text-lg font-semibold mb-3">Projects</h2>
      <div className="space-y-2">
        {projects.map((project) => (
          <button
            key={project.id}
            className={`w-full text-left rounded p-2 ${
              selectedProjectId === project.id ? "bg-sky-700" : "bg-slate-800"
            }`}
            onClick={() => onSelectProject(project.id)}
          >
            <div className="font-medium">{project.name}</div>
            <div className="text-xs text-slate-300">{project.floors}</div>
          </button>
        ))}
      </div>
      <div className="mt-4 flex flex-wrap gap-2">
        <button className="rounded bg-violet-600 px-3 py-1 text-sm" onClick={onOpenProjectForm}>
          New Project
        </button>
        <button className="rounded bg-emerald-600 px-3 py-1 text-sm" onClick={onOpenTaskForm}>
          Add Task
        </button>
        <button className="rounded bg-indigo-600 px-3 py-1 text-sm" onClick={() => onApplyTemplate("Electrical")}>
          +Electrical
        </button>
      </div>
      <h3 className="mt-5 mb-2 font-semibold">Task List</h3>
      <ul className="space-y-2 text-sm">
        {tasks.map((task) => (
          <li key={task.id} className="rounded bg-slate-800 p-2">
            <div className="font-medium">{task.name}</div>
            <div className="text-xs text-slate-400">{task.floor} - {task.mep_type}</div>
          </li>
        ))}
      </ul>
    </aside>
  );
}
