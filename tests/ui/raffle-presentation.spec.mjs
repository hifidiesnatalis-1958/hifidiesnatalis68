import {test,expect} from '@playwright/test';
import {mkdir} from 'node:fs/promises';
import {signSession} from '../../lib/session.js';
import content from '../../content/site.json' with {type:'json'};

async function signIn(context,role='admin') {
  process.env.SESSION_SECRET='ui-test-only-session-secret-not-for-deployment';
  const user=role==='admin' ? {id:'operator-test',nickname:'Panitia Uji',name:'Operator Uji',role} : {id:'participant-test',nickname:'140310250099',name:'Peserta Uji',role};
  await context.addCookies([{name:'hifi68-session',value:signSession(user),url:'http://localhost:3069',httpOnly:true,sameSite:'Lax'}]);
}
const savedWinner={id:'draw-test',name:'Peserta Uji',number:'DN68-00002',prize:'Doorprize',createdAt:'2026-10-24T04:00:00.000Z'};
async function mockStatus(page,state) {await page.route('**/api/raffle',route=>route.fulfill({json:{...state,ticket:null}}));}

async function expectClean(page) {await expect(page.locator('.raffle-presentation').locator('button,input,select,textarea,a')).toHaveCount(0);}

test('raffle presentation and drawing remain committee-only',async({page,context,request})=>{
  await page.goto('/presentasi/undian');await expect(page.getByRole('heading')).toHaveText('Presentasi khusus operator.');
  await expect(page.getByRole('link',{name:'Masuk sebagai operator'})).toHaveAttribute('href','/masuk?next=%2Fpresentasi%2Fundian');
  const headers={Origin:'http://localhost:3069'};
  expect((await request.post('/api/admin',{headers,data:{action:'draw'}})).status()).toBe(401);
  await signIn(context,'user');await page.goto('/presentasi/undian');await expect(page.getByRole('heading')).toHaveText('Presentasi khusus operator.');
  expect((await context.request.post('/api/admin',{headers,data:{action:'draw'}})).status()).toBe(403);
});

test('registration, reload and saved result links stay on the main panel without a prize input',async({page,context})=>{
  await signIn(context);let reads=0;const actions=[];
  await page.route('**/api/admin',route=>{
    if(route.request().method()==='GET'){reads++;return route.fulfill({json:{content,pending:[],winners:[savedWinner],raffleOpen:false,totalTickets:3}});}
    actions.push(route.request().postDataJSON());return route.fulfill({json:{winner:savedWinner}});
  });
  await page.route('**/api/presentation',route=>route.fulfill({json:{posts:[],blocked:0}}));
  await page.goto('/admin');
  await expect(page.getByRole('link',{name:'Buka presentasi undian'})).toHaveAttribute('target','_blank');
  await expect(page.getByRole('link',{name:'Tampilkan hasil',exact:true})).toHaveAttribute('href','/presentasi/undian?hasil=draw-test');
  await expect(page.getByLabel('Hadiah yang diundi',{exact:true})).toHaveCount(0);
  await page.getByRole('button',{name:'Undi pemenang',exact:true}).click();expect(actions).toEqual([{action:'draw'}]);
  const before=reads;await page.getByRole('button',{name:'Muat ulang undian',exact:true}).click();await expect.poll(()=>reads).toBeGreaterThan(before);
  await expect(page.getByRole('button',{name:'Buka pendaftaran',exact:true})).toBeVisible();
  await page.goto('/presentasi');await expect(page.getByRole('link',{name:'Presentasi undian',exact:true})).toHaveAttribute('href','/presentasi/undian');
});

test('only Space draws once, opens fullscreen and shows the saved winner without any controls',async({page,context})=>{
  await signIn(context);const state={open:false,total:3,winners:[]};await mockStatus(page,state);
  const draws=[];let release;const pending=new Promise(resolve=>{release=resolve;});
  await page.route('**/api/admin',async route=>{
    draws.push(route.request().postDataJSON());await pending;state.winners=[savedWinner];await route.fulfill({json:{winner:savedWinner}});
  });
  await page.goto('/presentasi/undian');await expect(page.locator('.presentation-count')).toHaveText('3 tiket · 3 belum menang');await expectClean(page);
  await page.keyboard.press('Enter');await page.keyboard.press('h');await page.keyboard.press('f');expect(draws).toHaveLength(0);await expectClean(page);
  await page.keyboard.press('Space');await expect(page.locator('.presentation-stage').getByRole('status')).toHaveText('Sedang mengundi…');
  await page.keyboard.press('Space');await page.keyboard.press('Space');
  await page.evaluate(()=>document.dispatchEvent(new KeyboardEvent('keydown',{code:'Space',key:' ',repeat:true,bubbles:true})));
  expect(draws).toEqual([{action:'draw'}]);release();
  await expect(page.locator('.raffle-winner-name')).toHaveText(savedWinner.name);
  await expect(page.locator('.raffle-ticket-number')).toHaveText(savedWinner.number);
  await expect(page.locator('.presentation-count')).toHaveText('3 tiket · 2 belum menang');
  await expect.poll(()=>page.evaluate(()=>Boolean(document.fullscreenElement))).toBe(true);
  await expect(page.locator('.raffle-stage-prize')).toHaveCount(0);await expectClean(page);
  await page.evaluate(()=>document.dispatchEvent(new KeyboardEvent('keydown',{code:'Space',key:' ',repeat:true,bubbles:true})));
  expect(draws).toHaveLength(1);
});

test('Space reads registration changes from the admin tab and cannot draw after all participants won',async({page,context})=>{
  await signIn(context);await page.emulateMedia({reducedMotion:'reduce'});const state={open:true,total:1,winners:[]};await mockStatus(page,state);const actions=[];
  await page.route('**/api/admin',route=>{actions.push(route.request().postDataJSON());state.winners=[savedWinner];return route.fulfill({json:{winner:savedWinner}});});
  await page.goto('/presentasi/undian');await expect(page.locator('.presentation-count')).toHaveText('1 tiket · 1 belum menang');
  await page.keyboard.press('Space');await expect(page.locator('.raffle-stage-error')).toContainText('Tutup pendaftaran dari panel panitia');expect(actions).toHaveLength(0);
  state.open=false;await page.keyboard.press('Space');await expect(page.locator('.raffle-ticket-number')).toHaveText(savedWinner.number);
  await expect(page.locator('.raffle-revealed')).toHaveCSS('animation-name','none');
  await expect(page.locator('.presentation-count')).toHaveText('1 tiket · 0 belum menang');
  await page.keyboard.press('Space');expect(actions).toEqual([{action:'draw'}]);await expectClean(page);
});

test('a failed draw blocks further Space presses and saved results can be replayed from the admin link',async({page,context})=>{
  await signIn(context);const state={open:false,total:3,winners:[]};await mockStatus(page,state);let requests=0;
  await page.route('**/api/admin',route=>{requests++;state.winners=[savedWinner];return route.fulfill({status:502,json:{error:{message:'Layanan belum dapat dijangkau.'}}});});
  await page.goto('/presentasi/undian');await expect(page.locator('.presentation-count')).toHaveText('3 tiket · 3 belum menang');await page.keyboard.press('Space');
  await expect(page.locator('.raffle-stage-error')).toContainText('Periksa riwayat di panel panitia');
  await page.keyboard.press('Space');await page.keyboard.press('Space');expect(requests).toBe(1);
  await page.goto('/presentasi/undian?hasil=draw-test');await expect(page.locator('.raffle-ticket-number')).toHaveText(savedWinner.number);expect(requests).toBe(1);await expectClean(page);
});

test('a failed read can recover with Space without duplicating a draw',async({page,context})=>{
  await signIn(context);let failReads=true,draws=0;
  await page.route('**/api/raffle',route=>failReads ? route.fulfill({status:502,json:{error:{message:'Koneksi terputus.'}}}) : route.fulfill({json:{open:false,total:3,winners:[]}}));
  await page.route('**/api/admin',route=>{draws++;return route.fulfill({json:{winner:savedWinner}});});
  await page.goto('/presentasi/undian');await expect(page.locator('.raffle-stage-error')).toContainText('Koneksi terputus');failReads=false;
  await page.keyboard.press('Space');await expect(page.locator('.raffle-ticket-number')).toHaveText(savedWinner.number);expect(draws).toBe(1);
});

for(const [width,height]of [[1440,900],[1280,720],[1024,768],[768,900],[390,844],[320,667]])test(`saved result fits a clean presentation at ${width}x${height}`,async({page,context})=>{
  await signIn(context);await page.setViewportSize({width,height});
  const long={...savedWinner,name:'Peserta dengan nama panjang dari warga himpunan yang hadir dalam perayaan Dies Natalis HIFI'};
  await mockStatus(page,{open:false,total:3,winners:[long]});await page.goto('/presentasi/undian?hasil=draw-test');
  await expect(page.locator('.raffle-winner-name')).toHaveText(long.name);await page.evaluate(()=>document.fonts.ready);await expectClean(page);
  expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
  for(const selector of ['.raffle-winner-name','.raffle-ticket-number'])expect(await page.locator(selector).evaluate((n,desktop)=>{const r=n.getBoundingClientRect();return r.left>=0 && r.right<=innerWidth && (!desktop || (r.top>=0 && r.bottom<=innerHeight));},width>=768)).toBe(true);
  if(width===1280 || width===390){await mkdir('test-results/previews',{recursive:true});await page.screenshot({path:`test-results/previews/doorprize-${width}.png`,fullPage:true,animations:'disabled'});}
});
