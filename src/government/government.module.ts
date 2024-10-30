import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { GovernmentController } from './government.controller';
import { GovernmentService } from './government.service';

@Module({
  imports: [ConfigModule.forRoot()],
  providers: [GovernmentService],
  exports: [GovernmentService],
  controllers: [GovernmentController],
})
export class GovernmentModule {}
