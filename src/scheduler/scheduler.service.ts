import { CompanyService } from '@/company/company.service';
import { MailService } from '@/mail/mail.service';
import { Injectable } from '@nestjs/common';
// import { Cron } from '@nestjs/schedule';

@Injectable()
export class SchedulerService {
  constructor(
    private readonly companyService: CompanyService,
    private readonly mailService: MailService,
  ) {}

  // @Cron('0 0 * * *')
  async handleCron() {
    const [
      companiesWithSevenDayExpTime,
      companiesWithOneDayExpTime,
      companiesWhichExpired,
    ] = await Promise.all([
      this.companyService.findExpiringCompanies(7),
      this.companyService.findExpiringCompanies(1),
      this.companyService.findExpiringCompanies(),
    ]);

    if (companiesWithOneDayExpTime.length) {
      await this.mailService.alertUserOfExpiringCompany(
        companiesWithOneDayExpTime as any,
      );
    } else if (companiesWithSevenDayExpTime.length) {
      await this.mailService.alertUserOfExpiringCompany(
        companiesWithSevenDayExpTime as any,
      );
    } else if (companiesWhichExpired.length) {
      // send email to admin
      await this.mailService.notifyAdminAboutExpiredCompanies(
        companiesWhichExpired as any,
        'admin@Email',
      );
    }
  }
}
