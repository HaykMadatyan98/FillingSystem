import {
  Controller,
  Post,
  Get,
  Body,
  Param,
  UseGuards,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBody,
  ApiParam,
  ApiBearerAuth,
  ApiForbiddenResponse,
  ApiOkResponse,
} from '@nestjs/swagger';
import { UserService } from './user.service';
import { User } from './schema/user.schema';
import { Roles } from '@/auth/decorators/roles.decorator';
import { authResponseMsgs, Role } from '@/auth/constants';
import { RolesGuard } from '@/auth/guards/role.guard';
import { AccessTokenGuard } from '@/auth/guards/access-token.guard';

@ApiTags('users')
@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get()
  @Roles(Role.Admin)
  @UseGuards(RolesGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get all users' })
  @ApiOkResponse({ description: 'Returns all users.' })
  @ApiForbiddenResponse({ description: authResponseMsgs.accessDenied })
  async findAll(): Promise<User[]> {
    return this.userService.getAllUsers();
  }

  @Get(':userId')
  @ApiBearerAuth()
  @UseGuards(AccessTokenGuard)
  @ApiOperation({ summary: 'Get a user by ID' })
  @ApiOkResponse({ description: 'Returns a user.' })
  async findOne(@Param('userId') userId: string): Promise<User> {
    return this.userService.getUserById(userId);
  }

  @Post('company/:userId')
  @ApiOperation({ summary: 'Add company(or companies) to user' })
  @ApiResponse({
    status: 200,
    description: 'successfully added',
  })
  @ApiParam({
    name: 'userId',
    description: 'The unique identifier (ID) for the user',
    type: String,
  })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        companyIds: {
          type: 'array',
          items: {
            type: 'string',
            description: 'The unique identifier (ID) for the entity',
          },
          description: 'Array of unique identifiers for companies',
        },
      },
      required: ['companyIds'],
    },
  })
  @ApiBearerAuth()
  @Roles(Role.Admin)
  @UseGuards(RolesGuard)
  @ApiForbiddenResponse({ description: authResponseMsgs.accessDenied })
  async addCompaniesToUser(
    @Param('userId') userId: string,
    @Body() body: { companyIds: string[] },
  ) {
    await this.userService.addCompaniesToUser(userId, body.companyIds);
  }

  @Get('company/:userId')
  @ApiParam({
    name: 'userId',
    description: 'The unique identifier (ID) for the user',
    type: String,
  })
  @ApiBearerAuth()
  @UseGuards(AccessTokenGuard)
  @ApiOperation({ summary: 'Get user company data by userId' })
  async getUserCompanyData(@Param('userId') userId: string) {
    return this.userService.getUserCompanyData(userId);
  }
}
