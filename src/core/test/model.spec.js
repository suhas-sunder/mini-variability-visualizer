import { describe, test, expect } from "vitest";
import { buildGraph } from "../model";
import { pathToRoot } from "../search";
import infusionSystemModel from "../../../public/sample-complex-infusion-system.json";
import automotiveSystemModel from "../../../public/sample-automotive.json";
import iotSystemModel from "../../../public/sample-iot.json";
import medicalSystemModel from "../../../public/sample-medical.json";

function verifyGraphIntegrity(model) {
  const graph = buildGraph(model.features);
  expect(graph.nodes).toHaveLength(model.features.length);
  expect(graph.parentMap instanceof Map).toBe(true);
  expect(Array.isArray(graph.edges)).toBe(true);
  expect(graph.nodes.some((n) => n.id === model.root)).toBe(true);
  expect(graph.edges.length).toBeGreaterThan(0);
  expect(graph.parentMap.size).toBeGreaterThan(0);
  expect(graph.nodes.every((node) => typeof node.id === "string")).toBe(true);
}

describe("buildGraph() structure and consistency", () => {
  test("infusion system builds correct graph", () => {
    verifyGraphIntegrity(infusionSystemModel, "Infusion System");
  });

  test("automotive system builds correct graph", () => {
    verifyGraphIntegrity(automotiveSystemModel, "Automotive System");
  });

  test("IoT system builds correct graph", () => {
    verifyGraphIntegrity(iotSystemModel, "IoT System");
  });

  test("medical system builds correct graph", () => {
    verifyGraphIntegrity(medicalSystemModel, "Medical System");
  });
});

describe("pathToRoot() traversal behavior", () => {
  const graph = buildGraph(infusionSystemModel.features);

  test("path from Bluetooth → InfusionPump is correct", () => {
    const path = pathToRoot("Bluetooth", graph.parentMap);
    expect(path).toEqual(["InfusionPump", "Communication", "Bluetooth"]);
  });

  test("path from FlowSensor → InfusionPump is correct", () => {
    const path = pathToRoot("FlowSensor", graph.parentMap);
    expect(path[0]).toBe("InfusionPump");
    expect(path.includes("SafetySystem")).toBe(true);
  });

  test("pathToRoot() returns single node for root feature", () => {
    const path = pathToRoot("InfusionPump", graph.parentMap);
    expect(path).toEqual(["InfusionPump"]);
  });

  test("invalid feature ID returns empty array", () => {
    const path = pathToRoot("FakeFeature", graph.parentMap);
    expect(path).toEqual([]);
  });
});
