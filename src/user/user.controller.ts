import {
  Controller,
  Post,
  Get,
  Put,
  Delete,
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
} from '@nestjs/swagger';
import { UserService } from './user.service';
import { User } from './schema/user.schema';
import { CreateUserDto } from './dtos/user.dto';
import { Roles } from '@/auth/decorators/roles.decorator';
import { Role } from '@/auth/constants';
import { RolesGuard } from '@/auth/guards/role.guard';
import { AccessTokenGuard } from '@/auth/guards/access-token.guard';

@ApiTags('users')
@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post()
  @Roles(Role.Admin)
  @UseGuards(RolesGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create a user' })
  @ApiResponse({
    status: 201,
    description: 'The user has been successfully created.',
  })
  async create(
    @Body() createUserDto: CreateUserDto,
  ): Promise<{ message: string }> {
    return this.userService.create(createUserDto);
  }

  @Get()
  @Roles(Role.Admin)
  @UseGuards(RolesGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get all users' })
  @ApiResponse({ status: 200, description: 'Returns all users.' })
  async findAll(): Promise<User[]> {
    return this.userService.getAllUsers();
  }

  @Get(':userId')
  @ApiBearerAuth()
  @UseGuards(AccessTokenGuard)
  @ApiOperation({ summary: 'Get a user by ID' })
  @ApiResponse({ status: 200, description: 'Returns a user.' })
  async findOne(@Param('userId') userId: string): Promise<User> {
    return this.userService.getUserById(userId);
  }

  @Put(':userId')
  @ApiOperation({ summary: 'Update a user' })
  @ApiBearerAuth()
  @ApiResponse({
    status: 200,
    description: 'The user has been successfully updated.',
  })
  @Roles(Role.Admin)
  @UseGuards(RolesGuard)
  async update(
    @Param('userId') userId: string,
    @Body() updateUserDto: any,
  ): Promise<User> {
    return this.userService.update(userId, updateUserDto);
  }

  @Delete(':userId')
  @ApiOperation({ summary: 'Delete a user' })
  @ApiResponse({
    status: 200,
    description: 'The user has been successfully deleted.',
  })
  @ApiBearerAuth()
  @Roles(Role.Admin)
  @UseGuards(RolesGuard)
  async remove(@Param('userId') userId: string): Promise<void> {
    return this.userService.remove(userId);
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
