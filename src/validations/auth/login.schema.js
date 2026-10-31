import * as yup from 'yup';

export const loginSchema = yup.object({
  email: yup
    .string()
    .trim()
    .lowercase()
    .email('Must be a valid email')
    .required('Email is required'),
  password: yup.string().required('Password is required'),
});
