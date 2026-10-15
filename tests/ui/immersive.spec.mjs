import {test,expect} from '@playwright/test';
import {mkdir} from 'node:fs/promises';
import {visitScene} from './navigation.mjs';
const ids=['beranda','rangkaian','tema','menfess','undian','cinderamata','dress-code','pesan','lokasi','panutup'];
test('event filtering keeps the current scene and scroll position',async({page})=>{
 await page.goto('/');await expect(page.locator('.festival-immersive')).toBeVisible();await visitScene(page,'rangkaian');
 const before=await page.evaluate(()=>scrollY);await page.getByRole('button',{name:'17 Oktober',exact:true}).click();await expect(page.locator('.event-row')).toHaveCount(2);
 await expect(page.locator('.festival-immersive')).toHaveAttribute('data-current-scene','rangkaian');expect(await page.evaluate(()=>scrollY)).toBe(before);
 await page.getByRole('button',{name:'Semua',exact:true}).click();await expect(page.locator('.event-row')).toHaveCount(4);
});
for(const width of [1440,768,390,320])test(`one stationary stage morphs through every section at ${width}px`,async({page})=>{
 await page.setViewportSize({width,height:width<700?844:900});const errors=[];page.on('pageerror',e=>errors.push(e.message));await page.goto('/');await expect(page.locator('.festival-immersive')).toBeVisible();await page.evaluate(()=>document.fonts.ready);
 const top=await page.locator('.festival-stage').evaluate(n=>n.getBoundingClientRect().top);const contours=[];
 for(const id of ids){
  await visitScene(page,id);const frame=page.locator(`.festival-frame[data-scene="${id}"]`);
  expect(Math.abs(await page.locator('.festival-stage').evaluate(n=>n.getBoundingClientRect().top)-top)).toBeLessThan(1);
  expect(await frame.getAttribute('inert')).toBe(null);expect(await page.locator('.festival-frame[inert]').count()).toBe(ids.length-1);
  expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
  expect(await page.evaluate(()=>Boolean(document.elementFromPoint(innerWidth/2,40)?.closest('.header'))),`${id} keeps the header above the scene`).toBe(true);
  contours.push(await page.locator('.story-surface path').getAttribute('d'));
  const scroller=frame.locator('.scene-scroll');expect(await scroller.evaluate(n=>n.scrollWidth<=n.clientWidth+1)).toBe(true);
  if(id==='beranda' && width<700){const bottom=await scroller.evaluate(n=>n.getBoundingClientRect().bottom);for(const span of await page.locator('.event-strip .countdown span').all())expect(await span.evaluate(n=>n.getBoundingClientRect().bottom)).toBeLessThanOrEqual(bottom+1);}
  await scroller.locator('img').evaluateAll(images=>Promise.all(images.map(i=>{i.loading='eager';return i.decode().catch(()=>{});})));
  await mkdir('test-results/previews',{recursive:true});if([1440,390].includes(width) && ['beranda','tema','menfess','cinderamata','lokasi'].includes(id))await page.screenshot({path:`test-results/previews/stage-${id}-${width}.png`});
 }
 expect(new Set(contours).size).toBeGreaterThanOrEqual(3);await visitScene(page,'beranda');expect(await page.locator('.story-surface path').getAttribute('d')).toBe(contours[0]);expect(errors).toEqual([]);
});
test('scroll blends adjacent scenes in place, reverses geometry, and retains Harewos input',async({page})=>{
 await page.setViewportSize({width:1440,height:900});await page.goto('/');await expect(page.locator('.festival-immersive')).toBeVisible();
 await page.evaluate(()=>scrollTo({top:innerHeight*1.08*.5,behavior:'instant'}));await page.waitForTimeout(100);
 const first=page.locator('.festival-frame').nth(0),second=page.locator('.festival-frame').nth(1);
 const a=Number(await first.evaluate(n=>getComputedStyle(n).opacity)),b=Number(await second.evaluate(n=>getComputedStyle(n).opacity));expect(a).toBeGreaterThan(.2);expect(b).toBeGreaterThan(.2);
 await visitScene(page,'menfess');const input=page.getByLabel('Tulis Harewos kamu');await input.fill('Cerita saya tetap ada saat berganti bagian.');await visitScene(page,'lokasi');await visitScene(page,'menfess');await expect(input).toHaveValue('Cerita saya tetap ada saat berganti bagian.');await expect(input).toHaveCSS('transform','none');
});
test('header anchors and deep links open the right scene; reduced motion keeps the full document',async({page})=>{
 await page.goto('/#undian');await expect(page.locator('.festival-immersive')).toHaveAttribute('data-current-scene','undian');await expect(page.locator('#undian .raffle-ticket')).toBeVisible();
 await visitScene(page,'lokasi');await page.setViewportSize({width:390,height:844});await expect(page.locator('.festival-immersive')).toHaveAttribute('data-current-scene','lokasi');await page.setViewportSize({width:1440,height:900});await expect(page.locator('.festival-immersive')).toHaveAttribute('data-current-scene','lokasi');
 await page.locator('.nav-links a[href="#menfess"]').click();await expect(page.locator('.festival-immersive')).toHaveAttribute('data-current-scene','menfess');await expect(page.getByLabel('Tulis Harewos kamu')).toBeVisible();
 await page.emulateMedia({reducedMotion:'reduce'});await expect(page.locator('.festival-immersive')).toHaveCount(0);await expect(page.getByRole('navigation',{name:'Bagian perayaan'})).toHaveCount(0);
 for(const id of ids)await expect(page.locator('#'+id)).toBeVisible();await page.locator('.footer a[href="#beranda"]').click();await expect(page.locator('#festival-title')).toBeInViewport();
});
