import mongoose from 'mongoose';

const adoptionSchema = new mongoose.Schema({
  shelterName: {
    type: String,
    required: true
  },
  shelterLocation: {
    type: String,
    required: true
  },
  petName: {
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
  rescueStory: {
    type: String,
    required: true
  },
  image: {
    type: String,
    default: 'https://images.unsplash.com/photo-1484156818044-c040038b0719?q=80&w=800'
  },
  healthStatus: {
    vaccinated: { type: Boolean, default: false },
    neutered: { type: Boolean, default: false },
    microchipped: { type: Boolean, default: false }
  },
  adoptionFee: {
    type: Number,
    default: 0
  },
  inquiries: [{
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    message: String,
    phone: String,
    status: { type: String, enum: ['Pending', 'Approved', 'Rejected'], default: 'Pending' },
    createdAt: { type: Date, default: Date.now }
  }]
}, { timestamps: true });

export default mongoose.model('Adoption', adoptionSchema);
