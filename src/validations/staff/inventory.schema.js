import * as yup from 'yup';
import { paginationFields } from '../common/pagination.schema.js';

export const listInventoryQuerySchema = yup.object({
  ...paginationFields,
});

export const addStockSchema = yup.object({
  menuId: yup.string().uuid('Invalid menu id').required('Menu item is required'),
  stock: yup
    .number()
    .integer('Stock must be a whole number')
    .min(0, 'Stock cannot be negative')
    .required('Stock is required'),
});

export const updateStockSchema = yup.object({
  stock: yup
    .number()
    .integer('Stock must be a whole number')
    .min(0, 'Stock cannot be negative')
    .required('Stock is required'),
});
