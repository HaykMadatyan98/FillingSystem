import { CompanyService } from '@/company/company.service';
import { createCompanyXml } from '@/utils/xml-creator.util';
import { HttpService } from '@nestjs/axios';
import {
  BadRequestException,
  forwardRef,
  Inject,
  Injectable,
  Logger,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AxiosResponse } from 'axios';
import { firstValueFrom } from 'rxjs';
import { IAttachmentResponse } from './interfaces';

@Injectable()
export class GovernmentService {
  private readonly clientSecret: string;
  private readonly clientId: string;
  private readonly sandboxURL: string;
  private readonly mainURL: string;
  private readonly tokenURL: string;
  private readonly logger = new Logger(GovernmentService.name);

  private accessToken: string | null = null;

  constructor(
    private readonly configService: ConfigService,
    @Inject(forwardRef(() => CompanyService))
    private readonly companyService: CompanyService,
    private httpService: HttpService,
  ) {
    this.clientSecret = this.configService.get<string>(
      'GOVERNMENT.clientSecret',
    );
    this.clientId = this.configService.get<string>('GOVERNMENT.clientId');
    this.sandboxURL = this.configService.get<string>('GOVERNMENT.sandboxURL');
    this.mainURL = this.configService.get<string>('GOVERNMENT.mainURL');
    this.tokenURL = this.configService.get<string>('GOVERNMENT.tokenURL');
    this.accessToken = '';
  }

  async sendCompanyDataToGovernment(companies: string[]) {
    await Promise.all(
      companies.map(async (companyId) => {
        try {
          const xmlData = await this.generateXml(companyId);
          const processId = this.getProcessId(companyId);

          const response: AxiosResponse = await firstValueFrom(
            this.httpService.post(
              `${this.tokenURL}/upload/BOIR/${processId}/${companyId}`,
              xmlData,
              {
                headers: {
                  Authorization: `Bearer ${this.accessToken}`,
                  'Content-Type': 'application/xml',
                },
              },
            ),
          );

          return response.data;
        } catch (error) {
          this.logger.error(
            `Failed to process company ID: ${companyId}`,
            error.stack,
          );
        }
      }),
    );
  }

  async getAccessToken(): Promise<string> {
    if (this.accessToken) {
      return this.accessToken;
    }

    const credentials = Buffer.from(
      `${this.clientId}:${this.clientSecret}`,
    ).toString('base64');

    const data = new URLSearchParams();
    data.append('grant_type', 'client_credentials');
    data.append('scope', 'BOSS-EFILE-SANDBOX');

    try {
      const response: AxiosResponse = await firstValueFrom(
        this.httpService.post(this.tokenURL, data, {
          headers: {
            Authorization: `Basic ${credentials}`,
            'Content-Type': 'application/x-www-form-urlencoded',
          },
        }),
      );

      console.log(response.data);
      this.accessToken = response.data.access_token;
      return this.accessToken;
    } catch (error) {
      throw new Error(`Failed to obtain access token: ${error.message}`);
    }
  }

  async getProcessId(companyId: string): Promise<string> {
    if (!companyId) {
      throw new Error(`Provide company Id`);
    }

    const company = await this.companyService.getCompanyById(companyId);

    if (company.processId) return company.processId;
    const accessToken = await this.getAccessToken();

    try {
      const response: AxiosResponse = await firstValueFrom(
        this.httpService.get(`${this.sandboxURL}/attachment`, {
          headers: {
            Authorization: `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
          },
        }),
      );

      await this.companyService.setProcessId(
        companyId,
        response.data.processId,
      );

      return response.data.processId;
    } catch (error) {
      throw new Error(`Failed to obtain processId: ${error.message}`);
    }
  }

  async sendAttachment(
    companyId: string,
    filename: string,
    file: any,
  ): Promise<IAttachmentResponse> {
    const processId = this.getProcessId(companyId);

    try {
      const response: AxiosResponse = await firstValueFrom(
        this.httpService.post(
          `${this.tokenURL}/${processId}/${filename}`,
          file,
          {
            headers: {
              Authorization: `Bearer ${this.accessToken}`,
              'Content-Type': 'application/binary',
            },
          },
        ),
      );

      return response.data;
    } catch (error) {
      throw new Error(`Failed upload attachment: ${error.message}`);
    }
  }

  async checkGovernmentStatus(companyId: string) {
    const processId = this.getProcessId(companyId);
    try {
      const response: AxiosResponse = await firstValueFrom(
        this.httpService.get(`${this.sandboxURL}/transcript/${processId}`, {
          headers: {
            Authorization: `Bearer ${this.accessToken}`,
            'Content-Type': 'application/json',
          },
        }),
      );

      return response.data;
    } catch (error) {
      throw new Error(`Failed to check submission status: ${error.message}`);
    }
  }

  async generateXml(companyId: string) {
    const companyData = await this.companyService.getFilteredData(companyId);
    console.log(companyData);
    if (!companyData.user) throw new BadRequestException('user is not exist');
    const { email, firstName, lastName } = companyData.user;
    return createCompanyXml(companyData, companyData.user);
  }
}
