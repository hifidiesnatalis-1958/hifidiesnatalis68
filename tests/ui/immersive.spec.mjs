import {test,expect} from '@playwright/test';
import {mkdir} from 'node:fs/promises';
import {visitScene} from './navigation.mjs';
const ids=['beranda','rangkaian','tema','menfess','undian','cinderamata','dress-code','pesan','lokasi','panutup'];

async function expectLogos(page,coverOpacity){
 const state=await page.locator('.wayang-object[data-object="logo-68"]').evaluate(node=>{
  const rect=node.querySelector('img').getBoundingClientRect(),matrix=new DOMMatrixReadOnly(getComputedStyle(node).transform),brand=document.querySelector('.header .brand'),headerImage=brand.querySelector('img'),header=headerImage.getBoundingClientRect(),headerStyle=getComputedStyle(headerImage),headerMatrix=new DOMMatrixReadOnly(headerStyle.transform),hit=document.elementFromPoint(header.left+header.width/2,header.top+header.height/2);
  const box=rect=>({left:rect.left,top:rect.top,right:rect.right,bottom:rect.bottom,width:rect.width,height:rect.height}),rotation=matrix=>[matrix.m12,matrix.m13,matrix.m21,matrix.m23,matrix.m31,matrix.m32];
  return {cover:box(rect),header:box(header),viewport:[innerWidth,innerHeight],rotation:rotation(matrix),headerRotation:rotation(headerMatrix),scale:[matrix.m11,matrix.m22],depth:matrix.m43,brandAccessible:brand.contains(hit),opacity:Number(getComputedStyle(node).opacity),headerOpacity:Number(headerStyle.opacity),headerVisibility:headerStyle.visibility};
 });
 expect(state.headerVisibility).toBe('visible');expect(state.headerOpacity).toBe(1);expect(state.brandAccessible).toBe(true);
 expect(state.opacity).toBeGreaterThanOrEqual(0);expect(state.opacity).toBeLessThanOrEqual(1);
 if(coverOpacity!==undefined)expect(state.opacity).toBe(coverOpacity);
 for(const rect of [state.header,...(state.opacity>.001?[state.cover]:[])]){
  expect(rect.width).toBeGreaterThan(0);expect(rect.height).toBeGreaterThan(0);expect(rect.left).toBeGreaterThanOrEqual(-.5);expect(rect.top).toBeGreaterThanOrEqual(-.5);expect(rect.right).toBeLessThanOrEqual(state.viewport[0]+.5);expect(rect.bottom).toBeLessThanOrEqual(state.viewport[1]+.5);
 }
 for(const value of [...state.rotation,...state.headerRotation])expect(Math.abs(value)).toBeLessThan(.0001);
 for(const value of state.scale)expect(value).toBeGreaterThan(0);
 expect(Math.abs(state.depth)).toBeLessThan(.0001);
}
async function expectWholeWayang(page,hero){
 const state=await page.evaluate(()=>{
  const cast=[...document.querySelectorAll('.wayang-object')].filter(n=>['wayang-arjuna','wayang-semar','logo-68'].includes(n.dataset.object)).map(node=>{const r=node.querySelector('img').getBoundingClientRect();return {name:node.dataset.object,left:r.left,top:r.top,right:r.right,bottom:r.bottom,width:r.width,height:r.height,opacity:Number(getComputedStyle(node).opacity)};});
  return {cast,viewport:[innerWidth,innerHeight]};
 });
 for(const actor of state.cast.filter(actor=>actor.name!=='logo-68')){
  expect(actor.opacity,actor.name).toBeGreaterThan(.1);expect(actor.width,actor.name).toBeGreaterThan(0);expect(actor.height,actor.name).toBeGreaterThan(0);
  expect(actor.left,actor.name).toBeGreaterThanOrEqual(-.5);expect(actor.top,actor.name).toBeGreaterThanOrEqual(-.5);expect(actor.right,actor.name).toBeLessThanOrEqual(state.viewport[0]+.5);expect(actor.bottom,actor.name).toBeLessThanOrEqual(state.viewport[1]+.5);
 }
 if(hero)for(let i=0;i<state.cast.length;i++)for(let j=i+1;j<state.cast.length;j++){
  const a=state.cast[i],b=state.cast[j],overlapX=Math.min(a.right,b.right)-Math.max(a.left,b.left),overlapY=Math.min(a.bottom,b.bottom)-Math.max(a.top,b.top);
  expect(overlapX>1 && overlapY>1,`${a.name} and ${b.name} remain separate on the cover`).toBe(false);
 }
}

test('event filtering keeps the current scene and scroll position',async({page})=>{
 await page.goto('/');await expect(page.locator('.festival-immersive')).toBeVisible();await visitScene(page,'rangkaian');
 const before=await page.evaluate(()=>scrollY);await page.getByRole('button',{name:'17 Oktober',exact:true}).click();await expect(page.locator('.event-row')).toHaveCount(2);
 await expect(page.locator('.festival-immersive')).toHaveAttribute('data-current-scene','rangkaian');expect(await page.evaluate(()=>scrollY)).toBe(before);
 await page.getByRole('button',{name:'Semua',exact:true}).click();await expect(page.locator('.event-row')).toHaveCount(4);
});
for(const [width,height] of [[1440,900],[1280,800],[768,900],[390,844],[320,844],[320,667]])test(`one stationary stage morphs through every section at ${width}x${height}px`,async({page})=>{
 test.setTimeout(60000);
 await page.setViewportSize({width,height});const errors=[];page.on('pageerror',e=>errors.push(e.message));await page.goto('/');await expect(page.locator('.festival-immersive')).toBeVisible();await page.evaluate(()=>document.fonts.ready);
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
  await expect(page.locator('.wayang-gate')).toBeHidden();await expectLogos(page,id==='beranda'?1:0);await expectWholeWayang(page,id==='beranda');
  const collisions=await frame.evaluate(frame=>{
   const viewport=frame.querySelector('.scene-scroll').getBoundingClientRect(),round=r=>Object.fromEntries(['left','top','width','height'].map(key=>[key,Math.round(r[key]*10)/10]));
   const cast=[...document.querySelectorAll('.wayang-object')].filter(n=>['wayang-arjuna','wayang-semar','logo-68','cloud-red','cloud-red-wide'].includes(n.dataset.object) && getComputedStyle(n).visibility!=='hidden' && Number(getComputedStyle(n).opacity)>.1).map(n=>({name:n.dataset.object,rect:n.querySelector('img').getBoundingClientRect()}));
   const result=[];
   // Text ranges measure each actual line, excluding the empty portion of a
   // heading's block box and visually hidden accessibility-only labels.
   for(const target of frame.querySelectorAll('h1,h2,.hero-actions a,.event-date strong,.event-date span,.countdown strong,.countdown span')){
    const walker=document.createTreeWalker(target,NodeFilter.SHOW_TEXT);
    while(walker.nextNode()){
     const node=walker.currentNode;if(!node.textContent.trim() || node.parentElement.closest('.sr-only'))continue;
     const range=document.createRange();range.selectNodeContents(node);
     for(const rect of range.getClientRects()){
      const text={left:Math.max(rect.left,viewport.left,0),right:Math.min(rect.right,viewport.right,innerWidth),top:Math.max(rect.top,viewport.top,0),bottom:Math.min(rect.bottom,viewport.bottom,innerHeight)};
      if(text.right<=text.left || text.bottom<=text.top)continue;
      for(const actor of cast){const overlapX=Math.min(text.right,actor.rect.right)-Math.max(text.left,actor.rect.left),overlapY=Math.min(text.bottom,actor.rect.bottom)-Math.max(text.top,actor.rect.top);if(overlapX>1 && overlapY>1)result.push({scene:frame.dataset.scene,object:actor.name,text:node.textContent.trim(),glyph:round(rect),art:round(actor.rect),overlap:[Math.round(overlapX*10)/10,Math.round(overlapY*10)/10]});}
     }
    }
   }
   return result;
  });
  expect(collisions,`${id} at ${width}x${height}px keeps the cast outside heading, action and event text`).toEqual([]);
  if(id==='menfess' || id==='pesan'){const input=frame.locator(id==='menfess'?'#menfess-to':'#messages-body');await input.scrollIntoViewIfNeeded();expect(await input.evaluate(n=>{const r=n.getBoundingClientRect();return document.elementFromPoint(r.left+r.width/2,r.top+r.height/2)===n;})).toBe(true);}
  await mkdir('test-results/previews',{recursive:true});if([1440,390].includes(width) && ['beranda','tema','menfess','cinderamata','lokasi'].includes(id))await page.screenshot({path:`test-results/previews/stage-${id}-${width}.png`,animations:'disabled'});
 }
 expect(new Set(contours).size).toBeGreaterThanOrEqual(3);await visitScene(page,'beranda');expect(await page.locator('.story-surface path').getAttribute('d')).toBe(contours[0]);expect(errors).toEqual([]);
});
test('the original object cast persists and moves through real depth as scroll reverses',async({page})=>{
 await page.setViewportSize({width:1440,height:900});await page.goto('/');await expect(page.locator('.festival-immersive')).toBeVisible();
 const theatre=page.locator('.wayang-theatre'),objects=page.locator('.wayang-object');await expect(theatre).toBeVisible();expect(await objects.count()).toBe(8);
 expect(await theatre.getAttribute('aria-hidden')).toBe('true');expect(await theatre.evaluate(n=>getComputedStyle(n).pointerEvents)).toBe('none');
 const cast=await objects.elementHandles(),names=await objects.evaluateAll(nodes=>nodes.map(n=>n.dataset.object));expect(new Set(names).size).toBe(names.length);
 expect(await theatre.locator('img').evaluateAll(images=>images.every(n=>new URL(n.currentSrc || n.src).pathname.startsWith('/assets/kasundaan/')))).toBe(true);
 expect(await page.locator('.festival-stage').evaluate(n=>parseFloat(getComputedStyle(n).perspective))).toBeGreaterThan(0);
 expect(await theatre.evaluate(n=>getComputedStyle(n).transformStyle)).toBe('preserve-3d');
 const arjuna=theatre.locator('.wayang-object[data-object="wayang-arjuna"]'),gate=page.locator('.wayang-gate');
 const pose=()=>arjuna.evaluate(n=>{const style=getComputedStyle(n),m=new DOMMatrixReadOnly(style.transform);return {transform:style.transform,depth:[m.m13,m.m23,m.m31,m.m32,m.m43]};});
 const scroll=async fraction=>{await page.evaluate(f=>scrollTo({top:Math.round(innerHeight*1.08)*f,behavior:'instant'}),fraction);await page.waitForTimeout(100);};
 await scroll(.2);const early=await pose(),gateEarly=await gate.evaluate(n=>getComputedStyle(n).transform);
 await scroll(.5);const middle=await pose(),gateMiddle=await gate.evaluate(n=>getComputedStyle(n).transform);
 expect(middle.transform).not.toBe(early.transform);expect(middle.transform).toContain('matrix3d');expect(middle.depth.some(n=>Math.abs(n)>.001)).toBe(true);expect(gateMiddle).not.toBe(gateEarly);
 await scroll(.2);expect((await pose()).transform).toBe(early.transform);
 for(const id of ids)await visitScene(page,id);
 for(const node of cast)expect(await node.evaluate(n=>n.isConnected && n===document.querySelector(`.wayang-object[data-object="${CSS.escape(n.dataset.object)}"]`))).toBe(true);
 expect(await objects.evaluateAll(nodes=>nodes.map(n=>n.dataset.object))).toEqual(names);
 await visitScene(page,'menfess');const puppet=arjuna.locator('img'),fixedPose=await arjuna.evaluate(n=>n.style.transform),idlePose=await puppet.evaluate(n=>getComputedStyle(n).transform);
 await expect.poll(()=>puppet.evaluate(n=>getComputedStyle(n).transform),{timeout:2500}).not.toBe(idlePose);expect(await arjuna.evaluate(n=>n.style.transform)).toBe(fixedPose);
 await visitScene(page,'beranda');
});

test('the header logo stays visible and upright while the cover logo fades between scenes on desktop and phone',async({page})=>{
 test.setTimeout(60000);
 for(const [width,height] of [[1440,900],[390,844]]){
  await page.setViewportSize({width,height});await page.goto('/');await expect(page.locator('.festival-immersive')).toBeVisible();await page.evaluate(()=>document.fonts.ready);
  const logo=page.locator('.wayang-object[data-object="logo-68"]');await expect(logo).toHaveCount(1);await logo.locator('img').evaluate(image=>image.decode().catch(()=>{}));
  for(const progress of [0,.2,.5,.8,1,7.42,8,9]){
   await page.evaluate(progress=>{const journey=document.querySelector('.festival-immersive'),start=journey.getBoundingClientRect().top+scrollY,step=Math.max(600,Math.round(innerHeight*1.08));scrollTo({top:start+progress*step,behavior:'instant'});},progress);
   await page.waitForTimeout(100);await expectLogos(page,progress===0?1:progress>=1?0:undefined);
   expect(await page.evaluate(()=>Boolean(document.elementFromPoint(innerWidth/2,40)?.closest('.header')))).toBe(true);
  }
 }
});

test('Harewos input survives scene changes and poster dialogs stay above the moving cast',async({page})=>{
 await page.setViewportSize({width:1440,height:900});await page.goto('/');await expect(page.locator('.festival-immersive')).toBeVisible();
 await visitScene(page,'menfess');const input=page.getByLabel('Tulis Harewos kamu');await input.fill('Cerita saya tetap ada saat berganti bagian.');await visitScene(page,'lokasi');await visitScene(page,'menfess');await expect(input).toHaveValue('Cerita saya tetap ada saat berganti bagian.');await expect(input).toHaveCSS('transform','none');
 await visitScene(page,'rangkaian');await page.getByRole('button',{name:'Perbesar poster lomba online'}).click();const dialog=page.getByRole('dialog');await expect(dialog).toBeVisible();
 const before=await page.locator('.wayang-object[data-object="logo-68"]').evaluate(n=>getComputedStyle(n).transform);
 expect(await dialog.evaluate(n=>{const r=n.getBoundingClientRect();return n.contains(document.elementFromPoint(r.left+r.width/2,r.top+Math.min(30,r.height/2)));})).toBe(true);
 await page.mouse.wheel(0,200);await page.waitForTimeout(120);expect(await page.locator('.wayang-object[data-object="logo-68"]').evaluate(n=>getComputedStyle(n).transform)).toBe(before);
 await page.keyboard.press('Escape');await expect(dialog).toHaveCount(0);await expect(page.locator('.festival-immersive')).toHaveAttribute('data-current-scene','rangkaian');
});
test('opening a poster during navigation pauses and resumes the object transition',async({page})=>{
 await page.setViewportSize({width:1440,height:900});await page.goto('/');await visitScene(page,'rangkaian');const journey=page.locator('.festival-immersive');
 // Activate both handlers in one browser task: normal Playwright clicks can
 // wait for the navigation animation before returning control to the test.
 const motion=await page.evaluate(()=>{const home=[...document.querySelectorAll('.journey-rail button')].find(n=>n.getAttribute('aria-label')==='Beranda');home.click();const motion=document.querySelector('.festival-immersive').dataset.motion;document.querySelector('#rangkaian .poster-preview').click();return motion;});expect(motion).toBe('transitioning');await expect(page.getByRole('dialog')).toBeVisible();
 await page.waitForTimeout(80);const logo=page.locator('.wayang-object[data-object="logo-68"]'),paused=await logo.evaluate(n=>getComputedStyle(n).transform);
 await page.waitForTimeout(1250);expect(await logo.evaluate(n=>getComputedStyle(n).transform)).toBe(paused);
 await page.keyboard.press('Escape');await expect(page.getByRole('dialog')).toHaveCount(0);await expect(journey).toHaveAttribute('data-motion','transitioning');
 await expect(journey).toHaveAttribute('data-motion','idle');await expect(journey).toHaveAttribute('data-current-scene','beranda');await expect(page.locator('#festival-title')).toBeVisible();
});

test('overflow fades only the content edges that have more to read, then clears for reduced motion',async({page})=>{
 await page.setViewportSize({width:1440,height:900});await page.goto('/');await visitScene(page,'beranda');
 const hero=page.locator('.scene-beranda .scene-scroll');expect(await hero.evaluate(n=>n.scrollHeight-n.clientHeight)).toBeLessThanOrEqual(2);await expect(hero).toHaveCSS('mask-image','none');
 await page.setViewportSize({width:390,height:844});await visitScene(page,'cinderamata');const scroller=page.locator('.scene-cinderamata .scene-scroll');expect(await scroller.evaluate(n=>n.scrollHeight-n.clientHeight)).toBeGreaterThan(60);
 await expect(scroller).toHaveCSS('scrollbar-width','none');await expect(scroller).toHaveCSS('overflow-y','auto');expect(await scroller.evaluate(n=>getComputedStyle(n,'::-webkit-scrollbar').display)).toBe('none');
 const mask=()=>scroller.evaluate(n=>n.style.maskImage),black='(?:rgb\\(0,\\s*0,\\s*0\\)|#000)';
 await scroller.evaluate(n=>n.scrollTo({top:0,behavior:'instant'}));await expect.poll(mask).toMatch(new RegExp('transparent,\\s*'+black+'\\s+0px'));expect(await mask()).toMatch(/calc\(100% - 24px\)/);
 const start=await scroller.evaluate(n=>n.scrollTop);await scroller.hover();await page.mouse.wheel(0,80);await expect.poll(()=>scroller.evaluate(n=>n.scrollTop)).toBeGreaterThan(start);
 await scroller.evaluate(n=>n.scrollTo({top:(n.scrollHeight-n.clientHeight)/2,behavior:'instant'}));await expect.poll(mask).toMatch(new RegExp('transparent,\\s*'+black+'\\s+24px'));expect(await mask()).toMatch(/calc\(100% - 24px\)/);
 await scroller.evaluate(n=>n.scrollTo({top:n.scrollHeight,behavior:'instant'}));await expect.poll(mask).not.toMatch(/calc\(100% - 24px\)/);expect(await mask()).toMatch(new RegExp('transparent,\\s*'+black+'\\s+24px'));
 await page.emulateMedia({reducedMotion:'reduce'});await expect(page.locator('.festival-immersive')).toHaveCount(0);await expect(scroller).toHaveCSS('mask-image','none');expect(await scroller.evaluate(n=>n.style.maskImage || n.style.webkitMaskImage)).toBe('');
});

test('header anchors and deep links open the right scene; reduced motion keeps the full document',async({page})=>{
 await page.goto('/#undian');await expect(page.locator('.festival-immersive')).toHaveAttribute('data-current-scene','undian');await expect(page.locator('#undian .raffle-ticket')).toBeVisible();
 await visitScene(page,'lokasi');await page.setViewportSize({width:390,height:844});await expect(page.locator('.festival-immersive')).toHaveAttribute('data-current-scene','lokasi');await page.setViewportSize({width:1440,height:900});await expect(page.locator('.festival-immersive')).toHaveAttribute('data-current-scene','lokasi');
 await page.locator('.nav-links a[href="#menfess"]').click();await expect(page.locator('.festival-immersive')).toHaveAttribute('data-current-scene','menfess');await expect(page.getByLabel('Tulis Harewos kamu')).toBeVisible();
 await page.emulateMedia({reducedMotion:'reduce'});await expect(page.locator('.festival-immersive')).toHaveCount(0);await expect(page.getByRole('navigation',{name:'Bagian perayaan'})).toHaveCount(0);
 await expect(page.locator('.wayang-theatre')).toBeHidden();await expect(page.locator('.wayang-logo')).toBeHidden();await expect(page.locator('.header .brand img')).toBeVisible();
 for(const name of ['wayang-arjuna','wayang-semar'])await expect(page.locator(`.wayang-object[data-object="${name}"] img`)).toHaveCSS('animation-name','none');
 for(const id of ids)await expect(page.locator('#'+id)).toBeVisible();await page.locator('.footer a[href="#beranda"]').click();await expect(page.locator('#festival-title')).toBeInViewport();
});

test('deep links keep the stage fixed and dress cards readable without horizontal scrolling',async({page})=>{
 test.setTimeout(60000);
 for(const [width,height] of [[1440,900],[1280,800],[1024,768],[768,900],[390,844],[320,667]]){
  await page.setViewportSize({width,height});await page.goto('/#dress-code');
  await expect(page.locator('.festival-immersive')).toHaveAttribute('data-current-scene','dress-code');await page.evaluate(()=>document.fonts.ready);
  const layout=await page.locator('.scene-dress-code').evaluate(frame=>{
   const scroller=frame.querySelector('.scene-scroll'),box=scroller.getBoundingClientRect();
   return {stageScroll:document.querySelector('.festival-stage').scrollTop,top:box.top,headerBottom:document.querySelector('.header').getBoundingClientRect().bottom,overflow:scroller.scrollWidth-scroller.clientWidth,
    cards:[...frame.querySelectorAll('.dress-card')].map(n=>{const r=n.getBoundingClientRect();return {width:r.width,left:r.left,right:r.right};}),left:box.left,right:box.right};
  });
  expect(layout.stageScroll).toBe(0);expect(layout.top).toBeGreaterThanOrEqual(layout.headerBottom);expect(layout.overflow).toBeLessThanOrEqual(1);expect(layout.cards).toHaveLength(2);
  for(const card of layout.cards){expect(card.width).toBeGreaterThan(110);expect(card.left).toBeGreaterThanOrEqual(layout.left);expect(card.right).toBeLessThanOrEqual(layout.right);}
  const caption=page.locator('.scene-dress-code .dress-card:last-child figcaption');await caption.scrollIntoViewIfNeeded();
  expect(await caption.evaluate(n=>{const r=n.getBoundingClientRect(),s=n.closest('.scene-scroll').getBoundingClientRect();return r.top>=s.top-1 && r.bottom<=s.bottom+1;})).toBe(true);
  await page.evaluate(()=>{location.hash='beranda';});await expect(page.locator('.festival-immersive')).toHaveAttribute('data-current-scene','beranda');
  expect(await page.locator('.hero-wordmark').evaluate(n=>n.getBoundingClientRect().top>=document.querySelector('.header').getBoundingClientRect().bottom)).toBe(true);
  expect(await page.locator('.festival-stage').evaluate(n=>n.scrollTop)).toBe(0);
 }
});
