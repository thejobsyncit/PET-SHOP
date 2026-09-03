import mongoose from 'mongoose';

const listingSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  title: {
    type: String,
    required: true
  },
  petType: {
    type: String,
    enum: ['dogs', 'cats', 'birds', 'reptiles', 'fish', 'small-pets'],
    required: true
  },
  breed: {
    type: String,
    required: true
  },
  age: {
    type: String,
    required: true
  },
  price: {
    type: Number,
    required: true,
    default: 0
  },
  description: {
    type: String,
    required: true
  },
  images: [{
    type: String,
    default: ['https://images.unsplash.com/photo-1543466835-00a7907e9de1?q=80&w=800']
  }],
  location: {
    type: String,
    required: true
  },
  vaccinationCertificate: {
    type: String,
    default: null
  },
  contactPhone: {
    type: String,
    required: true
  },
  isVerified: {
    type: Boolean,
    default: false
  },
  quantity: {
    type: Number,
    required: true,
    default: 1
  },
  soldCount: {
    type: Number,
    default: 0
  },
  paymentStatus: {
    type: String,
    enum: ['pending', 'paid', 'failed'],
    default: 'pending'
  },
  paymentAmount: {
    type: Number,
    default: 200
  },
  soldOutAt: {
    type: Date,
    default: null
  },
  status: {
    type: String,
    enum: ['Available', 'Sold', 'Adopted', 'Cancelled', 'Sold Out'],
    default: 'Available'
  }
}, { timestamps: true });

export default mongoose.model('Listing', listingSchema);
