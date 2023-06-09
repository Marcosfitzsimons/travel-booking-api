class PaymentController {
    constructor(subscriptionService) {
        this.subscriptionService = subscriptionService;
    }

    async getPaymentLink(req, res) {
        const trip = req.body.trip
        const userId = req.body.userId
        try {
            const payment = await this.subscriptionService.createPayment(trip, userId); // Request single payments

            return res.json(payment);
        } catch (error) {
            console.log(error);

            return res
                .status(500)
                .json({ error: true, msg: "Failed to create payment" });
        }
    }

    async getSubscriptionLink(req, res) {
        try {
            const subscription = await this.subscriptionService.createSubscription();

            return res.json(subscription);
        } catch (error) {
            console.log(error);

            return res
                .status(500)
                .json({ error: true, msg: "Failed to create subscription" });
        }
    }
}

export default PaymentController;