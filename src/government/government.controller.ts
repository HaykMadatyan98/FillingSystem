import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  Res,
} from '@nestjs/common';
import { ApiParam, ApiTags } from '@nestjs/swagger';
import * as path from 'node:path';
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

  @Get('checkStatus/:companyId')
  @ApiParam({
    name: 'companyId',
    required: true,
  })
  async checkCompanyStatus(@Param('companyId') companyId: string) {
    return this.governmentService.checkGovernmentStatus(companyId);
  }

  @Get('getSchema')
  async getXMLSchema(@Res() res: any) {
    const routeOfFile = path.join(
      path.resolve(),
      'src/government/files/11-11schema.xml',
    );
    return res.sendFile(routeOfFile);
  }

  @Get('getNamespace')
  async getXMLNamespace(@Res() res: any) {
    const routeOfFile = path.join(
      path.resolve(),
      'src/government/files/11-12namespaces.xml',
    );
    return res.sendFile(routeOfFile);
  }
}
