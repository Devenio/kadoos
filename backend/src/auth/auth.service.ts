import {
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { createHmac, timingSafeEqual } from 'node:crypto';
import bcrypt from 'bcryptjs';
import { env } from '../common/config/env.js';
import { PrismaService } from '../prisma/prisma.service.js';

export type DeskUser = {
  id: string;
  email: string;
  name: string;
  shopId: string;
  shopSlug: string;
  shopName: { en: string; fa: string };
};

type TokenPayload = {
  sub: string;
  shopId: string;
  exp: number;
};

@Injectable()
export class AuthService {
  constructor(private readonly prisma: PrismaService) {}

  async login(email: string, password: string): Promise<{ token: string; user: DeskUser }> {
    const user = await this.prisma.user.findUnique({
      where: { email: email.trim().toLowerCase() },
      include: { shop: true },
    });
    if (!user) {
      throw new UnauthorizedException('Email or password is wrong');
    }

    const ok = await bcrypt.compare(password, user.passwordHash);
    if (!ok) {
      throw new UnauthorizedException('Email or password is wrong');
    }

    const safe = toDeskUser(user);
    return { token: signToken(safe), user: safe };
  }

  async me(token: string | undefined): Promise<DeskUser> {
    const payload = verifyToken(token);
    const user = await this.prisma.user.findUnique({
      where: { id: payload.sub },
      include: { shop: true },
    });
    if (!user || user.shopId !== payload.shopId) {
      throw new UnauthorizedException('Please sign in again');
    }
    return toDeskUser(user);
  }
}

function toDeskUser(user: {
  id: string;
  email: string;
  name: string;
  shopId: string;
  shop: { slug: string; nameEn: string; nameFa: string };
}): DeskUser {
  return {
    id: user.id,
    email: user.email,
    name: user.name,
    shopId: user.shopId,
    shopSlug: user.shop.slug,
    shopName: { en: user.shop.nameEn, fa: user.shop.nameFa },
  };
}

function signToken(user: DeskUser): string {
  const payload: TokenPayload = {
    sub: user.id,
    shopId: user.shopId,
    exp: Math.floor(Date.now() / 1000) + 60 * 60 * 24 * 7,
  };
  const body = Buffer.from(JSON.stringify(payload)).toString('base64url');
  return `${body}.${sign(body)}`;
}

export function verifyToken(token: string | undefined): TokenPayload {
  if (!token) {
    throw new UnauthorizedException('Please sign in');
  }
  const [body, signature] = token.split('.');
  if (!body || !signature || !safeEqual(sign(body), signature)) {
    throw new UnauthorizedException('Please sign in again');
  }
  const payload = JSON.parse(Buffer.from(body, 'base64url').toString()) as TokenPayload;
  if (payload.exp * 1000 < Date.now()) {
    throw new UnauthorizedException('Please sign in again');
  }
  return payload;
}

function sign(body: string): string {
  return createHmac('sha256', env.JWT_SECRET).update(body).digest('base64url');
}

function safeEqual(a: string, b: string): boolean {
  const left = Buffer.from(a);
  const right = Buffer.from(b);
  return left.length === right.length && timingSafeEqual(left, right);
}
