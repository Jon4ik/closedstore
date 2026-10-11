import 'reflect-metadata';
import { strict as assert } from 'node:assert';
import { test } from 'node:test';
import { UsersService } from '../src/modules/users/users.service';

test('user list query explicitly excludes password hashes', async () => {
  let args: any;
  const prisma = { user: { findMany: async (query: any) => { args = query; return []; } } };
  const service = new UsersService(prisma as any);
  await service.findAll();
  assert.equal(Object.prototype.hasOwnProperty.call(args.select, 'password'), false);
  assert.equal(Object.prototype.hasOwnProperty.call(args.select.role.select, 'password'), false);
});
