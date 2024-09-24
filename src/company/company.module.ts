import { Module } from '@nestjs/common';
import { CompanyService } from './company.service';
import { CompanyController } from './company.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Company, CompanySchema } from './schemas/company.schema';
import { CompanyFormModule } from '@/company-form/company-form.module';
import { ParticipantFormModule } from '@/participant-form/participant-form.module';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Company.name, schema: CompanySchema }]),
    CompanyFormModule,
    ParticipantFormModule,
  ],
  providers: [CompanyService],
  controllers: [CompanyController],
})
export class CompanyModule {}
