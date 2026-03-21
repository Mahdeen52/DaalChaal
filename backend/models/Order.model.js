const mongoose = require('mongoose');

const OrderItemSchema = new mongoose.Schema({
    item: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Item',
        required: true
    },
    name: String,
    price: Number,
    quantity: {
        type: Number,
        default: 1,
        min: 1
    }
});

const InstallmentDetailSchema = new mongoose.Schema({
    installmentNumber: Number,
    amount: Number,
    dueDate: String,
    label: String
});

const OrderSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    items: [OrderItemSchema],
    totalPrice: {
        type: Number,
        required: true
    },
    status: {
        type: String,
        enum: ['pending', 'processing', 'completed', 'cancelled'],
        default: 'completed'
    },
    paymentMethod: {
        type: String,
        default: 'simulated'
    },
    // Billing info
    customerName: { type: String, default: '' },
    phone: { type: String, default: '' },
    installmentPlan: {
        type: String,
        enum: ['A', 'B', 'C', 'D'],
        default: 'A'
    },
    installmentDetails: [InstallmentDetailSchema],
    shippingAddress: {
        street: String,
        city: String,
        state: String,
        zipCode: String,
        country: String
    }
}, { timestamps: true });

module.exports = mongoose.model('Order', OrderSchema);
