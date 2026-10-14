import {test, expect} from '@playwright/test';
import {readFileSync} from 'node:fs';
import {signSession} from '../../lib/session.js';

test('committee date edits preserve WIB start time and can save a different start time', async ({page, context}) => {
  process.env.SESSION_SECRET = 'ui-test-only-session-secret-not-for-deployment';
  await context.addCookies([{name: 'hifi68-session', value: signSession({id: '90000', nickname: 'Panitia pilihan', role: 'admin'}),
    url: 'http://localhost:3069', httpOnly: true, sameSite: 'Lax'}]);
  let content = JSON.parse(readFileSync(new URL('../../content/site.json', import.meta.url), 'utf8'));
  const saved = [];
  await page.route('**/api/admin', route => {
    if (route.request().method() === 'POST') {
      const body = route.request().postDataJSON();
      expect(body.action).toBe('content');
      content = body.content;
      saved.push(content.date);
      return route.fulfill({json: {saved: true}});
    }
    return route.fulfill({json: {content, raffleOpen: false, totalTickets: 0, winners: [], pending: []}});
  });
  await page.goto('/admin');
  await expect(page.getByRole('heading', {name: 'Presentasi Harewos'})).toBeVisible();
  await expect(page.getByLabel('Jam mulai acara (WIB)')).toHaveValue('09:00');
  await page.getByLabel('Tanggal acara utama').fill('2026-10-25');
  await page.getByRole('button', {name: 'Simpan informasi acara'}).click();
  await expect.poll(() => saved.length).toBe(1);
  expect(saved[0]).toBe('2026-10-25T09:00:00+07:00');
  await expect(page.getByRole('button', {name: 'Simpan informasi acara'})).toBeEnabled();
  await page.getByLabel('Jam mulai acara (WIB)').fill('10:30');
  await page.getByRole('button', {name: 'Simpan informasi acara'}).click();
  await expect.poll(() => saved.length).toBe(2);
  expect(saved[1]).toBe('2026-10-25T10:30:00+07:00');
  await expect(page.getByLabel('Jam mulai acara (WIB)')).toHaveValue('10:30');
});
