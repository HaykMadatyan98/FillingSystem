import { Controller, Post, Body } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto, SendEmailDto } from './dtos/auth.dto';
import { ApiBody, ApiTags } from '@nestjs/swagger';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('email')
  @ApiBody({ type: SendEmailDto })
  async sendValidateEmail(@Body() body: SendEmailDto) {
    return this.authService.sendValidationEmail(body);
  }

  @Post('login')
  @ApiBody({ type: LoginDto })
  async login(@Body() body: LoginDto): Promise<any> {
    //change
    return this.authService.login(body.email, body.oneTimePass);
  }
}
