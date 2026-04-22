import { useState } from "react";

const initialForm = {
  name: "",
  floors: "L1,L2,L3",
  type: "Commercial"
};

export default function ProjectFormModal({ open, onClose, onSubmit }) {
  const [form, setForm] = useState(initialForm);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  if (!open) return null;

  async function handleSubmit() {
    if (!form.name.trim()) {
      setError("Project name is required");
      return;
    }
    setSubmitting(true);
    setError("");
    try {
      await onSubmit({ ...form, name: form.name.trim() });
      setForm(initialForm);
      onClose();
    } catch (submitError) {
      setError(submitError.message || "Failed to create project");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="absolute inset-0 z-30 flex items-center justify-center bg-slate-950/60">
      <div className="w-full max-w-lg rounded-lg border border-slate-700 bg-slate-900 p-5 shadow-xl">
        <h3 className="mb-4 text-lg font-semibold">Create New Project</h3>
        <div className="space-y-3">
          <input
            className="w-full rounded border border-slate-700 bg-slate-800 p-2"
            placeholder="Project name"
            value={form.name}
            onChange={(event) => setForm({ ...form, name: event.target.value })}
          />
          <input
            className="w-full rounded border border-slate-700 bg-slate-800 p-2"
            placeholder="Floors (comma separated)"
            value={form.floors}
            onChange={(event) => setForm({ ...form, floors: event.target.value })}
          />
          <select
            className="w-full rounded border border-slate-700 bg-slate-800 p-2"
            value={form.type}
            onChange={(event) => setForm({ ...form, type: event.target.value })}
          >
            <option value="Commercial">Commercial</option>
            <option value="Residential">Residential</option>
            <option value="Industrial">Industrial</option>
            <option value="Infrastructure">Infrastructure</option>
          </select>
        </div>
        {error ? <p className="mt-3 text-sm text-rose-300">{error}</p> : null}
        <div className="mt-5 flex items-center gap-2">
          <button
            className="rounded bg-emerald-600 px-3 py-1.5 text-sm disabled:opacity-60"
            onClick={handleSubmit}
            disabled={submitting}
          >
            {submitting ? "Creating..." : "Create Project"}
          </button>
          <button className="rounded bg-slate-700 px-3 py-1.5 text-sm" onClick={onClose}>
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
