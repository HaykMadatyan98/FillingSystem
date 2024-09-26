import { ILoginResponse } from './constants/auth-responses';
import { Controller, Post, Body } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto, SendEmailDto } from './dtos/auth.dto';
import {
  ApiBody,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiTags,
} from '@nestjs/swagger';
import { authResponseMsgs } from './constants';
import { errorMessages } from '@/exceptions/constants/error-messages';
import { IResponseMessage } from '@/user/constants';
import {
  LoginResponseDto,
  ValidateEmailResponseDto,
} from './dtos/response.dto';

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
}
