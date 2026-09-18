import createModel from './baseModel.js';
import bcrypt from 'bcryptjs';

const UserModel = createModel('users');

export const User = {
  ...UserModel,
  async comparePassword(candidatePassword, hashedPassword) {
    if (!candidatePassword || !hashedPassword) return false;
    return await bcrypt.compare(candidatePassword, hashedPassword);
  }
};

export default User;
