import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { create } from 'xmlbuilder2';
import { fields } from './constants';
import { CompanyService } from '@/company/company.service';

@Injectable()
export class GovernmentService {
  clientSecret: string;
  clientId: string;
  constructor(
    private readonly configService: ConfigService,
    private readonly companyService: CompanyService,
  ) {
    this.clientSecret = this.configService.get<string>(
      'GOVERNMENT.clientSecret',
    );
    this.clientId = this.configService.get<string>('GOVERNMENT.clientId');
  }

  async sendCompanyDataToGovernment(companies: string[]) {
    await Promise.all(
      companies.map(async (company: string) => {
        return this.generateXml(company);
      }),
    );
  }

  async generateXml(companyId: string) {
    const reportData = await this.companyService.getCompanyById(companyId);
    console.log(reportData);
    const xml = create({ version: '1.0', encoding: 'UTF-8' }).ele(
      'fc2:EFilingSubmissionXML',
      {
        'xmlns:fc2': 'www.fincen.gov/base',
        'xmlns:xsi': 'http://www.w3.org/2001/XMLSchema-instance',
        'xsi:schemaLocation':
          'www.fincen.gov/base https://www.fincen.gov/sites/default/files/schema/base/BOIRSchema.xsd',
        SeqNum: '1',
      },
    );

    fields.forEach((field: any) => {
      this.setXMLInformation(
        xml,
        field.name,
        reportData[field.dataName],
        field.options,
      );
    });

    return xml.end({ prettyPrint: true });
  }

  setXMLInformation(xml: any, field: string, data: any, options: any = {}) {
    xml.ele(`fc2:${field}`, options).txt(data);
  }
}
