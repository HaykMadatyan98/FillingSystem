import { Body, Controller, HttpCode, HttpStatus, Post } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { GovernmentService } from './government.service';

@Controller('government')
@ApiTags('government')
export class GovernmentController {
  constructor(private readonly governmentService: GovernmentService) {}
  @Post('send-companies')
  @HttpCode(HttpStatus.OK)
  async handleSendGridWebhook(@Body() companies: string[]): Promise<void> {
    await this.governmentService.sendCompanyDataToGovernment(companies);
  }
}
