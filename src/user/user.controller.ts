import {
  Controller,
  Post,
  Get,
  Put,
  Delete,
  Body,
  Param,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBody,
  ApiParam,
} from '@nestjs/swagger';
import { UserService } from './user.service';
import { User } from './schema/user.schema';
import { CreateUserDto } from './dtos/user.dto';

@ApiTags('users')
@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post()
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
  @ApiOperation({ summary: 'Get all users' })
  @ApiResponse({ status: 200, description: 'Returns all users.' })
  async findAll(): Promise<User[]> {
    return this.userService.getAllUsers();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a user by ID' })
  @ApiResponse({ status: 200, description: 'Returns a user.' })
  async findOne(@Param('id') id: string): Promise<User> {
    return this.userService.getUserById(id);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update a user' })
  @ApiResponse({
    status: 200,
    description: 'The user has been successfully updated.',
  })
  async update(
    @Param('id') id: string,
    @Body() updateUserDto: any,
  ): Promise<User> {
    return this.userService.update(id, updateUserDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a user' })
  @ApiResponse({
    status: 200,
    description: 'The user has been successfully deleted.',
  })
  async remove(@Param('id') id: string): Promise<void> {
    return this.userService.remove(id);
  }

  @Post('company/:id')
  @ApiOperation({ summary: 'add company(or companies) to user' })
  @ApiResponse({
    status: 200,
    description: 'successfully added',
  })
  @ApiParam({
    name: 'id',
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
  async addCompaniesToUser(
    @Param('id') userId: string,
    @Body() body: { companyIds: string[] },
  ) {
    await this.userService.addCompaniesToUser(userId, body.companyIds);
  }

  @Get('user/:id')
  @ApiParam({
    name: 'id',
    description: 'The unique identifier (ID) for the user',
    type: String,
  })
  @ApiOperation({ summary: 'get user company data' })
  async getUserCompanyData(@Param('id') userId: string) {
    return this.userService.getUserCompanyData(userId);
  }
}
