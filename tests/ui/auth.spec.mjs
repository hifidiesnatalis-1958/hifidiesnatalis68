import {test,expect} from '@playwright/test';
import {signSession} from '../../lib/session.js';
const password='Password pilihan 2026',user={id:'npm-one',nickname:'140310240054',npm:'140310240054',name:'Sandy Fauzi',role:'user',admin:false};
for(const width of [1440,390,320])test(`name, NPM and chosen password forms fit ${width}px`,async({page})=>{
 await page.setViewportSize({width,height:960});await page.goto('/masuk?mode=daftar');
 for(const label of ['Nama lengkap','NPM','Kata sandi','Ulangi kata sandi'])await expect(page.getByLabel(label,{exact:true})).toBeVisible();
 await expect(page.getByLabel('NPM',{exact:true})).toHaveAttribute('placeholder','Masukkan 12 digit NPM');await expect(page.getByLabel('NPM',{exact:true})).toHaveValue('');
 await expect(page.getByLabel('Kata sandi',{exact:true})).toHaveAttribute('autocomplete','new-password');
 await expect(page.getByLabel('Token',{exact:true})).toHaveCount(0);await page.evaluate(()=>document.fonts.ready);expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
});
test('registration rejects cohort 26 and mismatched passwords, then registers the chosen name and password',async({page})=>{
 let sent=0;await page.route('**/api/auth/register',route=>{sent++;expect(route.request().postDataJSON()).toEqual({npm:user.npm,name:user.name,password,passwordConfirm:password});return route.fulfill({json:{user}});});
 await page.route('**/api/session',route=>route.fulfill({json:{user,loginReady:true}}));
 await page.goto('/masuk?mode=daftar');await page.getByLabel('Nama lengkap',{exact:true}).fill(user.name);await page.getByLabel('NPM',{exact:true}).fill('140310260054');await page.getByLabel('Kata sandi',{exact:true}).fill(password);await page.getByLabel('Ulangi kata sandi',{exact:true}).fill(password);await page.getByRole('checkbox').check();
 await page.getByRole('button',{name:'Buat akun',exact:true}).click();expect(sent).toBe(0);
 await page.getByLabel('NPM',{exact:true}).fill(user.npm);await page.getByLabel('Ulangi kata sandi',{exact:true}).fill('Password berbeda');await page.getByRole('button',{name:'Buat akun',exact:true}).click();await expect(page.locator('form').getByRole('alert')).toContainText('belum sama');expect(sent).toBe(0);
 await page.getByLabel('Ulangi kata sandi',{exact:true}).fill(password);await page.getByRole('button',{name:'Buat akun',exact:true}).click();await expect(page).toHaveURL(/welcome=1/);await expect(page.locator('.user-name')).toHaveText(user.name);
});
test('NPM and chosen password login creates a session and returns to the raffle',async({page})=>{
 let body;await page.route('**/api/auth/login',route=>{body=route.request().postDataJSON();return route.fulfill({json:{user}});});await page.route('**/api/session',route=>route.fulfill({json:{user,loginReady:true}}));
 await page.goto('/masuk?next=%2F%23undian');await page.getByLabel('NPM',{exact:true}).fill(user.npm);await page.getByLabel('Kata sandi',{exact:true}).fill(password);await page.locator('form').getByRole('button',{name:'Masuk',exact:true}).click();await expect(page).toHaveURL(/welcome=1#undian$/);expect(body).toEqual({npm:user.npm,password});
});
test('operators keep password access and errors remain inline',async({page})=>{
 let body;await page.route('**/api/auth/login',route=>{body=route.request().postDataJSON();return route.fulfill({status:401,json:{error:{message:'Nickname atau password salah.'}}});});await page.goto('/masuk?mode=panitia');await page.getByLabel('Nama pengguna',{exact:true}).fill('admin123');await page.getByLabel('Kata sandi',{exact:true}).fill('Test password');await page.locator('form').getByRole('button',{name:'Masuk',exact:true}).click();await expect(page.locator('form').getByRole('alert')).toContainText('Nickname atau password salah');expect(body).toEqual({operator:true,nickname:'admin123',password:'Test password'});
});
test('the token endpoint is retired and operators cannot enroll as raffle participants',async({request,context})=>{
 expect((await request.post('/api/admin/token',{headers:{Origin:'http://localhost:3069'},data:{}})).status()).toBe(404);
 process.env.SESSION_SECRET='ui-test-only-session-secret-not-for-deployment';await context.addCookies([{name:'hifi68-session',value:signSession({id:'operator',nickname:'Panitia pilihan',role:'admin'}),url:'http://localhost:3069',httpOnly:true,sameSite:'Lax'}]);expect((await context.request.post('/api/raffle',{headers:{Origin:'http://localhost:3069'},data:{consent:true}})).status()).toBe(403);
});
