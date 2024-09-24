import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Company, CompanyDocument } from './schemas/company.schema';
import { Model } from 'mongoose';
import * as csvParser from 'csv-parser';
import * as Stream from 'stream';
import { CompanyFormService } from '@/company-form/company-form.service';
import { CustomException } from '@/exceptions/custom-exception';
import { CustomNotFoundException } from '@/exceptions/not-found.exception';
// import { sanitizeData } from '@/utils/sanitizer.util';
import { ParticipantFormService } from '@/participant-form/participant-form.service';
import { sanitizeData } from '@/utils/sanitizer.util';

@Injectable()
export class CompanyService {
  constructor(
    @InjectModel(Company.name) private companyModel: Model<CompanyDocument>,
    private readonly companyFormService: CompanyFormService,
    private readonly participantFormService: ParticipantFormService,
  ) {}

  async addCsvDataIntoDb(file: Express.Multer.File) {
    const results = [];
    const bufferStream = new Stream.PassThrough();
    bufferStream.end(file.buffer);

    await new Promise((resolve, reject) => {
      bufferStream
        .pipe(csvParser({ separator: ',', quote: '"' }))
        .on('data', (data) => {
          // console.log(data, 'data');
          results.push(data);
        })
        .on('end', () => resolve(results))
        .on('error', reject);
    });

    await Promise.all(results.map((row) => this.changeCompanyData(row)));
  }

  async changeCompanyData(row) {
    const companyFormId = await this.companyFormService.getCompanyFormIdByTaxId(
      row['Tax ID Number'],
    );

    let company = await this.companyModel.findOne({
      'forms.company': companyFormId,
    });

    const sanitizedData = await sanitizeData(row);

    if (!company) {
      const companyForm =
        await this.companyFormService.createCompanyFormFromCsv(
          sanitizedData.company,
        );
      const ownersIds = [];
      const applicantsIds = [];

      const participantsData = await Promise.all(
        sanitizedData.participants.map((participant) =>
          this.participantFormService.createParticipantFormFromCsv(participant),
        ),
      );
      participantsData.forEach((participant) => {
        participant[0]
          ? applicantsIds.push(participant[1])
          : ownersIds.push(participant[1]);
      });

      company = new this.companyModel({
        ['forms.company']: companyForm.id,
        ['forms.applicants']: applicantsIds,
        ['forms.owners']: ownersIds,
        name: sanitizedData.company.names.legalName,
      });
      await company.save();
    } else {
      await this.companyFormService.updateCompanyFormFromCsv(
        sanitizedData.company,
        companyFormId,
      );

      // const changeApplicant = await Promise.all(sanitizedData.participants.map((participant) => {
      //   const existParticipant = this.participantFormService.findParticipantFormByDocNum(participant.identificationDetails.docNumber)

      //   if (existParticipant) {
      //     // change and save
      //     // existParticipant.save()
      //   } else {
      //     // create new
      //   }

      // }))
    }
  }
}
