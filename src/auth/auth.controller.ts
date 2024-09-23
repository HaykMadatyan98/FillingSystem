import { Controller, Post, Body } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto, SendEmailDto } from './dtos/auth.dto';
import {
  ApiBody,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiTags,
} from '@nestjs/swagger';
import { ErrorMessages, ResponseMessages } from '@/constants';
@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('email')
  @ApiBody({ type: SendEmailDto })
  @ApiOkResponse({ description: ResponseMessages.otpWasSent.message })
  @ApiNotFoundResponse({
    description: ErrorMessages.UserWithEnteredEmailNotFound.message,
  })
  async sendValidateEmail(@Body() body: SendEmailDto) {
    return this.authService.sendValidationEmail(body);
  }

  @Post('login')
  @ApiBody({ type: LoginDto })
  @ApiOkResponse({ description: ResponseMessages.successfulLogin.message })
  async login(@Body() body: LoginDto): Promise<any> {
    return this.authService.login(body.email, body.oneTimePass);
  }
}
