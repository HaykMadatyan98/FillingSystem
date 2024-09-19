import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import {
  ApplicantForm,
  OwnerForm,
  ApplicantFormSchema,
  OwnerFormSchema,
} from './schemas/owner-applicant-form.schema';
import { OwnerApplicantFormService } from './owner-applicant-form.service';
import { OwnerApplicantFormController } from './owner-applicant-form.controller';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: ApplicantForm.name, schema: ApplicantFormSchema },
    ]),
    MongooseModule.forFeature([
      { name: OwnerForm.name, schema: OwnerFormSchema },
    ]),
  ],
  providers: [OwnerApplicantFormService],
  controllers: [OwnerApplicantFormController],
})
export class OwnerApplicantFormModule {}
