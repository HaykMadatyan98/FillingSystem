import Handlebars from 'handlebars';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as SendGrid from '@sendgrid/mail';
import * as fs from 'node:fs';
import * as path from 'node:path';

@Injectable()
export class MailService {
  emailFrom: string;

  constructor(private readonly configService: ConfigService) {
    SendGrid.setApiKey(process.env.SENDGRID_API_KEY);
    this.emailFrom = process.env.SENDGRID_EMAIL_FROM;
  }

  async sendOTPtoEmail(oneTimePass: number, email: string): Promise<void> {
    try {
      const templatePath = path.join(
        path.resolve(),
        '/src/mail/templates/oneTimePass.hbs',
      );

      const template = fs.readFileSync(templatePath, 'utf-8');
      const compiledFile = Handlebars.compile(template);
      const htmlContent = compiledFile({ oneTimePass });

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
}
