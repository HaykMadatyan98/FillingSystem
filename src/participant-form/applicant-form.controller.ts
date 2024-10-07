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
  Req,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { ParticipantFormService } from './participant-form.service';
import {
  ApiBearerAuth,
  ApiBody,
  ApiConsumes,
  ApiCreatedResponse,
  ApiOperation,
  ApiParam,
  ApiTags,
} from '@nestjs/swagger';
import { FileInterceptor } from '@nestjs/platform-express';
import {
  ApplicantFormDto,
  CreateParticipantDocDto,
} from './dtos/participant-form.dto';
import { AccessTokenGuard } from '@/auth/guards/access-token.guard';
import { RequestWithUser } from '@/auth/interfaces/request.interface';

@ApiTags('form')
@Controller('form')
export class ApplicantFormController {
  constructor(
    private readonly participantFormService: ParticipantFormService,
  ) {}

  @Post('applicant/create/:companyId')
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
  @ApiParam({
    name: 'participant',
    required: true,
    description: 'is applicant or not',
    example: 'applicant',
  })
  @ApiOperation({
    summary: 'Create new applicant',
  })
  @ApiBearerAuth()
  @UseGuards(AccessTokenGuard)
  async createNewParticipantForm(
    @Body() payload: ApplicantFormDto,
    @Req() req: RequestWithUser,
    @Param('companyId') companyId: string,
  ) {
    return this.participantFormService.createParticipantForm(
      payload,
      companyId,
      true,
      req.user,
    );
  }

  @Patch('applicant/:companyId/:formId')
  @ApiOperation({
    summary: 'Change applicant by formId',
  })
  @ApiParam({
    name: 'companyId',
    required: true,
    description: 'ID of the company',
  })
  @ApiParam({
    name: 'formId',
    required: true,
    description: 'ID of the applicant form',
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
  @ApiCreatedResponse({ type: ApplicantFormDto })
  @ApiBearerAuth()
  @UseGuards(AccessTokenGuard)
  async changeParticipantForm(
    @Param('formId') formId: string,
    @Param('companyId') companyId: string,
    @Body() payload: ApplicantFormDto,
    @Req() req: RequestWithUser,
  ) {
    return this.participantFormService.changeParticipantFormById(
      companyId,
      formId,
      payload,
      true,
      req.user,
    );
  }

  @Get('applicant/:formId')
  @ApiOperation({
    summary: 'Get applicant by formId',
  })
  @ApiBearerAuth()
  @UseGuards(AccessTokenGuard)
  async getParticipantFormById(
    @Param('formId') formId: string,
    @Req() req: RequestWithUser,
  ) {
    return this.participantFormService.getParticipantFormById(
      formId,
      true,
      req.user,
    );
  }

  @Delete('applicant/:formId')
  @ApiOperation({
    summary: 'Remove applicant by formId',
  })
  @ApiBearerAuth()
  @UseGuards(AccessTokenGuard)
  async deleteParticipantFormById(
    @Param('formId') formId: string,
    @Req() req: RequestWithUser,
  ) {
    return this.participantFormService.deleteParticipantFormById(
      formId,
      true,
      req.user,
    );
  }

  @Post('uploadAndUpdate/:participantId')
  @UseInterceptors(FileInterceptor('docImg'))
  @ApiConsumes('multipart/form-data')
  @ApiParam({
    name: 'participantId',
    required: true,
    description: 'ID of applicant which doc image will send',
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
  @ApiBearerAuth()
  @UseGuards(AccessTokenGuard)
  async uploadAnImageToTheCloudAndUpdate(
    @Param('participantId') participantId: string,
    @UploadedFile(
      new ParseFilePipe({
        fileIsRequired: true,
        validators: [new FileTypeValidator({ fileType: '.(jpeg|png|jpg)' })],
      }),
    )
    docImg: Express.Multer.File,
    @Req() req: RequestWithUser,
  ) {
    return await this.participantFormService.updateDocImageInParticipantForm(
      participantId,
      docImg,
      req.user,
    );
  }

  @Post('uploadApplImg/:companyId')
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
      },
    },
  })
  @ApiBearerAuth()
  @UseGuards(AccessTokenGuard)
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
    @Req() req: RequestWithUser,
  ) {
    return await this.participantFormService.uploadAnImageAndCreate(
      companyId,
      docImg,
      payload,
      true,
      req.user,
    );
  }
}