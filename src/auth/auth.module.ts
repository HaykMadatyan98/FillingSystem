import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { User, UserSchema } from '../user/schema/user.schema';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { MailModule } from '@/mail/mail.module';
import { UserModule } from '@/user/user.module';
import { AccessTokenStrategy } from './strategies/access-token.strategy';
import { RefreshTokenStrategy } from './strategies/refresh-token.strategy';
import { JwtModule } from '@nestjs/jwt';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]),
    JwtModule.register({}),
    MailModule,
    UserModule,
  ],
  providers: [AuthService, AccessTokenStrategy, RefreshTokenStrategy],
  controllers: [AuthController],
})
export class AuthModule {}
