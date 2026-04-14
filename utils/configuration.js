import Config from "../models/Config.js";

export async function getConfigurationValue(key, fallbackValue = null) {
  const normalizedKey = String(key || "").trim().toUpperCase();

  let configuration = await Config.findOne({ key: normalizedKey }).lean();

  if (!configuration) {
    if (fallbackValue === null || fallbackValue === undefined) {
      return null;
    }

    await Config.create({
      key: normalizedKey,
      value: String(fallbackValue),
    });

    return String(fallbackValue);
  }

  if (configuration.value !== null && configuration.value !== undefined) {
    return configuration.value;
  }

  return fallbackValue === null || fallbackValue === undefined
    ? null
    : String(fallbackValue);
}
