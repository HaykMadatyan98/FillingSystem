import { Injectable } from '@nestjs/common';
import * as jwt from 'jsonwebtoken';
import { MailService } from '@/mail/mail.service';
import { UserService } from '@/user/user.service';
import { ExpirationTimes } from '../constants';
import { SendEmailBodyDto } from './dtos/auth.dto';
import moment from 'moment';

@Injectable()
export class AuthService {
  private readonly accessSecretKey = process.env.JWT_ACCESS_SECRET;
  private readonly refreshSecretKey = process.env.JWT_REFRESH_SECRET;

  constructor(
    private mailerService: MailService,
    private userService: UserService,
  ) {}

  async sendValidationEmail(emails: SendEmailBodyDto) {
    const emailPromises = emails.emails.map(async ({ email }) => {
      if (!email) {
        throw new Error('Email is undefined');
      }

      const oneTimePass = Math.floor(100000 + Math.random() * 900000);
      await this.userService.changeUserOtp(email, oneTimePass);
      await this.mailerService.sendOTPtoEmail(oneTimePass, email);
    });

    await Promise.all(emailPromises);

    return { message: 'successfully sent' };
  }

  async login(email: string, oneTimePass: number): Promise<any> {
    const user = await this.userService.getUserByEmail(email);

    if (
      !user ||
      user.oneTimePass !== oneTimePass ||
      moment(user.oneTimeExpiration).isBefore(moment())
    ) {
      throw new Error('Invalid credentials');
    }

    const accessToken = jwt.sign(
      { email: user.email, role: user.role },
      this.accessSecretKey,
      {
        expiresIn: ExpirationTimes.ACCESS_TOKEN,
      },
    );

    const refreshToken = jwt.sign(
      { email: user.email, role: user.role },
      this.refreshSecretKey,
      {
        expiresIn: ExpirationTimes.REFRESH_TOKEN,
      },
    );
    // change
    return {
      message: 'successfully signed in',
      // id: user._id,
      accessToken: accessToken,
      refreshToken: refreshToken,
    };
  }
}
