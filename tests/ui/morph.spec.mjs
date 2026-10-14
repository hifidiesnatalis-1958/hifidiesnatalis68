import {test, expect} from '@playwright/test';
import {mkdir} from 'node:fs/promises';

async function settle(page) {
  await page.evaluate(() => new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve))));
  await page.waitForTimeout(100);
}
async function snapshot(page) {
  return page.evaluate(() => {
    const style = selector => getComputedStyle(document.querySelector(selector));
    return {
      shape: style('.hero-surface').borderRadius,
      emblem: style('.hero-emblem-motion').transform,
      welcome: Number(style('.hero-copy').opacity),
      story: Number(style('.hero-story-end').opacity),
      top: document.querySelector('.hero-stage').getBoundingClientRect().top,
    };
  });
}

for (const width of [1440, 390]) test(`native scroll morph remains smooth and reversible at ${width}px`, async ({page}) => {
  await page.setViewportSize({width, height: 900});
  await page.emulateMedia({reducedMotion: 'no-preference'});
  await page.goto('/');
  await page.evaluate(() => document.fonts.ready);
  await settle(page);
  const initial = await snapshot(page);
  expect(initial.welcome).toBe(1);
  expect(initial.story).toBe(0);
  await page.evaluate(() => window.scrollTo({top: innerHeight * .6, behavior: 'instant'}));
  await settle(page);
  const early = await snapshot(page);
  expect(early.welcome).toBeGreaterThan(.95);
  expect(early.story).toBe(0);
  const distance = await page.locator('.culture-hero').evaluate(node => node.offsetHeight - innerHeight + 120);
  await page.evaluate(y => window.scrollTo({top: y * .9, behavior: 'instant'}), distance);
  await settle(page);
  const end = await snapshot(page);
  expect(end.shape).not.toBe(initial.shape);
  expect(end.emblem).not.toBe(initial.emblem);
  expect(end.welcome).toBeLessThan(.05);
  expect(end.story).toBeGreaterThan(.95);
  expect(end.top).toBeGreaterThan(70);
  expect(end.top).toBeLessThan(105);
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  await mkdir('test-results/previews', {recursive: true});
  await page.screenshot({path: `test-results/previews/morph-end-${width}.png`});
  await page.evaluate(() => window.scrollTo({top: 0, behavior: 'instant'}));
  await settle(page);
  expect((await snapshot(page)).welcome).toBe(1);
  await page.screenshot({path: `test-results/previews/morph-start-${width}.png`});
  await page.locator('.hero-actions a[href="#rangkaian"]').click();
  await expect(page).toHaveURL(/#rangkaian$/);
  await expect(page.locator('#rangkaian h2')).toBeInViewport();
});

test('reduced motion shows a complete compact scene with working navigation', async ({page}) => {
  await page.emulateMedia({reducedMotion: 'reduce'});
  await page.setViewportSize({width: 390, height: 844});
  await page.goto('/');
  expect(await page.locator('.culture-hero').evaluate(node => node.offsetHeight < innerHeight)).toBe(true);
  await expect(page.locator('.hero-stage')).toHaveCSS('position', 'relative');
  await expect(page.locator('.hero-story-end')).toBeHidden();
  await expect(page.locator('.hero-copy')).toBeVisible();
  await page.locator('.hero-actions a[href="#menfess"]').click();
  await expect(page).toHaveURL(/#menfess$/);
  await expect(page.getByLabel('Tulis Harewos kamu')).toBeInViewport();
});
