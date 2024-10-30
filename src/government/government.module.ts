import { Module, forwardRef } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { GovernmentController } from './government.controller';
import { GovernmentService } from './government.service';
import { CompanyModule } from '@/company/company.module';

@Module({
  imports: [ConfigModule.forRoot(), forwardRef(() => CompanyModule)],
  providers: [GovernmentService],
  exports: [GovernmentService],
  controllers: [GovernmentController],
})
export class GovernmentModule {}
