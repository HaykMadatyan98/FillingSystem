import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class GovernmentService {
  private readonly apiKey = configService.get<string>('GOVERNMENT_API_KEY');
}
