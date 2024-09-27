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
  ApiBearerAuth,
  ApiBody,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { authResponseMsgs } from './constants';
import { errorMessages } from '@/exceptions/constants/error-messages';
import { IResponseMessage } from '@/user/constants';
import {
  LoginResponseDto,
  RefreshTokenResponseDto,
  ValidateEmailResponseDto,
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
    description: authResponseMsgs.otpWasSent.message,
    type: ValidateEmailResponseDto,
  })
  @ApiNotFoundResponse({
    description: errorMessages.wrongSendedEmailOrPass.message,
  })
  async sendValidateEmail(
    @Body() body: SendEmailDto,
  ): Promise<IResponseMessage> {
    return this.authService.sendValidationEmail(body.email);
  }

  @Post('login')
  @ApiBody({ type: LoginDto })
  @ApiOkResponse({
    description: authResponseMsgs.successfulLogin.message,
    type: LoginResponseDto,
  })
  async login(@Body() body: LoginDto): Promise<ILoginResponse> {
    return this.authService.login(body.email, body.oneTimePass);
  }

  @Post('refresh')
  @ApiOperation({ summary: 'Refresh access and refresh tokens' })
  @ApiBearerAuth()
  @UseGuards(RefreshTokenGuard)
  @ApiResponse({
    status: 200,
    description: 'Tokens refreshed successfully',
    type: RefreshTokenResponseDto,
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden, invalid or expired refresh token',
  })
  async refreshTokens(@Req() req: RequestWithUser) {
    const userId = req.user['sub'];
    const refreshToken = req.user['refreshToken'];

    return this.authService.refreshTokens(userId, refreshToken);
  }

  @Get('logout/:id')
  @ApiOkResponse({
    description: authResponseMsgs.successfulLogin.message,
    type: LoginResponseDto,
  })
  async logout(@Param('userId') userId: string): Promise<void> {
    return this.authService.logout(userId);
  }
}
