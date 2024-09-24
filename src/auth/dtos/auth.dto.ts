import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsArray, IsEmail, IsNumber, ValidateNested } from 'class-validator';

export class SendEmailDto {
  @ApiProperty({ type: String, required: true })
  @IsEmail()
  email: string;
}

export class SendEmailBodyDto {
  @ApiProperty({
    type: [SendEmailDto],
    description: 'Array of emails',
    required: true,
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => SendEmailDto)
  emails: SendEmailDto[];
}

export class LoginDto {
  @ApiProperty({ type: String, required: true })
  @IsEmail()
  email: string;

  @ApiProperty({ type: Number, required: true })
  @IsNumber()
  oneTimePass: number;
}
