import { Injectable, UnauthorizedException, BadRequestException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
import { EmailService } from '../email/email.service';
import { randomBytes } from 'crypto';

export interface LoginDto {
  email: string;
  password: string;
}

export interface RegisterDto {
  name: string;
  email: string;
  password: string;
  phone?: string;
}

export interface JwtPayload {
  sub: string;
  email: string;
  role: string;
}

interface PasswordResetToken {
  token: string;
  email: string;
  expiresAt: Date;
}

@Injectable()
export class AuthService {
  private passwordResetTokens: Map<string, PasswordResetToken> = new Map();

  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
    private emailService: EmailService,
  ) {}

  async validateUser(email: string, password: string): Promise<any> {
    const user = await this.usersService.findByEmail(email);
    
    if (user && user.password && await this.usersService.verifyPassword(password, user.password)) {
      const { password, ...result } = user;
      return result;
    }
    
    return null;
  }

  async login(loginDto: LoginDto) {
    const user = await this.validateUser(loginDto.email, loginDto.password);
    
    if (!user) {
      throw new UnauthorizedException('Credenciais inválidas');
    }

    if (!user.isActive) {
      throw new UnauthorizedException('Conta desativada');
    }

    // Atualizar último login
    await this.usersService.updateLastLogin(user.id);

    const payload: JwtPayload = {
      sub: user.id,
      email: user.email,
      role: user.role,
    };

    return {
      access_token: this.jwtService.sign(payload),
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        image: user.image,
      },
    };
  }

  async register(registerDto: RegisterDto) {
    // Criar usuário
    const user = await this.usersService.create(registerDto);

    // Enviar email de boas-vindas
    this.emailService.sendWelcomeEmail(user.email, user.name ?? 'Cliente').catch(err => {
      console.error('Erro ao enviar email de boas-vindas:', err);
    });

    // Fazer login automático
    const payload: JwtPayload = {
      sub: user.id,
      email: user.email,
      role: user.role,
    };

    return {
      access_token: this.jwtService.sign(payload),
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    };
  }

  async getProfile(userId: string) {
    return this.usersService.findOne(userId);
  }

  async refreshToken(user: any) {
    const payload: JwtPayload = {
      sub: user.id,
      email: user.email,
      role: user.role,
    };

    return {
      access_token: this.jwtService.sign(payload),
    };
  }

  async changePassword(userId: string, currentPassword: string, newPassword: string) {
    const user = await this.usersService.findByEmail(
      (await this.usersService.findOne(userId)).email
    );

    if (user && user.password && !await this.usersService.verifyPassword(currentPassword, user.password)) {
      throw new UnauthorizedException('Senha atual incorreta');
    }

    await this.usersService.changePassword(userId, newPassword);

    return { message: 'Senha alterada com sucesso' };
  }

  // Solicitar recuperação de senha
  async forgotPassword(email: string) {
    const user = await this.usersService.findByEmail(email);
    
    if (!user) {
      // Não revelar se o email existe ou não por segurança
      return { message: 'Se o email existir, você receberá um link de recuperação.' };
    }

    // Gerar token único
    const token = randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15 minutos

    // Armazenar token
    this.passwordResetTokens.set(token, {
      token,
      email: user.email,
      expiresAt,
    });

    // Limpar tokens expirados
    this.cleanExpiredTokens();

    // Enviar email
    await this.emailService.sendPasswordReset(user.email, user.name ?? 'Cliente', token);

    return { message: 'Se o email existir, você receberá um link de recuperação.' };
  }

  // Verificar token de recuperação
  async verifyResetToken(token: string) {
    const resetData = this.passwordResetTokens.get(token);

    if (!resetData) {
      throw new BadRequestException('Token inválido ou expirado');
    }

    if (new Date() > resetData.expiresAt) {
      this.passwordResetTokens.delete(token);
      throw new BadRequestException('Token expirado. Solicite um novo link.');
    }

    return { valid: true, email: resetData.email };
  }

  // Redefinir senha com token
  async resetPassword(token: string, newPassword: string) {
    const resetData = this.passwordResetTokens.get(token);

    if (!resetData) {
      throw new BadRequestException('Token inválido ou expirado');
    }

    if (new Date() > resetData.expiresAt) {
      this.passwordResetTokens.delete(token);
      throw new BadRequestException('Token expirado. Solicite um novo link.');
    }

    // Buscar usuário e atualizar senha
    const user = await this.usersService.findByEmail(resetData.email);
    if (!user) {
      throw new BadRequestException('Usuário não encontrado');
    }

    await this.usersService.changePassword(user.id, newPassword);

    // Remover token usado
    this.passwordResetTokens.delete(token);

    return { message: 'Senha redefinida com sucesso!' };
  }

  // Limpar tokens expirados
  private cleanExpiredTokens() {
    const now = new Date();
    for (const [token, data] of this.passwordResetTokens.entries()) {
      if (now > data.expiresAt) {
        this.passwordResetTokens.delete(token);
      }
    }
  }
}