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
  @ApiConsumes('multipart/form-data')
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
  @UseInterceptors(FileInterceptor('docImg'))
  @ApiOperation({
    summary: 'Create new applicant/owner',
  })
  async createNewParticipantForm(
    @Body() payload: CreateParticipantFormDto,
    @UploadedFile(
      new ParseFilePipe({
        fileIsRequired: false,
        validators: [
          new FileTypeValidator({ fileType: '.(jpeg|png|jpg|csv)' }),
        ],
      }),
    )
    docImg?: Express.Multer.File,
  ) {
    return this.participantFormService.createParticipantForm();
  }

  @Patch('participant/:companyId/:formId')
  @ApiOperation({
    summary: 'Change applicant/owner by formId',
  })
  @ApiConsumes('multipart/form-data')
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
  @UseInterceptors(FileInterceptor('docImg'))
  @ApiCreatedResponse({ type: ChangeParticipantFormDto })
  async changeParticipantForm(
    @Param('formId') formId: string,
    @Param('companyId') companyId: string,
    @Body() payload: ChangeParticipantFormDto,
    @UploadedFile(
      new ParseFilePipe({
        fileIsRequired: false,
        validators: [
          new FileTypeValidator({ fileType: '.(jpeg|png|jpg|csv)' }),
        ],
      }),
    )
    docImg?: Express.Multer.File,
  ) {
    console.log(payload);
    return this.participantFormService.changeParticipantFormById(
      companyId,
      formId,
      payload,
      docImg,
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
}
