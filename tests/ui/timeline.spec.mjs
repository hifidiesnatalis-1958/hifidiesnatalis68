import {test,expect} from '@playwright/test';
import {visitScene} from './navigation.mjs';

const officialEvents=[
 {id:'dress-to-impress',title:'Dress to Impress',date:'2026-10-17',time:'19.30 WIB',url:'https://discord.gg/5RJrU9crB'},
 {id:'pengumpulan',title:'Ngedongeng & Poster Digital',date:'2026-10-17',time:'Maksimal 23.59 WIB',url:'https://bit.ly/PengumpulanLombaOnlineDies68'},
 {id:'check-sound',title:'Check sound penampil',date:'2026-10-24',time:'06.15\u201308.45 WIB'},
 {id:'puncak',title:'Puncak Dies Natalis ke-68',date:'2026-10-24',time:'09.00 WIB\u2013selesai'},
];

async function openSchedule(page,width,height){
 await page.setViewportSize({width,height});await page.goto('/');await page.evaluate(()=>document.fonts.ready);await visitScene(page,'rangkaian');
 await expect(page.locator('#rangkaian .event-row')).toHaveCount(4);
}

async function expectOriginalEvents(page){
 await expect(page.locator('#rangkaian .event-row h3')).toHaveText(officialEvents.map(event=>event.title));
 for(const event of officialEvents){
  const row=page.locator(`#rangkaian [data-event="${event.id}"]`);
  await expect(row.locator('time')).toHaveAttribute('datetime',event.date);
  await expect(row.locator('.event-meta')).toContainText(event.time);
  if(event.url)await expect(row.locator('.event-link')).toHaveAttribute('href',event.url);
  else await expect(row.locator('.event-link')).toHaveCount(0);
 }
}

async function geometry(page){
 return page.locator('#rangkaian .timeline').evaluate(timeline=>{
  const rect=node=>{const r=node.getBoundingClientRect();return {left:r.left,right:r.right,top:r.top,bottom:r.bottom,width:r.width};};
  const canvas=document.createElement('canvas');canvas.width=canvas.height=1;const paint=canvas.getContext('2d');
  paint.fillStyle=getComputedStyle(timeline,'::before').backgroundColor;paint.fillRect(0,0,1,1);
  return {timeline:rect(timeline),band:[...paint.getImageData(0,0,1,1).data],viewport:innerWidth,
   rows:[...timeline.querySelectorAll('.event-row')].map(row=>({date:rect(row.querySelector('.timeline-date')),summary:rect(row.querySelector('.event-summary')),heading:rect(row.querySelector('h3')),background:getComputedStyle(row).backgroundColor}))};
 });
}

for(const width of [1440,768])test(`schedule dates share a centered ribbon with alternating entries at ${width}px`,async({page})=>{
 await openSchedule(page,width,900);await expectOriginalEvents(page);
 const state=await geometry(page),center=(state.timeline.left+state.timeline.right)/2;
 for(const [channel,expected] of [12,87,91,255].entries())expect(Math.abs(state.band[channel]-expected)).toBeLessThanOrEqual(1);
 for(const [index,row] of state.rows.entries()){
  expect(Math.abs((row.date.left+row.date.right)/2-center)).toBeLessThan(1);
  if(index%2===0){expect(row.summary.right).toBeLessThanOrEqual(row.date.left+1);expect(row.heading.right).toBeLessThan(row.date.left);}
  else{expect(row.summary.left).toBeGreaterThanOrEqual(row.date.right-1);expect(row.heading.left).toBeGreaterThan(row.date.right);}
  expect(row.background).toBe('rgba(0, 0, 0, 0)');
  expect(row.summary.left).toBeGreaterThanOrEqual(0);expect(row.summary.right).toBeLessThanOrEqual(width);
 }
 expect(await page.evaluate(()=>document.documentElement.scrollWidth)).toBeLessThanOrEqual(width);
 await page.getByRole('button',{name:'17 Oktober',exact:true}).click();await expect(page.locator('#rangkaian .event-row h3')).toHaveText(officialEvents.slice(0,2).map(event=>event.title));
 await page.getByRole('button',{name:'24 Oktober',exact:true}).click();await expect(page.locator('#rangkaian .event-row h3')).toHaveText(officialEvents.slice(2).map(event=>event.title));
 await page.getByRole('button',{name:'Semua',exact:true}).click();await expectOriginalEvents(page);
});

for(const [width,height] of [[390,844],[320,667]])test(`schedule keeps every date left of readable content at ${width}px`,async({page})=>{
 await openSchedule(page,width,height);await expectOriginalEvents(page);
 const state=await geometry(page);
 for(const row of state.rows){
  expect(Math.abs(row.date.left-state.timeline.left)).toBeLessThan(1);
  expect(row.summary.left).toBeGreaterThanOrEqual(row.date.right-1);
  expect(row.heading.left).toBeGreaterThan(row.date.right);
  expect(row.summary.right).toBeLessThanOrEqual(width);expect(row.summary.width).toBeGreaterThan(130);
 }
 expect(await page.evaluate(()=>document.documentElement.scrollWidth)).toBeLessThanOrEqual(width);
 const last=page.locator('#rangkaian [data-event="puncak"] h3');await last.scrollIntoViewIfNeeded();
 const readable=await last.evaluate(node=>{const h=node.getBoundingClientRect(),panel=node.closest('.scene-scroll').getBoundingClientRect();return h.top>=panel.top && h.bottom<=panel.bottom;});
 expect(readable).toBe(true);
 const poster=page.getByRole('button',{name:'Perbesar poster lomba online'});await poster.scrollIntoViewIfNeeded();await poster.click();
 await expect(page.getByRole('dialog').getByRole('img')).toHaveAttribute('src','/assets/kasundaan/poster-online.webp');
 await page.keyboard.press('Escape');await expect(poster).toBeFocused();
 await expect(page.locator('#rangkaian .juknis')).toHaveAttribute('href','https://bit.ly/JuknisLombaOnlineDies68');
});
