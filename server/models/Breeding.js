import mongoose from 'mongoose';

const breedingSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  studName: {
    type: String,
    required: true
  },
  petType: {
    type: String,
    enum: ['dogs', 'cats'],
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
  kciNumber: {
    type: String,
    required: true
  },
  studFee: {
    type: Number,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  images: [{
    type: String,
    default: ['https://images.unsplash.com/photo-1534361960057-19889db9621e?q=80&w=800']
  }],
  pedigreeDetails: {
    sire: { type: String, default: 'Champion Line' },
    dam: { type: String, default: 'Champion Line' }
  },
  location: {
    type: String,
    required: true
  },
  contactPhone: {
    type: String,
    required: true
  },
  isVerified: {
    type: Boolean,
    default: false
  }
}, { timestamps: true });

export default mongoose.model('Breeding', breedingSchema);
