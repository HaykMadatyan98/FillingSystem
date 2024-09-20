import { Injectable } from '@nestjs/common';
import * as fs from 'fs';
import * as csvParser from 'csv-parser';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CompanyForm } from './../company-form/schemas/company-form.schema';

@Injectable()
export class CsvService {
  constructor(
    @InjectModel(CompanyForm.name)
    private reportingCompanyModel: Model<CompanyForm>,
  ) {}

  async importCSV(filePath: string): Promise<void> {
    const results = [];
    return new Promise((resolve, reject) => {
      fs.createReadStream(filePath)
        .pipe(csvParser())
        .on('data', (data) => results.push(data))
        .on('end', async () => {
          try {
            for (const row of results) {
              const reportingCompany = new this.reportingCompanyModel({
                name: {
                  legalName: row['Legal Name'],
                  alternateName: row['Alternate Name'],
                },
                taxInformation: {
                  taxIdentificationType: row['Tax ID Type'],
                  taxIdentificationNumber: row['Tax ID Number'],
                  countryJurisdiction: row['Country/Jurisdiction'],
                },
                countryJurisdictionOfFormation:
                  row['Country/Jurisdiction of Formation'],
                address: {
                  address: row['Address'],
                  city: row['City'],
                  usOrUsTerritory: row['US or Territory'] === 'Yes',
                  state: row['State'],
                  zipCode: row['ZIP Code'],
                },
              });
              await reportingCompany.save();
            }
            resolve();
          } catch (error) {
            reject(error);
          }
        });
    });
  }
}
