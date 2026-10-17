import {test,expect} from '@playwright/test';
import {mkdir} from 'node:fs/promises';
import {signSession} from '../../lib/session.js';
import content from '../../content/site.json' with {type:'json'};

async function signIn(context,role='admin') {
  process.env.SESSION_SECRET='ui-test-only-session-secret-not-for-deployment';
  const user=role==='admin' ? {id:'operator-test',nickname:'Panitia Uji',name:'Operator Uji',role} : {id:'participant-test',nickname:'140310250099',name:'Peserta Uji',role};
  await context.addCookies([{name:'hifi68-session',value:signSession(user),url:'http://localhost:3069',httpOnly:true,sameSite:'Lax'}]);
}
const savedWinner={id:'draw-test',name:'Peserta Uji',number:'DN68-00002',prize:'Kaos HIFI 68',createdAt:'2026-10-24T04:00:00.000Z'};
async function mockStatus(page,state) {await page.route('**/api/raffle',route=>route.fulfill({json:{...state,ticket:null}}));}

test('raffle presentation and drawing remain committee-only',async({page,context,request})=>{
  await page.goto('/presentasi/undian');await expect(page.getByRole('heading')).toHaveText('Presentasi khusus operator.');
  await expect(page.getByRole('link',{name:'Masuk sebagai operator'})).toHaveAttribute('href','/masuk?next=%2Fpresentasi%2Fundian');
  const headers={Origin:'http://localhost:3069'};
  expect((await request.post('/api/admin',{headers,data:{action:'draw',prize:'Hadiah uji'}})).status()).toBe(401);
  await signIn(context,'user');await page.goto('/presentasi/undian');await expect(page.getByRole('heading')).toHaveText('Presentasi khusus operator.');
  expect((await context.request.post('/api/admin',{headers,data:{action:'draw',prize:'Hadiah uji'}})).status()).toBe(403);
});

test('both existing operator panels link to raffle presentation',async({page,context})=>{
  await signIn(context);
  await page.route('**/api/admin',route=>route.fulfill({json:{content,pending:[],winners:[],raffleOpen:false,totalTickets:3}}));
  await page.route('**/api/presentation',route=>route.fulfill({json:{posts:[],blocked:0}}));
  await page.goto('/admin');await expect(page.getByRole('link',{name:'Buka presentasi undian'})).toHaveAttribute('href','/presentasi/undian');
  await page.goto('/presentasi');await expect(page.getByRole('link',{name:'Presentasi undian',exact:true})).toHaveAttribute('href','/presentasi/undian');
});

test('one draw request reveals only the saved server winner and history can be replayed without drawing',async({page,context})=>{
  await signIn(context);const state={open:false,total:3,winners:[]};await mockStatus(page,state);
  const draws=[];let release;const pending=new Promise(resolve=>{release=resolve;});
  await page.route('**/api/admin',async route=>{
    const body=route.request().postDataJSON();draws.push(body);await pending;
    state.winners=[savedWinner];await route.fulfill({json:{winner:savedWinner}});
  });
  await page.goto('/presentasi/undian');await page.getByLabel('Hadiah yang diundi').fill(savedWinner.prize);
  const draw=page.getByRole('button',{name:'Undi pemenang',exact:true});await expect(draw).toBeEnabled();await draw.click();
  await expect(page.locator('.presentation-stage').getByRole('status')).toHaveText('Sedang mengundi…');
  await expect(page.getByRole('button',{name:'Sedang mengundi…'})).toBeDisabled();
  await page.locator('.raffle-presentation-form').evaluate(form=>{form.requestSubmit();form.requestSubmit();});
  expect(draws).toEqual([{action:'draw',prize:savedWinner.prize}]);release();
  await expect(page.locator('.raffle-winner-name')).toHaveText(savedWinner.name);
  await expect(page.locator('.raffle-ticket-number')).toHaveText(savedWinner.number);
  await expect(page.locator('.presentation-count')).toHaveText('3 tiket · 2 belum menang');
  await expect(draw).toBeEnabled();
  await page.reload();await page.getByText('Riwayat pemenang (1)',{exact:true}).click();
  await page.getByRole('button',{name:'Tampilkan hasil',exact:true}).click();await expect(page.locator('.raffle-ticket-number')).toHaveText(savedWinner.number);
  expect(draws).toHaveLength(1);
  await page.keyboard.press('h');await expect(page.locator('.presentation-controls')).toHaveCount(0);
  await page.keyboard.press('h');await expect(page.locator('.presentation-controls')).toBeVisible();
  await page.getByRole('button',{name:'Layar penuh',exact:true}).click();await expect(page.getByRole('button',{name:'Keluar layar penuh'})).toBeVisible();
  await page.getByRole('button',{name:'Keluar layar penuh'}).click();
});

test('registration must close before drawing and reduced motion skips the rolling animation',async({page,context})=>{
  await signIn(context);await page.emulateMedia({reducedMotion:'reduce'});const state={open:true,total:1,winners:[]};await mockStatus(page,state);const actions=[];
  await page.route('**/api/admin',route=>{
    const body=route.request().postDataJSON();actions.push(body);
    if(body.action==='raffleOpen'){state.open=false;return route.fulfill({json:{open:false}});}
    state.winners=[savedWinner];return route.fulfill({json:{winner:savedWinner}});
  });
  await page.goto('/presentasi/undian');await page.getByLabel('Hadiah yang diundi').fill(savedWinner.prize);const draw=page.getByRole('button',{name:'Undi pemenang',exact:true});await expect(draw).toBeDisabled();
  await page.getByRole('button',{name:'Tutup pendaftaran',exact:true}).click();await expect(draw).toBeEnabled();await draw.click();
  await expect(page.locator('.raffle-ticket-number')).toHaveText(savedWinner.number);await expect(page.locator('.raffle-revealed')).toHaveCSS('animation-name','none');
  expect(actions).toEqual([{action:'raffleOpen',open:false},{action:'draw',prize:savedWinner.prize}]);await expect(draw).toBeDisabled();
  await page.getByText('Riwayat pemenang (1)',{exact:true}).click();await expect(page.locator('.raffle-presentation-history')).toContainText(savedWinner.number);
});

test('an ambiguous failed draw is not replayed and saved results remain recoverable',async({page,context})=>{
  await signIn(context);const state={open:false,total:3,winners:[]};await mockStatus(page,state);let requests=0;
  await page.route('**/api/admin',route=>{requests++;state.winners=[savedWinner];return route.fulfill({status:502,json:{error:{message:'Layanan belum dapat dijangkau. Silakan coba kembali.'}}});});
  await page.goto('/presentasi/undian');await page.getByLabel('Hadiah yang diundi').fill(savedWinner.prize);await page.getByRole('button',{name:'Undi pemenang',exact:true}).click();
  await expect(page.locator('.presentation-controls').getByRole('alert')).toContainText('Layanan belum dapat dijangkau');await expect(page.getByRole('button',{name:'Undi pemenang',exact:true})).toBeDisabled();
  await page.getByRole('button',{name:'Muat ulang',exact:true}).click();await page.getByText('Riwayat pemenang (1)',{exact:true}).click();await page.getByRole('button',{name:'Tampilkan hasil',exact:true}).click();
  await expect(page.locator('.raffle-ticket-number')).toHaveText(savedWinner.number);expect(requests).toBe(1);
});

for(const [width,height]of [[1440,900],[768,900],[390,844],[320,667]])test(`raffle stage fits long saved names and prizes at ${width}px`,async({page,context})=>{
  await signIn(context);await page.setViewportSize({width,height});const long={...savedWinner,name:'Peserta dengan nama panjang dari warga himpunan yang hadir dalam perayaan Dies Natalis HIFI',prize:'Paket cenderamata resmi Dies Natalis HIFI FMIPA Universitas Padjadjaran ke-68 bertema Kasundaan'};
  await mockStatus(page,{open:false,total:3,winners:[long]});await page.goto('/presentasi/undian');await page.getByText('Riwayat pemenang (1)',{exact:true}).click();await page.getByRole('button',{name:'Tampilkan hasil',exact:true}).click();await page.evaluate(()=>document.fonts.ready);
  expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
  for(const selector of ['.raffle-winner-name','.raffle-ticket-number','.raffle-stage-prize'])expect(await page.locator(selector).evaluate(n=>{const r=n.getBoundingClientRect();return r.left>=0 && r.right<=innerWidth;})).toBe(true);
  if(width===1440 || width===390){await mkdir('test-results/previews',{recursive:true});await page.screenshot({path:`test-results/previews/raffle-presentation-${width}.png`,fullPage:true,animations:'disabled'});}
});

for(const [width,height]of [[1440,900],[1280,720],[1024,768]])test(`projector view keeps the complete saved result visible at ${width}x${height}`,async({page,context})=>{
  await signIn(context);await page.setViewportSize({width,height});
  const long={...savedWinner,name:'Peserta dengan nama panjang dari warga himpunan yang hadir dalam perayaan Dies Natalis HIFI',prize:'Paket cenderamata resmi Dies Natalis HIFI FMIPA Universitas Padjadjaran ke-68 bertema Kasundaan'};
  await mockStatus(page,{open:false,total:3,winners:[long]});await page.goto('/presentasi/undian');
  await page.getByText('Riwayat pemenang (1)',{exact:true}).click();await page.getByRole('button',{name:'Tampilkan hasil',exact:true}).click();
  await page.getByRole('button',{name:'Layar penuh',exact:true}).click();await page.keyboard.press('h');await page.evaluate(()=>document.fonts.ready);
  await expect(page.locator('.presentation-controls')).toHaveCount(0);
  for(const selector of ['.raffle-winner-name','.raffle-ticket-number','.raffle-stage-prize'])expect(await page.locator(selector).evaluate(n=>{const r=n.getBoundingClientRect();return r.left>=0 && r.right<=innerWidth && r.top>=0 && r.bottom<=innerHeight;})).toBe(true);
  expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
  await mkdir('test-results/previews',{recursive:true});await page.screenshot({path:`test-results/previews/raffle-projector-${width}.png`,animations:'disabled'});
  await page.keyboard.press('f');
});
