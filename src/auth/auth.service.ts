import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import * as jwt from 'jsonwebtoken';
import { MailService } from '@/mail/mail.service';
import { UserService } from '@/user/user.service';
import * as moment from 'moment';
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

    return { message: authResponseMsgs.otpWasSent };
  }

  async login(email: string, oneTimePass: number): Promise<ILoginResponse> {
    const user = await this.userService.getUserByEmail(email);

    if (!user || user.oneTimePass !== oneTimePass) {
      throw new NotFoundException(authResponseMsgs.wrongSendedEmailOrPass);
    }

    if (moment(user.oneTimeExpiration).isBefore(moment())) {
      throw new UnauthorizedException(authResponseMsgs.codeWasExpired);
    }

    const { accessToken, refreshToken } = await this.generateNewToken(
      user['id'],
      user.email,
      user.role,
    );

    await this.userService.changeRefreshToken(user['id'], refreshToken);

    return {
      message: authResponseMsgs.successfulLogin,
      userId: user['id'],
      accessToken: accessToken,
      refreshToken: refreshToken,
    };
  }

  async logout(userId: string) {
    await this.userService.changeRefreshToken(userId, '');

    return { message: authResponseMsgs.successfullLogout };
  }

  async generateNewToken(userId: string, email: string, role: string) {
    const accessToken = jwt.sign(
      { userId, email, role },
      this.accessSecretKey,
      {
        expiresIn: ExpirationTimes.ACCESS_TOKEN,
      },
    );

    const refreshToken = jwt.sign(
      { userId, email, role },
      this.refreshSecretKey,
      {
        expiresIn: ExpirationTimes.REFRESH_TOKEN,
      },
    );

    return { refreshToken, accessToken };
  }

  async refreshTokens(userId: string, refToken: string) {
    const user = await this.userService.getUserById(userId as string);

    if (!user || !user.refreshToken) {
      throw new ForbiddenException(authResponseMsgs.accessDenied);
    }

    let decoded: IDecodedToken;

    try {
      decoded = jwt.verify(refToken, this.refreshSecretKey) as IDecodedToken;
    } catch (err) {
      throw new UnauthorizedException(authResponseMsgs.expiredRefreshToken);
    }

    if (!decoded.email || !decoded.role) {
      throw new BadRequestException(authResponseMsgs.tokenPayloadMissingFields);
    }

    const { accessToken, refreshToken } = await this.generateNewToken(
      userId,
      decoded.email,
      decoded.role,
    );

    await this.userService.changeRefreshToken(userId, refreshToken);

    return {
      message: authResponseMsgs.tokenRefreshed,
      accessToken,
      refreshToken,
    };
  }
}
