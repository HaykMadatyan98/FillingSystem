import { forwardRef, Module } from '@nestjs/common';
import { CompanyService } from './company.service';
import { CompanyController } from './company.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Company, CompanySchema } from './schemas/company.schema';
import { CompanyFormModule } from '@/company-form/company-form.module';
import { ParticipantFormModule } from '@/participant-form/participant-form.module';
import { AuthService } from '@/auth/auth.service';
import { MailModule } from '@/mail/mail.module';
import { UserModule } from '@/user/user.module';
import { AuthModule } from '@/auth/auth.module';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Company.name, schema: CompanySchema }]),
    forwardRef(() => CompanyFormModule),
    ParticipantFormModule,
    MailModule,
    forwardRef(() => UserModule),
    forwardRef(() => AuthModule),
  ],
  providers: [AuthService, CompanyService],
  controllers: [CompanyController],
  exports: [CompanyService],
})
export class CompanyModule {}
