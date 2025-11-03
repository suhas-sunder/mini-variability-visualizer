/**
 * validateJSON
 * Ensures the uploaded feature model file follows the expected structure.
 * Provides clear, descriptive messages for users when issues are detected.
 */
export default function validateJSON(data) {
  if (!data || typeof data !== "object") {
    throw new Error("The uploaded file must contain a valid JSON object.");
  }

  // --- Feature Validation ---
  if (!Array.isArray(data.features)) {
    throw new Error(
      "The file must include a 'features' array describing all system features."
    );
  }

  const featureIds = new Set();

  data.features.forEach((feature, index) => {
    if (!feature || typeof feature !== "object") {
      throw new Error(`Feature #${index + 1} must be a valid object.`);
    }

    // ID
    if (!feature.id || typeof feature.id !== "string") {
      throw new Error(
        `Feature #${index + 1} is missing a valid 'id' property (a unique feature name).`
      );
    }
    featureIds.add(feature.id);

    // Type
    if (
      feature.type &&
      !["mandatory", "optional", "alternative", "or"].includes(
        feature.type.toLowerCase()
      )
    ) {
      throw new Error(
        `Feature '${feature.id}' has an invalid type '${feature.type}'. Allowed types are: mandatory, optional, alternative, or.`
      );
    }

    // Parent reference
    if (feature.parent && typeof feature.parent !== "string") {
      throw new Error(
        `Feature '${feature.id}' has an invalid parent reference. The 'parent' field must be a string referring to another feature's ID.`
      );
    }
  });

  // --- Root Validation ---
  if (data.root && typeof data.root !== "string") {
    throw new Error("The 'root' field must be a text value (the main feature ID).");
  }

  // Root feature presence
  if (data.root && !featureIds.has(data.root)) {
    throw new Error(
      `The root feature '${data.root}' is not defined in the 'features' list. Please check that the root ID matches an existing feature.`
    );
  }

  // --- Constraint Validation ---
  if (data.constraints) {
    if (!Array.isArray(data.constraints)) {
      throw new Error(
        "The 'constraints' section must be an array (list) of relationships between features."
      );
    }

    data.constraints.forEach((constraint, index) => {
      if (!constraint || typeof constraint !== "object") {
        throw new Error(`Constraint #${index + 1} must be a valid object.`);
      }

      const { from, to, type } = renameConstraintFields(constraint, index);

      if (typeof from !== "string" || typeof to !== "string") {
        throw new Error(
          `Constraint #${index + 1} must specify two valid feature IDs under 'from' and 'to'.`
        );
      }

      const validTypes = ["requires", "excludes", "conflicts"];
      if (!type || !validTypes.includes(type.toLowerCase())) {
        throw new Error(
          `Constraint between '${from}' and '${to}' uses an invalid type '${type}'. Allowed types are: requires, excludes, conflicts.`
        );
      }

      // Soft warning: missing features referenced
      if (!featureIds.has(from) || !featureIds.has(to)) {
        console.warn(
          `⚠ Constraint between '${from}' and '${to}' references features not defined in the feature list.`
        );
      }
    });
  }

  return true;
}

/**
 * Helper: normalize legacy field names ('a','b') to user-friendly ones.
 */
function renameConstraintFields(constraint, index) {
  const mapped = {
    from: constraint.from ?? constraint.a,
    to: constraint.to ?? constraint.b,
    type: constraint.type,
  };

  if (!mapped.from && constraint.a)
    console.warn(
      `ℹ Renamed legacy constraint field 'a' to 'from' for constraint #${index + 1}.`
    );
  if (!mapped.to && constraint.b)
    console.warn(
      `ℹ Renamed legacy constraint field 'b' to 'to' for constraint #${index + 1}.`
    );

  return mapped;
}
