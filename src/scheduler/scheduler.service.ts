import { CompanyService } from '@/company/company.service';
import { UserService } from '@/user/user.service';
import { Injectable } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';

@Injectable()
export class SchedulerService {
  constructor(
    private readonly companyService: CompanyService,
    private readonly userService: UserService,
  ) {}

  //   @Cron('0 0 * * *')
  //   async handleCron() {
  //     const companies = await this.companyService.getCompaniesByExpTime();
  //  after that get the users emails
  // send to all users mail by mailService

  //   }
}
