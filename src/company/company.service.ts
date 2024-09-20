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
import { OwnerApplicantFormService } from '@/owner-applicant-form/owner-applicant-form.service';

@Injectable()
export class CompanyService {
  constructor(
    @InjectModel(Company.name) private companyModel: Model<CompanyDocument>,
    private readonly companyFormService: CompanyFormService,
    private readonly ownerApplicantFormService: OwnerApplicantFormService,
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
    let company = await this.getCompanyByTaxId(Number(row['Tax ID Number']));
    const sanitizedData = await sanitizeData(row);

    if (!company) {
      const companyForm =
        await this.companyFormService.createCompanyFormFromCsv(
          sanitizedData.company,
        );

      const applicantFormId =
        await this.ownerApplicantFormService.createApplicantFormFromCsv(
          sanitizedData.applicant,
        );

      const ownerFormId =
        await this.ownerApplicantFormService.createOwnerFormFromCsv(
          sanitizedData.owner,
        );

      const newCompany = new this.companyModel({
        name: companyForm.companyName,
        ['forms.company']: companyForm.id,
        ['forms.owners']: [ownerFormId],
        ['forms.applicants']: [applicantFormId],
      });

      await newCompany.save();
    }
  }

  async getCompanyByTaxId(taxId: number) {
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