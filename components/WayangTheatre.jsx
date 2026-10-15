'use client';
import artwork from '@/public/assets/kasundaan/manifest.json';

const assets=Object.fromEntries(artwork.assets.map(asset=>[asset.name,asset]));
// Each pose is [x, foot-y, height, depth, turn-y, tilt-z, opacity].
// Positions share a viewport coordinate system; the same source cutouts stay mounted.
const cast=[
 {name:'gunungan-blue',poses:[
  [.27,.86,.72,-180,0,0,.28],[.04,.91,.58,-220,28,-8,.21],[.94,.92,.62,-230,-25,7,.24],[.05,.94,.64,-170,30,-10,.21],[.94,.93,.69,-220,-30,8,.25],
  [.05,.92,.56,-180,22,-7,.24],[.95,.94,.68,-230,-20,9,.24],[.05,.93,.61,-180,28,-8,.23],[.94,.94,.67,-210,-27,6,.24],[.51,.93,.83,-220,0,0,.14]],
  mobile:[[.56,.84,.36,-100,0,0,.22]]},
 {name:'wayang-arjuna'},
 {name:'wayang-semar'},
 {name:'logo-68'},
 {name:'cloud-red',poses:[
  [.15,.28,.105,60,8,-8,.9],[.08,.23,.09,80,18,-5,.75],[.91,.25,.10,50,-16,6,.75],[.08,.27,.09,75,20,-6,.8],[.90,.24,.10,50,-18,6,.8],
  [.10,.22,.09,75,18,-5,.8],[.90,.26,.10,50,-16,6,.8],[.08,.24,.09,80,18,-5,.75],[.90,.26,.10,55,-18,6,.8],[.10,.23,.09,50,12,-7,.9]],
  mobile:[[.82,.59,.055,15,-8,0,.7]]},
 {name:'cloud-red-wide',poses:[
  [.025,.96,.075,70,-10,3,1],[.84,.99,.08,130,-16,3,.9],[.17,.99,.08,110,16,-3,.9],[.84,.99,.08,140,-16,3,.9],[.17,.99,.08,110,16,-3,.9],
  [.84,.99,.08,130,-16,3,.9],[.17,.99,.08,110,16,-3,.9],[.84,.99,.08,140,-16,3,.9],[.17,.99,.08,110,16,-3,.9],[.84,.99,.08,100,-10,3,1]],
  mobile:[[-.04,.80,.04,15,-10,3,1]]},
 {name:'corner-top-left',poses:[
  [.035,.24,.17,80,15,0,.9],[.025,.23,.15,100,24,-3,.95],[.025,.23,.16,70,12,2,.9],[.025,.23,.15,90,24,-3,.95],[.025,.23,.16,70,14,2,.9],
  [.025,.23,.15,100,24,-3,.95],[.025,.23,.16,75,14,2,.9],[.025,.23,.15,90,24,-3,.95],[.025,.23,.16,70,14,2,.9],[.045,.26,.22,90,12,0,1]]},
 {name:'corner-top-right',poses:[
  [.965,.24,.17,80,-15,0,.9],[.975,.23,.15,100,-24,3,.95],[.975,.23,.16,70,-12,-2,.9],[.975,.23,.15,90,-24,3,.95],[.975,.23,.16,70,-14,-2,.9],
  [.975,.23,.15,100,-24,3,.95],[.975,.23,.16,75,-14,-2,.9],[.975,.23,.15,90,-24,3,.95],[.975,.23,.16,70,-14,-2,.9],[.955,.26,.22,90,-12,0,1]]},
];
const mix=(a,b,t)=>a+(b-a)*t;
function poseFor(actor,index,mobile,tablet,hero,height){
 const pose=[...actor.poses[index]];
 if(index!==0){
  if(actor.name==='gunungan-blue')pose[0]=pose[0]<.5 ? -.09 : 1.09;
  if(actor.name==='cloud-red'){pose[0]=pose[0]<.5 ? -.03 : 1.03;pose[1]=.18;pose[2]=.06;pose[3]=20;}
  if(tablet){
   if(actor.name==='cloud-red')pose[0]=pose[0]<.5 ? -.09 : 1.09;
   if(actor.name==='gunungan-blue')pose[0]=pose[0]<.5 ? -.20 : 1.20;
  }
 }
 if(!mobile)return pose;
 if(index===0 && actor.mobile){
  const opening=[...actor.mobile[0]];
  if(actor.name==='cloud-red'){
   const band=Math.max(0,hero.bottom-hero.top);
   opening[1]=(hero.top+Math.min(58,band*.4))/height;
   opening[2]=Math.min(.055,band*.2/height);opening[3]=0;
  }
  return opening;
 }
 if(index===9){
  pose[2]*=.58;pose[3]*=.45;
  if(actor.name==='gunungan-blue')pose[0]=1.20;
  return pose;
 }
 pose[0]=pose[0]<.5 ? -.055 : 1.055;
 pose[2]*=.62;pose[3]*=.45;
 if(actor.name==='gunungan-blue')pose[0]=pose[0]<.5 ? -.20 : 1.20;
 return pose;
}
// Hero artwork has three separate slots. Later chapters reserve side wings or a mobile shelf.
function figurePose(name,index,width,height,hero){
 const arjuna=name==='wayang-arjuna',logo=name==='logo-68',asset=assets[name],ratio=asset.width/asset.height;
 if(index===0 || logo){
  const span=hero.right-hero.left,band=hero.bottom-hero.top;
  const size=Math.max(1,Math.min(band*(arjuna ? .90 : logo ? .70 : .76),span*(arjuna ? .23 : logo ? .39 : .24)/ratio));
  return [hero.left+span*(arjuna ? .12 : logo ? .50 : .88),logo ? hero.top+band*.70 : hero.bottom,size,0];
 }
 if(width<=700)return [width*(arjuna ? .18+.035*(index%3) : .82-.035*((index+1)%3)),height-88,arjuna ? 96 : 76,arjuna ? -4 : 4];
 const wing=width>=1200 ? 74 : 58,size=wing/ratio;
 const level=(arjuna ? [.48,.72,.88,.53,.76,.89,.58,.80,.87] : [.80,.48,.66,.86,.55,.74,.44,.64,.83])[index-1];
 return [arjuna ? 18+wing/2 : width-18-wing/2,Math.max(hero.headerBottom+size+18,Math.min(height-102,height*level)),size,arjuna ? -4 : 4];
}
export function moveTheatre(objects,gate,from,to,t,width,height,hero){
 const mobile=width<=700,tablet=width>700 && width<=980,arc=Math.sin(Math.PI*t);
 cast.forEach((actor,index)=>{
  const node=objects[actor.name];if(!node)return;
  if(actor.name==='logo-68' || actor.name.startsWith('wayang-')){
   const a=figurePose(actor.name,from,width,height,hero),b=figurePose(actor.name,to,width,height,hero),p=a.map((v,i)=>mix(v,b[i],t));
   const logo=actor.name==='logo-68',half=p[2]*assets[actor.name].width/assets[actor.name].height/2;
   const x=Math.max(half+18,Math.min(width-half-18,p[0])),y=Math.max(p[2]+18,Math.min(height-18,p[1]));
   node.style.transform=`translate3d(${x.toFixed(2)}px,${y.toFixed(2)}px,0) translate(-50%,-100%) rotateY(${p[3].toFixed(2)}deg) scale(${(p[2]/200).toFixed(5)})`;
   const opacity=logo ? (from===0 ? 1-t : to===0 ? t : 0) : 1;
   node.style.opacity=String(opacity);node.style.visibility=opacity>.001 ? 'visible' : 'hidden';return;
  }
  const a=poseFor(actor,from,mobile,tablet,hero,height),b=poseFor(actor,to,mobile,tablet,hero,height),p=a.map((v,i)=>mix(v,b[i],t));
  // A shallow arc gives the cutouts a real shared 3D route, rather than a dissolve.
  const side=index%2 ? 1 : -1;
  const x=p[0]*width+side*arc*width*(mobile ? .025 : .045),y=p[1]*height-arc*height*.065;
  const depth=p[3]+arc*(mobile?35:80),turn=p[4]+side*arc*22;
  node.style.transform=`translate3d(${x.toFixed(2)}px,${y.toFixed(2)}px,${depth.toFixed(2)}px) translate(-50%,-100%) rotateY(${turn.toFixed(2)}deg) rotateZ(${p[5].toFixed(2)}deg) scale(${(p[2]*height/200).toFixed(5)})`;
  node.style.opacity=String(p[6]);
 });
 // The existing gunungan sweeps the seam between outgoing/incoming chapters.
 const cover=from===to ? 0 : Math.sin(Math.PI*t);
 // Render the SVG at stage size; normalized scaling keeps its vector lines crisp.
 gate.style.transform=`translate3d(${((1-t)*width).toFixed(2)}px,${(height*(1.06-.08*cover)).toFixed(2)}px,${(90*cover).toFixed(2)}px) translate(-50%,-100%) rotateY(${(-80+160*t).toFixed(2)}deg) rotateZ(${(-9+18*t).toFixed(2)}deg) scale(${(.08+.86*cover).toFixed(5)})`;
 gate.style.opacity=String(Math.min(1,cover*3));
 gate.style.visibility=cover>.002 ? 'visible' : 'hidden';
}
export default function WayangTheatre({objects,gate}){
 return <><div className="wayang-wings" aria-hidden="true"><div className="wayang-theatre" aria-hidden="true">
  <div className="wayang-kelir"/><div className="wayang-floor"/>
  {cast.filter(actor=>actor.name!=='logo-68').map(actor=>{const asset=assets[actor.name];return <div className="wayang-object" data-object={actor.name} key={actor.name} ref={node=>{objects.current[actor.name]=node;}}><img src={asset.src} width={asset.width} height={asset.height} alt="" decoding="async"/></div>;})}
 </div></div><div className="wayang-curtain" aria-hidden="true"><div className="wayang-gate" ref={gate}><img src={assets['gunungan-blue'].src} width={420} height={1000} alt="" decoding="async"/></div></div>
 </>;
}
export function WayangLogo({objects}){
 const asset=assets['logo-68'];
 return <div className="wayang-object wayang-logo" data-object="logo-68" aria-hidden="true" ref={node=>{objects.current['logo-68']=node;}}><img src={asset.src} width={asset.width} height={asset.height} alt="" decoding="async" fetchPriority="high"/></div>;
}
