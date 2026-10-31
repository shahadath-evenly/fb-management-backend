import bcrypt from 'bcryptjs';
import { ApiError } from '../../utils/ApiError.js';
import { toSafeUser } from '../../utils/sanitizeUser.js';
import { userRepository } from '../../repositories/user.repository.js';
import { outletRepository } from '../../repositories/outlet.repository.js';

export const staffService = {
  async createStaff({ firstName, lastName, email, password, outletId }) {
    const outlet = await outletRepository.findById(outletId);
    if (!outlet) {
      throw new ApiError(400, 'Outlet does not exist');
    }

    const existing = await userRepository.findByEmail(email);
    if (existing) {
      throw new ApiError(409, 'A user with this email already exists');
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const staff = await userRepository.create({
      firstName,
      lastName,
      email,
      password: hashedPassword,
      role: 'staff',
      outletId,
    });

    return toSafeUser(staff);
  },

  async listStaff() {
    const staff = await userRepository.findAllStaff();
    return staff.map(toSafeUser);
  },

  async updateStaff(id, { firstName, lastName, email, outletId }) {
    const existingStaff = await userRepository.findById(id);
    if (!existingStaff || existingStaff.role !== 'staff') {
      throw new ApiError(404, 'Staff not found');
    }

    const outlet = await outletRepository.findById(outletId);
    if (!outlet) {
      throw new ApiError(400, 'Outlet does not exist');
    }

    if (email !== existingStaff.email) {
      const emailOwner = await userRepository.findByEmail(email);
      if (emailOwner) {
        throw new ApiError(409, 'A user with this email already exists');
      }
    }

    const updated = await userRepository.update(id, { firstName, lastName, email, outletId });
    return toSafeUser(updated);
  },

  async deleteStaff(id) {
    const existingStaff = await userRepository.findById(id);
    if (!existingStaff || existingStaff.role !== 'staff') {
      throw new ApiError(404, 'Staff not found');
    }
    await userRepository.delete(id);
  },
};
