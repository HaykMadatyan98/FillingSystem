import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User, UserDocument } from './schema/user.schema';
import { CreateUserDto } from './dtos/user.dto';
import * as moment from 'moment';
import { CompanyService } from '@/company/company.service';
import { userResponseMsgs } from './constants';
import { userVerificationTime } from '@/auth/constants';

@Injectable()
export class UserService {
  constructor(
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    private readonly companyService: CompanyService,
  ) {}

  async create(createUserDto: CreateUserDto): Promise<{ message: string }> {
    const createdUser = new this.userModel(createUserDto);
    await createdUser.save();

    return userResponseMsgs.accountCreated;
  }

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

  async getAllUsers(): Promise<User[]> {
    return this.userModel.find().exec();
  }

  async getUserById(id: string): Promise<User> {
    return this.userModel.findById(id).exec();
  }

  async getUserByEmail(email: string): Promise<User | null> {
    return this.userModel.findOne({ email });
  }

  async update(id: string, updateUserDto: any): Promise<User> {
    return this.userModel
      .findByIdAndUpdate(id, updateUserDto, { new: true })
      .exec();
  }

  async remove(id: string): Promise<void> {
    await this.userModel.findByIdAndDelete(id).exec();
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

    user.refreshToken = refreshToken;
    await user.save();
  }
}
