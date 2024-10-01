import { ApiProperty } from '@nestjs/swagger';
import { authResponseMsgs } from '../constants';

export class LoginResponseDto {
  @ApiProperty({ example: authResponseMsgs.successfulLogin })
  message: string;

  @ApiProperty({ example: '66f4f33f6538526f9f929d4f' })
  userId: string;

  @ApiProperty({ example: 'eyJhbGciOiJIUzI1NiIsInR5...' })
  accessToken: string;

  @ApiProperty({ example: 'eyJhbGciOiJIUzI1NiIsInR5...refresh' })
  refreshToken: string;
}

export class ResponseMessageDto {
  @ApiProperty()
  message: string;
}

export class RefreshTokenResponseDto {
  @ApiProperty({ description: 'New access token' })
  accessToken: string;

  @ApiProperty({ description: 'New refresh token' })
  refreshToken: string;

  @ApiProperty({
    description: 'Message indicating the result of the refresh process',
  })
  message: string;
}
