import {expect} from '@playwright/test';
const names={beranda:'Beranda',rangkaian:'Rangkaian',tema:'Tema',menfess:'Harewos',undian:'Undian',cinderamata:'Cenderamata','dress-code':'Busana',pesan:'Pesan',lokasi:'Lokasi',panutup:'Panutup'};
export async function visitScene(page,id){
 const controls=page.getByRole('navigation',{name:'Bagian perayaan'});
 if(!await page.evaluate(()=>matchMedia('(prefers-reduced-motion: reduce)').matches))await expect(controls).toBeVisible();
 if(await controls.count()){
  await controls.getByRole('button',{name:names[id],exact:true}).click();
  await expect(page.locator('.festival-immersive')).toHaveAttribute('data-current-scene',id);
  await expect(page.locator(`.festival-frame[data-scene="${id}"]`)).toHaveCSS('opacity','1');
 }else await page.locator('#'+id).scrollIntoViewIfNeeded();
}
