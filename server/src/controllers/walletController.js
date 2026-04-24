const prisma = require('../lib/prisma');

// @desc    Top up wallet
// @route   POST /api/wallet/topup
exports.topUpWallet = async (req, res) => {
    try {
        const { amount } = req.body;
        const userId = req.user.id;

        if (!amount || amount <= 0) {
            return res.status(400).json({ message: 'Invalid amount' });
        }

        // In production, verify payment here before adding funds

        const user = await prisma.user.update({
            where: { id: userId },
            data: {
                wallet_balance: {
                    increment: parseFloat(amount)
                }
            }
        });

        res.json({
            message: 'Wallet topped up successfully',
            wallet_balance: user.wallet_balance
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};
