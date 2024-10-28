import { userVerificationTime } from '@/auth/constants';
import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as SendGrid from '@sendgrid/mail';
import Handlebars from 'handlebars';
import * as fs from 'node:fs';
import * as path from 'node:path';
import { IUserInvitationEmail } from './interfaces/mail.interface';

@Injectable()
export class MailService {
  emailFrom: string;
  adminFullName: string;
  adminEmail: string;

  constructor(private readonly configService: ConfigService) {
    SendGrid.setApiKey(configService.get<string>('SENDGRID.apiKey'));
    this.emailFrom = configService.get<string>('SENDGRID.emailFrom');
    this.adminFullName = `${this.configService.get<string>('ADMIN.firstName')} ${this.configService.get<string>(
      'ADMIN.lastName',
    )}`;
    this.adminEmail = this.configService.get<string>('ADMIN.email');
  }

  async sendOTPtoEmail(
    oneTimePass: number,
    email: string,
    userName: string,
  ): Promise<void> {
    try {
      const templatePath = path.join(
        path.resolve(),
        '/src/mail/templates/oneTimePass.hbs',
      );

      const verificationTime = `${userVerificationTime[0]} ${userVerificationTime[1]}`;
      const template = fs.readFileSync(templatePath, 'utf-8');
      const compiledFile = Handlebars.compile(template);
      const htmlContent = compiledFile({
        oneTimePass,
        verificationTime,
        userName,
      });

      const mail: SendGrid.MailDataRequired = {
        to: email,
        from: this.emailFrom,
        subject: 'Email Confirmation',
        html: htmlContent,
      };

      const sendgirdData = await SendGrid.send(mail);
      console.log(sendgirdData);
    } catch (error) {
      throw new HttpException(
        {
          status: error.status || HttpStatus.INTERNAL_SERVER_ERROR,
          error: error.message || 'An unexpected error occurred',
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async sendInvitationEmailToFormFiller(data: IUserInvitationEmail) {
    const { email, companyName, fullName, isNewCompany } = data;
    if (!email) {
      return;
    }

    try {
      const templatePath = path.join(
        path.resolve(),
        `/src/mail/templates/${isNewCompany ? 'invitation' : 'change-notification'}.hbs`,
      );

      const template = fs.readFileSync(templatePath, 'utf-8');
      const compiledFile = Handlebars.compile(template);
      const htmlContent = compiledFile({ companyName, fullName });
      const mail: SendGrid.MailDataRequired = {
        to: email,
        from: this.emailFrom,
        subject: 'Mail for BOIR Filler',
        html: htmlContent,
      };

      await SendGrid.send(mail);
    } catch (error) {
      console.log(error);
      throw new HttpException(
        {
          status: error.status || HttpStatus.INTERNAL_SERVER_ERROR,
          error: error.message || 'An unexpected error occurred',
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
      // catch error and save data into db
    }
  }

  async sendInvitationEmail(email: string, userName: string): Promise<void> {
    try {
      const templatePath = path.join(
        path.resolve(),
        '/src/mail/templates/oneTimePass.hbs',
      );

      const template = fs.readFileSync(templatePath, 'utf-8');
      const compiledFile = Handlebars.compile(template);
      const htmlContent = compiledFile({
        userName,
      });

      const mail: SendGrid.MailDataRequired = {
        to: email,
        from: this.emailFrom,
        subject: 'Invitation For BOIR',
        html: htmlContent,
      };

      await SendGrid.send(mail);
    } catch (error) {
      console.log(error);
      // write error exception and add in future the part where information will be saved in db
    }
  }

  async alertUserOfExpiringCompany(
    companies: {
      name: string;
      user: { firstName: string; lastName: string; email: string };
    }[],
    remainingDay: number,
  ): Promise<void> {
    try {
      console.log('in alert notification', companies, remainingDay);
      const templatePath = path.join(
        path.resolve(),
        '/src/mail/templates/warning-notification.hbs',
      );

      const template = fs.readFileSync(templatePath, 'utf-8');
      const compiledFile = Handlebars.compile(template);

      await Promise.all(
        companies.map(async (company) => {
          const htmlContent = compiledFile({
            fillerFullName: `${company.user.firstName} ${company.user.lastName}`,
            companyName: company.name,
            remainingDays: remainingDay,
          });

          const mail: SendGrid.MailDataRequired = {
            to: company.user.email,
            from: this.emailFrom,
            subject: 'Company expiration time is coming up',
            html: htmlContent,
          };

          await SendGrid.send(mail);
        }),
      );
    } catch (error) {
      console.log(error);
      // write error exception and add in future the part where information will be saved in db
    }
  }

  async notifyAdminAboutExpiredCompanies(
    companies: { user: { name: string; email: string } }[],
  ) {
    console.log(companies);
    // implement in future
  }
}
