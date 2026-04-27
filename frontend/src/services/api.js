const API_BASE = "https://pm-backend-i9ha.onrender.com/api";

async function request(path, options = {}) {
  const response = await fetch(`${API_BASE}${path}`, {
    headers: { "Content-Type": "application/json" },
    ...options
  });
  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: "Request failed" }));
    throw new Error(error.message || "Request failed");
  }
  if (response.status === 204) return null;
  return response.json();
}

export const api = {
  getProjects: () => request("/projects"),
  createProject: (payload) => request("/projects", { method: "POST", body: JSON.stringify(payload) }),
  getTasks: (projectId) => request(`/projects/${projectId}/tasks`),
  createTask: (projectId, payload) =>
    request(`/projects/${projectId}/tasks`, { method: "POST", body: JSON.stringify(payload) }),
  applyTemplate: (projectId, mepType, payload) =>
    request(`/projects/${projectId}/templates/${mepType}/apply`, {
      method: "POST",
      body: JSON.stringify(payload)
    }),
  getGanttData: (projectId, filters) => {
    const params = new URLSearchParams(filters).toString();
    return request(`/projects/${projectId}/gantt${params ? `?${params}` : ""}`);
  }
};
