import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { UserModule } from './user/user.module';
import { ReportingCompanyModule } from './reporting-company/reporting-company.module';
import { CompanyApplicantModule } from './company-applicant/company-applicant.module';
import { AuthModule } from './auth/auth.module';
import { SeedService } from './seed/seed.service';

@Module({
  imports: [
    MongooseModule.forRoot(process.env.MONGODB_URI),
    UserModule,
    ReportingCompanyModule,
    CompanyApplicantModule,
    AuthModule,
  ],
  controllers: [],
  providers: [SeedService],
})
export class AppModule {
  constructor(private readonly seedService: SeedService) {}
}
