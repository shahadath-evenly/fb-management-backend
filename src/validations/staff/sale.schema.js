import * as yup from 'yup';

export const createSaleSchema = yup.object({
  items: yup
    .array()
    .of(
      yup.object({
        menuId: yup.string().uuid('Invalid menu id').required('Menu id is required'),
        quantity: yup
          .number()
          .integer('Quantity must be a whole number')
          .positive('Quantity must be greater than 0')
          .required('Quantity is required'),
      }),
    )
    .min(1, 'At least one item is required')
    .required('Items are required'),
});
