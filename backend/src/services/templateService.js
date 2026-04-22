const templates = {
  Electrical: [
    "Cable Tray Installation",
    "Conduit Work",
    "Cable Pulling",
    "Termination",
    "Testing"
  ],
  HVAC: ["Duct Installation", "AHU Installation", "Testing & Balancing"],
  Plumbing: ["Pipe Routing", "Fixture Installation", "Hydro Test", "Commissioning"]
};

export function getTemplateTasks(mepType) {
  return templates[mepType] || [];
}
