import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule } from '@nestjs/config';
import { UserModule } from './user/user.module';
import { CompanyFormModule } from './company-form/company-form.module';
import { ParticipantFormModule } from './participant-form/participant-form.module';
import { AuthModule } from './auth/auth.module';
import { CompanyModule } from './company/company.module';
import { MailModule } from './mail/mail.module';
import { SchedulerModule } from './scheduler/scheduler.module';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import { APP_GUARD } from '@nestjs/core';
@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: '.env',
    }),
    MongooseModule.forRoot(process.env.MONGODB_URL),
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
  ],
  providers: [
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
  controllers: [],
})
export class AppModule {}
