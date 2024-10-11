import { IResponseMessage } from '@/user/constants';
import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiBody,
  ApiForbiddenResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { authResponseMsgs } from './constants';
import { ILoginResponse } from './constants/auth-responses';
import { LoginAdminDto, LoginDto, SendEmailDto } from './dtos/auth.dto';
import {
  LoginResponseDto,
  RefreshTokenResponseDto,
  ResponseMessageDto,
} from './dtos/response.dto';
import { LocalAuthGuard } from './guards/local-auth.guard';
import { RefreshTokenGuard } from './guards/refresh-token.guard';
import { RequestWithUser } from './interfaces/request.interface';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('email')
  @ApiBody({ type: SendEmailDto })
  @ApiOkResponse({
    description: authResponseMsgs.otpWasSent,
  })
  @ApiNotFoundResponse({
    description: authResponseMsgs.userNotFound,
  })
  @ApiOperation({ summary: 'Send Validation Email to User' })
  async sendValidateEmail(
    @Body() body: SendEmailDto,
  ): Promise<IResponseMessage> {
    return this.authService.sendValidationEmail(body.email);
  }

  @Post('login')
  @ApiBody({ type: LoginDto })
  @ApiOkResponse({
    description: authResponseMsgs.successfulLogin,
    type: LoginResponseDto,
  })
  @ApiOperation({ summary: 'Sign in by one time pass' })
  @ApiNotFoundResponse({ description: authResponseMsgs.wrongSentEmailOrPass })
  @ApiUnauthorizedResponse({ description: authResponseMsgs.codeWasExpired })
  async login(@Body() body: LoginDto): Promise<ILoginResponse> {
    return this.authService.login(body.email, body.oneTimePass);
  }

  @Post('login/admin')
  @ApiBody({ type: LoginAdminDto })
  @UseGuards(LocalAuthGuard)
  @ApiNotFoundResponse({ description: authResponseMsgs.userNotFound })
  @ApiBadRequestResponse({
    description: authResponseMsgs.wrongSentEmailOrPass,
  })
  @ApiOkResponse({
    description: authResponseMsgs.successfulLogin,
    type: LoginResponseDto,
  })
  async signInAdmin(@Body() body: LoginAdminDto) {
    return this.authService.signInAdmin(body.email, body.password);
  }

  @Get('refresh')
  @ApiOperation({ summary: 'Refresh access and refresh tokens' })
  @ApiBearerAuth()
  @UseGuards(RefreshTokenGuard)
  @ApiOkResponse({
    description: authResponseMsgs.tokenRefreshed,
    type: RefreshTokenResponseDto,
  })
  @ApiForbiddenResponse({
    description: authResponseMsgs.expiredRefreshToken,
  })
  @ApiUnauthorizedResponse({
    description: authResponseMsgs.expiredRefreshToken,
  })
  @ApiBadRequestResponse({
    description: authResponseMsgs.tokenPayloadMissingFields,
  })
  async refreshTokens(@Req() req: RequestWithUser) {
    return this.authService.refreshTokens(
      req.user['userId'] as string,
      req.user['refreshToken'],
    );
  }

  @Get('logout/:id')
  @ApiOkResponse({
    type: ResponseMessageDto,
    description: authResponseMsgs.successfulLogout,
  })
  @ApiNotFoundResponse({ description: authResponseMsgs.userNotFound })
  @ApiOperation({ summary: 'Sign out by entered user id' })
  async logout(@Param('userId') userId: string): Promise<IResponseMessage> {
    return this.authService.logout(userId);
  }
}
