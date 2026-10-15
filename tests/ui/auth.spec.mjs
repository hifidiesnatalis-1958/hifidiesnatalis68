import {test,expect} from '@playwright/test';
import {signSession} from '../../lib/session.js';
for(const width of [1440,390,320])test(`NPM and token forms fit ${width}px`,async({page})=>{
 await page.setViewportSize({width,height:960});await page.goto('/masuk');
 await expect(page.getByLabel('NPM',{exact:true})).toBeVisible();await expect(page.getByLabel('Token',{exact:true})).toHaveAttribute('type','password');
 await page.getByRole('button',{name:'Daftar NPM',exact:true}).first().click();
 await expect(page.getByLabel('Token',{exact:true})).toHaveCount(0);await expect(page.getByRole('button',{name:'Buat akun NPM'})).toBeVisible();
 await page.evaluate(()=>document.fonts.ready);expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
});
test('registration rejects cohort 26 in the browser and shows a token receipt for an eligible NPM',async({page})=>{
 let sent=0;const user={id:'npm-one',nickname:'140310240054',npm:'140310240054',role:'user'};
 await page.route('**/api/auth/register',route=>{sent++;expect(route.request().postDataJSON()).toEqual({npm:user.npm});return route.fulfill({json:{user,token:'HIFI68-'+'x'.repeat(32)}});});
 await page.goto('/masuk?mode=daftar');await page.getByLabel('NPM',{exact:true}).fill('140310260054');
 await page.getByRole('checkbox').check();await page.getByRole('button',{name:'Buat akun NPM'}).click();expect(sent).toBe(0);
 await page.getByLabel('NPM',{exact:true}).fill(user.npm);await page.getByRole('button',{name:'Buat akun NPM'}).click();
 await expect(page.getByRole('heading',{name:'Simpan tokenmu.'})).toBeVisible();await expect(page.locator('.token-receipt code')).toContainText('HIFI68-');
 await expect(page.getByRole('button',{name:'Lanjut ke perayaan'})).toBeDisabled();
 const download=page.waitForEvent('download');await page.getByRole('button',{name:'Unduh token'}).click();expect((await download).suggestedFilename()).toContain(user.npm);
 await page.locator('.token-receipt input[type=checkbox]').check();await expect(page.getByRole('button',{name:'Lanjut ke perayaan'})).toBeEnabled();
});
test('NPM token login forms a session and returns to the raffle',async({page})=>{
 const user={id:'npm-one',nickname:'140310240054',npm:'140310240054',role:'user',admin:false};let body;
 await page.route('**/api/auth/login',route=>{body=route.request().postDataJSON();return route.fulfill({json:{user}});});
 await page.route('**/api/session',route=>route.fulfill({json:{user,loginReady:true}}));
 await page.goto('/masuk?next=%2F%23undian');await page.getByLabel('NPM',{exact:true}).fill(user.npm);await page.getByLabel('Token',{exact:true}).fill('HIFI68-'+'x'.repeat(32));
 await page.locator('form').getByRole('button',{name:'Masuk',exact:true}).click();await expect(page).toHaveURL(/welcome=1#undian$/);
 expect(body).toEqual({npm:user.npm,token:'HIFI68-'+'x'.repeat(32)});
});
test('operators have a distinct password path and errors remain inline',async({page})=>{
 let body;await page.route('**/api/auth/login',route=>{body=route.request().postDataJSON();return route.fulfill({status:401,json:{error:{message:'Nickname atau password salah.'}}});});
 await page.goto('/masuk?mode=panitia');await page.getByLabel('Nickname',{exact:true}).fill('admin123');await page.getByLabel('Password',{exact:true}).fill('Test password');
 await page.locator('form').getByRole('button',{name:'Masuk',exact:true}).click();await expect(page.locator('form').getByRole('alert')).toContainText('Nickname atau password salah');
 expect(body).toEqual({operator:true,nickname:'admin123',password:'Test password'});
});

test('token recovery requires an operator and raffle enrollment rejects operators',async({request,context})=>{
 const headers={Origin:'http://localhost:3069'};
 expect((await request.post('/api/admin/token',{headers,data:{npm:'140310240054'}})).status()).toBe(401);
 process.env.SESSION_SECRET='ui-test-only-session-secret-not-for-deployment';
 await context.addCookies([{name:'hifi68-session',value:signSession({id:'student',nickname:'140310240054',role:'user'}),url:'http://localhost:3069',httpOnly:true,sameSite:'Lax'}]);
 expect((await context.request.post('/api/admin/token',{headers,data:{npm:'140310240054'}})).status()).toBe(403);
 await context.addCookies([{name:'hifi68-session',value:signSession({id:'operator',nickname:'Panitia pilihan',role:'admin'}),url:'http://localhost:3069',httpOnly:true,sameSite:'Lax'}]);
 expect((await context.request.post('/api/raffle',{headers,data:{consent:true}})).status()).toBe(403);
 expect((await context.request.post('/api/admin/token',{headers:{Origin:'https://untrusted.example'},data:{npm:'140310240054'}})).status()).toBe(403);
});
