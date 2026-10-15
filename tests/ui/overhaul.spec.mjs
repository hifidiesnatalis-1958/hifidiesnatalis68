import {test, expect} from '@playwright/test';

test('native poster dialog closes with Escape and returns focus to its trigger', async ({page}) => {
  await page.goto('/');
  const trigger = page.locator('#rangkaian .poster-links').getByRole('button', {name: 'Lomba online', exact: true});
  await trigger.click();
  const dialog = page.getByRole('dialog');
  await expect(dialog).toBeVisible();
  await expect(dialog.getByRole('heading')).toHaveText('Lomba online');
  await expect(dialog.getByRole('link', {name: 'Unduh poster'})).toHaveAttribute('download', 'poster-online-hifi68.webp');
  await page.keyboard.press('Escape');
  await expect(dialog).toHaveCount(0);
  await expect(trigger).toBeFocused();
  await expect(page.locator('body')).not.toHaveCSS('overflow', 'hidden');
});

test('five philosophy panels use source artwork and keyboard navigation',async({page})=>{
 await page.goto('/');const theme=page.locator('#tema');await expect(theme.getByRole('tab')).toHaveCount(5);
 const names=['Kujang','Angka 68','Ornamen Batik','Keseluruhan','Warna'],sources=['poster-kujang','poster-logo','poster-batik','poster-whole','poster-colors'];
 for(const [i,name] of names.entries()){
  await theme.getByRole('tab',{name,exact:true}).click();await expect(theme.getByRole('tabpanel')).toBeVisible();await expect(theme.getByRole('tabpanel').getByRole('heading',{name,exact:true})).toBeVisible();
  await theme.getByRole('button',{name:'Lihat sumber desain'}).click();
  await expect(page.getByRole('dialog').getByRole('img')).toHaveAttribute('src',`/assets/kasundaan/${sources[i]}.webp`);
  await page.keyboard.press('Escape');
 }
 await theme.getByRole('tab',{name:'Warna',exact:true}).press('Home');await expect(theme.getByRole('tab',{name:'Kujang',exact:true})).toBeFocused();await expect(theme.getByRole('tabpanel').getByRole('heading',{name:'Kujang',exact:true})).toBeVisible();
});

test('merch catalogue uses actual product assets and opens a readable poster on mobile', async ({page}) => {
  await page.setViewportSize({width: 390, height: 844});
  await page.goto('/');
  await expect(page.locator('.merch-product')).toHaveCount(4);
  await page.getByRole('button', {name: 'Lihat katalog', exact: true}).click();
  const dialog = page.getByRole('dialog');
  await expect(dialog).toBeVisible();
  await expect(dialog.getByRole('img')).toHaveAttribute('src', '/assets/kasundaan/poster-merch.webp');
  expect(await dialog.evaluate(node => node.getBoundingClientRect().width <= innerWidth)).toBe(true);
  await dialog.getByRole('button', {name: 'Tutup poster'}).click();
  await expect(dialog).toHaveCount(0);
});

test('authenticated anonymous menfess still sends to the existing API and shows moderation feedback', async ({page}) => {
  let submitted;
  await page.route('**/api/session', route => route.fulfill({json: {user: {id: 'baraya', nickname: 'Nama bebas', admin: false}, loginReady: true}}));
  await page.route('**/api/menfess*', route => {
    if (route.request().method() === 'POST') {
      submitted = route.request().postDataJSON();
      return route.fulfill({json: {id: 'new', status: 'pending', message: 'Pesan tersimpan dan menunggu persetujuan panitia.'}});
    }
    return route.fulfill({json: {posts: [], mine: [], more: false, page: 1}});
  });
  await page.goto('/');
  await expect(page.locator('.user-name')).toHaveText('Nama bebas');
  await page.getByLabel('Untuk siapa?').fill('Baraya HIFI');
  await page.getByLabel('Tulis Harewos kamu').fill('Sampai bertemu di perayaan.');
  await page.getByRole('button', {name: 'Kirim Harewos', exact: true}).click();
  await expect(page.locator('#menfess [role=status]')).toContainText('menunggu persetujuan');
  expect(submitted).toEqual({body: 'Sampai bertemu di perayaan.', to: 'Baraya HIFI', anonymous: true});
  await expect(page.getByLabel('Tulis Harewos kamu')).toHaveValue('');
});
