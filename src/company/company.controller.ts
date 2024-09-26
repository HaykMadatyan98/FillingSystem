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
// import { JwtAuthGuard } from '@/auth/guards/jwt-auth.guard';
import { FileInterceptor } from '@nestjs/platform-express';
import {
  ApiBody,
  ApiConsumes,
  ApiOperation,
  ApiParam,
  ApiTags,
} from '@nestjs/swagger';
import { RolesGuard } from '@/auth/guards/role.guard';

@ApiTags('company')
@Controller('company')
export class CompanyController {
  constructor(private readonly companyService: CompanyService) {}

  @Get()
  // @UseGuards(RolesGuard)
  async getAllCompanies() {}

  @Get(':companyId')
  async getCompanyById(@Param('companyId') companyId) {
    return this.getCompanyById(companyId);
  }

  @Post()
  // @UseGuards(RolesGuard)
  async createNewCompany(@Body() body: any) {
    return this.companyService.createNewCompany(body);
  }

  @Post('csv')
  //   @UseGuards(JwtAuthGuard, RolesGuard)
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
  // @UseGuards(RolesGuard)
  async deleteCompany(@Param('companyId') companyId) {
    return this.companyService.deleteCompanyById(companyId);
  }
}
