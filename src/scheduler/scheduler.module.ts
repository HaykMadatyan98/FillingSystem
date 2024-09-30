import { Module } from '@nestjs/common';
import { SchedulerService } from './scheduler.service';
import { CompanyModule } from '@/company/company.module';
import { UserModule } from '@/user/user.module';

@Module({
  imports: [CompanyModule, UserModule],
  providers: [SchedulerService],
  exports: [SchedulerService],
})
export class SchedulerModule {}
