import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule } from '@nestjs/config';
import { UserModule } from './user/user.module';
import { CompanyFormModule } from './company-form/company-form.module';
import { ParticipantFormModule } from './participant-form/participant-form.module';
import { AuthModule } from './auth/auth.module';
// import { SeedService } from './seed/seed.service';
// import { CsvController } from './csv/import-csv.controller';
// import { CsvService } from './csv/import-csv.service';
// import { CompanyController } from './company/company.controller';
import { CompanyModule } from './company/company.module';
import { MailService } from './mail/mail.service';
import { MailModule } from './mail/mail.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: '.env',
    }),
    MongooseModule.forRoot(process.env.MONGODB_URL),
    UserModule,
    CompanyFormModule,
    ParticipantFormModule,
    AuthModule,
    CompanyModule,
    MailModule,
  ],
  providers: [MailService],
  controllers: [],
  // controllers: [CsvController, CompanyController],
  // providers: [SeedService, CsvService, MailService],
})
export class AppModule {
  // constructor(private readonly seedService: SeedService) {}
}
