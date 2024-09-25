import {
  Body,
  Controller,
  Delete,
  FileTypeValidator,
  Get,
  Param,
  ParseFilePipe,
  Patch,
  Post,
  UploadedFile,
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
    return this.companyService.addCsvDataIntoDb(companyFile);
  }

  // change company data (admin)
  @Patch()
  async updateCompanyData() {}

  // delete company data (admin)
  @Delete()
  async deleteCompany() {}
}
