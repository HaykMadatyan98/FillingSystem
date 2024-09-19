import { Controller, Post, Body } from '@nestjs/common';
import { OwnerApplicantFormService } from './owner-applicant-form.service';
import { CreateApplicantFormDto } from './dtos/applicant-form.dto';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('form')
@Controller('form')
export class OwnerApplicantFormController {
  constructor(
    private readonly applicantFormService: OwnerApplicantFormService,
  ) {}

  @Post('/applicant')
  async changeApplicantForm(@Body() createApplicantFormDto: CreateApplicantFormDto) {
    return this.applicantFormService.changeApplicantForm(createApplicantFormDto);
  }

  @Post('/owner')
  async changeOwnerForm(@Body() createApplicantFormDto: CreateApplicantFormDto) {
    return this.applicantFormService.changeOwnerForm(createApplicantFormDto);
  }
}
