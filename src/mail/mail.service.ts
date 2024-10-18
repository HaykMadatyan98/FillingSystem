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

  constructor(private readonly configService: ConfigService) {
    SendGrid.setApiKey(configService.get<string>('SENDGRID.apiKey'));
    this.emailFrom = configService.get<string>('SENDGRID.emailFrom');
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

      await SendGrid.send(mail);
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

  async sendInvitationEmailToFormFillers(data: IUserInvitationEmail[]) {
    const emailPromises = data.map(
      async ({ email, companyName, fullName, isNewCompany }) => {
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
      },
    );
    await Promise.all(emailPromises);
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
    companies: { name: string; user: { name: string; email: string } }[],
  ): Promise<void> {
    try {
      const templatePath = path.join(
        path.resolve(),
        '/src/mail/templates/oneTimePass.hbs',
      );

      const template = fs.readFileSync(templatePath, 'utf-8');
      const compiledFile = Handlebars.compile(template);

      await Promise.all(
        companies.map(async (company) => {
          const htmlContent = compiledFile({
            userName: company.user.name,
            companyName: company.name,
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
    companies: { name: string; user: { name: string; email: string } }[],
    adminEmail: string,
  ) {
    console.log(companies, adminEmail);
    // implement in future
  }
}
