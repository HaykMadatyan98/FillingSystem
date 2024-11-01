import { CompanyService } from '@/company/company.service';
import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { create } from 'xmlbuilder2';

@Injectable()
export class GovernmentService {
  private readonly clientSecret: string;
  private readonly clientId: string;
  private readonly logger = new Logger(GovernmentService.name);

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
      companies.map(async (companyId) => {
        try {
          const xmlData = await this.generateXml(companyId);
          console.log(xmlData);
          this.logger.log(
            `Successfully generated XML for company ID: ${companyId}`,
          );
        } catch (error) {
          this.logger.error(
            `Failed to process company ID: ${companyId}`,
            error.stack,
          );
        }
      }),
    );
  }

  private async generateXml(companyId: string) {
    const companyData = await this.companyService.getFilteredData(companyId);

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

    // fields.forEach((field) => {
    //   const data = companyData[field.dataName];
    //   if (data !== undefined) {
    //     this.setXMLInformation(xml, field.name, data, field.options);
    //   } else {
    //     this.logger.warn(
    //       `Field ${field.name} not found in company information for company ID ${companyId}`,
    //     );
    //   }
    // });

    return xml.end({ prettyPrint: true });
  }

  private setXMLInformation(
    xml: any,
    field: string,
    data: any,
    options: any = {},
  ) {
    xml.ele(`fc2:${field}`, options).txt(data);
  }
}
