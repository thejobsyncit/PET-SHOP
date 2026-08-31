import mongoose from 'mongoose';

const serviceSchema = new mongoose.Schema({
  provider: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  providerName: {
    type: String,
    required: true
  },
  title: {
    type: String,
    required: true,
    trim: true
  },
  category: {
    type: String,
    enum: [
      'Veterinary',
      'Grooming',
      'Hostel',
      'Walking',
      'Training',
      'Transport',
      'Insurance',
      'Breeding',
      'Daycare',
      'Other'
    ],
    required: true
  },
  price: {
    type: Number,
    required: true,
    default: 0
  },
  discountPrice: {
    type: Number,
    default: 0
  },
  priceUnit: {
    type: String,
    default: 'per session'
  },
  duration: {
    type: String,
    default: '45 mins'
  },
  petTypes: [{
    type: String,
    default: ['Dogs', 'Cats']
  }],
  serviceMode: {
    type: String,
    enum: ['Clinic / Facility', 'Home Visit / Doorstep', 'Online Consultation', 'Hybrid'],
    default: 'Clinic / Facility'
  },
  location: {
    type: String,
    required: true
  },
  state: {
    type: String,
    default: 'Karnataka'
  },
  city: {
    type: String,
    default: 'Bangalore'
  },
  area: {
    type: String,
    default: ''
  },
  contactPhone: {
    type: String,
    default: ''
  },
  contactWhatsapp: {
    type: String,
    default: ''
  },
  description: {
    type: String,
    required: true
  },
  highlights: [{
    type: String
  }],
  packages: [{
    name: String,
    price: Number,
    duration: String,
    desc: String
  }],
  images: [{
    type: String,
    default: ['https://images.unsplash.com/photo-1576091160550-2173dba999ef?q=80&w=800']
  }],
  rating: {
    type: Number,
    default: 5.0
  },
  reviewsCount: {
    type: Number,
    default: 0
  },
  status: {
    type: String,
    enum: ['Active', 'Paused', 'Draft'],
    default: 'Active'
  },
  isVerified: {
    type: Boolean,
    default: true
  }
}, { timestamps: true });

export default mongoose.model('Service', serviceSchema);
