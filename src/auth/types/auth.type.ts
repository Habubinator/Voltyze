import { User, Role } from '@prisma/client';
import { Request } from 'express';

export type AuthorizedUser = Pick<User, 'id' | 'name' | 'isBanned'> & {
  role: Role;
};

export type AuthorizedRequest = Request & { user: AuthorizedUser };
