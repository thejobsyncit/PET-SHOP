import mongoose from 'mongoose';
import bcrypt from 'bcrypt';

const UserSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true,
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    trim: true,
    match: [/\S+@\S+\.\S+/, 'Please use a valid email address'],
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: 6,
  },
  role: {
    type: String,
    enum: ['CUSTOMER', 'ADMIN', 'SERVICE_PROVIDER', 'SUPERADMIN'],
    default: 'CUSTOMER',
  },
  mobile: {
    type: String,
  },
  location: {
    type: String,
  },
  serviceCategory: {
    type: String,
  },
  businessName: {
    type: String,
    trim: true,
  },
  govtProofType: {
    type: String,
    default: 'AWBI / NGO Registration Certificate',
  },
  govtProofNumber: {
    type: String,
    trim: true,
  },
  govtProofDoc: {
    type: String,
  },
  verificationStatus: {
    type: String,
    enum: ['Pending', 'Verified', 'Under Review', 'Rejected'],
    default: 'Verified',
  },
  shelterCapacity: {
    type: Number,
    default: 50,
  },
  bio: {
    type: String,
  },
  addresses: [{
    name: String,
    phone: String,
    streetAddress: String,
    city: String,
    state: String,
    postalCode: String,
    country: { type: String, default: 'India' },
    isDefault: { type: Boolean, default: false }
  }],
  wishlist: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product'
  }],
  cart: [{
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product'
    },
    quantity: {
      type: Number,
      default: 1,
      min: 1
    }
  }],
  prescriptionHistory: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Prescription'
  }],
  createdAt: {
    type: Date,
    default: Date.now,
  }
});

// Hash password before saving
UserSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (err) {
    next(err);
  }
});

// Compare password method
UserSchema.methods.comparePassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

const User = mongoose.models.User || mongoose.model('User', UserSchema);
export default User;
