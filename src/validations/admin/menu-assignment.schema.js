import * as yup from 'yup';

const priceField = yup
  .string()
  .matches(/^\d+(\.\d{1,2})?$/, 'Price must be a valid amount with up to 2 decimal places')
  .test('positive', 'Price must be greater than 0', (value) => value !== undefined && parseFloat(value) > 0)
  .required('Price is required');

export const createAssignmentSchema = yup.object({
  outletId: yup.string().uuid('Invalid outlet id').required('Outlet is required'),
  menuId: yup.string().uuid('Invalid menu id').required('Menu item is required'),
  price: priceField,
});

export const updateAssignmentPriceSchema = yup.object({
  price: priceField,
});

export const listAssignmentsQuerySchema = yup.object({
  outletId: yup.string().uuid('Invalid outlet id').optional(),
  menuId: yup.string().uuid('Invalid menu id').optional(),
});
