import { Controller, Post, Body } from '@nestjs/common';
import { ReportingCompanyService } from './reporting-company.service';

@Controller('reporting-companies')
export class ReportingCompanyController {
  constructor(
    private readonly reportingCompanyService: ReportingCompanyService,
  ) {}

  @Post()
  async create(@Body() createReportingCompanyDto: any) {
    return this.reportingCompanyService.create(createReportingCompanyDto);
  }
}
