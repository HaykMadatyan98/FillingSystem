import { Injectable } from '@nestjs/common';
import * as fs from 'fs';
import * as csvParser from 'csv-parser';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CompanyForm } from '@/company-form/schemas/company-form.schema';
import { Company } from '@/company/schemas/company.schema';
import { ApplicantForm } from '@/owner-applicant-form/schemas/owner-applicant-form.schema';
import { OwnerForm } from '@/owner-applicant-form/schemas/owner-applicant-form.schema';

@Injectable()
export class CsvService {
  constructor(
    @InjectModel(Company.name) private companyModel: Model<Company>,
    @InjectModel(CompanyForm.name) private companyFormModel: Model<CompanyForm>,
    @InjectModel(ApplicantForm.name)
    private applicantFormModel: Model<ApplicantForm>,
    @InjectModel(OwnerForm.name) private ownerFormModel: Model<OwnerForm>,
  ) {}

  async importCSV(filePath: string): Promise<void> {
    const results = await this.parseCSV(filePath);
    await Promise.all(results.map((row) => this.processRow(row)));
  }

  private parseCSV(filePath: string): Promise<any[]> {
    return new Promise((resolve, reject) => {
      const results = [];
      fs.createReadStream(filePath)
        .pipe(csvParser())
        .on('data', (data) => results.push(data))
        .on('end', () => resolve(results))
        .on('error', reject);
    });
  }

  private async processRow(row: any): Promise<void> {
    try {
      const companyInfo = await this.companyFormModel.findOne({
        'taxInfo.taxNumber': row['Tax ID Number'],
      });

      const companyData = companyInfo
        ? await this.companyModel.findById(companyInfo._id)
        : await this.createNewCompany(row);

      const newCompanyInfo = await this.createOrUpdateCompanyInfo(row);
      const applicants = await this.processApplicants(row);
      const owners = await this.processOwners(row);

      companyData.forms.applicants = companyData.forms.applicants || [];
      companyData.forms.owners = companyData.forms.owners || [];

      companyData.forms.applicants.push(...applicants);
      companyData.forms.owners.push(...owners);
      companyData.forms.company = newCompanyInfo;

      await companyData.save();
    } catch (error) {
      console.error('Error processing row:', error);
    }
  }

  private async processApplicants(row: any): Promise<ApplicantForm[]> {
    const applicantIDs = row['Applicant FinCEN ID'].split(';');
    return Promise.all(
      applicantIDs.map((finCENID) =>
        this.createOrUpdateApplicantForm(finCENID.trim(), row),
      ),
    );
  }

  private async processOwners(row: any): Promise<OwnerForm[]> {
    const ownerIDs = row['Owner FinCEN ID'].split(';');
    return Promise.all(
      ownerIDs.map((finCENID) =>
        this.createOrUpdateOwnerForm(finCENID.trim(), row),
      ),
    );
  }

  async createOrUpdateCompanyInfo(row: any): Promise<CompanyForm> {
    let companyData = await this.companyFormModel.findOne({
      'taxInfo.taxNumber': row['Tax ID Number'],
    });

    if (companyData) {
      companyData.names = {
        legalName: row['Legal Name'],
        altName: row['Alternate Name'],
      };
      companyData.taxInfo = {
        taxType: row['Tax ID Type'],
        taxNumber: row['Tax ID Number'],
        countryOrJurisdiction: row['Country/Jurisdiction'],
      };
      companyData.formationJurisdiction.countryOrJurisdiction =
        row['Country/Jurisdiction of Formation'];
      companyData.address = {
        address: row['Company Address'],
        city: row['Company City'],
        usOrUsTerritory: row['US or Territory'],
        state: row['Company State'],
        zipCode: row['Company ZIP Code'],
      };

      await companyData.save();
    } else {
      companyData = new this.companyFormModel({
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
          address: row['Company Address'],
          city: row['Company City'],
          usOrUsTerritory: row['US or Territory'] === 'Yes',
          state: row['Company State'],
          zipCode: row['Company ZIP Code'],
        },
      });
      await companyData.save();
    }
    return companyData;
  }

  async createOrUpdateApplicantForm(
    finCENID: string,
    row: any,
  ): Promise<ApplicantForm> {
    const existingApplicant = await this.applicantFormModel.findOne({
      'applicantFinCENID.finCENID': finCENID,
    });

    if (existingApplicant) {
      existingApplicant.personalInfo = {
        lastOrLegalName: row['Applicant Last Name'],
        firstName: row['Applicant First Name'],
        middleName: row['Applicant Middle Name'],
        suffix: row['Applicant Suffix'],
        dateOfBirth: new Date(row['Applicant DOB']),
      };
      existingApplicant.address = {
        type: row['Applicant Address Type'],
        address: row['Applicant Address'],
        city: row['Applicant City'],
        countryOrJurisdiction: row['Applicant Country'],
        state: row['Applicant State'],
        postalCode: row['Applicant Postal Code'],
      };
      await existingApplicant.save();
      return existingApplicant;
    } else {
      const newApplicant = new this.applicantFormModel({
        applicant: {
          existingReportCompany:
            row['Applicant Existing Report Company'] === 'true',
        },
        applicantFinCENID: { finCENID },
        personalInformation: {
          lastOrLegalName: row['Applicant Last Name'],
          firstName: row['Applicant First Name'],
          middleName: row['Applicant Middle Name'],
          suffix: row['Applicant Suffix'],
          dateOfBirth: new Date(row['Applicant DOB']),
        },
        currentAddress: {
          type: row['Applicant Address Type'],
          address: row['Applicant Address'],
          city: row['Applicant City'],
          countryOrJurisdiction: row['Applicant Country'],
          state: row['Applicant State'],
          postalCode: row['Applicant Postal Code'],
        },
        identificationAndJurisdiction: {
          docType: row['Applicant Doc Type'],
          docNumber: row['Applicant Doc Number'],
          countryOrJurisdiction: row['Applicant Country Jurisdiction'],
          state: row['Applicant Doc State'],
          docImg: {
            blobId: row['Applicant Doc Image Blob ID'],
            blobUrl: row['Applicant Doc Image Blob URL'],
          },
        },
      });
      await newApplicant.save();
      return newApplicant;
    }
  }

  async createOrUpdateOwnerForm(
    finCENID: string,
    row: any,
  ): Promise<OwnerForm> {
    const existingOwner = await this.ownerFormModel.findOne({
      'ownerFinCENId.finCENID': finCENID,
    });

    if (existingOwner) {
      existingOwner.personalInfo = {
        lastOrLegalName: row['Owner Last Name'],
        firstName: row['Owner First Name'],
        middleName: row['Owner Middle Name'],
        suffix: row['Owner Suffix'],
        dateOfBirth: new Date(row['Owner DOB']),
      };
      existingOwner.residentialAddress = {
        type: row['Owner Address Type'],
        address: row['Owner Address'],
        city: row['Owner City'],
        countryOrJurisdiction: row['Owner Country'],
        state: row['Owner State'],
        postalCode: row['Owner Postal Code'],
      };
      await existingOwner.save();
      return existingOwner;
    } else {
      const newOwner = new this.ownerFormModel({
        beneficialOwner: {
          isParentOrGuard:
            row['Beneficial Owner Is Parent Or Guardian'] === 'true',
        },
        ownerFinCENId: { finCENID },
        exemptEntity: { exemptEntity: row['Exempt Entity'] === 'true' },
        personalInfo: {
          lastOrLegalName: row['Owner Last Name'],
          firstName: row['Owner First Name'],
          middleName: row['Owner Middle Name'],
          suffix: row['Owner Suffix'],
          dateOfBirth: new Date(row['Owner DOB']),
        },
        residentialAddress: {
          type: row['Owner Address Type'],
          address: row['Owner Address'],
          city: row['Owner City'],
          countryOrJurisdiction: row['Owner Country'],
          state: row['Owner State'],
          postalCode: row['Owner Postal Code'],
        },
      });
      await newOwner.save();
      return newOwner;
    }
  }

  async createNewCompany(row: any): Promise<Company> {
    const newCompany = new this.companyModel({
      name: row['Company name'],
      answerCount: 0,
      expTime: new Date(),
      forms: {
        company: null,
        applicants: [],
        owners: [],
      },
    });
    await newCompany.save();
    return newCompany;
  }
}
