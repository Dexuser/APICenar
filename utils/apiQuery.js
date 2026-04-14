export function escapeRegex(value = "") {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function toPositiveInt(value, fallback) {
  const parsedValue = Number.parseInt(value, 10);

  if (!Number.isFinite(parsedValue) || parsedValue <= 0) {
    return fallback;
  }

  return parsedValue;
}

export function getListQueryOptions(query, options = {}) {
  const page = toPositiveInt(query.page, options.defaultPage || 1);
  const pageSize = Math.min(
    toPositiveInt(query.pageSize, options.defaultPageSize || 10),
    options.maxPageSize || 100
  );
  const allowedSortFields = options.allowedSortFields || [];
  const fieldMap = options.sortFieldMap || {};
  const requestedSortField = query.sortBy || options.defaultSortBy || "createdAt";
  const normalizedSortField = fieldMap[requestedSortField] || requestedSortField;
  const sortBy = allowedSortFields.includes(normalizedSortField)
    ? normalizedSortField
    : options.defaultSortBy || "createdAt";
  const sortDirection = String(query.sortDirection || options.defaultSortDirection || "desc")
    .toLowerCase() === "asc"
    ? 1
    : -1;

  return {
    page,
    pageSize,
    skip: (page - 1) * pageSize,
    sort: {
      [sortBy]: sortDirection,
    },
    search: String(query.search || "").trim(),
  };
}

export function buildPaginatedResult(items, total, page, pageSize) {
  return {
    items,
    pagination: {
      page,
      pageSize,
      total,
      totalPages: total === 0 ? 0 : Math.ceil(total / pageSize),
    },
  };
}
