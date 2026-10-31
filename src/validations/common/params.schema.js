import * as yup from 'yup';

export const idParamSchema = yup.object({
  id: yup.string().uuid('Invalid id format').required('id is required'),
});
