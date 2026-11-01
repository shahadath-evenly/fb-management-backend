import * as yup from 'yup';
import { paginationFields } from '../common/pagination.schema.js';

const basePriceField = yup
  .string()
  .matches(/^\d+(\.\d{1,2})?$/, 'Base price must be a valid amount with up to 2 decimal places')
  .test('positive', 'Base price must be greater than 0', (value) => value !== undefined && parseFloat(value) > 0)
  .required('Base price is required');

export const createMenuSchema = yup.object({
  name: yup
    .string()
    .trim()
    .min(2, 'Name must be at least 2 characters')
    .max(100, 'Name must be at most 100 characters')
    .required('Menu item name is required'),
  basePrice: basePriceField,
});

export const updateMenuSchema = yup.object({
  name: yup
    .string()
    .trim()
    .min(2, 'Name must be at least 2 characters')
    .max(100, 'Name must be at most 100 characters')
    .required('Menu item name is required'),
  basePrice: basePriceField,
});

export const listMenusQuerySchema = yup.object({
  ...paginationFields,
});
