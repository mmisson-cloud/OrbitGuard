'use strict';
const $=id=>document.getElementById(id);let result=null, playback=null, tick=0;
const C=1800,A=.06,SIGMA=5.670374419e-8,TS=3,dt=10,limit=40;
const fmt=n=>Number.isFinite(n)?n.toFixed(1):'—';
const settings=()=>({heat:Number($('heat').value), warning:Number($('warning').value), landing:$('preset').value==='early'?35:40,dustMinutes:30});
// Single-node explicit Euler integration. Temperature is in kelvin within Stefan–Boltzmann law.
function simulate(s,pre){let T=35,open=false,exp=0,peak=-Infinity,trace=[],events=[];const dustStart=s.landing,dustEnd=dustStart+s.dustMinutes,end=100,warningAt=Math.max(0,dustStart-s.warning);
 for(let k=0;k<=end*60/dt;k++){let t=k*dt/60,dust=t>=dustStart&&t<dustEnd;
  if(pre&&t>=warningAt&&t<dustStart){open=true} else if(t>=dustStart&&t<dustEnd){if(T>=36)open=true;else if(T<=34)open=false} else {if(T>=36)open=true;else if(T<=34)open=false}
  // Baseline only opens in response to the same thermal override, never solely due to warning.
  const e=open?.8:.18,tk=T+273.15,rad=e*SIGMA*A*(Math.pow(tk,4)-Math.pow(TS,4));
  if(dust&&open)exp+=dt/60;
  trace.push({t,T,open,dust,rad});peak=Math.max(peak,T);
  if(k<end*60/dt)T+=(s.heat-rad)*dt/C;
 }
 return {trace,exp,peak,landing:s.landing,warningAt,dustEnd};}
function makePaths(){let s=settings();let pre=simulate(s,true),base=simulate(s,false);result={s,pre,base};let p=i=>{let tr=i.trace;return tr.filter((_,n)=>n%6===0||n===tr.length-1).map((x,j)=>`${j?'L':'M'}${(45+x.t*6.28).toFixed(1)} ${(205-(x.T-15)*3.3).toFixed(1)}`).join(' ')};
 $('preLine').setAttribute('d',p(pre));$('baseLine').setAttribute('d',p(base));$('limitLine').setAttribute('d',`M45 ${205-(limit-15)*3.3} H673`);
 $('gridLines').innerHTML=[20,30,40,50,60].map(t=>`<path class="gridline" d="M45 ${205-(t-15)*3.3} H675"/><text x="12" y="${209-(t-15)*3.3}">${t}</text>`).join('') + [0,20,40,60,80,100].map(t=>`<text x="${40+t*6.28}" y="223">${t}</text>`).join('');
 let red=base.exp>0?100*(1-pre.exp/base.exp):null;
 $('exposurePre').textContent=fmt(pre.exp)+'m';$('exposureBase').textContent=fmt(base.exp)+'m';$('exposureSave').textContent=red===null?'N/A':fmt(red)+'%';
 $('comparisonNote').textContent=`Peak temperatures: Pre-Cool ${fmt(pre.peak)}°C; reactive ${fmt(base.peak)}°C. ${pre.peak>limit?'Pre-Cool crosses the illustrative 40°C limit in this scenario.':'Pre-Cool remains below the illustrative 40°C limit.'} These are simulated values, not experimental measurements.`;
 $('advisory').textContent=pre.peak>limit?'⚠️ Thermal warning: Pre-Cool exceeds the demo temperature limit. Try a lower heat load or earlier warning.':`✓ Predicted thermal limit respected. Pre-Cool reduces open-cover dust exposure by ${red===null?'an undefined amount':fmt(red)+'%'} in this simulation.`;
 seek(tick);
}
function seek(i){if(!result)return;tick=Math.min(100,Math.max(0,i));let x=result.pre.trace[Math.min(result.pre.trace.length-1,Math.round(tick*6))];$('currentTemp').textContent=fmt(x.T)+'°C';$('coverState').textContent=x.open?'OPEN':'CLOSED';$('coverState').style.color=x.open?'var(--amber)':'var(--mint)';$('clock').textContent=`${Math.floor(tick)}:00`;$('scrub').value=tick;$('scene').classList.toggle('dust',x.dust);$('flap').setAttribute('transform',x.open?'translate(0 -25) rotate(-12 60 40)':'');}
function stop(){clearInterval(playback);playback=null;$('start').textContent='▶ Play mission';}
$('start').onclick=()=>{if(playback){stop();return}if(tick>=100)seek(0);$('start').textContent='Ⅱ Pause';playback=setInterval(()=>{seek(tick+1);if(tick>=100)stop()},110)};
$('reset').onclick=()=>{stop();seek(0)};$('scrub').oninput=e=>{stop();seek(+e.target.value)};
function speak(text){if(!('speechSynthesis' in window)){alert('Speech playback unavailable in this browser');return;}speechSynthesis.cancel();let u=new SpeechSynthesisUtterance(text);u.rate=.96;speechSynthesis.speak(u)}
$('narrate').onclick=()=>{if(!result)return;let {pre,base}=result;speak(`OrbitGuard Pre Cool report. Predicted maximum temperature ${fmt(pre.peak)} degrees Celsius. Cover open during dust for ${fmt(pre.exp)} minutes, versus ${fmt(base.exp)} minutes with the reactive controller. All results are simulated.`)};
for(const id of ['heat','warning']){$(id).oninput=()=>{$('heatLabel').textContent=$('heat').value+' W';$('warningLabel').textContent=$('warning').value+' min';stop();makePaths()}}
$('preset').onchange=()=>{const v=$('preset').value;const values={nominal:[18,10],early:[18,10],high:[30,10],late:[18,2]}[v];$('heat').value=values[0];$('warning').value=values[1];$('heatLabel').textContent=values[0]+' W';$('warningLabel').textContent=values[1]+' min';stop();makePaths();};
$('export').onclick=()=>{let r=result;let rows=['minute,precool_temperature_C,reactive_temperature_C,precool_cover_open,reactive_cover_open,dust_active,heat_input_W'];for(let i=0;i<r.pre.trace.length;i+=6){let a=r.pre.trace[i],b=r.base.trace[i];rows.push([a.t.toFixed(2),a.T.toFixed(3),b.T.toFixed(3),a.open?1:0,b.open?1:0,a.dust?1:0,r.s.heat].join(','))}download('OrbitGuard_simulation.csv',rows.join('\n'),'text/csv')};
function download(name,content,type){let url=URL.createObjectURL(new Blob([content],{type})),a=document.createElement('a');a.href=url;a.download=name;a.click();setTimeout(()=>URL.revokeObjectURL(url),3000)}
$('share').onclick=async()=>{let txt=`OrbitGuard Pre-Cool simulation: ${fmt(result.pre.exp)} minutes radiator open during dust vs ${fmt(result.base.exp)} min reactive. Peak simulated temperature ${fmt(result.pre.peak)}°C. Educational model only.`;if(navigator.share){try{await navigator.share({title:'OrbitGuard mission result',text:txt})}catch(e){}}else if(navigator.clipboard){await navigator.clipboard.writeText(txt);alert('Summary copied')}else alert(txt)};
for(const b of document.querySelectorAll('.nav button'))b.addEventListener('click',()=>{let page=b.dataset.page;document.querySelectorAll('.screen').forEach(s=>s.classList.toggle('active',s.id===page));document.querySelectorAll('.nav button').forEach(x=>x.setAttribute('aria-selected',x===b?'true':'false'));window.scrollTo(0,0);});
// Offline image sampling; intentional no cloud upload.
$('photo').onchange=e=>{let f=e.target.files&&e.target.files[0];if(!f)return;let img=new Image(),url=URL.createObjectURL(f);img.onload=()=>{const can=$('photoCanvas'),ctx=can.getContext('2d',{willReadFrequently:true}),scale=Math.min(1,800/Math.max(img.width,img.height));can.width=Math.round(img.width*scale);can.height=Math.round(img.height*scale);ctx.drawImage(img,0,0,can.width,can.height);can.style.display='block';$('scanPlaceholder').style.display='none';URL.revokeObjectURL(url)};img.src=url};
$('photoCanvas').onclick=e=>{let c=e.currentTarget,rect=c.getBoundingClientRect(),x=Math.max(0,Math.min(c.width-1,Math.floor((e.clientX-rect.left)/rect.width*c.width))),y=Math.max(0,Math.min(c.height-1,Math.floor((e.clientY-rect.top)/rect.height*c.height))),d=c.getContext('2d').getImageData(x,y,1,1).data,hex='#'+[...d].slice(0,3).map(v=>v.toString(16).padStart(2,'0')).join('').toUpperCase();$('colorHex').textContent=hex;$('colorRgb').textContent=`${d[0]},${d[1]},${d[2]}`;$('colorSwatch').style.background=hex;};
$('saveNote').onclick=()=>{let notes=JSON.parse(localStorage.getItem('orbitguard_notes')||'[]');notes.push({at:new Date().toISOString(),component:$('component').value,note:$('note').value});localStorage.setItem('orbitguard_notes',JSON.stringify(notes));$('noteStatus').textContent='Observation saved locally on this device ('+notes.length+' total).';};
function timing(){let vals=['delay','close','dustLead','margin'].map(x=>Number($(x).value));if(vals.some(x=>!Number.isFinite(x)||x<0)){$('timingResult').textContent='Enter valid nonnegative values.';return}let rem=vals[2]-vals[0]-vals[1]-vals[3];$('timingResult').textContent=rem>=0?`✓ Cover should close with ${fmt(rem)} seconds of remaining margin under your assumptions.`:`⚠️ Cover would be late by ${fmt(-rem)} seconds. Improve the warning or closing time.`;}
for(const id of ['delay','close','dustLead','margin'])$(id).oninput=timing;
$('saveMeasurements').onclick=()=>{let a=$('tBefore').value,b=$('tAfter').value;if(a===''||b===''||!Number.isFinite(+a)||!Number.isFinite(+b)){$('measurementResult').textContent='Enter two measured temperatures first.';return}let m={before:+a,after:+b,recorded:new Date().toISOString()};localStorage.setItem('orbitguard_measurements',JSON.stringify(m));$('measurementResult').textContent=`Saved real tabletop reading: ${fmt(+a)}°C to ${fmt(+b)}°C (difference ${fmt(+b- +a)}°C). Not a vacuum model validation.`};
$('installHelp').onclick=()=>{$('installation').style.display=$('installation').style.display==='none'?'block':'none'};
let m=localStorage.getItem('orbitguard_measurements');if(m){try{let v=JSON.parse(m);$('tBefore').value=v.before;$('tAfter').value=v.after;$('measurementResult').textContent=`Saved reading: ${v.before}°C → ${v.after}°C (${v.recorded.slice(0,10)})`}catch(e){}}
if('serviceWorker' in navigator&&location.protocol.startsWith('http'))window.addEventListener('load',()=>navigator.serviceWorker.register('./sw.js').catch(()=>{}));timing();makePaths();
