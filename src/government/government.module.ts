import { Module, forwardRef } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { GovernmentController } from './government.controller';
import { GovernmentService } from './government.service';
import { CompanyModule } from '@/company/company.module';
import { HttpModule } from '@nestjs/axios';

@Module({
  imports: [
    ConfigModule.forRoot(),
    forwardRef(() => CompanyModule),
    HttpModule,
  ],
  providers: [GovernmentService],
  exports: [GovernmentService],
  controllers: [GovernmentController],
})
export class GovernmentModule {}
