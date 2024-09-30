import {
  Body,
  Controller,
  Delete,
  FileTypeValidator,
  Get,
  Param,
  ParseFilePipe,
  Patch,
  Post,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { ParticipantFormService } from './participant-form.service';
import {
  ApiBody,
  ApiConsumes,
  ApiCreatedResponse,
  ApiOperation,
  ApiParam,
  ApiTags,
  getSchemaPath,
} from '@nestjs/swagger';
import { FileInterceptor } from '@nestjs/platform-express';
import {
  BeneficialOwnerDto,
  ChangeParticipantFormDto,
  CreateParticipantFormDto,
  CurrentAddressDto,
  ExemptEntityDto,
  ExistingCompanyApplicantDto,
  FinCENIDDto,
  IdentificationAndJurisdictionDto,
  PersonalInformationDto,
} from './dtos/participant-form.dto';

@ApiTags('form')
@Controller('form')
export class ParticipantFormController {
  constructor(
    private readonly participantFormService: ParticipantFormService,
  ) {}

  @Post('participant/create/:companyId')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        docImg: {
          type: 'string',
          format: 'binary',
        },
      },
    },
  })
  @ApiParam({
    name: 'companyId',
    required: true,
    description: 'ID of the company',
  })
  @ApiOperation({
    summary: 'Create new applicant/owner',
  })
  async createNewParticipantForm(@Body() payload: CreateParticipantFormDto) {
    return this.participantFormService.createParticipantForm();
  }

  @Patch('participant/:companyId/:formId')
  @ApiOperation({
    summary: 'Change applicant/owner by formId',
  })
  @ApiParam({
    name: 'companyId',
    required: true,
    description: 'ID of the company',
  })
  @ApiParam({
    name: 'formId',
    required: true,
    description: 'ID of the owner/applicant form',
  })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        ...{
          applicant: {
            type: 'object',
            $ref: getSchemaPath(ExistingCompanyApplicantDto),
          },
          beneficialOwner: {
            type: 'object',
            $ref: getSchemaPath(BeneficialOwnerDto),
          },
          finCENID: { type: 'object', $ref: getSchemaPath(FinCENIDDto) },
          exemptEntity: {
            type: 'object',
            $ref: getSchemaPath(ExemptEntityDto),
          },
          personalInfo: {
            type: 'object',
            $ref: getSchemaPath(PersonalInformationDto),
          },
          address: { type: 'object', $ref: getSchemaPath(CurrentAddressDto) },
          identificationDetails: {
            type: 'object',
            $ref: getSchemaPath(IdentificationAndJurisdictionDto),
          },
          isApplicant: { type: 'boolean' },
        },
        docImg: {
          type: 'string',
          format: 'binary',
        },
      },
    },
  })
  @ApiCreatedResponse({ type: ChangeParticipantFormDto })
  async changeParticipantForm(
    @Param('formId') formId: string,
    @Param('companyId') companyId: string,
    @Body() payload: ChangeParticipantFormDto,
  ) {
    console.log(payload);
    return this.participantFormService.changeParticipantFormById(
      companyId,
      formId,
      payload,
    );
  }

  @Get('participant/:formId')
  @ApiOperation({
    summary: 'Get applicant/owner by formId',
  })
  async getParticipantFormById(@Param('formId') formId: string) {}

  @Delete('participant/:formId')
  @ApiOperation({
    summary: 'Remove applicant/owner by formId',
  })
  async deleteParticipantFormById(@Param('formId') formId: string) {}

  @Post('uploadAndUpdate/:participantId')
  @UseInterceptors(FileInterceptor('docImg'))
  @ApiConsumes('multipart/form-data')
  async uploadAnImageToTheCloudAndUpdate(
    @Param('participantId') participantId: string,
    @UploadedFile(
      new ParseFilePipe({
        fileIsRequired: true,
        validators: [new FileTypeValidator({ fileType: '.(jpeg|png|jpg)' })],
      }),
    )
    docImg: Express.Multer.File,
  ) {
    const docImageData =
      await this.participantFormService.uploadAnImageToTheCloud(docImg);

    // update (steps find company which contains current id after checking update the current field)
    // send message after update
  }

  @Post('uploadAndCreate/:companyId')
  @UseInterceptors(FileInterceptor('docImg'))
  @ApiConsumes('multipart/form-data')
  async uploadAnImageToTheCloudAndCreate(
    @Param('companyId') companyId: string,
    @UploadedFile(
      new ParseFilePipe({
        fileIsRequired: true,
        validators: [new FileTypeValidator({ fileType: '.(jpeg|png|jpg)' })],
      }),
    )
    docImg: Express.Multer.File,
  ) {
    const docImageData =
      await this.participantFormService.uploadAnImageToTheCloud(docImg);

    // before creating get the data about where it need to be created(applicant/owner)
    // create new participant Form and add it into company
    // send the mongodb.ObjectId of the new created participant
  }
}
