import path from "path";
import Category from "../../models/Category.js";
import CommerceType from "../../models/CommerceType.js";
import Favorite from "../../models/Favorite.js";
import Order from "../../models/Order.js";
import Product from "../../models/Product.js";
import User from "../../models/User.js";
import UserRoles from "../../models/enums/userRoles.js";
import { sendError, sendSuccess } from "../../utils/apiResponses.js";
import {
  buildPaginatedResult,
  escapeRegex,
  getListQueryOptions,
} from "../../utils/apiQuery.js";

function toPublicFilePath(file) {
  if (!file) {
    return null;
  }

  return `\\${path.relative("public", file.path)}`.replaceAll("\\\\", "\\");
}

function serializeCommerceType(commerceType) {
  return {
    id: commerceType._id.toString(),
    name: commerceType.title,
    icon: commerceType.image,
    isActive: commerceType.isActive,
    createdAt: commerceType.createdAt,
    updatedAt: commerceType.updatedAt,
  };
}

export async function getAdminCommerceTypes(req, res) {
  const { page, pageSize, skip, sort, search } = getListQueryOptions(req.query, {
    defaultSortBy: "title",
    defaultSortDirection: "asc",
    allowedSortFields: ["title", "createdAt", "updatedAt", "isActive"],
    sortFieldMap: {
      name: "title",
      icon: "image",
    },
  });

  const filters = {};

  if (search) {
    filters.title = new RegExp(escapeRegex(search), "i");
  }

  if (req.query.isActive !== undefined) {
    filters.isActive = String(req.query.isActive).toLowerCase() === "true";
  }

  const [commerceTypes, total] = await Promise.all([
    CommerceType.find(filters).sort(sort).skip(skip).limit(pageSize).lean(),
    CommerceType.countDocuments(filters),
  ]);

  return sendSuccess(
    res,
    200,
    buildPaginatedResult(
      commerceTypes.map(serializeCommerceType),
      total,
      page,
      pageSize
    )
  );
}

export async function getAdminCommerceTypeById(req, res) {
  const commerceType = await CommerceType.findById(req.params.id).lean();

  if (!commerceType) {
    return sendError(res, 404, "Commerce type not found.");
  }

  return sendSuccess(res, 200, serializeCommerceType(commerceType));
}

export async function createCommerceType(req, res) {
  if (!req.file) {
    return sendError(res, 400, "icon is required.");
  }

  const existingType = await CommerceType.findOne({
    title: req.body.name,
  }).lean();

  if (existingType) {
    return sendError(res, 409, "Commerce type name already exists.");
  }

  const commerceType = await CommerceType.create({
    title: req.body.name,
    image: toPublicFilePath(req.file),
    isActive: true,
  });

  return sendSuccess(res, 201, serializeCommerceType(commerceType));
}

export async function updateCommerceType(req, res) {
  const commerceType = await CommerceType.findById(req.params.id);

  if (!commerceType) {
    return sendError(res, 404, "Commerce type not found.");
  }

  const existingType = await CommerceType.findOne({
    title: req.body.name,
    _id: { $ne: commerceType._id },
  }).lean();

  if (existingType) {
    return sendError(res, 409, "Commerce type name already exists.");
  }

  commerceType.title = req.body.name;

  if (req.file) {
    commerceType.image = toPublicFilePath(req.file);
  }

  await commerceType.save();

  return sendSuccess(res, 200, serializeCommerceType(commerceType));
}

export async function deleteCommerceType(req, res) {
  const commerceType = await CommerceType.findById(req.params.id).lean();

  if (!commerceType) {
    return sendError(res, 404, "Commerce type not found.");
  }

  const commerces = await User.find({
    role: UserRoles.COMMERCE,
    commerceTypeId: commerceType._id,
  })
    .select("_id")
    .lean();

  const commerceIds = commerces.map((commerce) => commerce._id);

  if (commerceIds.length > 0) {
    const orders = await Order.find({
      "commerce.commerceId": { $in: commerceIds },
      "delivery.userId": { $ne: null },
    })
      .select("delivery.userId")
      .lean();

    const deliveryIds = [
      ...new Set(
        orders
          .map((order) => order.delivery?.userId?.toString())
          .filter(Boolean)
      ),
    ];

    if (deliveryIds.length > 0) {
      await User.updateMany(
        {
          _id: { $in: deliveryIds },
          role: UserRoles.DELIVERY,
        },
        {
          $set: { isBusy: false },
        }
      );
    }

    await Favorite.deleteMany({ commerceId: { $in: commerceIds } });
    await Product.deleteMany({ commerceId: { $in: commerceIds } });
    await Category.deleteMany({ commerceId: { $in: commerceIds } });
    await Order.deleteMany({ "commerce.commerceId": { $in: commerceIds } });
    await User.deleteMany({ _id: { $in: commerceIds } });
  }

  await CommerceType.deleteOne({ _id: commerceType._id });

  return res.status(204).send();
}
