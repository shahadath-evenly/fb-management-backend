export function getPaginationArgs({ page, limit }) {
  const take = limit;
  const skip = (page - 1) * take;
  return { skip, take };
}

export function buildPaginationMeta({ page, limit, total }) {
  return {
    page,
    limit,
    total,
    totalPages: Math.max(1, Math.ceil(total / limit)),
  };
}
