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
import { AcessTokenGuard } from '@/auth/guards/access-token.guard';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiBody, ApiConsumes, ApiTags } from '@nestjs/swagger';
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
  async getAllCompanies() {}

  @Get(':companyId')
  async getCompanyById(@Param('companyId') companyId) {
    return this.getCompanyById(companyId);
  }

  @Post()
  @Roles(Role.Admin)
  @UseGuards(RolesGuard)
  async createNewCompany(@Body() body: any) {
    return this.companyService.createNewCompany(body);
  }

  @Post('csv')
  @Roles(Role.Admin)
  @UseGuards(AcessTokenGuard, RolesGuard)
  @UseInterceptors(FileInterceptor('company'))
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
  async deleteCompany(@Param('companyId') companyId) {
    return this.companyService.deleteCompanyById(companyId);
  }
}
