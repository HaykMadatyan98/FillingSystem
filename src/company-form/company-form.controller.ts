import { Controller, Body, Patch, Get, Param } from '@nestjs/common';
import { CompanyFormService } from './company-form.service';
import { ApiOperation, ApiTags } from '@nestjs/swagger';

@ApiTags('form')
@Controller('form')
export class CompanyFormController {
  constructor(private readonly companyFormService: CompanyFormService) {}

  @Patch('/company/:formId')
  @ApiOperation({ summary: 'Change reporting company form' })
  
  async changeCompanyForm(@Param('formId') formId: string, @Body() body: any) {
    return this.companyFormService.changeCompanyFormById(formId, body);
  }

  @Get('/company/:formId')
  @ApiOperation({ summary: 'Get reporting company form by formId' })
  async getCompanyFormById(@Param('formId') formId: string) {
    return this.companyFormService.getCompanyFormById(formId);
  }
}
