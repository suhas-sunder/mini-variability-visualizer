import React from "react";
import { FileJson } from "lucide-react";

export default function JsonUploadInstructions() {
  return (
    <div className="w-full max-w-3xl mx-auto mt-6 p-6 bg-gray-950/80 text-gray-200 rounded-2xl border border-gray-800 shadow-lg backdrop-blur-md">
      <div className="flex items-center gap-2 mb-4">
        <FileJson size={22} className="text-blue-300" />
        <h2 className="text-xl font-semibold text-blue-200">
          JSON Upload Guidelines
        </h2>
      </div>

      <p className="text-gray-300 mb-4">
        To load your feature model, upload a JSON file that defines the root
        feature, its features list, and any constraints.
      </p>

      <h3 className="text-lg font-semibold text-gray-100 mt-6 mb-2">
        Required Structure
      </h3>

      <ul className="list-disc list-inside space-y-2 text-gray-200">
        <li>
          <span className="font-semibold text-blue-300">root</span>: a string
          naming the top-level feature.
        </li>
        <li>
          <span className="font-semibold text-blue-300">features</span>: an
          array where each object describes one feature with:
          <ul className="list-disc list-inside ml-6 mt-1 space-y-1 text-gray-300">
            <li>
              <span className="font-mono text-gray-100">id</span>: unique
              identifier of the feature
            </li>
            <li>
              <span className="font-mono text-gray-100">type</span>: mandatory,
              optional, alternative, or or-group
            </li>
            <li>
              <span className="font-mono text-gray-100">parent</span>: ID of the
              parent feature
            </li>
            <li>
              <span className="font-mono text-gray-100">label</span>: optional,
              human-friendly name
            </li>
            <li>
              <span className="font-mono text-gray-100">group</span>: optional
              group type (e.g., xor)
            </li>
          </ul>
        </li>
        <li>
          <span className="font-semibold text-blue-300">constraints</span>: list
          of rules describing requires or excludes relationships.
        </li>
      </ul>

      <h3 className="text-lg font-semibold text-gray-100 mt-8 mb-2">
        Example of a Valid JSON File
      </h3>

      <pre className="bg-gray-900 text-sm text-gray-100 rounded-lg p-4 overflow-x-auto border border-gray-800">
        {`{
  "root": "Car",
  "features": [
    { "id": "Car", "label": "Car", "type": "mandatory" },

    {
      "id": "EngineGroup",
      "label": "Engine Type",
      "type": "mandatory",
      "parent": "Car",
      "group": "xor"
    },
    {
      "id": "Gasoline",
      "label": "Gasoline Engine",
      "type": "mandatory",
      "parent": "EngineGroup"
    },
    {
      "id": "Electric",
      "label": "Electric Motor",
      "type": "mandatory",
      "parent": "EngineGroup"
    },

    {
      "id": "Safety",
      "label": "Safety Package",
      "type": "mandatory",
      "parent": "Car"
    },
    {
      "id": "Airbag",
      "label": "Airbag",
      "type": "mandatory",
      "parent": "Safety"
    },
    {
      "id": "ABS",
      "label": "ABS System",
      "type": "mandatory",
      "parent": "Safety"
    },
    {
      "id": "WheelSpeedSensors",
      "label": "Wheel Speed Sensors",
      "type": "mandatory",
      "parent": "Safety"
    },

    {
      "id": "TractionControl",
      "label": "Traction Control System",
      "type": "optional",
      "parent": "Safety"
    },

    {
      "id": "Sunroof",
      "label": "Sunroof",
      "type": "optional",
      "parent": "Car"
    },
    {
      "id": "RoofRack",
      "label": "Roof Rack",
      "type": "optional",
      "parent": "Car"
    }
  ],

  "constraints": [
    { "type": "requires", "a": "ABS", "b": "WheelSpeedSensors" },
    { "type": "requires", "a": "TractionControl", "b": "ABS" },
    { "type": "excludes", "a": "Sunroof", "b": "RoofRack" }
  ]
}`}
      </pre>

      <p className="mt-4 text-gray-300 text-sm">
        This example shows how a feature model maps the structure of a product
        line. Features are stored as a flat list so the visualizer can build the
        tree dynamically, parents are referenced by ID to avoid nesting, and
        constraints are separated so they can be drawn as curved relationships.
        This keeps the JSON simple, consistent, and easy for our tool to parse
        at any scale.
      </p>
      <p className="mt-4 text-gray-300 text-sm">
        Please upload a valid JSON file following these guidelines to visualize
        your feature model!
      </p>
    </div>
  );
}
