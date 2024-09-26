import { Injectable, NotFoundException } from '@nestjs/common';
import * as jwt from 'jsonwebtoken';
import { MailService } from '@/mail/mail.service';
import { UserService } from '@/user/user.service';
import moment from 'moment';
import { errorMessages } from '@/exceptions/constants/error-messages';
import {
  authResponseMsgs,
  IResponseMessage,
  ExpirationTimes,
  ILoginResponse,
} from '@/auth/constants';

@Injectable()
export class AuthService {
  private readonly accessSecretKey = process.env.JWT_ACCESS_SECRET;
  private readonly refreshSecretKey = process.env.JWT_REFRESH_SECRET;

  constructor(
    private mailerService: MailService,
    private userService: UserService,
  ) {}

  async sendValidationEmail(email: string): Promise<IResponseMessage> {
    const oneTimePass = Math.floor(100000 + Math.random() * 900000);
    await this.userService.changeUserOtp(email, oneTimePass);
    await this.mailerService.sendOTPtoEmail(oneTimePass, email);

    return authResponseMsgs.otpWasSent;
  }

  // watch again
  async login(email: string, oneTimePass: number): Promise<ILoginResponse> {
    const user = await this.userService.getUserByEmail(email);

    if (
      !user ||
      user.oneTimePass !== oneTimePass ||
      moment(user.oneTimeExpiration).isBefore(moment())
    ) {
      throw new NotFoundException({ ...errorMessages.WrongSendedEmailOrPass });
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

    return {
      message: authResponseMsgs.successfulLogin.message,
      userId: user['id'],
      accessToken: accessToken,
      refreshToken: refreshToken,
    };
  }
}
