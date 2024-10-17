import { AccessTokenGuard } from '@/auth/guards/access-token.guard';
import { Body, Controller, Patch, Post, UseGuards } from '@nestjs/common';
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

  @Patch('payment-succeed')
  @ApiBody({})
  @UseGuards(AccessTokenGuard)
  async updatePaymentStatus(@Body() body: any) {
    return this.transactionService.updateTransactionStatus(body);
  }
}
