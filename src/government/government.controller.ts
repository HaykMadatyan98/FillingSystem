import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Param,
  Post,
} from '@nestjs/common';
import { ApiParam, ApiTags } from '@nestjs/swagger';
import { GovernmentService } from './government.service';

@Controller('government')
@ApiTags('government')
export class GovernmentController {
  constructor(private readonly governmentService: GovernmentService) {}

  @Post('send-companies')
  @HttpCode(HttpStatus.OK)
  async handleSendDataToGovernment(@Body() companies: string[]): Promise<void> {
    await this.governmentService.sendCompanyDataToGovernment(companies);
  }

  @Post('get-processId')
  @HttpCode(HttpStatus.OK)
  async handleGetProcessId(@Body() companyId: string): Promise<void> {
    await this.governmentService.getProcessId(companyId);
  }

  @Post('generate-xml/:companyId')
  @ApiParam({
    name: 'companyId',
    required: true,
  })
  async generateXMLForDev(@Param('companyId') companyId: string) {
    return this.governmentService.generateXml(companyId);
  }
}
