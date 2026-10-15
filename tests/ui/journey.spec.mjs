import {test, expect} from '@playwright/test';
import {mkdir} from 'node:fs/promises';

const scenes=['#rangkaian .event-row','#tema','#menfess','#undian .raffle-ticket',
  '#cinderamata','#dress-code','#pesan .feedback-form','#lokasi .map','.footer'];
async function scroll(page,top){
  await page.evaluate(y=>window.scrollTo({top:y,behavior:'instant'}),top);
  await page.evaluate(()=>new Promise(resolve=>requestAnimationFrame(()=>requestAnimationFrame(resolve))));
}
async function contour(page,selector){return page.locator(selector).first().evaluate(node=>node.classList.contains('morph-chapter') ? getComputedStyle(node.querySelector('.chapter-surface path')).d : getComputedStyle(node).borderRadius);}
async function atmosphere(page){return page.locator('.journey-shape-a').evaluate(node=>{
  const style=getComputedStyle(node);return {shape:style.borderRadius,transform:style.transform,color:style.backgroundColor};
});}

for(const width of [1440,390]) test(`all chapters morph in both scroll directions at ${width}px`,async({page})=>{
  await page.setViewportSize({width,height:900});
  await page.emulateMedia({reducedMotion:'no-preference'});
  const errors=[];page.on('pageerror',error=>errors.push(error.message));
  await page.goto('/');await page.evaluate(()=>document.fonts.ready);
  await expect(page.locator('.loading-state')).toHaveCount(0);
  await scroll(page,0);const opening=await atmosphere(page);
  expect(opening.transform).not.toBe('none');
  for(const selector of scenes){
    const {early,late}=await page.locator(selector).first().evaluate(node=>{
      const rect=node.getBoundingClientRect(),top=rect.top+scrollY;
      const max=document.documentElement.scrollHeight-innerHeight;
      return {early:Math.max(0,Math.min(max,top-innerHeight*.8)),late:Math.min(max,top+rect.height*.2)};
    });
    await scroll(page,early);const before=await contour(page,selector);
    await scroll(page,late);const after=await contour(page,selector);
    expect(after,`${selector} should change contour`).not.toBe(before);
    expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
    await scroll(page,early);
    expect(await contour(page,selector),`${selector} should reverse its contour`).toBe(before);
  }
  await scroll(page,await page.evaluate(()=>document.documentElement.scrollHeight));
  expect(await atmosphere(page)).not.toEqual(opening);
  await expect(page.locator('.header')).toBeInViewport();
  await scroll(page,0);expect(await atmosphere(page)).toEqual(opening);
  expect(errors).toEqual([]);
  await mkdir('test-results/previews',{recursive:true});
  for(const id of ['tema','cinderamata','lokasi']){
    const section=page.locator('#'+id);
    await section.locator('img').evaluateAll(images=>Promise.all(images.map(image=>image.decode().catch(()=>{}))));
    const center=await section.evaluate(node=>node.getBoundingClientRect().top+scrollY+node.offsetHeight/2-innerHeight/2+45);
    await scroll(page,center);
    await page.waitForTimeout(100);
    expect(await page.evaluate(()=>Boolean(document.elementFromPoint(innerWidth/2,42)?.closest('.header')))).toBe(true);
    await page.screenshot({path:`test-results/previews/journey-${id}-${width}.png`});
  }
});

test('Harewos input and layout remain stable while scrolling the full journey',async({page})=>{
  await page.setViewportSize({width:390,height:844});
  await page.emulateMedia({reducedMotion:'no-preference'});await page.goto('/');
  await page.evaluate(()=>document.fonts.ready);
  const input=page.getByLabel('Tulis Harewos kamu');
  await input.fill('Carita ti baraya, tetap tersimpan saat halaman digulir.');
  const bounds=()=>input.evaluate(node=>{
    const rect=node.getBoundingClientRect();return {top:rect.top+scrollY,left:rect.left,width:rect.width,height:rect.height};
  });
  const before=await bounds();
  await scroll(page,await page.evaluate(()=>document.documentElement.scrollHeight));
  await scroll(page,0);await input.scrollIntoViewIfNeeded();
  await expect(input).toHaveValue('Carita ti baraya, tetap tersimpan saat halaman digulir.');
  expect(await bounds()).toEqual(before);
  await expect(input).toHaveCSS('transform','none');
  await expect(page.getByRole('button',{name:'Masuk untuk mengirim'}).first()).toBeVisible();
});

test('reduced motion keeps every chapter readable and removes the moving background',async({page})=>{
  await page.emulateMedia({reducedMotion:'reduce'});await page.goto('/');
  await expect(page.locator('.journey-atmosphere')).toBeHidden();
  for(const selector of scenes) await expect(page.locator(selector).first()).toHaveCSS('animation-name','none');
  await page.getByLabel('Tulis Harewos kamu').fill('Halaman tetap bisa dipakai tanpa animasi.');
  await page.locator('.footer a[href="#beranda"]').click();
  await expect(page).toHaveURL(/#beranda$/);
  await expect(page.locator('#festival-title')).toBeInViewport();
});
