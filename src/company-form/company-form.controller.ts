import { Controller, Post, Body } from '@nestjs/common';
import { CompanyFormService } from './company-form.service';

@Controller('company-form')
export class CompanyFormController {
  constructor(private readonly reportingCompanyService: CompanyFormService) {}

  @Post()
  async create(@Body() createCompanyFormDto: any) {
    return this.reportingCompanyService.create(createCompanyFormDto);
  }
}
