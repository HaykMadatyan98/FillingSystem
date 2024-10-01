import { CompanyService } from './../company/company.service';
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
  CreateParticipantDocDto,
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

  // add user check
  @Post('uploadAndUpdate/:participantId')
  @UseInterceptors(FileInterceptor('docImg'))
  @ApiConsumes('multipart/form-data')
  @ApiParam({
    name: 'participantId',
    required: true,
    description: 'ID of owner or applicant which doc image will send',
  })
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
    return await this.participantFormService.updateDocImageInParticipantForm(
      participantId,
      docImg,
    );
  }

  // add user check
  @Post('uploadAndCreate/:companyId')
  @UseInterceptors(FileInterceptor('docImg'))
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        docImg: {
          type: 'string',
          format: 'binary',
        },
        docType: {
          type: 'string',
          example: 'Foreign passport',
        },
        docNum: {
          type: 'string',
          example: 'A123456789',
        },
        isApplicant: {
          type: 'boolean',
        },
      },
    },
  })
  async uploadAnImageToTheCloudAndCreate(
    @Param('companyId') companyId: string,
    @UploadedFile(
      new ParseFilePipe({
        fileIsRequired: true,
        validators: [new FileTypeValidator({ fileType: '.(jpeg|png|jpg)' })],
      }),
    )
    docImg: Express.Multer.File,
    @Body() payload: CreateParticipantDocDto,
  ) {
    return await this.participantFormService.uploadAnImageAndCreate(
      companyId,
      docImg,
      payload,
    );
  }
}
