import * as yup from 'yup';
import { paginationFields } from '../common/pagination.schema.js';

export const listMenuQuerySchema = yup.object({
  ...paginationFields,
});
