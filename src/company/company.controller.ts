import {
  Controller,
  Delete,
  FileTypeValidator,
  Get,
  ParseFilePipe,
  Patch,
  Post,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { CompanyService } from './company.service';
import { JwtAuthGuard } from '@/auth/guards/jwt-auth.guard';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiBody, ApiConsumes, ApiTags } from '@nestjs/swagger';

@ApiTags('company')
@Controller('company')
export class CompanyController {
  constructor(private readonly companyService: CompanyService) {}

  // get all company data (admin)
  @Get()
  async getAllCompanies() {}

  // get company by id
  @Get(':id')
  async getCompanyById() {}

  // create a company with unique params (admin)
  @Post()
  async createNewCompany() {}

  // add uploaded csv data into db (admin)
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
    console.log(companyFile);
    return this.companyService.addCsvDataIntoDb(companyFile);
  }

  // change comapny data (admin)
  @Patch()
  async updateCompanyData() {}

  // delete company data (admin)
  @Delete()
  async deleteCompany() {}
}
