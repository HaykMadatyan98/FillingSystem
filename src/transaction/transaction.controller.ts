import { Body, Controller, Post, Req, Res } from '@nestjs/common';
import { TransactionService } from './transaction.service';

@Controller('transaction')
export class TransactionController {
  constructor(private transactionService: TransactionService) {}

  @Post('create-payment-intent')
  async createPaymentIntent(@Body() body, @Res() res) {
    const { companyIds } = body; 
    const paymentIntent =
      await this.transactionService.createPaymentIntent(companyIds);
    return res.json(paymentIntent);
  }

  @Post('webhook')
  async stripeWebhook(@Req() req, @Res() res) {
    const signature = req.headers['stripe-signature'];
    const event = this.transactionService.verifyStripeEvent(req.body, signature);
    await this.transactionService.handleEvent(event);
    res.json({ received: true });
  }
}
