import { forwardRef, Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { CompanyForm, CompanyFormSchema } from './schemas/company-form.schema';
import { CompanyFormService } from './company-form.service';
import { CompanyFormController } from './company-form.controller';
import { CompanyModule } from '@/company/company.module';
@Module({
  imports: [
    forwardRef(() => CompanyModule),
    MongooseModule.forFeature([
      { name: CompanyForm.name, schema: CompanyFormSchema },
    ]),
  ],
  providers: [CompanyFormService],
  controllers: [CompanyFormController],
  exports: [CompanyFormService],
})
export class CompanyFormModule {}
