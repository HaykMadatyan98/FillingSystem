import { userVerificationTime } from '@/auth/constants';
import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectModel } from '@nestjs/mongoose';
import * as SendGrid from '@sendgrid/mail';
import Handlebars from 'handlebars';
import { Model } from 'mongoose';
import * as fs from 'node:fs';
import * as path from 'node:path';
import { MessageTypeEnum, SendGridEventTypeEnum } from './constants';
import { SendGridWebhookDto } from './dtos/mail.dto';
import { IUserInvitationEmail } from './interfaces/mail.interface';
import { Mail, MailDocument } from './schemas/mail.schema';

@Injectable()
export class MailService {
  emailFrom: string;
  adminFullName: string;
  adminEmail: string;

  constructor(
    private readonly configService: ConfigService,
    @InjectModel(Mail.name) private mailModel: Model<MailDocument>,
  ) {
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

      const sendgridData = await SendGrid.send(mail);
      const messageId = sendgridData[0]?.headers['x-message-id'];
      await this.createEmailData(MessageTypeEnum.OTP, messageId, email);
    } catch (error) {
      await this.createErrorData(MessageTypeEnum.OTP, email, error.message);
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

      const sendgridData = await SendGrid.send(mail);
      const messageId = sendgridData[0]?.headers['x-message-id'];
      await this.createEmailData(MessageTypeEnum.OTP, messageId, email);
    } catch (error) {
      await this.createErrorData(MessageTypeEnum.OTP, email, error.message);
      throw new HttpException(
        {
          status: error.status || HttpStatus.INTERNAL_SERVER_ERROR,
          error: error.message || 'An unexpected error occurred',
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
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

      const sendgridData = await SendGrid.send(mail);
      const messageId = sendgridData[0]?.headers['x-message-id'];
      await this.createEmailData(MessageTypeEnum.OTP, messageId, email);
    } catch (error) {
      await this.createErrorData(MessageTypeEnum.OTP, email, error.message);
      throw new HttpException(
        {
          status: error.status || HttpStatus.INTERNAL_SERVER_ERROR,
          error: error.message || 'An unexpected error occurred',
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async alertUserOfExpiringCompany(
    companies: {
      name: string;
      user: { firstName: string; lastName: string; email: string };
    }[],
    remainingDay: number,
  ): Promise<void> {
    const templatePath = path.join(
      path.resolve(),
      '/src/mail/templates/warning-notification.hbs',
    );

    const template = fs.readFileSync(templatePath, 'utf-8');
    const compiledFile = Handlebars.compile(template);

    await Promise.all(
      companies.map(async (company) => {
        try {
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

          const sendgridData = await SendGrid.send(mail);
          const messageId = sendgridData[0]?.headers['x-message-id'];
          await this.createEmailData(
            MessageTypeEnum.OTP,
            messageId,
            company.user.email,
          );
        } catch (error) {
          await this.createErrorData(
            MessageTypeEnum.OTP,
            company.user.email,
            error.message,
          );
          throw new HttpException(
            {
              status: error.status || HttpStatus.INTERNAL_SERVER_ERROR,
              error: error.message || 'An unexpected error occurred',
            },
            HttpStatus.INTERNAL_SERVER_ERROR,
          );
        }
      }),
    );
  }

  async notifyAdminAboutExpiredCompanies(
    companies: { user: { name: string; email: string } }[],
  ) {
    console.log(companies);
    // implement in future
  }

  async createEmailData(
    messageType: MessageTypeEnum,
    message_id: string,
    email: string,
  ) {
    const messageData = {
      messages: [
        {
          messageType,
          sendTime: new Date(),
          status: SendGridEventTypeEnum.PENDING,
          message_id,
        },
      ],
    };

    await this.upsertEmailData(email, messageData);
  }

  async updateEmailStatus(events: SendGridWebhookDto[]): Promise<void> {
    for (const event of events) {
      const { message_id, event: status, email, reason } = event;

      await this.mailModel.updateOne(
        { email, 'messages.message_id': message_id },
        {
          $set: {
            'messages.$.status':
              SendGridEventTypeEnum[status.toUpperCase()] ||
              SendGridEventTypeEnum.UNKNOWN,
            'messages.$.reason': reason || null,
          },
        },
      );
    }
  }

  async createErrorData(
    messageType: MessageTypeEnum,
    email: string,
    reason?: string,
  ) {
    const errorData = {
      errors: [
        {
          messageType,
          receiveTime: new Date(),
          reason,
        },
      ],
    };

    await this.upsertEmailData(email, errorData);
  }

  private async upsertEmailData(
    email: string,
    data: { messages?: any[]; errors?: any[] },
  ): Promise<void> {
    const message = await this.mailModel.findOne({ email });

    if (!message) {
      const newMessage = new this.mailModel({ email, ...data });
      await newMessage.save();
    } else {
      if (data.messages) {
        message.messages.push(...data.messages);
      }
      if (data.errors) {
        message.errorMessages.push(...data.errors);
      }
      await message.save();
    }
  }
}
