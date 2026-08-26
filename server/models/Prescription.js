import mongoose from 'mongoose';

const PrescriptionSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  patientName: {
    type: String,
    required: [true, 'Patient/Pet name is required'],
  },
  veterinarianName: {
    type: String,
    required: [true, 'Veterinarian name is required'],
  },
  clinicName: {
    type: String,
  },
  customerComments: {
    type: String,
  },
  prescriptionFileUrl: {
    type: String,
    required: [true, 'Prescription image or PDF file is required'],
  },
  status: {
    type: String,
    enum: ['Pending', 'Under Review', 'Approved', 'Rejected'],
    default: 'Pending',
  },
  reviewedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  reviewNotes: {
    type: String,
  },
  items: [{
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
    },
    quantity: {
      type: Number,
      default: 1,
    }
  }],
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const Prescription = mongoose.models.Prescription || mongoose.model('Prescription', PrescriptionSchema);
export default Prescription;
