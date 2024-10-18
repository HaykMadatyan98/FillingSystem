import { Module } from '@nestjs/common';
import { GovernmentService } from './government.service';

@Module({
  providers: [GovernmentService],
})
export class GovernmentModule {}
