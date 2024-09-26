import { Controller, Body, Patch, Get, Param } from '@nestjs/common';
import { CompanyFormService } from './company-form.service';
// import { CompanyFormDto } from './dtos/company-form.dto';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('form')
@Controller('form')
export class CompanyFormController {
  constructor(private readonly companyFormService: CompanyFormService) {}

  // update
  @Patch('/company/:companyFormId')
  async changeCompanyForm(
    @Param('companyFormId') companyFormId: string,
    @Body() body: any,
  ) {
    return this.companyFormService.changeCompanyFormById(companyFormId, body);
  }

  // get
  @Get('/company/:id')
  async getCompanyFormById(@Param('companyFormId') companyFormId: string) {
    return this.companyFormService.getCompanyFormById(companyFormId);
  }
}
