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
    return this.userModel.findOne({ email: email.toLowerCase().trim() }).exec();
  }

  async findById(id: string): Promise<UserDocument | null> {
    return this.userModel.findById(id).select('-passwordHash').exec();
  }

  async findByEmailOrId(identifier: string): Promise<UserDocument | null> {
    if (identifier.includes('@')) {
      return this.userModel.findOne({ email: identifier.toLowerCase().trim() }).exec();
    }
    return this.userModel.findById(identifier).exec();
  }

  async findAllUsers() {
    return this.userModel.find().select('-passwordHash').sort({ createdAt: -1 }).exec();
  }

  async createUser(data: { name: string; email: string; phone?: string; password: string; role: UserRole }) {
    const existing = await this.findByEmail(data.email);
    if (existing) {
      throw new Error(`User with email "${data.email}" already exists`);
    }
    const passwordHash = await bcrypt.hash(data.password, 10);
    return this.userModel.create({
      name: data.name,
      email: data.email.toLowerCase().trim(),
      phone: data.phone,
      passwordHash,
      role: data.role || UserRole.STAFF,
      isActive: true,
    });
  }

  async updateUserRole(id: string, role: UserRole) {
    return this.userModel.findByIdAndUpdate(id, { role }, { new: true }).select('-passwordHash').exec();
  }

  async toggleUserActive(id: string, isActive: boolean) {
    return this.userModel.findByIdAndUpdate(id, { isActive }, { new: true }).select('-passwordHash').exec();
  }

  private async seedSuperAdmin() {
    const existingAdmin = await this.userModel.findOne({ role: UserRole.SUPER_ADMIN });
    if (!existingAdmin) {
      const email = this.configService.get<string>('INITIAL_ADMIN_EMAIL') || 'admin@avelora.com';
      const password = this.configService.get<string>('INITIAL_ADMIN_PASSWORD') || 'admin123';
      const passwordHash = await bcrypt.hash(password, 10);
      await this.userModel.create({
        name: 'Super Admin',
        email: email.toLowerCase().trim(),
        passwordHash,
        role: UserRole.SUPER_ADMIN,
        isActive: true,
      });
      this.logger.log(`Initialized default SUPER_ADMIN account: ${email}`);
    }
  }
}
