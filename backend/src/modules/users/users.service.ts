import { Injectable, OnModuleInit, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { ConfigService } from '@nestjs/config';
import { Model } from 'mongoose';
import * as bcrypt from 'bcrypt';
import { User, UserDocument, UserRole } from '../../schemas/user.schema';

@Injectable()
export class UsersService implements OnModuleInit {
  private readonly logger = new Logger(UsersService.name);

  constructor(
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    private configService: ConfigService,
  ) {}

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
      const email = this.configService.get<string>('INITIAL_ADMIN_EMAIL') || 'admin@avelora.com';
      const password = this.configService.get<string>('INITIAL_ADMIN_PASSWORD') || 'admin123';
      const passwordHash = await bcrypt.hash(password, 10);
      await this.userModel.create({
        name: 'Super Admin',
        email,
        passwordHash,
        role: UserRole.SUPER_ADMIN,
      });
      this.logger.log(`Initialized default SUPER_ADMIN account: ${email}`);
    }
  }
}
