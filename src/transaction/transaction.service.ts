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

  private async createOrChangeTransaction(paymentIntent, companyIds) {
    const currentCompaniesTransactions =
      await this.findAllTransactionsForCurrentYear(companyIds);

    if (!currentCompaniesTransactions.length) {
      const transaction = new this.transactionModel({
        transactionId: paymentIntent.id,
        amountPaid: paymentIntent.amount / 100,
        status: paymentIntent.status,
        paymentDate: new Date(paymentIntent.created * 1000),
        paymentMethod: paymentIntent.payment_method_types?.[0] || 'unknown',
        transactionType: 'BOIR Payment',
        companies: companyIds,
      });
      await transaction.save();
      await this.companyService.addTransactionToCompanies(
        companyIds,
        transaction['id'],
      );
    } else if (currentCompaniesTransactions.length === 1) {
      currentCompaniesTransactions[0].transactionId = paymentIntent.id;
      currentCompaniesTransactions[0].paymentDate = new Date(
        paymentIntent.created * 1000,
      );
    } else {
      let currentTransaction: TransactionDocument | undefined =
        currentCompaniesTransactions.find(
          (company) => (company.companies = [...companyIds]),
        );

      if (!currentTransaction) {
        const transaction = new this.transactionModel({
          transactionId: paymentIntent.id,
          amountPaid: paymentIntent.amount / 100,
          status: paymentIntent.status,
          paymentDate: new Date(paymentIntent.created * 1000),
          paymentMethod: paymentIntent.payment_method_types?.[0] || 'unknown',
          transactionType: 'BOIR Payment',
          companies: companyIds,
        });
        await transaction.save();
        await this.companyService.addTransactionToCompanies(
          companyIds,
          transaction['id'],
        );
        currentTransaction = transaction;
      } else {
        currentTransaction.transactionId = paymentIntent.id;
        currentTransaction.paymentDate = new Date(paymentIntent.created * 1000);

        await currentTransaction.save();
      }

      const otherTransactions: {
        transactionId: string;
        companyIds: string[];
      }[] = currentCompaniesTransactions.map((transaction) => {
        if (transaction.transactionId !== currentTransaction.transactionId) {
          return {
            transactionId: transaction.transactionId as string,
            companyIds: transaction.companies as unknown[] as string[],
          };
        }
      });

      await Promise.all(
        otherTransactions.map(async (transaction) => {
          await this.companyService.removeCompanyTransaction(
            transaction.companyIds,
            transaction.transactionId,
          );
        }),
      );

      const transactionsToRemove = otherTransactions.map(
        (data) => data.transactionId,
      );

      await this.removeTransactions(transactionsToRemove);
    }
  }

  async createPaymentIntent(companyIds: string[]) {
    const { companiesAndTheirAmount, totalAmount } =
      await this.companyService.getSubmittedCompaniesAndTheirAmount(companyIds);

    const companyNames = companiesAndTheirAmount.map((company) => company.name);
    const paymentIntent = await this.stripe.paymentIntents.create({
      amount: totalAmount * 100,
      currency: 'usd',
      metadata: { companyNames: companyNames.join(',') },
      automatic_payment_methods: {
        enabled: true,
      },
    });

    await this.createOrChangeTransaction(paymentIntent, companyIds);

    return {
      clientSecret: paymentIntent.client_secret,
      companies: companiesAndTheirAmount,
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

  private async findAllTransactionsForCurrentYear(
    companyIds: string[],
  ): Promise<TransactionDocument[]> {
    const currentYearStart = new Date(new Date().getFullYear(), 0, 1); 
    const currentYearEnd = new Date(
      new Date().getFullYear(),
      11,
      31,
      23,
      59,
      59,
    );

    return this.transactionModel
      .find({
        paymentDate: {
          $gte: currentYearStart, 
          $lte: currentYearEnd, 
        },
        companies: { $in: companyIds }, 
      })
      .exec();
  }

  private async removeTransactions(transactions: string[]) {
    const result = await this.transactionModel.deleteMany({
      _id: { $in: transactions },
    });

    return result;
  }
  // async handleEvent(event: any) {
  //   const eventType = event.type;

  //   switch (eventType) {
  //     case 'payment_intent.succeeded': {
  //       const paymentIntent = event.data.object;
  //       const companyIds = paymentIntent.metadata.companyIds.split(',');
  //       await this.recordTransaction(companyIds, paymentIntent);
  //       break;
  //     }
  //     case 'payment_intent.payment_failed': {
  //       break;
  //     }
  //     default:
  //       console.log(`Unhandled event type ${eventType}`);
  //   }
  // }

  // async recordTransaction(companyIds: string[], paymentIntent: any) {
  //   const companies =
  //     await this.companyService.getSubmittedCompanies(companyIds);

  //   for (const company of companies) {
  //     const transaction = new this.transactionModel({
  //       transactionId: paymentIntent.id,
  //       amountPaid: paymentIntent.amount / 100,
  //       status: 'succeeded',
  //       paymentDate: new Date(),
  //       paymentMethod: paymentIntent.payment_method,
  //       company: company['id'],
  //     });

  //     await transaction.save();
  //     company.transactions.push(transaction['_id'] as Transaction);
  //     company.isPaid = true;
  //     await company.save();
  //   }
  // }
}
