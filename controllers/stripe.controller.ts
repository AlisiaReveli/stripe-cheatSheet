
import config from '../config/stripe';
const stripeObject = require('stripe')(config.secretKey);

//you can use discount coupon 
const createSubscription = async (customerId: string, accountId: string, priceId: string) => {
    return stripeObject.subscriptions.create({
        customer: customerId,
        transfer_data: {
            destination: accountId,
        },
        items: [
            {
                price: priceId,
                // coupon:couponId
            },
        ],
    });
}
const createPaymentIntent = async (
    amount: number,
    customerId: string,
    accountId: string,
    description: string,
) => {
    return stripeObject.paymentIntents.create({
        amount: Math.round(amount * 100),
        currency: 'usd',
        description,
        customer: customerId,
        transfer_data: {
            amount,
            destination: accountId,
        },
    });
}

//The Customer resource is a core entity within Stripe.Use it to store all of the profile, billing, and tax information required to bill a customer for subscriptions and one - off invoices.
const createCustomer = async (name: string, email: string) => {
    return stripeObject.customers.create({
        name: name,
        email: email,
    });
}


const createAccountLink = async (accountId: string) => {
    return stripeObject.accountLinks.create({
        account: accountId,
        refresh_url: process.env.FRONTEND_URL,
        return_url: process.env.FRONTEND_URL,
        type: 'account_onboarding',
    });
}

const attachPaymentMethod = async (paymentMethodId: string, customerId: string) => {
    return stripeObject.paymentMethods.attach(paymentMethodId, {
        customer: customerId,
    });
}

const makeDefaultPaymentMethod = async (paymentMethodId: string, customerId: string) => {
    return stripeObject.customers.update(customerId, {
        invoice_settings: {
            default_payment_method: paymentMethodId,
        },
    });
}
//must create an account (known as a connected account) for each user that receives money on your platform.
const createAccount = async (email: string) => {
    return stripeObject.accounts.create({
        type: 'express',
        email,
        capabilities: {
            card_payments: { requested: true },
            transfers: { requested: true },
        },
    });
}

const attachTokenToAccount = async (accountId: string, tokenId: string) => {
    return stripeObject.accounts.update(accountId, {
        external_account: tokenId,
        capabilities: {
            card_payments: { requested: true },
        },
    });
}

//part of identity verification process
const createFile = async (file: any, accountId: string) => {
    return stripeObject.files.create(
        {
            purpose: 'identity_document',
            file: {
                data: file.buffer,
                name: file.filename,
                type: file.mimetype,
            },
        },
        {
            stripeAccount: accountId,
        },
    );
}

const addFileToPerson = async (accountId: string, individualId: string, fileId: string) => {
    return stripeObject.accounts.updatePerson(accountId, individualId, {
        verification: {
            document: {
                front: fileId,
            },
        },
    });
}

const retrivePaymentMethods = async (customerId: string) => {
    return stripeObject.paymentMethods.list({
        customer: customerId,
        type: 'card',
    });
}

const getSubscription = async (subscriptionId: string) => {
    return stripeObject.subscriptions.retrieve(subscriptionId);
}

const getUpcomingProratedInvoice = async (customer: string, subscriptionId: string) => {
    return stripeObject.invoices.list({
        customer: customer,
        subscription: subscriptionId,
    });
}


const getLatestInvoice = async (subscription) => {
    return stripeObject.invoices.retrieve(subscription.latest_invoice);
}

const charge = async (amount: number, currency: 'usd', source: string, description: string) => {
    return stripeObject.charges.create({
        amount: amount,
        currency: 'usd',
        source: source, //. This can be the ID of a card
        description: 'My First Test Charge (created for API docs at https://www.stripe.com/docs/api)',
    });
}

const refund = async (latestInvoice, remaining) => {
    return stripeObject.refunds.create({
        charge: latestInvoice.charge,
        amount: Math.floor(remaining),
        reverse_transfer: true,
    });
}

const cancel = async (subscriptionId) => {
    return stripeObject.subscriptions.del(subscriptionId, {
        prorate: true,
    });
}

const getAccount = async (id) => {
    return stripeObject.accounts.retrieve(id);
}

const createInvoice = async (customerId:string) => {
    return stripeObject.invoices.create({
        auto_advance: false,
        collection_method: 'send_invoice',
        customer: customerId,
        description: 'Invoice description',
        days_until_due: 5,
    });
}

const createInvoiceItem = async (customerId: string, priceId: string) => {
    return stripeObject.invoiceItems.create({
        customer: customerId,
        price: priceId,
        quantity: 1,
    });
}

const sendInvoice = async (invoice) => {
    return stripeObject.invoices.sendInvoice(invoice);
}

const createProduct = async (name: string, amount: number, accountId: string) => {
    return stripeObject.products.create(
        {
            name,
            default_price_data: {
                currency: 'usd',
                unit_amount: Math.round(amount * 100),
                recurring: {},
            },
        },
        {
            stripeAccount: accountId,
        },
    );
}

//create discount coupon

const createCoupon = async (percent_off: number, duration: 'repeating', duration_in_months: number) => {
    const coupon = await stripeObject.coupons.create({
        percent_off: 25.5,
        duration: 'repeating',
        duration_in_months: 3,
    });
    }

const createCheckout= async( price:number, customer:string) =>{
    return stripeObject.checkout.sessions.create({
        success_url: process.env.FRONTEND_URL ,
        cancel_url: process.env.FRONTEND_URL,
        line_items: [{ price, quantity: 1 }],
        customer,
        mode: 'payment',
    });
}

const createSessionCheckout=async( price:number, customer:string, accountId:string) =>{
    return stripeObject.checkout.sessions.create(
        {
            success_url: process.env.FRONTEND_URL,
            cancel_url: process.env.FRONTEND_URL,
            line_items: [{ price, quantity: 1 }],
            customer_email: customer,
            mode: 'payment',
        },
        {
            stripeAccount: accountId,
        },
    );
}

const retrieveSession=async(id:string)=> {
    return stripeObject.checkout.sessions.retrieve(id);
}

const retrieveSessionCheckoutSession=async(id:string, accountId:string)=> {
    return stripeObject.checkout.sessions.retrieve(id, {
        stripeAccount: accountId,
    });
}

const expireSession=async(id:string)=> {
    return stripeObject.checkout.sessions.expire(id);
}

module.exports = {
    createSubscription,
    createPaymentIntent,
    createCustomer,
    createAccountLink,
    attachPaymentMethod,
    makeDefaultPaymentMethod,
    createAccount,
    attachTokenToAccount,
    createFile,
    addFileToPerson,
    retrivePaymentMethods,
    getSubscription,
    getUpcomingProratedInvoice,
    getLatestInvoice,
    refund,
    cancel,
    getAccount,
    createInvoice,
    createInvoiceItem,
    sendInvoice,
    createSessionProduct: createProduct,
    createCheckout,
    createSessionCheckout,
    retrieveSession,
    retrieveSessionCheckoutSession,
    expireSession,
    charge,
    createCoupon
}