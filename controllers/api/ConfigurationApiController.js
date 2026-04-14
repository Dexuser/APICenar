import Config from "../../models/Config.js";
import { sendError, sendSuccess } from "../../utils/apiResponses.js";

function serializeConfiguration(configuration) {
  return {
    id: configuration._id.toString(),
    key: configuration.key,
    value: configuration.value,
    createdAt: configuration.createdAt,
    updatedAt: configuration.updatedAt,
  };
}

function normalizeKey(key) {
  return String(key || "").trim().toUpperCase();
}

export async function getConfigurations(req, res) {
  const configurations = await Config.find().sort({ key: 1 }).lean();

  return sendSuccess(
    res,
    200,
    configurations.map(serializeConfiguration)
  );
}

export async function getConfigurationByKey(req, res) {
  const key = normalizeKey(req.params.key);
  const configuration = await Config.findOne({ key }).lean();

  if (!configuration) {
    return sendError(res, 404, "Configuration not found.");
  }

  return sendSuccess(res, 200, serializeConfiguration(configuration));
}

export async function updateConfiguration(req, res) {
  const routeKey = normalizeKey(req.params.key);
  const bodyKey = normalizeKey(req.body.key);

  if (routeKey !== bodyKey) {
    return sendError(res, 400, "Route key and body key must match.");
  }

  if (routeKey === "ITBIS") {
    const numericValue = Number(req.body.value);

    if (!Number.isFinite(numericValue) || numericValue < 0) {
      return sendError(res, 400, "ITBIS value must be a valid non-negative number.");
    }
  }

  const configuration = await Config.findOne({ key: routeKey });

  if (!configuration) {
    return sendError(res, 404, "Configuration not found.");
  }

  configuration.key = routeKey;
  configuration.value = String(req.body.value);

  await configuration.save();

  return sendSuccess(res, 200, serializeConfiguration(configuration));
}
