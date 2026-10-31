import * as yup from 'yup';

// Spread into a module's own query schema alongside any extra filters
// (e.g. status). Page/limit/search are server-side on every listing
// endpoint — default limit is 10, capped at 100 to prevent abuse.
export const paginationFields = {
  page: yup.number().integer('Page must be a whole number').min(1).default(1),
  limit: yup.number().integer('Limit must be a whole number').min(1).max(100).default(10),
  search: yup.string().trim().default(''),
};

export const statusFilterField = yup.string().oneOf(['active', 'inactive']).optional();
