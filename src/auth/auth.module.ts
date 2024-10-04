import { forwardRef, Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { User, UserSchema } from '../user/schema/user.schema';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { MailModule } from '@/mail/mail.module';
import { UserModule } from '@/user/user.module';
import { AccessTokenStrategy } from './strategies/access-token.strategy';
import { RefreshTokenStrategy } from './strategies/refresh-token.strategy';
import { JwtModule } from '@nestjs/jwt';
import { ExpirationTimes } from './constants';
import { UserService } from '@/user/user.service';
import { RolesGuard } from './guards/role.guard';
import { CompanyModule } from '@/company/company.module';
import { CompanyFormModule } from '@/company-form/company-form.module';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]),
    JwtModule.register({
      secret: process.env.JWT_ACCESS_SECRET,
      signOptions: { expiresIn: ExpirationTimes.ACCESS_TOKEN },
    }),
    MailModule,
    forwardRef(() => UserModule),
    forwardRef(() => CompanyModule),
  ],
  providers: [
    AuthService,
    AccessTokenStrategy,
    RefreshTokenStrategy,
    UserService,
    RolesGuard,
  ],
  controllers: [AuthController],
  exports: [JwtModule, AuthService],
})
export class AuthModule {}
