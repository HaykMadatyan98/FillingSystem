import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Company, CompanyDocument } from './schemas/company.schema';
import { Model } from 'mongoose';
import * as csvParser from 'csv-parser';
import * as Stream from 'stream';
import { CompanyFormService } from '@/company-form/company-form.service';
import { CustomException } from '@/exceptions/custom-exception';
import { CustomNotFoundException } from '@/exceptions/not-found.exception';
import { sanitizeData } from '@/utils/sanitizer.util';

@Injectable()
export class CompanyService {
  constructor(
    @InjectModel(Company.name) private companyModel: Model<CompanyDocument>,
    private readonly companyFormService: CompanyFormService,
  ) {}

  async addCsvDataIntoDb(file: Express.Multer.File) {
    const results = [];
    const bufferStream = new Stream.PassThrough();
    bufferStream.end(file.buffer);

    await new Promise((resolve, reject) => {
      bufferStream
        .pipe(csvParser())
        .on('data', (data) => {
          results.push(data);
        })
        .on('end', () => resolve(results))
        .on('error', reject);
    });

    await Promise.all(results.map((row) => this.changeCompanyData(row)));
  }

  async changeCompanyData(row) {
    const company = await this.getCompanyByTaxId(Number(row['Tax ID Number']));
    const sanitizedData = await sanitizeData(row);

    if (!company) {
      const companyForm =
        await this.companyFormService.createCompanyFormFromCsv(
          sanitizedData.company,
        );
      const newCompany = new this.companyModel({
        name: companyForm.companyName,
        ['forms.company']: companyForm.id,
      });
      await newCompany.save();
    }
  }

  async getCompanyByTaxId(taxId: number) {
    console.log(taxId, 'taxId');
    const companyForm =
      await this.companyFormService.getCompanyFormByTaxId(taxId);

    if (!companyForm) {
      return null;
    }

    return this.companyModel.findOne({
      'forms.company.id': companyForm.id,
    });
  }
}
