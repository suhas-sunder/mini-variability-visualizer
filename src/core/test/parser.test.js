import { describe, test, expect } from "vitest";
import { validateModel } from "../parser";
import infusionSystemModel from "../../../public/sample-complex-infusion-system.json";
import automotiveSystemModel from "../../../public/sample-automotive.json";
import iotSystemModel from "../../../public/sample-iot.json";
import medicalSystemModel from "../../../public/sample-medical.json";

describe("validateModel() with real JSON datasets", () => {
  test("invalid when missing root", () => {
    const { ok } = validateModel({ features: [] });
    expect(ok).toBe(false);
  });

  test("infusion system model passes validation", () => {
    const { ok, errors } = validateModel(infusionSystemModel);
    expect(ok).toBe(true);
    expect(errors).toHaveLength(0);
  });

  test("automotive model passes validation", () => {
    const { ok, errors } = validateModel(automotiveSystemModel);
    expect(ok).toBe(true);
    expect(errors).toHaveLength(0);
  });

  test("IoT model passes validation", () => {
    const { ok, errors } = validateModel(iotSystemModel);
    expect(ok).toBe(true);
    expect(errors).toHaveLength(0);
  });

  test("medical model passes validation", () => {
    const { ok, errors } = validateModel(medicalSystemModel);
    expect(ok).toBe(true);
    expect(errors).toHaveLength(0);
  });

  test("invalid constraint type is caught", () => {
    const brokenModel = {
      ...medicalSystemModel,
      constraints: [{ type: "oops", a: "Bluetooth", b: "WiFi" }],
    };
    const { ok, errors } = validateModel(brokenModel);
    expect(ok).toBe(false);
    expect(errors.join(" ")).toMatch(/Invalid constraint type/);
  });
});
