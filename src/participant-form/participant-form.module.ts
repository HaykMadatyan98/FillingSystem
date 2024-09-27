import { forwardRef, Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import {
  ParticipantForm,
  ParticipantFormSchema,
} from './schemas/participant-form.schema';
import { ParticipantFormService } from './participant-form.service';
import { ParticipantFormController } from './participant-form.controller';
import { CompanyModule } from '@/company/company.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: ParticipantForm.name, schema: ParticipantFormSchema },
    ]),
    forwardRef(() => CompanyModule),
  ],
  providers: [ParticipantFormService],
  controllers: [ParticipantFormController],
  exports: [ParticipantFormService],
})
export class ParticipantFormModule {}
