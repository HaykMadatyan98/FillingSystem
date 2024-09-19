import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { UserModule } from './user/user.module';
import { CompanyFormModule } from './company-form/company-form.module';
import { OwnerApplicantFormModule } from './owner-applicant-form/owner-applicant-form.module';
import { AuthModule } from './auth/auth.module';
import { SeedService } from './seed/seed.service';
import { CompanyController } from './company/company.controller';
import { CompanyModule } from './company/company.module';
import { MailService } from './mail/mail.service';
import { MailModule } from './mail/mail.module';

@Module({
  imports: [
    MongooseModule.forRoot(process.env.MONGODB_URI),
    UserModule,
    CompanyFormModule,
    OwnerApplicantFormModule,
    AuthModule,
    CompanyModule,
    MailModule,
  ],
  controllers: [CompanyController],
  providers: [SeedService, MailService],
})
export class AppModule {
  constructor(private readonly seedService: SeedService) {}
}
