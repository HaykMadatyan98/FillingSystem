import { Module, OnModuleInit } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { APP_GUARD } from '@nestjs/core';
import { MongooseModule } from '@nestjs/mongoose';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import { AuthModule } from './auth/auth.module';
import { CompanyFormModule } from './company-form/company-form.module';
import { CompanyModule } from './company/company.module';
import configs from './config';
import { MailModule } from './mail/mail.module';
import { ParticipantFormModule } from './participant-form/participant-form.module';
import { SchedulerModule } from './scheduler/scheduler.module';
import { SeederService } from './seeders/seeder/seeder.service';
import { UserModule } from './user/user.module';
@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath:
        process.env.NODE_ENV === 'production' ? '.env.prod' : '.env.dev',
      load: [configs],
    }),
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        uri: configService.get<string>('MONGODB_URL'),
      }),
      inject: [ConfigService],
    }),
    UserModule,
    CompanyFormModule,
    CompanyModule,
    ParticipantFormModule,
    AuthModule,
    MailModule,
    SchedulerModule,
    ThrottlerModule.forRoot([
      {
        ttl: 20 * 60_000,
        limit: 1000,
      },
    ]),
    // StripeModule.forRootAsync(),
  ],
  providers: [
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
    SeederService,
  ],
  controllers: [],
})
export class AppModule implements OnModuleInit {
  constructor(private readonly seederService: SeederService) {}

  async onModuleInit() {
    await this.seederService.seed();
  }
}
