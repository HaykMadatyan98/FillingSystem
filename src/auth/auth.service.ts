import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
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
    const userName = await this.userService.changeUserOtp(email, oneTimePass);
    await this.mailerService.sendOTPtoEmail(oneTimePass, email, userName);

    return authResponseMsgs.otpWasSent;
  }

  async login(email: string, oneTimePass: number): Promise<ILoginResponse> {
    const user = await this.userService.getUserByEmail(email);

    if (
      !user ||
      user.oneTimePass !== oneTimePass ||
      moment(user.oneTimeExpiration).isBefore(moment())
    ) {
      throw new NotFoundException({ ...errorMessages.WrongSendedEmailOrPass });
    }

    const { accessToken, refreshToken } = await this.generateNewToken(
      user.email,
      user.role,
    );

    await this.userService.changeRefreshToken(user['id'], refreshToken);

    return {
      message: authResponseMsgs.successfulLogin.message,
      userId: user['id'],
      accessToken: accessToken,
      refreshToken: refreshToken,
    };
  }

  async logout(userId: string) {
    await this.userService.changeRefreshToken(userId, '');
  }

  async generateNewToken(email: string, role: string) {
    const accessToken = jwt.sign({ email, role }, this.accessSecretKey, {
      expiresIn: ExpirationTimes.ACCESS_TOKEN,
    });

    const refreshToken = jwt.sign({ email, role }, this.refreshSecretKey, {
      expiresIn: ExpirationTimes.REFRESH_TOKEN,
    });

    return { refreshToken, accessToken };
  }

  async refreshTokens(userId: string, refToken: string) {
    const user = await this.userService.getUserById(userId);

    if (!user || !user.refreshToken) {
      throw new ForbiddenException('Access Denied');
    }

    let decoded: IDecodedToken;

    try {
      decoded = jwt.verify(refToken, this.refreshSecretKey) as IDecodedToken;
    } catch (err) {
      throw new ForbiddenException('Invalid or expired refresh token');
    }

    if (!decoded.email || !decoded.role) {
      throw new ForbiddenException('Token payload is missing required fields');
    }

    const { accessToken, refreshToken } = await this.generateNewToken(
      decoded.email,
      decoded.role,
    );

    await this.userService.changeRefreshToken(userId, refreshToken);

    return {
      message: 'Token updated successfully',
      accessToken,
      refreshToken,
    };
  }
}
