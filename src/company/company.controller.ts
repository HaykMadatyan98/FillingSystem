import {
  Body,
  Controller,
  Delete,
  FileTypeValidator,
  Get,
  Param,
  ParseFilePipe,
  Post,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { CompanyService } from './company.service';
import { AccessTokenGuard } from '@/auth/guards/access-token.guard';
import { FileInterceptor } from '@nestjs/platform-express';
import {
  ApiBearerAuth,
  ApiBody,
  ApiConsumes,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { Roles } from '@/auth/decorators/roles.decorator';
import { Role } from '@/auth/constants';
import { RolesGuard } from '@/auth/guards/role.guard';

@ApiTags('company')
@Controller('company')
export class CompanyController {
  constructor(private readonly companyService: CompanyService) {}

  @Get()
  @Roles(Role.Admin)
  @UseGuards(RolesGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get all company data(Admin)' })
  async getAllCompanies() {
    return this.companyService.getAllCompanies();
  }

  @Get(':companyId')
  @UseGuards(AccessTokenGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get company by entered company Id' })
  async getCompanyById(@Param('companyId') companyId) {
    return this.getCompanyById(companyId);
  }

  @Post()
  @Roles(Role.Admin)
  @UseGuards(RolesGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create new company (Admin)' })
  async createNewCompany(@Body() body: any) {
    return this.companyService.createNewCompany(body);
  }

  @Post('csv')
  // @Roles(Role.Admin)
  // @UseGuards(AccessTokenGuard, RolesGuard)
  @ApiOperation({
    summary: 'Create or change company data by entered .csv file (Admin)',
  })
  @UseInterceptors(FileInterceptor('company'))
  // @ApiBearerAuth()
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        company: {
          type: 'string',
          format: 'binary',
        },
      },
    },
  })
  async addDataFromCSV(
    @UploadedFile(
      new ParseFilePipe({
        fileIsRequired: true,
        validators: [new FileTypeValidator({ fileType: '.(csv)' })],
      }),
    )
    companyFile: Express.Multer.File,
  ) {
    return this.companyService.addCsvDataIntoDb(companyFile);
  }

  @Delete(':companyId')
  @Roles(Role.Admin)
  @UseGuards(RolesGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete company by companyId (Admin)' })
  async deleteCompany(@Param('companyId') companyId: string) {
    return this.companyService.deleteCompanyById(companyId);
  }
}
