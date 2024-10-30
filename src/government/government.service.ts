import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class GovernmentService {
  clientSecret: string;
  clientId: string;

  constructor(private readonly configService: ConfigService) {
    this.clientSecret = this.configService.get<string>(
      'GOVERNMENT.clientSecret',
    );
    this.clientId = this.configService.get<string>('GOVERNMENT.clientId');
  }

  async sentCompanyDataToGovernment() {
    console.log();
  }
}
