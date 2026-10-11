import 'reflect-metadata';
import { strict as assert } from 'node:assert';
import { test } from 'node:test';
import { ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { PermissionsGuard } from '../src/modules/auth/permissions.guard';
import { PERMISSIONS_KEY } from '../src/modules/auth/require-permissions.decorator';

function context(handler: Function, permissions?: string[]) {
  return {
    getHandler: () => handler,
    getClass: () => class TestController {},
    switchToHttp: () => ({ getRequest: () => ({ user: permissions ? { permissions } : undefined }) }),
  } as any;
}

test('allows a user with the required permission', () => {
  const handler = () => undefined;
  Reflect.defineMetadata(PERMISSIONS_KEY, ['view_users'], handler);
  const guard = new PermissionsGuard(new Reflector());
  assert.equal(guard.canActivate(context(handler, ['view_users', 'view'])), true);
});

test('denies a user without the required permission', () => {
  const handler = () => undefined;
  Reflect.defineMetadata(PERMISSIONS_KEY, ['manage_users'], handler);
  const guard = new PermissionsGuard(new Reflector());
  assert.throws(() => guard.canActivate(context(handler, ['view_users'])), ForbiddenException);
});

test('fails closed when a protected route has no permission metadata', () => {
  const handler = () => undefined;
  const guard = new PermissionsGuard(new Reflector());
  assert.throws(() => guard.canActivate(context(handler, ['manage_users'])), ForbiddenException);
});

test('denies requests without an authenticated user', () => {
  const handler = () => undefined;
  Reflect.defineMetadata(PERMISSIONS_KEY, ['view_users'], handler);
  const guard = new PermissionsGuard(new Reflector());
  assert.throws(() => guard.canActivate(context(handler)), ForbiddenException);
});
