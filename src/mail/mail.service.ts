import Handlebars from 'handlebars';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as SendGrid from '@sendgrid/mail';
import * as fs from 'node:fs';
import * as path from 'node:path';
import { userVerificationTime } from '@/auth/constants';

@Injectable()
export class MailService {
  emailFrom: string;

  constructor(private readonly configService: ConfigService) {
    SendGrid.setApiKey(process.env.SENDGRID_API_KEY);
    this.emailFrom = process.env.SENDGRID_EMAIL_FROM;
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
      console.log(error);
      // write error exception and add in future the part where information will be saved in db
    }
  }

  async sendEmailToParticipants(emails) {
    const emailPromises = emails.map(async ({ email }) => {
      try {
        const templatePath = path.join(
          path.resolve(),
          '/src/mail/templates/participantEmail.hbs', // path to participant Email hbs file
        );

        const template = fs.readFileSync(templatePath, 'utf-8');
        const compiledFile = Handlebars.compile(template);
        const htmlContent = compiledFile({}); // the data which need to add in handlebars file

        const mail: SendGrid.MailDataRequired = {
          to: email,
          from: this.emailFrom,
          subject: 'Participant Mails', // change
          html: htmlContent,
        };

        await SendGrid.send(mail);
      } catch (error) {
        console.log(error);
        // catch error and save data into db
      }
      await Promise.all(emailPromises);
    });
  }
}
