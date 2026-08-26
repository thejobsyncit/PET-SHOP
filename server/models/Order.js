import mongoose from 'mongoose';

const OrderSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  orderItems: [{
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
      required: true,
    },
    name: String,
    price: Number,
    quantity: {
      type: Number,
      required: true,
    },
    image: String,
  }],
  shippingAddress: {
    name: String,
    phone: String,
    streetAddress: String,
    city: String,
    state: String,
    postalCode: String,
    country: String,
  },
  paymentMethod: {
    type: String,
    required: true,
    enum: ['UPI', 'Credit Card', 'Debit Card', 'Net Banking', 'Razorpay', 'Cash on Delivery'],
  },
  paymentDetails: {
    status: {
      type: String,
      enum: ['Pending', 'Completed', 'Failed', 'Refunded'],
      default: 'Pending',
    },
    transactionId: String,
    paidAt: Date,
  },
  shippingStatus: {
    type: String,
    enum: [
      'Pending',
      'Confirmed',
      'Processing',
      'Packed',
      'Shipped',
      'Out for Delivery',
      'Delivered',
      'Cancelled',
      'Refunded'
    ],
    default: 'Pending',
  },
  pricing: {
    subtotal: { type: Number, required: true },
    discount: { type: Number, default: 0 },
    shipping: { type: Number, default: 0 },
    tax: { type: Number, default: 0 },
    total: { type: Number, required: true },
  },
  prescriptionId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Prescription',
  },
  trackingNumber: {
    type: String,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const Order = mongoose.models.Order || mongoose.model('Order', OrderSchema);
export default Order;
