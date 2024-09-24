import { Controller, Post, Body } from '@nestjs/common';
import { ParticipantFormService } from './participant-form.service';
import { ApiTags } from '@nestjs/swagger';
import { CreateParticipantFormDto } from './dtos/participant-form.dto';

@ApiTags('form')
@Controller('form')
export class ParticipantFormController {
  constructor(
    private readonly participantFormService: ParticipantFormService,
  ) {}

  // @Post('/applicant')
  // async changeApplicantForm(
  //   @Body() createApplicantFormDto: CreateApplicantFormDto,
  // ) {
  //   return this.applicantFormService.changeApplicantForm(
  //     createApplicantFormDto,
  //   );
  // }

  // @Post('/owner')
  // async changeOwnerForm(
  //   @Body() createApplicantFormDto: CreateApplicantFormDto,
  // ) {
  //   return this.applicantFormService.changeOwnerForm(createApplicantFormDto);
  // }
  // @Post('/participant')
  // async changeParticipantData(
  //   @Body() participantData: CreateParticipantFormDto,
  // ) {
  // return this.participantFormService.changeParticipantForm(participantData);
  // }
}
