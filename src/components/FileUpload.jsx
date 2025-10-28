import { loadJSONFile } from "../data/loaders/jsonLoader";
import { validateModel } from "../core/parser";
import { buildGraph } from "../core/model";
import { useApp } from "../state/store";

export default function FileUpload() {
  const { setModel, setGraph } = useApp();

  // Handle file selection
  async function onChange(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const json = await loadJSONFile(file);
      const { ok, errors } = validateModel(json);
      if (!ok) {
        alert("Invalid model:\n" + errors.join("\n"));
        return;
      }
      const g = buildGraph(json.features);
      setModel(json);
      setGraph(g);
    } catch (err) {
      alert("Failed to load: " + err.message);
    }
  }

  return (
    <div>
      <input type="file" accept="application/json" onChange={onChange} />
    </div>
  );
}
