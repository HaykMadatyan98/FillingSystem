import { ILoginResponse } from './constants/auth-responses';
import {
  Controller,
  Post,
  Body,
  Get,
  Param,
  UseGuards,
  Req,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto, SendEmailDto } from './dtos/auth.dto';
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
import { authResponseMsgs } from './constants';
import { IResponseMessage } from '@/user/constants';
import {
  LoginResponseDto,
  RefreshTokenResponseDto,
  ResponseMessageDto,
} from './dtos/response.dto';
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
  @ApiNotFoundResponse({ description: authResponseMsgs.wrongSendedEmailOrPass })
  @ApiUnauthorizedResponse({ description: authResponseMsgs.codeWasExpired })
  async login(@Body() body: LoginDto): Promise<ILoginResponse> {
    return this.authService.login(body.email, body.oneTimePass);
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
    console.log(req.user);
    return this.authService.refreshTokens(
      req.user['userId'] as string,
      req.user['refreshToken'],
    );
  }

  @Get('logout/:id')
  @ApiOkResponse({
    type: ResponseMessageDto,
    description: authResponseMsgs.successfullLogout,
  })
  @ApiNotFoundResponse({ description: authResponseMsgs.userNotFound })
  @ApiOperation({ summary: 'Sign out by entered user id' })
  async logout(@Param('userId') userId: string): Promise<IResponseMessage> {
    return this.authService.logout(userId);
  }
}
