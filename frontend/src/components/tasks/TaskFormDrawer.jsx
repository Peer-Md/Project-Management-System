import { useState } from "react";

const initial = {
  name: "",
  mepType: "Electrical",
  floor: "L1",
  startDate: "2026-05-01",
  quantity: 100,
  productivityRate: 50,
  status: "Not Started",
  completionPercent: 0
};

export default function TaskFormDrawer({ open, onClose, onSubmit }) {
  const [form, setForm] = useState(initial);
  if (!open) return null;

  return (
    <div className="absolute right-0 top-0 h-full w-96 border-l border-slate-800 bg-slate-900 p-4">
      <h3 className="text-lg font-semibold mb-3">Create Task</h3>
      <div className="space-y-2">
        <input
          className="w-full rounded bg-slate-800 p-2"
          placeholder="Task name"
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
        />
        <select
          className="w-full rounded bg-slate-800 p-2"
          value={form.mepType}
          onChange={(e) => setForm({ ...form, mepType: e.target.value })}
        >
          <option>Electrical</option>
          <option>HVAC</option>
          <option>Plumbing</option>
        </select>
        <input className="w-full rounded bg-slate-800 p-2" value={form.floor} onChange={(e) => setForm({ ...form, floor: e.target.value })} />
        <input type="date" className="w-full rounded bg-slate-800 p-2" value={form.startDate} onChange={(e) => setForm({ ...form, startDate: e.target.value })} />
        <input type="number" className="w-full rounded bg-slate-800 p-2" value={form.quantity} onChange={(e) => setForm({ ...form, quantity: Number(e.target.value) })} />
        <input type="number" className="w-full rounded bg-slate-800 p-2" value={form.productivityRate} onChange={(e) => setForm({ ...form, productivityRate: Number(e.target.value) })} />
      </div>
      <div className="mt-4 flex gap-2">
        <button className="rounded bg-emerald-600 px-3 py-1" onClick={() => onSubmit(form)}>
          Save Task
        </button>
        <button className="rounded bg-slate-700 px-3 py-1" onClick={onClose}>
          Cancel
        </button>
      </div>
    </div>
  );
}
