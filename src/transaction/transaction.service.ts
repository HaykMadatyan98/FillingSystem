import { CompanyService } from '@/company/company.service';
import { forwardRef, Inject } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import Stripe from 'stripe';
import { Transaction, TransactionDocument } from './schemas/transaction.schema';

export class TransactionService {
  private stripe: Stripe;

  constructor(
    @Inject('STRIPE_API_KEY') private readonly apiKey: string,
    @InjectModel(Transaction.name)
    private transactionModel: Model<TransactionDocument>,
    @Inject(forwardRef(() => CompanyService))
    private readonly companyService: CompanyService,
  ) {
    this.stripe = new Stripe(this.apiKey, {
      apiVersion: '2024-09-30.acacia',
    });
  }

  async createPaymentIntent(companyIds: string[]) {
    const companies =
      await this.companyService.getSubmittedCompanies(companyIds);

    const totalAmount = companies.reduce((sum, company, index) => {
      const discount = index === 1 ? 0.25 : index > 1 ? 0.5 : 0;
      return sum + 100 * (1 - discount);
    }, 0);

    const paymentIntent = await this.stripe.paymentIntents.create({
      amount: totalAmount * 100,
      currency: 'usd',
      metadata: { companyIds: companyIds.join(',') },
    });

    return {
      clientSecret: paymentIntent.client_secret,
      totalAmount,
    };
  }

  verifyStripeEvent(payload: any, signature: string) {
    return this.stripe.webhooks.constructEvent(
      payload,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET,
    );
  }

  async handleEvent(event: any) {
    const eventType = event.type;

    switch (eventType) {
      case 'payment_intent.succeeded': {
        const paymentIntent = event.data.object;
        const companyIds = paymentIntent.metadata.companyIds.split(',');
        await this.recordTransaction(companyIds, paymentIntent);
        break;
      }
      case 'payment_intent.payment_failed': {
        break;
      }
      default:
        console.log(`Unhandled event type ${eventType}`);
    }
  }

  async recordTransaction(companyIds: string[], paymentIntent: any) {
    const companies =
      await this.companyService.getSubmittedCompanies(companyIds);

    for (const company of companies) {
      const transaction = new this.transactionModel({
        transactionId: paymentIntent.id,
        amountPaid: paymentIntent.amount / 100,
        status: 'succeeded',
        paymentDate: new Date(),
        paymentMethod: paymentIntent.payment_method,
        company: company['id'],
      });

      await transaction.save();
      company.transactions.push(transaction['_id'] as Transaction);
      company.isPaid = true;
      await company.save();
    }
  }
}
