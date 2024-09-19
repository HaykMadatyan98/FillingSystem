import { Controller, Post, Body } from '@nestjs/common';
import { CompanyApplicantService } from './company-applicant.service';

@Controller('company-applicants')
export class CompanyApplicantController {
  constructor(
    private readonly companyApplicantService: CompanyApplicantService,
  ) {}

  @Post()
  async create(@Body() createCompanyApplicantDto: any) {
    return this.companyApplicantService.create(createCompanyApplicantDto);
  }
}
