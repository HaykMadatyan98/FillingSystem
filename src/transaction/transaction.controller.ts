import { AccessTokenGuard } from '@/auth/guards/access-token.guard';
import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiBody } from '@nestjs/swagger';
import { CreatePaymentIntentDto } from './dtos/transaction.dto';
import { TransactionService } from './transaction.service';

@Controller('transaction')
export class TransactionController {
  constructor(private transactionService: TransactionService) {}

  @Post('create-payment-intent')
  @ApiBody({ type: CreatePaymentIntentDto })
  @UseGuards(AccessTokenGuard)
  @ApiBearerAuth()
  async createPaymentIntent(@Body() body: CreatePaymentIntentDto) {
    const { companyIds } = body;

    return this.transactionService.createPaymentIntent(
      companyIds as unknown as string[],
    );
  }

  // @Post('webhook')
  // async stripeWebhook(@Req() req, @Res() res) {
  //   const signature = req.headers['stripe-signature'];
  //   const event = this.transactionService.verifyStripeEvent(
  //     req.body,
  //     signature,
  //   );
  //   await this.transactionService.handleEvent(event);
  //   res.json({ received: true });
  // }
}
