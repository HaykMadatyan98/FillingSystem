import { AccessTokenGuard } from '@/auth/guards/access-token.guard';
import { RequestWithUser } from '@/auth/interfaces/request.interface';
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
import { FileInterceptor } from '@nestjs/platform-express';
import {
  ApiBearerAuth,
  ApiBody,
  ApiConsumes,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiTags,
} from '@nestjs/swagger';
import { participantFormResponseMsgs } from './constants';
import {
  ApplicantFormDto,
  CreateParticipantDocDto,
  OwnerFormDto,
} from './dtos/participant-form.dto';
import { ParticipantFormService } from './participant-form.service';

@ApiTags('form/owner')
@Controller('form/owner')
export class OwnerFormController {
  constructor(
    private readonly participantFormService: ParticipantFormService,
  ) {}

  @Post('create/:companyId')
  @ApiBody({
    type: OwnerFormDto,
  })
  @ApiParam({
    name: 'companyId',
    required: true,
    description: 'ID of the company',
  })
  @ApiOperation({
    summary: 'Create new owner',
  })
  @ApiBearerAuth()
  @UseGuards(AccessTokenGuard)
  async createNewParticipantForm(
    @Body() payload: OwnerFormDto,
    @Req() req: RequestWithUser,
    @Param('companyId') companyId: string,
  ) {
    return this.participantFormService.createParticipantForm(
      payload,
      companyId,
      false,
      req.user,
    );
  }

  @Patch(':companyId/:formId')
  @ApiOperation({
    summary: 'Change owner by formId',
  })
  @ApiParam({
    name: 'companyId',
    required: true,
    description: 'ID of the company',
  })
  @ApiParam({
    name: 'formId',
    required: true,
    description: 'ID of the owner form',
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
    return this.participantFormService.changeParticipantForm(
      payload,
      formId,
      false,
      companyId,
      req.user,
    );
  }

  @Get(':formId')
  @ApiOperation({
    summary: 'Get owner by formId',
  })
  @ApiBearerAuth()
  @UseGuards(AccessTokenGuard)
  async getParticipantFormById(
    @Param('formId') formId: string,
    @Req() req: RequestWithUser,
  ) {
    return this.participantFormService.getParticipantFormById(
      formId,
      false,
      req.user,
    );
  }

  @Delete(':formId')
  @ApiOperation({
    summary: 'Remove owner by formId',
  })
  @ApiBearerAuth()
  @UseGuards(AccessTokenGuard)
  async deleteParticipantFormById(
    @Param('formId') formId: string,
    @Req() req: RequestWithUser,
  ) {
    return this.participantFormService.deleteParticipantFormById(
      formId,
      false,
      req.user,
    );
  }

  @Post('uploadOwnImg/:companyId')
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
      false,
      req.user,
    );
  }

  @Get('/company/:userId')
  @ApiParam({
    required: true,
    name: 'userId',
  })
  @ApiOperation({
    summary: 'Get all user companies applicant information',
  })
  @ApiOkResponse({
    description: participantFormResponseMsgs.retrieved,
  })
  @UseGuards(AccessTokenGuard)
  @ApiBearerAuth()
  async getAllCompaniesOwners(@Param('userId') userId: string) {
    return this.participantFormService.getAllCompaniesParticipants(
      false,
      userId,
    );
  }
}
