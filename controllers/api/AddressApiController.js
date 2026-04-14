import Address from "../../models/Address.js";
import { sendError, sendSuccess } from "../../utils/apiResponses.js";
import {
  buildPaginatedResult,
  escapeRegex,
  getListQueryOptions,
} from "../../utils/apiQuery.js";

function buildLegacyDescription({ street, sector, city, reference }) {
  return [street, sector, city, reference].filter(Boolean).join(", ");
}

function serializeAddress(address) {
  return {
    id: address._id.toString(),
    label: address.label,
    street: address.street,
    sector: address.sector,
    city: address.city,
    reference: address.reference,
    createdAt: address.createdAt,
    updatedAt: address.updatedAt,
  };
}

export async function getMyAddresses(req, res) {
  const { page, pageSize, skip, sort, search } = getListQueryOptions(req.query, {
    defaultSortBy: "createdAt",
    defaultSortDirection: "desc",
    allowedSortFields: ["createdAt", "updatedAt", "label", "city", "sector"],
  });

  const filters = { userId: req.user._id };

  if (search) {
    const regex = new RegExp(escapeRegex(search), "i");
    filters.$or = [
      { label: regex },
      { street: regex },
      { sector: regex },
      { city: regex },
      { reference: regex },
    ];
  }

  const [addresses, total] = await Promise.all([
    Address.find(filters).sort(sort).skip(skip).limit(pageSize).lean(),
    Address.countDocuments(filters),
  ]);

  return sendSuccess(
    res,
    200,
    buildPaginatedResult(
      addresses.map(serializeAddress),
      total,
      page,
      pageSize
    )
  );
}

export async function getAddressById(req, res) {
  const address = await Address.findOne({
    _id: req.params.id,
    userId: req.user._id,
  }).lean();

  if (!address) {
    return sendError(res, 404, "Address not found.");
  }

  return sendSuccess(res, 200, serializeAddress(address));
}

export async function createAddress(req, res) {
  const address = await Address.create({
    userId: req.user._id,
    label: req.body.label,
    street: req.body.street,
    sector: req.body.sector,
    city: req.body.city,
    reference: req.body.reference,
    title: req.body.label,
    description: buildLegacyDescription(req.body),
  });

  return sendSuccess(res, 201, serializeAddress(address));
}

export async function updateAddress(req, res) {
  const address = await Address.findOne({
    _id: req.params.id,
    userId: req.user._id,
  });

  if (!address) {
    return sendError(res, 404, "Address not found.");
  }

  address.label = req.body.label;
  address.street = req.body.street;
  address.sector = req.body.sector;
  address.city = req.body.city;
  address.reference = req.body.reference;
  address.title = req.body.label;
  address.description = buildLegacyDescription(req.body);

  await address.save();

  return sendSuccess(res, 200, serializeAddress(address));
}

export async function deleteAddress(req, res) {
  const result = await Address.deleteOne({
    _id: req.params.id,
    userId: req.user._id,
  });

  if (!result.deletedCount) {
    return sendError(res, 404, "Address not found.");
  }

  return res.status(204).send();
}
