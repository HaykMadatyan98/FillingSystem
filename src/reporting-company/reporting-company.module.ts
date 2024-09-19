import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import {
  ReportingCompany,
  ReportingCompanySchema,
} from './schemas/reporting-company.schema';
import { ReportingCompanyService } from './reporting-company.service';
import { ReportingCompanyController } from './reporting-company.controller';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: ReportingCompany.name, schema: ReportingCompanySchema },
    ]),
  ],
  providers: [ReportingCompanyService],
  controllers: [ReportingCompanyController],
})
export class ReportingCompanyModule {}
