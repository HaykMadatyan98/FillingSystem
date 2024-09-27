import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule } from '@nestjs/config';
import { UserModule } from './user/user.module';
import { CompanyFormModule } from './company-form/company-form.module';
import { ParticipantFormModule } from './participant-form/participant-form.module';
import { AuthModule } from './auth/auth.module';
import { CompanyModule } from './company/company.module';
// import { MailService } from './mail/mail.service';
import { MailModule } from './mail/mail.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: '.env',
    }),
    MongooseModule.forRoot(process.env.MONGODB_URL),
    UserModule,
    CompanyFormModule,
    ParticipantFormModule,
    AuthModule,
    CompanyModule,
    MailModule,
  ],
  providers: [],
  controllers: [],
})
export class AppModule {}
