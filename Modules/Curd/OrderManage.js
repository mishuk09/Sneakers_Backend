const express = require('express');
const router = express.Router();
const Order = require('../../Schema/Order'); // Adjust the path as needed

// Controller function for creating an order
const createOrder = async (req, res) => {
    try {
        const newOrder = new Order(req.body);
        await newOrder.save();
        res.status(201).json({ message: 'Order created successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Error creating order', error });
    }
};
    
// Controller function for fetching all orders
const getOrders = async (req, res) => {
    try {
        const orders = await Order.find();
        res.status(200).json(orders);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching orders', error });
    }
};


// Controller function for completing an order
const completeOrder = async (req, res) => {
    try {
        const orderId = req.params.id;
        await Order.findByIdAndDelete(orderId);
        res.status(200).json({ message: 'Order completed successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Error completing order', error });
    }
};

// Define the route
router.delete('/orders/:id', completeOrder);

// Define the routes
router.post('/orders', createOrder);
router.get('/orders', getOrders);

module.exports = router;
