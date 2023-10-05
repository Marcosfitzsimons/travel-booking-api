import axios from 'axios'

class PaymentService {
    async createPayment(trip, userId) {
        const url = "https://api.mercadopago.com/checkout/preferences";

        const body = {
            items: [
                {
                    id: trip._id,
                    title: "Viaje con fabebus",
                    description: "Viaje con fabebus",
                    currency_id: "ARS",
                    quantity: 1,
                    unit_price: 20 // trip.price
                }
            ],
            back_urls: {
                failure: "https://www.fabebuscda.com.ar/payment-failure",
                pending: "https://www.fabebuscda.com.ar/viajes",
                success: `https://www.fabebuscda.com.ar/payment-success/${userId}/${trip._id}`
            },
            auto_return: "approved",
            payment_methods: {
                installments: 1
            },
            binary_mode: true
        };

        const payment = await axios.post(url, body, {
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${process.env.ACCESS_TOKEN}`
            }
        });

        return payment.data;
    }

    async createSubscription() {
        const url = "https://api.mercadopago.com/preapproval";

        const body = {
            reason: "Suscripción de ejemplo",
            auto_recurring: {
                frequency: 1,
                frequency_type: "months",
                transaction_amount: 10,
                currency_id: "ARS"
            },
            back_url: "https://google.com.ar",
            payer_email: "test_user_46945293@testuser.com"
        };

        const subscription = await axios.post(url, body, {
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${process.env.ACCESS_TOKEN}`
            }
        });

        return subscription.data;
    }
}

export default PaymentService;