import { ApiProperty } from '@nestjs/swagger';
import { authResponseMsgs } from '../constants';

export class LoginResponseDto {
  @ApiProperty({ example: authResponseMsgs.successfulLogin.message })
  message: string;

  @ApiProperty({ example: '66f4f33f6538526f9f929d4f' })
  userId: string;

  @ApiProperty({ example: 'eyJhbGciOiJIUzI1NiIsInR5...' })
  accessToken: string;

  @ApiProperty({ example: 'eyJhbGciOiJIUzI1NiIsInR5...refresh' })
  refreshToken: string;
}

export class ValidateEmailResponseDto {
  @ApiProperty({ example: authResponseMsgs.otpWasSent.message })
  message: string;
}