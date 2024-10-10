import { User } from '@/user/schema/user.schema';
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import * as bcrypt from 'bcrypt';
import { Model } from 'mongoose';

@Injectable()
export class SeederService {
  constructor(
    @InjectModel(User.name) private readonly userModel: Model<User>,
  ) {}

  async seed() {
    const email = 'harutyun.terteryan100@gmail.com';
    const adminUser = await this.userModel.findOne({ email });
    if (!adminUser) {
      const saltRounds = 10;
      const hashedPassword = await bcrypt.hash('Admin1234', saltRounds);

      await this.userModel.create({
        firstName: 'Admin',
        lastName: 'test',
        email: email,
        password: hashedPassword,
        role: 'admin',
      });
      console.log('Database seeded with user!');
    }
  }
}
