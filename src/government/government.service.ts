import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class GovernmentService {
  private apiKey;
  constructor(private readonly configService: ConfigService) {
    this.apiKey = this.configService.get<string>('GOVERNMENT_API_KEY');
  }
}
