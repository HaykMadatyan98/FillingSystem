import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import {
  CompanyApplicant,
  CompanyApplicantSchema,
} from './schemas/company-applicant.schema';
import { CompanyApplicantService } from './company-applicant.service';
import { CompanyApplicantController } from './company-applicant.controller';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: CompanyApplicant.name, schema: CompanyApplicantSchema },
    ]),
  ],
  providers: [CompanyApplicantService],
  controllers: [CompanyApplicantController],
})
export class CompanyApplicantModule {}
