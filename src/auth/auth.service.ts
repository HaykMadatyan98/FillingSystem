import {
  authResponseMsgs,
  ExpirationTimes,
  ILoginResponse,
  IResponseMessage,
} from '@/auth/constants';
import { MailService } from '@/mail/mail.service';
import { UserService } from '@/user/user.service';
import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';
import * as jwt from 'jsonwebtoken';
import * as moment from 'moment';
import { LoginAdminDto } from './dtos/auth.dto';

@Injectable()
export class AuthService {
  private accessSecretKey: string;
  private refreshSecretKey: string;

  constructor(
    private readonly mailerService: MailService,
    private readonly userService: UserService,
    private readonly configService: ConfigService,
  ) {
    this.accessSecretKey = this.configService.get<string>('TOKEN.accessSecret');
    this.refreshSecretKey = this.configService.get<string>(
      'TOKEN.refreshSecret',
    );
  }

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

    return { message: authResponseMsgs.successfulLogout };
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
      console.log(err);
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

  async signInAdmin(email: string, userId: string) {
    const user = await this.userService.getUserByEmail(email);

    if (!user) {
      throw new NotFoundException(authResponseMsgs.userNotFound);
    }

    const { accessToken, refreshToken } = await this.generateNewToken(
      userId,
      email,
      'admin',
    );

    return {
      message: authResponseMsgs.successfulLogin,
      accessToken,
      refreshToken,
      userId,
    };
  }

  async validateUser(loginAdminDto: LoginAdminDto): Promise<any> {
    const user = await this.userService.getUserByEmail(loginAdminDto.email);
    if (user && (await bcrypt.compare(loginAdminDto.password, user.password))) {
      return { email: loginAdminDto.email, userId: user['id'] };
    }
    return null;
  }
}
