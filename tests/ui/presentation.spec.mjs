import {test,expect} from '@playwright/test';
import {mkdir} from 'node:fs/promises';
import {signSession} from '../../lib/session.js';
const testSecret='ui-test-only-session-secret-not-for-deployment';
function token(nickname) {
  process.env.SESSION_SECRET=testSecret;
  return signSession({id:nickname==='Panitia pilihan' ? '90000' : '10001',nickname:nickname==='Panitia pilihan'?nickname:'140310240054',role:nickname==='Panitia pilihan' ? 'admin' : 'user'});
}
async function signIn(context,nickname='Panitia pilihan') {
  await context.addCookies([{name:'hifi68-session',value:token(nickname),url:'http://localhost:3069',httpOnly:true,sameSite:'Lax'}]);
}
const fixture=[
  {id:'a',to:'Baraya HIFI',body:'Hatur nuhun sudah menjadi bagian dari cerita ini. Sampai bertemu di perayaan kita!',author:'Baraya anonim'},
  {id:'b',to:'Fisika 24',body:'Semoga perjalanan kita selalu dipenuhi hal baik dan teman yang saling mendukung.',author:'Baraya anonim'},
  {id:'c',to:'Panitia Dies Natalis',body:'Terima kasih sudah menyiapkan ruang untuk ngariung bersama.',author:'Baraya anonim'},
];
async function mockPresentation(page,posts=fixture) {
  await page.route('**/api/presentation',route=>route.fulfill({json:{posts,blocked:2,filterActive:true,updatedAt:new Date().toISOString()}}));
}
test('presentation page and API require a committee account',async({page,context,request})=>{
  await page.goto('/presentasi');await expect(page.getByRole('heading')).toContainText('khusus operator');
  expect((await request.get('/api/presentation')).status()).toBe(401);
  await signIn(context,'Baraya bebas');await page.goto('/presentasi');await expect(page.getByRole('heading')).toContainText('khusus operator');
  expect((await context.request.get('/api/presentation')).status()).toBe(403);
  await signIn(context);expect((await context.request.get('/api/presentation')).status()).toBe(503);
});
test('shuffled presentation navigates each message once, hides controls and supports fullscreen',async({page,context})=>{
  await signIn(context);await mockPresentation(page);await page.goto('/presentasi');
  await expect(page.locator('.presentation-count')).toHaveText('1 / 3');
  await expect(page.locator('.presentation-status')).toContainText('Penyaringan kata aktif');
  await expect(page.locator('.presentation-card footer')).toContainText('Pengirim anonim');
  const seen=new Set();
  for(let i=0;i<3;i++) {
    seen.add(await page.locator('.presentation-body').textContent());
    if(i<2) await page.getByRole('button',{name:'Berikutnya'}).click();
  }
  expect(seen.size).toBe(3);expect([...seen].sort()).toEqual(fixture.map(post=>post.body).sort());await expect(page.getByRole('button',{name:'Berikutnya'})).toBeDisabled();
  await page.keyboard.press('ArrowLeft');await expect(page.locator('.presentation-count')).toHaveText('2 / 3');
  await page.getByRole('button',{name:'Acak ulang'}).click();await expect(page.locator('.presentation-count')).toHaveText('1 / 3');
  await page.getByRole('button',{name:'Sembunyikan kontrol'}).click();await expect(page.locator('.presentation-controls')).toHaveCount(0);
  await page.keyboard.press('h');await expect(page.locator('.presentation-controls')).toBeVisible();
  await page.getByRole('button',{name:'Layar penuh',exact:true}).click();
  await expect(page.getByRole('button',{name:'Keluar layar penuh'})).toBeVisible();
  await page.getByRole('button',{name:'Keluar layar penuh'}).click();
  await page.evaluate(()=>document.fonts.ready);await mkdir('test-results/previews',{recursive:true});
  await page.screenshot({path:'test-results/previews/presentation-1440.png',fullPage:true});
});
test('autoplay advances on the chosen interval and stops at the final message',async({page,context})=>{
  await page.clock.install();await signIn(context);await mockPresentation(page);await page.goto('/presentasi');
  await expect(page.locator('.presentation-count')).toHaveText('1 / 3');
  await page.getByLabel('Durasi tiap pesan').selectOption('8');
  await page.getByRole('button',{name:'Putar otomatis'}).click();await page.clock.fastForward(8100);
  await expect(page.locator('.presentation-count')).toHaveText('2 / 3');await page.clock.fastForward(8100);
  await expect(page.locator('.presentation-count')).toHaveText('3 / 3');
  await expect(page.getByRole('button',{name:'Putar otomatis'})).toBeDisabled();
  await page.clock.fastForward(16000);await expect(page.locator('.presentation-count')).toHaveText('3 / 3');
});
test('long messages fit a narrow screen and service failures leave a useful empty state',async({page,context})=>{
  await signIn(context);await page.setViewportSize({width:390,height:844});
  await mockPresentation(page,[{...fixture[0],body:'Terima kasih untuk semua cerita dan kebersamaan yang telah kita lalui. '.repeat(11)}]);
  await page.goto('/presentasi');await expect(page.locator('.presentation-body')).toBeVisible();
  expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
  await page.screenshot({path:'test-results/previews/presentation-390.png',fullPage:true});
  await page.unroute('**/api/presentation');await page.route('**/api/presentation',route=>route.fulfill({status:503,json:{error:{message:'Layanan belum diaktifkan panitia.'}}}));
  await page.getByRole('button',{name:'Muat ulang'}).click();
  await expect(page.locator('.presentation-empty')).toContainText('Layanan belum diaktifkan');await expect(page.getByRole('button',{name:'Berikutnya'})).toBeDisabled();
});
