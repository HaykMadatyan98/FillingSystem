import {
  Controller,
  Body,
  Patch,
  Get,
  Param,
  Req,
  UseGuards,
} from '@nestjs/common';
import { CompanyFormService } from './company-form.service';
import {
  ApiBearerAuth,
  ApiBody,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { RequestWithUser } from '@/auth/interfaces/request.interface';
import { AccessTokenGuard } from '@/auth/guards/access-token.guard';
import { ChangeCompanyFormDto } from './dtos/company-form.dto';

@ApiTags('form/company')
@Controller('form/company')
export class CompanyFormController {
  constructor(private readonly companyFormService: CompanyFormService) {}

  @Patch('/:companyId/:formId')
  @ApiOperation({ summary: 'Change reporting company form' })
  @UseGuards(AccessTokenGuard)
  @ApiBearerAuth()
  @ApiBody({
    type: ChangeCompanyFormDto,
  })
  @ApiOkResponse({})
  async changeCompanyForm(
    @Param('formId') formId: string,
    @Param('companyId') companyId: string,
    @Body() body: ChangeCompanyFormDto,
    @Req() req: RequestWithUser,
  ) {
    return this.companyFormService.updateCompanyForm(
      body,
      formId,
      companyId,
      req.user,
    );
  }

  @Get('/:formId')
  @ApiOperation({ summary: 'Get reporting company form by formId' })
  @UseGuards(AccessTokenGuard)
  @ApiBearerAuth()
  async getCompanyFormById(
    @Param('formId') formId: string,
    @Req() req: RequestWithUser,
  ) {
    return this.companyFormService.getCompanyFormById(formId, req.user);
  }
}
