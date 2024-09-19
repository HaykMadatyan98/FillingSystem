import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import {
  ReportingCompany,
  ReportingCompanyDocument,
} from './schemas/reporting-company.schema';

@Injectable()
export class ReportingCompanyService {
  constructor(
    @InjectModel(ReportingCompany.name)
    private reportingCompanyModel: Model<ReportingCompanyDocument>,
  ) {}

  async create(createReportingCompanyDto: any): Promise<ReportingCompany> {
    const createdCompany = new this.reportingCompanyModel(
      createReportingCompanyDto,
    );
    return createdCompany.save();
  }
}
