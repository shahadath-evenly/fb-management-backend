import * as yup from 'yup';

export const createStaffSchema = yup.object({
  firstName: yup.string().trim().min(2, 'First name must be at least 2 characters').max(50).required('First name is required'),
  lastName: yup.string().trim().min(2, 'Last name must be at least 2 characters').max(50).required('Last name is required'),
  email: yup.string().trim().lowercase().email('Must be a valid email').required('Email is required'),
  password: yup.string().min(8, 'Password must be at least 8 characters').required('Password is required'),
  outletId: yup.string().uuid('Invalid outlet id').required('Outlet is required'),
});

export const updateStaffSchema = yup.object({
  firstName: yup.string().trim().min(2, 'First name must be at least 2 characters').max(50).required('First name is required'),
  lastName: yup.string().trim().min(2, 'Last name must be at least 2 characters').max(50).required('Last name is required'),
  email: yup.string().trim().lowercase().email('Must be a valid email').required('Email is required'),
  outletId: yup.string().uuid('Invalid outlet id').required('Outlet is required'),
});
