const prisma = require('../lib/prisma');
const Razorpay = require('razorpay');
const shortid = require('shortid');
const crypto = require('crypto');

// Initialize Razorpay (Use test keys from env)
const razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID || 'rzp_test_1234567890',
    key_secret: process.env.RAZORPAY_KEY_SECRET || 'secret_key_12345',
});

// @desc    Create a new order
// @route   POST /api/orders
exports.createOrder = async (req, res) => {
    try {
        const { bookId, paymentMethod } = req.body; // paymentMethod: 'razorpay' or 'wallet'
        const userId = req.user.id;

        const book = await prisma.book.findUnique({
            where: { id: parseInt(bookId) },
        });

        if (!book) {
            return res.status(404).json({ message: 'Book not found' });
        }

        if (paymentMethod === 'wallet') {
            // 1. Check Balance
            const user = await prisma.user.findUnique({ where: { id: userId } });
            if (user.wallet_balance < book.price) {
                return res.status(400).json({ message: 'Insufficient wallet balance' });
            }

            // 2. Deduct Balance
            await prisma.user.update({
                where: { id: userId },
                data: { wallet_balance: { decrement: book.price } }
            });

            // 3. Create Completed Order
            const order = await prisma.order.create({
                data: {
                    user_id: userId,
                    book_id: book.id,
                    payment_status: 'completed',
                    transaction_id: `WALLET_${shortid.generate()}`,
                    amount: book.price,
                },
            });

            return res.json({ status: 'success', order_id: order.id, payment_method: 'wallet' });
        }

        // Default: Razorpay Flow
        const options = {
            amount: book.price * 100, // Amount in paise
            currency: 'INR',
            receipt: shortid.generate(),
            payment_capture: 1,
        };

        const response = await razorpay.orders.create(options);

        // Create record in database
        const order = await prisma.order.create({
            data: {
                user_id: userId,
                book_id: book.id,
                payment_status: 'pending',
                transaction_id: response.id, // Razorpay Order ID
                amount: book.price,
            },
        });

        res.json({
            id: response.id,
            currency: response.currency,
            amount: response.amount,
            order_db_id: order.id,
            payment_method: 'razorpay'
        });
    } catch (error) {
        console.error('ORDER CREATION ERROR:', error);
        res.status(500).json({ 
            message: 'Server error during order creation',
            error: error.message 
        });
    }
};

// @desc    Verify payment signature
// @route   POST /api/orders/verify
exports.verifyPayment = async (req, res) => {
    try {
        const { razorpay_order_id, razorpay_payment_id, razorpay_signature, order_db_id } = req.body;

        const body = razorpay_order_id + '|' + razorpay_payment_id;
        const expectedSignature = crypto
            .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET || 'secret_key_12345')
            .update(body.toString())
            .digest('hex');

        if (expectedSignature === razorpay_signature) {
            // Update order status
            await prisma.order.update({
                where: { id: order_db_id },
                data: {
                    payment_status: 'completed',
                    transaction_id: razorpay_payment_id // Update with payment ID
                }
            });

            res.json({ status: 'success' });
        } else {
            res.status(400).json({ status: 'failure' });
        }
    } catch (error) {
        console.error('PAYMENT VERIFICATION ERROR:', error);
        res.status(500).json({ message: 'Server error' });
    }
};
