import { Controller, Post, Body } from '@nestjs/common';
import { OwnerApplicantFormService } from './owner-applicant-form.service';

@Controller('form')
export class OwnerApplicantFormController {
  constructor(
    private readonly applicantFormService: OwnerApplicantFormService,
  ) {}

  @Post()
  async create(@Body() createApplicantFormDto: any) {
    return this.applicantFormService.create(createApplicantFormDto);
  }
}
