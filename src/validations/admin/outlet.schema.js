import * as yup from 'yup';
import { paginationFields, statusFilterField } from '../common/pagination.schema.js';

export const createOutletSchema = yup.object({
  name: yup
    .string()
    .trim()
    .min(2, 'Name must be at least 2 characters')
    .max(100, 'Name must be at most 100 characters')
    .required('Outlet name is required'),
});

export const updateOutletSchema = yup.object({
  name: yup
    .string()
    .trim()
    .min(2, 'Name must be at least 2 characters')
    .max(100, 'Name must be at most 100 characters')
    .required('Outlet name is required'),
});

export const updateOutletStatusSchema = yup.object({
  status: yup.string().oneOf(['active', 'inactive'], 'Status must be active or inactive').required('Status is required'),
});

export const listOutletsQuerySchema = yup.object({
  ...paginationFields,
  status: statusFilterField,
});
