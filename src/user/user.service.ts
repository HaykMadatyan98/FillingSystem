import { authResponseMsgs, userVerificationTime } from '@/auth/constants';
import { CompanyService } from '@/company/company.service';
import {
  forwardRef,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import * as moment from 'moment';
import { Model } from 'mongoose';
import { userResponseMsgs } from './constants';
import { User, UserDocument } from './schema/user.schema';

@Injectable()
export class UserService {
  constructor(
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    @Inject(forwardRef(() => CompanyService))
    private readonly companyService: CompanyService,
  ) {}

  async changeUserOtp(
    email: string,
    oneTimePass: number | null,
  ): Promise<string> {
    const user = await this.userModel.findOne({ email });

    if (!user) {
      throw new NotFoundException(userResponseMsgs.userNotFound);
    }

    user.oneTimePass = oneTimePass;
    user.oneTimeExpiration = moment()
      .add(...userVerificationTime)
      .toISOString();
    await user.save();

    return user.firstName;
  }

  async getUserById(id: string): Promise<User> {
    return this.userModel.findById(id).exec();
  }

  async getUserByEmail(email: string): Promise<User | null> {
    return this.userModel.findOne({ email });
  }

  async getUserByTokenAndId(userId: string, refreshToken: string) {
    const user = await this.userModel.findOne({ _id: userId, refreshToken });

    return user;
  }

  async createUserFromCsvData(
    email: string,
    name: string,
    companyId: string,
  ): Promise<UserDocument> {
    const newUser = new this.userModel({
      email,
      firstName: name,
      companies: [companyId],
    });
    await newUser.save();

    return newUser['id'];
  }

  async addCompanyToUser(userId: string, companyId: string) {
    const user: any = await this.userModel.findById(userId);

    if (!user.companies.includes(companyId)) {
      user.companies.push(companyId);
      await user.save();
    }

    return user['id'];
  }

  async addCompaniesToUser(userId: string, companyIds: string[]) {
    await this.userModel.findOneAndUpdate(
      { _id: userId },
      { $addToSet: { companies: { $each: companyIds } } },
      { new: true },
    );
  }

  async getUserCompanyData(userId: string) {
    const user = await this.userModel
      .findById(userId, {
        companies: 1,
        _id: 0,
      })
      .select('-companies.forms');

    return await this.companyService.getCompaniesByIds(user.companies);
  }

  async changeRefreshToken(userId: string, refreshToken: string) {
    const user = await this.userModel.findById(userId);

    if (!user) {
      throw new NotFoundException(authResponseMsgs.userNotFound);
    }

    user.refreshToken = refreshToken;
    await user.save();
  }

  async removeCompanyFromUser(
    userId: string,
    companyId: string,
  ): Promise<void> {
    const user = await this.userModel.findOneAndUpdate(
      { _id: userId },
      { $pull: { companies: companyId } },
      { new: true },
    );

    if (!user) {
      throw new NotFoundException(
        `No user is associated with company ID ${companyId}`,
      );
    }

    if (user.companies.length === 0) {
      await this.userModel.deleteOne({ _id: userId });
    }
  }

  async findOrCreateUser(
    email: string | null,
    userName: string,
    companyId: string,
    userId: string | null,
  ) {
    let user = null;

    if (email) {
      user = await this.userModel.findOne({ email });
    }

    if (!user && userId) {
      user = await this.userModel.findById(userId);
    }

    if (user) {
      user = await this.userModel.findOneAndUpdate(
        { _id: user._id },
        { $addToSet: { companies: companyId } },
        { new: true },
      );
    }

    if (!user) {
      user = await this.userModel.create({
        email,
        firstName: userName,
        companies: [companyId],
      });
    }

    return user;
  }
}
