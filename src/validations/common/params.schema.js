import * as yup from 'yup';

export const idParamSchema = yup.object({
  id: yup.string().uuid('Invalid id format').required('id is required'),
});

export function uuidParamSchema(paramName) {
  return yup.object({
    [paramName]: yup.string().uuid(`Invalid ${paramName} format`).required(`${paramName} is required`),
  });
}
