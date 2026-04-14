import Category from "../../models/Category.js";
import CommerceType from "../../models/CommerceType.js";
import Favorite from "../../models/Favorite.js";
import Product from "../../models/Product.js";
import User from "../../models/User.js";
import UserRoles from "../../models/enums/userRoles.js";
import { sendError, sendSuccess } from "../../utils/apiResponses.js";
import {
  buildPaginatedResult,
  escapeRegex,
  getListQueryOptions,
} from "../../utils/apiQuery.js";

function serializeCommerceType(commerceType) {
  return {
    id: commerceType._id.toString(),
    name: commerceType.title,
    icon: commerceType.image,
    createdAt: commerceType.createdAt,
    updatedAt: commerceType.updatedAt,
  };
}

export async function getCommerceTypes(req, res) {
  const { page, pageSize, skip, sort, search } = getListQueryOptions(req.query, {
    defaultSortBy: "title",
    defaultSortDirection: "asc",
    allowedSortFields: ["title", "createdAt", "updatedAt"],
    sortFieldMap: {
      name: "title",
    },
  });

  const filters = {};
  filters.isActive = true;

  if (search) {
    filters.title = new RegExp(escapeRegex(search), "i");
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

export async function getCommerces(req, res) {
  const { commerceTypeId } = req.query;
  const { page, pageSize, skip, sort, search } = getListQueryOptions(req.query, {
    defaultSortBy: "commerceName",
    defaultSortDirection: "asc",
    allowedSortFields: ["commerceName", "createdAt", "updatedAt", "openTime", "closeTime"],
    sortFieldMap: {
      name: "commerceName",
      openingTime: "openTime",
      closingTime: "closeTime",
    },
  });

  if (commerceTypeId) {
    const commerceType = await CommerceType.findById(commerceTypeId).lean();

    if (!commerceType) {
      return sendError(res, 400, "commerceTypeId does not exist.");
    }
  }

  const filters = {
    role: UserRoles.COMMERCE,
    isActive: true,
  };

  if (commerceTypeId) {
    filters.commerceTypeId = commerceTypeId;
  }

  if (search) {
    filters.commerceName = new RegExp(escapeRegex(search), "i");
  }

  const [commerces, total] = await Promise.all([
    User.find(filters).sort(sort).skip(skip).limit(pageSize).lean(),
    User.countDocuments(filters),
  ]);

  const commerceIds = commerces.map((commerce) => commerce._id);
  const favorites = await Favorite.find({
    userId: req.user._id,
    commerceId: { $in: commerceIds },
  })
    .select("commerceId")
    .lean();

  const favoriteIds = new Set(favorites.map((favorite) => favorite.commerceId.toString()));

  return sendSuccess(
    res,
    200,
    buildPaginatedResult(
      commerces.map((commerce) => ({
        id: commerce._id.toString(),
        userName: commerce.username,
        email: commerce.email,
        name: commerce.commerceName,
        description: commerce.description || null,
        phone: commerce.phone || null,
        openingTime: commerce.openTime,
        closingTime: commerce.closeTime,
        logo: commerce.commerceLogo || null,
        commerceTypeId: commerce.commerceTypeId?.toString() || null,
        isFavorite: favoriteIds.has(commerce._id.toString()),
      })),
      total,
      page,
      pageSize
    )
  );
}

export async function getCommerceCatalog(req, res) {
  const commerce = await User.findOne({
    _id: req.params.commerceId,
    role: UserRoles.COMMERCE,
    isActive: true,
  }).lean();

  if (!commerce) {
    return sendError(res, 404, "Commerce not found.");
  }

  const products = await Product.find({
    commerceId: commerce._id,
    isActive: true,
  })
    .populate("categoryId")
    .sort({ createdAt: 1 })
    .lean();

  const categoriesById = new Map();

  for (const product of products) {
    const categoryDocument = product.categoryId;
    const categoryId = categoryDocument?._id?.toString() || "uncategorized";

    if (!categoriesById.has(categoryId)) {
      categoriesById.set(categoryId, {
        id: categoryDocument?._id?.toString() || null,
        name: categoryDocument?.name || "Uncategorized",
        description: categoryDocument?.description || null,
        products: [],
      });
    }

    categoriesById.get(categoryId).products.push({
      id: product._id.toString(),
      name: product.name,
      description: product.description,
      price: product.price,
      image: product.image,
      categoryId: categoryDocument?._id?.toString() || null,
    });
  }

  const categories = Array.from(categoriesById.values());

  if (categories.length === 0) {
    const existingCategories = await Category.find({
      commerceId: commerce._id,
    })
      .sort({ name: 1 })
      .lean();

    for (const category of existingCategories) {
      categories.push({
        id: category._id.toString(),
        name: category.name,
        description: category.description,
        products: [],
      });
    }
  }

  return sendSuccess(res, 200, {
    commerce: {
      id: commerce._id.toString(),
      name: commerce.commerceName,
      description: commerce.description || null,
      logo: commerce.commerceLogo || null,
      openingTime: commerce.openTime,
      closingTime: commerce.closeTime,
      commerceTypeId: commerce.commerceTypeId?.toString() || null,
    },
    categories,
  });
}
