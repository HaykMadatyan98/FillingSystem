import { CompanyModule } from '@/company/company.module';
import { DynamicModule, forwardRef, Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { Transaction, TransactionSchema } from './schemas/transaction.schema';
import { TransactionController } from './transaction.controller';
import { TransactionService } from './transaction.service';

@Module({
  imports: [
    forwardRef(() => CompanyModule),
    ConfigModule,
    MongooseModule.forFeature([
      { name: Transaction.name, schema: TransactionSchema },
    ]),
  ],
  providers: [
    TransactionService,
    {
      provide: 'STRIPE_API_KEY',
      useFactory: (configService: ConfigService) =>
        configService.get('STRIPE.apiKey'),
      inject: [ConfigService],
    },
  ],
  controllers: [TransactionController],
})
export class TransactionModule {
  static forRootAsync(): DynamicModule {
    return {
      module: TransactionModule,
      imports: [ConfigModule.forRoot()],
      providers: [
        TransactionService,
        {
          provide: 'STRIPE_API_KEY',
          useFactory: (configService: ConfigService) =>
            configService.get('STRIPE.apiKey'),
          inject: [ConfigService],
        },
      ],
    };
  }
}
