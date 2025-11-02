import { describe, test, expect } from "vitest";
import infusionSystemModel from "../../public/sample-complex-infusion-system.json";
import automotiveSystemModel from "../../public/sample-automotive.json";
import iotSystemModel from "../../public/sample-iot.json";
import medicalSystemModel from "../../public/sample-medical.json";

/* -------------------------------------------------------------------------- */
/* Utility Helpers                                                            */
/* -------------------------------------------------------------------------- */

/**
 * Normalize raw constraint fields { a, b } → { sourceFeatureId, targetFeatureId }.
 * Filters out malformed or incomplete constraints defensively.
 */
function normalizeConstraints(rawConstraintList) {
  if (!Array.isArray(rawConstraintList)) return [];
  return rawConstraintList
    .filter(
      (rawConstraint) =>
        rawConstraint &&
        (rawConstraint.type === "requires" || rawConstraint.type === "excludes") &&
        typeof rawConstraint.a === "string" &&
        typeof rawConstraint.b === "string"
    )
    .map((rawConstraint) => ({
      type: rawConstraint.type,
      sourceFeatureId: rawConstraint.a,
      targetFeatureId: rawConstraint.b,
    }));
}

/**
 * Return all "requires" and "excludes" relations for a feature.
 */
function getRelationsFor(targetFeatureId, rawConstraintList) {
  if (!Array.isArray(rawConstraintList)) {
    return { requires: [], excludes: [] };
  }

  const normalizedConstraintList = normalizeConstraints(rawConstraintList);

  const requiredFeatureIds = normalizedConstraintList
    .filter(
      (constraintEntry) =>
        constraintEntry.type === "requires" &&
        constraintEntry.sourceFeatureId === targetFeatureId
    )
    .map((constraintEntry) => constraintEntry.targetFeatureId);

  const excludedFeatureIds = normalizedConstraintList
    .filter(
      (constraintEntry) =>
        constraintEntry.type === "excludes" &&
        (constraintEntry.sourceFeatureId === targetFeatureId ||
          constraintEntry.targetFeatureId === targetFeatureId)
    )
    .map((constraintEntry) =>
      constraintEntry.sourceFeatureId === targetFeatureId
        ? constraintEntry.targetFeatureId
        : constraintEntry.sourceFeatureId
    );

  return {
    requires: Array.from(new Set(requiredFeatureIds)),
    excludes: Array.from(new Set(excludedFeatureIds)),
  };
}

/**
 * Compare two arrays without order sensitivity.
 */
function expectArraysToMatch(actualArray, expectedArray) {
  const sortedActualArray = Array.isArray(actualArray)
    ? [...actualArray].sort()
    : [];
  const sortedExpectedArray = Array.isArray(expectedArray)
    ? [...expectedArray].sort()
    : [];
  expect(sortedActualArray).toEqual(sortedExpectedArray);
}

/**
 * Ensure all constraint references point to valid feature IDs.
 */
function verifyConstraintFeatureReferences(model) {
  const { features, constraints } = model;
  const validFeatureIds = new Set(features.map((f) => f.id));
  for (const constraint of constraints) {
    if (constraint.a) expect(validFeatureIds.has(constraint.a)).toBe(true);
    if (constraint.b) expect(validFeatureIds.has(constraint.b)).toBe(true);
  }
}

/**
 * Shared directional/symmetric assertions for any model.
 */
function assertRequiresIsDirectional(normalizedList, rawList) {
  const requiresList = normalizedList.filter(
    (constraintEntry) => constraintEntry.type === "requires"
  );
  for (const { sourceFeatureId, targetFeatureId } of requiresList) {
    const sourceRelations = getRelationsFor(sourceFeatureId, rawList);
    const targetRelations = getRelationsFor(targetFeatureId, rawList);
    expect(sourceRelations.requires).toContain(targetFeatureId);
    expect(targetRelations.requires).not.toContain(sourceFeatureId);
  }
}

function assertExcludesIsSymmetric(normalizedList, rawList) {
  const excludesList = normalizedList.filter(
    (constraintEntry) => constraintEntry.type === "excludes"
  );
  for (const { sourceFeatureId, targetFeatureId } of excludesList) {
    const sourceRelations = getRelationsFor(sourceFeatureId, rawList);
    const targetRelations = getRelationsFor(targetFeatureId, rawList);
    expect(sourceRelations.excludes).toContain(targetFeatureId);
    expect(targetRelations.excludes).toContain(sourceFeatureId);
  }
}

/**
 * Ensure a feature never requires or excludes itself.
 */
function assertNoSelfRelations(normalizedList, rawList) {
  const allFeatureIds = new Set(
    normalizedList.flatMap((constraintEntry) => [
      constraintEntry.sourceFeatureId,
      constraintEntry.targetFeatureId,
    ])
  );
  for (const featureId of allFeatureIds) {
    const relations = getRelationsFor(featureId, rawList);
    expect(relations.requires).not.toContain(featureId);
    expect(relations.excludes).not.toContain(featureId);
  }
}

/* -------------------------------------------------------------------------- */
/* Infusion System                                                            */
/* -------------------------------------------------------------------------- */

describe("Infusion System Relations", () => {
  const { constraints } = infusionSystemModel;
  const normalized = normalizeConstraints(constraints);

  test("Constraint references exist in feature list", () => {
    verifyConstraintFeatureReferences(infusionSystemModel);
  });

  test("Bluetooth requires BatteryBackup and excludes WiFi", () => {
    const relations = getRelationsFor("Bluetooth", constraints);
    expectArraysToMatch(relations.requires, ["BatteryBackup"]);
    expectArraysToMatch(relations.excludes, ["WiFi"]);
  });

  test("Requires is directional", () => {
    assertRequiresIsDirectional(normalized, constraints);
  });

  test("Excludes is symmetric", () => {
    assertExcludesIsSymmetric(normalized, constraints);
  });

  test("No self relations exist", () => {
    assertNoSelfRelations(normalized, constraints);
  });

  test("Unknown feature IDs yield empty arrays", () => {
    const result = getRelationsFor("NonexistentFeature", constraints);
    expectArraysToMatch(result.requires, []);
    expectArraysToMatch(result.excludes, []);
  });

  test("Handles duplicate and redundant constraints gracefully", () => {
    const duplicated = [
      ...constraints,
      { type: "requires", a: "Bluetooth", b: "BatteryBackup" },
      { type: "excludes", a: "Bluetooth", b: "WiFi" },
      { type: "excludes", a: "WiFi", b: "Bluetooth" },
    ];
    const result = getRelationsFor("Bluetooth", duplicated);
    expectArraysToMatch(result.requires, ["BatteryBackup"]);
    expectArraysToMatch(result.excludes, ["WiFi"]);
  });

  test("Empty or non-array input yields empty results", () => {
    expectArraysToMatch(getRelationsFor("Bluetooth", []).requires, []);
    expectArraysToMatch(getRelationsFor("Bluetooth", null).requires, []);
    expectArraysToMatch(getRelationsFor("Bluetooth", {}).requires, []);
  });

  test("Malformed constraints are ignored by normalization", () => {
    const malformed = [
      ...constraints,
      { type: "requires", a: "Bluetooth" }, // missing target
      { type: "excludes", b: "WiFi" }, // missing source
      { bogus: "entry" }, // invalid
      { type: "requires", a: 42, b: "BatteryBackup" }, // invalid type
    ];
    const result = getRelationsFor("Bluetooth", malformed);
    expectArraysToMatch(result.requires, ["BatteryBackup"]);
    expectArraysToMatch(result.excludes, ["WiFi"]);
  });
});

/* -------------------------------------------------------------------------- */
/* Automotive System                                                          */
/* -------------------------------------------------------------------------- */

describe("Automotive System Relations", () => {
  const { constraints } = automotiveSystemModel;
  const normalized = normalizeConstraints(constraints);

  test("Constraint references exist in feature list", () => {
    verifyConstraintFeatureReferences(automotiveSystemModel);
  });

  test("ElectricMotor requires ABS", () => {
    const relations = getRelationsFor("ElectricMotor", constraints);
    expectArraysToMatch(relations.requires, ["ABS"]);
  });

  test("Gasoline and ElectricMotor exclude each other", () => {
    const gasRelations = getRelationsFor("Gasoline", constraints);
    const motorRelations = getRelationsFor("ElectricMotor", constraints);
    expectArraysToMatch(gasRelations.excludes, ["ElectricMotor"]);
    expectArraysToMatch(motorRelations.excludes, ["Gasoline"]);
  });

  test("Requires is directional", () => {
    assertRequiresIsDirectional(normalized, constraints);
  });

  test("Excludes is symmetric", () => {
    assertExcludesIsSymmetric(normalized, constraints);
  });

  test("No self relations exist", () => {
    assertNoSelfRelations(normalized, constraints);
  });
});

/* -------------------------------------------------------------------------- */
/* IoT System                                                                 */
/* -------------------------------------------------------------------------- */

describe("IoT System Relations", () => {
  const { constraints } = iotSystemModel;
  const normalized = normalizeConstraints(constraints);

  test("Constraint references exist in feature list", () => {
    verifyConstraintFeatureReferences(iotSystemModel);
  });

  test("Camera requires CloudService", () => {
    const relations = getRelationsFor("Camera", constraints);
    expectArraysToMatch(relations.requires, ["CloudService"]);
    expectArraysToMatch(relations.excludes, []);
  });

  test("Requires is directional", () => {
    assertRequiresIsDirectional(normalized, constraints);
  });

  test("No self relations exist", () => {
    assertNoSelfRelations(normalized, constraints);
  });
});

/* -------------------------------------------------------------------------- */
/* Medical System                                                             */
/* -------------------------------------------------------------------------- */

describe("Medical System Relations", () => {
  const { constraints } = medicalSystemModel;
  const normalized = normalizeConstraints(constraints);

  test("Constraint references exist in feature list", () => {
    verifyConstraintFeatureReferences(medicalSystemModel);
  });

  test("Bluetooth requires BatteryBackup and excludes WiFi", () => {
    const relations = getRelationsFor("Bluetooth", constraints);
    expectArraysToMatch(relations.requires, ["BatteryBackup"]);
    expectArraysToMatch(relations.excludes, ["WiFi"]);
  });

  test("Requires is directional", () => {
    assertRequiresIsDirectional(normalized, constraints);
  });

  test("Excludes is symmetric", () => {
    assertExcludesIsSymmetric(normalized, constraints);
  });

  test("No self relations exist", () => {
    assertNoSelfRelations(normalized, constraints);
  });

  test("Malformed constraints do not affect output", () => {
    const malformed = [
      ...constraints,
      { type: "requires", a: "Bluetooth" },
      { bogus: "data" },
      { type: "excludes", a: "Bluetooth" },
    ];
    const relations = getRelationsFor("Bluetooth", malformed);
    expectArraysToMatch(relations.requires, ["BatteryBackup"]);
    expectArraysToMatch(relations.excludes, ["WiFi"]);
  });
});

/* -------------------------------------------------------------------------- */
/* Cross-Model Consistency Checks                                             */
/* -------------------------------------------------------------------------- */

describe("Cross-Model Integrity Checks", () => {
  const models = {
    Infusion: infusionSystemModel,
    Automotive: automotiveSystemModel,
    IoT: iotSystemModel,
    Medical: medicalSystemModel,
  };

  for (const [modelName, modelData] of Object.entries(models)) {
    const { constraints } = modelData;
    const normalized = normalizeConstraints(constraints);

    test(`${modelName}: All 'requires' relations are directional`, () => {
      assertRequiresIsDirectional(normalized, constraints);
    });

    test(`${modelName}: All 'excludes' relations are symmetric`, () => {
      assertExcludesIsSymmetric(normalized, constraints);
    });

    test(`${modelName}: No constraint references nonexistent features`, () => {
      verifyConstraintFeatureReferences(modelData);
    });

    test(`${modelName}: No self-referential constraints exist`, () => {
      assertNoSelfRelations(normalized, constraints);
    });
  }
});
