import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User, UserDocument } from './schema/user.schema';
import { CreateUserDto } from './dtos/user.dto';
import { CustomNotFoundException } from '@/exceptions/not-found.exception';
import { ErrorMessages } from '@/constants/error-messages';
import * as moment from 'moment';

@Injectable()
export class UserService {
  constructor(@InjectModel(User.name) private userModel: Model<UserDocument>) {}

  async create(createUserDto: CreateUserDto): Promise<{ message: string }> {
    const createdUser = new this.userModel(createUserDto);
    await createdUser.save();

    return { message: 'account successfully created' };
  }

  async changeUserOtp(
    email: string,
    oneTimePass: number | null,
  ): Promise<void> {
    const user = await this.userModel.findOne({ email });

    if (!user) {
      throw new CustomNotFoundException(
        ErrorMessages.UserWithEnteredEmailNotFound,
      );
    }

    user.oneTimePass = oneTimePass;
    user.oneTimeExpiration = moment().add(1, 'hour').toString();
    await user.save();
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
}
