import { Controller, Post, Body } from '@nestjs/common';
import { CompanyFormService } from './company-form.service';
import { CompanyFormDto } from './dtos/company-form.dto';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('form')
@Controller('form')
export class CompanyFormController {
  constructor(private readonly reportingCompanyService: CompanyFormService) {}

  @Post('company')
  async create(@Body() createCompanyFormDto: CompanyFormDto) {
    return this.reportingCompanyService.create(createCompanyFormDto);
  }
}
