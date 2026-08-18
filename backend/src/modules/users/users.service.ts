import { Injectable, OnModuleInit, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import * as bcrypt from 'bcrypt';
import { User, UserDocument, UserRole } from '../../schemas/user.schema';

@Injectable()
export class UsersService implements OnModuleInit {
  private readonly logger = new Logger(UsersService.name);

  constructor(@InjectModel(User.name) private userModel: Model<UserDocument>) {}

  async onModuleInit() {
    await this.seedSuperAdmin();
  }

  async findByEmail(email: string): Promise<UserDocument | null> {
    return this.userModel.findOne({ email }).exec();
  }

  async findById(id: string): Promise<UserDocument | null> {
    return this.userModel.findById(id).select('-passwordHash').exec();
  }

  private async seedSuperAdmin() {
    const existingAdmin = await this.userModel.findOne({ role: UserRole.SUPER_ADMIN });
    if (!existingAdmin) {
      const passwordHash = await bcrypt.hash('admin123', 10);
      await this.userModel.create({
        name: 'Super Admin',
        email: 'admin@avelora.com',
        passwordHash,
        role: UserRole.SUPER_ADMIN,
      });
      this.logger.log('Seeded initial SUPER_ADMIN user: admin@avelora.com / admin123');
    }
  }
}
