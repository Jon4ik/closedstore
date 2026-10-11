import 'reflect-metadata';
import { strict as assert } from 'node:assert';
import { test } from 'node:test';
import { BadRequestException } from '@nestjs/common';
import { StoresService } from '../src/modules/stores/stores.service';

const service = new StoresService({} as any);

test('parses a valid DD.MM.YYYY date without local timezone ambiguity', () => {
  const date = (service as any).convertDate('28.02.2025') as Date;
  assert.equal(date.toISOString(), '2025-02-28T00:00:00.000Z');
});

test('rejects impossible calendar dates instead of normalizing them', () => {
  assert.throws(() => (service as any).convertDate('31.02.2025'), BadRequestException);
});

test('rejects reversed stage dates', () => {
  assert.throws(
    () => (service as any).validateDates({ closureDate: '10.10.2026', demolitionDate: '09.10.2026' }),
    BadRequestException,
  );
});
