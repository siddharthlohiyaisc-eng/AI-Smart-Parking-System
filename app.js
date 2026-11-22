'use strict';
const slides=[...document.querySelectorAll('.slide')],rail=document.getElementById('rail');let current=-1,wheelLock=0,helpOpen=false;
const nf=n=>String(n).padStart(2,'0');
slides.forEach((s,i)=>{const b=document.createElement('button');b.title=`${i+1}. ${s.dataset.name}`;b.setAttribute('aria-label',b.title);b.addEventListener('click',()=>go(i));rail.appendChild(b)});
function go(index){if(!Number.isFinite(index))return;index=Math.min(slides.length-1,Math.max(0,index));if(index===current)return;current=index;slides.forEach((s,i)=>{s.classList.toggle('active',i===index);s.setAttribute('aria-hidden',i!==index)});[...rail.children].forEach((b,i)=>b.classList.toggle('active',i===index));document.getElementById('slide-no').textContent=nf(index+1);document.getElementById('slide-title').textContent=slides[index].dataset.name.toUpperCase();document.getElementById('progress-fill').style.width=`${(index+1)/slides.length*100}%`;}
go(0);
document.querySelectorAll('[data-go]').forEach(x=>x.addEventListener('click',()=>go(+x.dataset.go)));
document.getElementById('next').addEventListener('click',()=>go(current+1));document.getElementById('prev').addEventListener('click',()=>go(current-1));
function showHelp(v){helpOpen=v;document.getElementById('help-modal').classList.toggle('show',v)}
document.querySelector('[data-help]').addEventListener('click',()=>showHelp(true));document.getElementById('close-help').addEventListener('click',()=>showHelp(false));document.getElementById('help-modal').addEventListener('click',e=>{if(e.target.id==='help-modal')showHelp(false)});
document.addEventListener('keydown',e=>{if(e.key==='Escape'){showHelp(false);return}if(e.key==='?'||e.key==='F1'){e.preventDefault();showHelp(!helpOpen);return}if(helpOpen)return;if(e.target.matches('input, textarea, select'))return;if(e.key==='f'||e.key==='F'){if(!document.fullscreenElement)document.documentElement.requestFullscreen?.().catch(()=>{});else document.exitFullscreen?.();return}if(['ArrowRight','PageDown',' '].includes(e.key)){e.preventDefault();go(current+1)}else if(['ArrowLeft','PageUp'].includes(e.key)){e.preventDefault();go(current-1)}else if(e.key==='Home'){e.preventDefault();go(0)}else if(e.key==='End'){e.preventDefault();go(slides.length-1)}else if(e.key==='4'){go(4)}});
document.addEventListener('wheel',e=>{if(helpOpen)return;const active=slides[current];if(window.innerWidth<780&&active.scrollHeight>active.clientHeight){const isAtBottom=active.scrollTop+active.clientHeight>=active.scrollHeight-6,isAtTop=active.scrollTop<=2;if((e.deltaY>0&&!isAtBottom)||(e.deltaY<0&&!isAtTop))return}const now=Date.now();if(Math.abs(e.deltaY)>14&&now-wheelLock>850){wheelLock=now;go(current+(e.deltaY>0?1:-1))}},{passive:true});
// Reactive custom cursor, cursor light, glow-on-hover, and lightly magnetic buttons.
const cursor=document.getElementById('cursor'),ring=document.getElementById('cursor-ring'),light=document.getElementById('cursor-light');let mx=-100,my=-100,rx=-100,ry=-100,lightx=-100,lighty=-100;
const pointerReady=matchMedia('(hover:hover) and (pointer:fine)').matches;
if(pointerReady){document.addEventListener('pointermove',e=>{mx=e.clientX;my=e.clientY;cursor.style.transform=`translate(${mx}px,${my}px) translate(-50%,-50%)`;const t=e.target.closest('.interactive, .slot, .wheel-seg, input, button');document.body.classList.toggle('is-hover',!!t)});document.addEventListener('pointerdown',()=>document.body.classList.add('is-down'));document.addEventListener('pointerup',()=>document.body.classList.remove('is-down'));function track(){rx+=(mx-rx)*.17;ry+=(my-ry)*.17;lightx+=(mx-lightx)*.075;lighty+=(my-lighty)*.075;ring.style.transform=`translate(${rx}px,${ry}px) translate(-50%,-50%)`;light.style.transform=`translate(${lightx}px,${lighty}px) translate(-50%,-50%)`;requestAnimationFrame(track)}requestAnimationFrame(track);
document.querySelectorAll('.interactive').forEach(el=>el.addEventListener('pointermove',e=>{const r=el.getBoundingClientRect();el.style.setProperty('--mx',`${(e.clientX-r.left)/r.width*100}%`);el.style.setProperty('--my',`${(e.clientY-r.top)/r.height*100}%`)}));document.querySelectorAll('.magnetic').forEach(el=>{el.addEventListener('pointermove',e=>{const r=el.getBoundingClientRect();const x=(e.clientX-r.left-r.width/2)*.12,y=(e.clientY-r.top-r.height/2)*.12;el.style.transform=`translate(${x}px,${y}px)`});el.addEventListener('pointerleave',()=>el.style.transform='')});document.querySelectorAll('.tilt').forEach(el=>{el.addEventListener('pointermove',e=>{const r=el.getBoundingClientRect(),x=(e.clientX-r.left)/r.width-.5,y=(e.clientY-r.top)/r.height-.5;el.style.transform=`perspective(900px) rotateY(${x*3.5}deg) rotateX(${-y*3.5}deg) translateY(-3px)`});el.addEventListener('pointerleave',()=>el.style.transform='')});}
// Live A* formula playground.
function updateFormula(){const g=+document.getElementById('g-slider').value,h=+document.getElementById('h-slider').value;document.getElementById('g-val').textContent=g;document.getElementById('h-val').textContent=h;document.getElementById('g-num').textContent=nf(g);document.getElementById('h-num').textContent=nf(h);document.getElementById('f-num').textContent=nf(g+h)}document.getElementById('g-slider').addEventListener('input',updateFormula);document.getElementById('h-slider').addEventListener('input',updateFormula);updateFormula();
// Actual grid / A* implementation. Each move costs 1, only cardinal moves, Manhattan heuristic.
// Real grid / A* implementation: four-way movement, unit costs, Manhattan heuristic.
const W=14,H=9,start={x:0,y:4},slotEntries=[['P1',2,1],['P2',5,1],['P3',8,1],['P4',11,1],['P5',2,7],['P6',5,7],['P7',8,7],['P8',11,7]],slotsMap=new Map(slotEntries.map(([id,x,y])=>[`${x},${y}`,id])),slotPoints=Object.fromEntries(slotEntries.map(([id,x,y])=>[id,{x,y}]));
const walls=new Set();for(let x=0;x<W;x++){walls.add(`${x},0`);walls.add(`${x},8`)}[0,3,6,9,12].forEach(x=>{walls.add(`${x},2`);walls.add(`${x},6`)});[[7,3],[6,5]].forEach(([x,y])=>walls.add(`${x},${y}`));walls.delete('0,4');
const presets={balanced:['P1','P3','P5','P7'],busy:['P1','P2','P3','P5','P6','P7'],quiet:['P1','P5']};
let occupied=new Set(presets.balanced),reserved=new Set(),currentPreset='balanced',expandedCells=new Set(),routeCells=new Set(),selectedSlot=null,runGeneration=0,running=false,routeTarget='auto',candidateScores=[];
const grid=document.getElementById('parking-grid'),status=document.getElementById('demo-status'),targetSelect=document.getElementById('target-select'),routeCar=document.getElementById('route-car');
const key=(x,y)=>`${x},${y}`;
// This always uses the actual map; Manhattan distance never replaces a shortest legal path.
function astar(goal,blockedSlotIds){
 const goalId=slotsMap.get(key(goal.x,goal.y));
 let open=[{x:start.x,y:start.y,g:0,h:Math.abs(start.x-goal.x)+Math.abs(start.y-goal.y)}],gscore=new Map([[key(start.x,start.y),0]]),prev=new Map(),closed=new Set(),trace=[];
 while(open.length){
  open.sort((a,b)=>(a.g+a.h)-(b.g+b.h)||a.h-b.h||a.y-b.y||a.x-b.x);
  const n=open.shift(),k=key(n.x,n.y);if(closed.has(k))continue;
  closed.add(k);trace.push(k);
  if(n.x===goal.x&&n.y===goal.y){const path=[k];let cur=k;while(prev.has(cur)){cur=prev.get(cur);path.push(cur)}path.reverse();return {path,cost:path.length-1,trace}}
  for(const [dx,dy] of [[1,0],[0,-1],[0,1],[-1,0]]){
   const nx=n.x+dx,ny=n.y+dy,nk=key(nx,ny);if(nx<0||nx>=W||ny<0||ny>=H||walls.has(nk)||closed.has(nk))continue;
   const other=slotsMap.get(nk);if(other&&other!==goalId)continue;
   if(other&&blockedSlotIds.has(other))continue;
   const nextg=n.g+1;if(nextg<(gscore.get(nk)??Infinity)){gscore.set(nk,nextg);prev.set(nk,k);open.push({x:nx,y:ny,g:nextg,h:Math.abs(nx-goal.x)+Math.abs(ny-goal.y)})}
  }
 }
 return null;
}
function bestCandidates(){return slotEntries.filter(([id])=>!occupied.has(id)).map(([id,x,y])=>{const sol=astar({x,y},occupied);return {id,...(sol||{cost:Infinity,unreachable:true})}}).sort((a,b)=>a.cost-b.cost||a.id.localeCompare(b.id))}
function fillTargets(){const old=routeTarget;targetSelect.replaceChildren();const opt=document.createElement('option');opt.value='auto';opt.textContent='AUTO · Nearest free slot';targetSelect.appendChild(opt);
 for(const [id] of slotEntries){const o=document.createElement('option');o.value=id;o.textContent=`${id} · ${occupied.has(id)?'Occupied':'Available'}`;o.disabled=occupied.has(id);targetSelect.appendChild(o)}
 if(old!=='auto'&&occupied.has(old))routeTarget='auto';targetSelect.value=routeTarget;
}
function updateCandidateBar(){const bar=document.getElementById('candidate-list');bar.replaceChildren();candidateScores=bestCandidates();const costs=new Map(candidateScores.map(x=>[x.id,x.cost]));
 for(const [id] of slotEntries){const blocked=occupied.has(id),cost=costs.get(id),b=document.createElement('button');b.className='candidate interactive';if(routeTarget===id)b.classList.add('pinned');b.disabled=blocked;b.dataset.target=id;
  b.innerHTML=`${id} <span class="cost">${blocked?'FULL':Number.isFinite(cost)?String(cost).padStart(2,'0'):'NO PATH'}</span>`;
  b.title=blocked?`${id} occupied: tap this bay on grid to make it available`:`Directly allocate a car to ${id} (${cost} moves)`;bar.appendChild(b)
 }
}
function updateHero(){document.querySelectorAll('.hero-lot .bay').forEach(el=>{const id=el.textContent.trim();el.classList.toggle('busy',occupied.has(id));el.classList.toggle('assigned',id===selectedSlot);el.title=`Explore ${id} in the live parking map`})}
function updateGrid(){const frag=document.createDocumentFragment();for(let y=0;y<H;y++)for(let x=0;x<W;x++){
 const k=key(x,y),slot=slotsMap.get(k),el=document.createElement(slot?'button':'div');el.className='cell';el.dataset.key=k;
 if(walls.has(k))el.classList.add('wall');else if(slot){el.classList.add('slot');if(occupied.has(slot))el.classList.add('occupied');el.dataset.slot=slot;el.setAttribute('aria-label',`${slot}: ${occupied.has(slot)?'occupied':'available'}; click to toggle`);el.title=`${slot}: click to ${occupied.has(slot)?'free':'occupy'}`;el.textContent=slot}
 else if(k===key(start.x,start.y)){el.classList.add('start');el.textContent='IN'}else el.classList.add('road');
 if(expandedCells.has(k)&&!slot&&!walls.has(k))el.classList.add('expanded');if(routeCells.has(k))el.classList.add('route');if(selectedSlot&&slot===selectedSlot)el.classList.add('target');frag.appendChild(el)
 }grid.replaceChildren(frag);
 document.getElementById('free-count').textContent=8-occupied.size;document.getElementById('allocated-count').textContent=reserved.size;
 document.querySelectorAll('[data-preset]').forEach(b=>b.classList.toggle('active',b.dataset.preset===currentPreset));
 fillTargets();updateCandidateBar();updateHero();
}
function clearRun(){runGeneration++;running=false;expandedCells.clear();routeCells.clear();selectedSlot=null;routeCar.classList.remove('on','arrived');
 document.getElementById('slot-result').textContent='—';document.getElementById('length-result').textContent='—';document.getElementById('visited-result').textContent='—';document.getElementById('find-route').textContent='▶ Find Parking';document.getElementById('find-route').disabled=false;
}
function setPreset(name){if(!presets[name])return;currentPreset=name;occupied=new Set(presets[name]);reserved.clear();routeTarget='auto';clearRun();status.textContent=`${name[0].toUpperCase()+name.slice(1)} scenario loaded. Try any target or find the nearest bay.`;updateGrid()}
document.querySelectorAll('[data-preset]').forEach(b=>b.addEventListener('click',()=>setPreset(b.dataset.preset)));
document.getElementById('reset-grid').addEventListener('click',()=>setPreset('balanced'));
targetSelect.addEventListener('change',()=>{routeTarget=targetSelect.value;clearRun();status.textContent=routeTarget==='auto'?'Automatic mode: A* will choose the closest free, reachable bay.':`${routeTarget} selected. Find Parking will calculate a real A* route to that bay.`;updateGrid()});
grid.addEventListener('click',e=>{const s=e.target.closest('[data-slot]');if(!s)return;const id=s.dataset.slot;
 if(e.shiftKey&&!occupied.has(id)){routeTarget=id;clearRun();updateGrid();void runParking();return}
 if(occupied.has(id)){occupied.delete(id);reserved.delete(id)}else{occupied.add(id);reserved.delete(id)}
 currentPreset='custom';if(routeTarget===id&&occupied.has(id))routeTarget='auto';clearRun();status.textContent=`${id} is now ${occupied.has(id)?'occupied':'available'}. Run A* to calculate a fresh route.`;updateGrid()
});
function sleep(ms){return new Promise(r=>setTimeout(r,ms))}
function carCenter(cellKey){const cell=grid.querySelector(`[data-key="${cellKey}"]`);if(!cell)return null;const r=cell.getBoundingClientRect();return {x:r.left+r.width/2,y:r.top+r.height/2}}
async function driveCar(path,token){if(window.matchMedia('(prefers-reduced-motion: reduce)').matches)return;const first=carCenter(path[0]);if(!first)return;
 routeCar.style.left=first.x+'px';routeCar.style.top=first.y+'px';routeCar.classList.add('on');
 for(const k of path){if(token!==runGeneration||current!==4){routeCar.classList.remove('on');return}const xy=carCenter(k);if(xy){routeCar.style.left=xy.x+'px';routeCar.style.top=xy.y+'px'}await sleep(78)}routeCar.classList.add('arrived');await sleep(300);routeCar.classList.remove('on','arrived')
}
async function runParking(options={}){
 if(running)return;
 // Run again means another car. The previous car's space remains occupied.
 clearRun();const token=runGeneration;const requested=options.forcedId||routeTarget;
 const free=slotEntries.filter(([id])=>!occupied.has(id));if(!free.length){status.textContent='All bays are full. Free a red slot or Reset the lot.';updateGrid();return}
 if(requested!=='auto'&&occupied.has(requested)){routeTarget='auto';status.textContent=`${requested} is occupied. Choose another free bay.`;updateGrid();return}
 const choices=bestCandidates();const best=requested==='auto'?choices.find(x=>Number.isFinite(x.cost)):choices.find(x=>x.id===requested&&Number.isFinite(x.cost));
 if(!best){status.textContent=requested==='auto'?'No reachable free parking bays on this map.':'That bay has no legal path. Try another available bay.';updateGrid();return}
 running=true;document.getElementById('find-route').disabled=true;document.getElementById('find-route').textContent='Searching…';status.textContent=`A* exploring the road network toward ${best.id}…`;
 document.getElementById('sys-hud').textContent='● A* SEARCHING';
 document.getElementById('slot-result').textContent=best.id;document.getElementById('length-result').textContent=`${best.cost} moves`;document.getElementById('visited-result').textContent=`${best.trace.length} cells`;
 for(const k of best.trace){if(token!==runGeneration)return;expandedCells.add(k);updateGrid();await sleep(14)}
 status.textContent=`Shortest legal route to ${best.id}: ${best.cost} moves. Following the path…`;
 for(const k of best.path){if(token!==runGeneration)return;routeCells.add(k);updateGrid();await sleep(53)}
 if(token!==runGeneration)return;
 selectedSlot=best.id;occupied.add(best.id);reserved.add(best.id);currentPreset='custom';routeTarget='auto';updateGrid();
 status.textContent=`✓ Car ${reserved.size} parked in ${best.id} · ${best.cost} moves. Click Find Parking again for the next car!`;
 document.getElementById('find-route').textContent='▶ Park Next Car';document.getElementById('find-route').disabled=false;
 document.getElementById('sys-hud').textContent='● SPACE ALLOCATED';running=false;
 void driveCar(best.path,token);
}
document.getElementById('find-route').addEventListener('click',()=>runParking());
document.getElementById('candidate-list').addEventListener('click',e=>{const b=e.target.closest('[data-target]');if(!b||b.disabled)return;routeTarget=b.dataset.target;clearRun();updateGrid();void runParking({forcedId:b.dataset.target})});
updateGrid();
// Clickable four-quadrant decision-wheel.
const wheelSteps=[['Scan the environment','The system reads its simulated map and distinguishes roads, walls, available bays and occupied bays.'],['Run informed search','For each available destination, A* explores accessible road cells while estimating remaining distance using Manhattan distance.'],['Compare route costs','The system compares the resulting shortest path lengths and chooses the reachable parking slot with the smallest travel cost.'],['Allocate and visualize','The chosen bay is highlighted and the legal route from the entrance is displayed; the user can change occupancy and recalculate.']];let wheelIndex=0;function setWheel(i){wheelIndex=i;document.getElementById('wheel-number').textContent=nf(i+1);document.getElementById('wheel-id').textContent=`STEP ${nf(i+1)} / 04`;document.getElementById('wheel-title').textContent=wheelSteps[i][0];document.getElementById('wheel-copy').textContent=wheelSteps[i][1];document.querySelectorAll('.wheel-seg').forEach(el=>el.classList.toggle('selected',+el.dataset.step===i));document.querySelectorAll('#wheel-pager button').forEach(el=>el.classList.toggle('on',+el.dataset.step===i))}document.querySelectorAll('[data-step]').forEach(el=>{el.addEventListener('click',()=>setWheel(+el.dataset.step));el.addEventListener('keydown',e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();setWheel(+el.dataset.step)}})});
// Interactive mini-quiz.
const questions=[{q:'What does A* calculate in our parking project?',choices:['The shortest available route','A car’s registration number','The parking payment amount','The speed of the internet'],answer:0,why:'A* finds a shortest legal route in our unweighted grid.'},{q:'In f(n) = g(n) + h(n), what is h(n)?',choices:['Number of occupied spaces','Estimated remaining cost','The amount of parking fees','Number of drivers'],answer:1,why:'h(n) estimates how far the target is; this demo uses Manhattan distance.'},{q:'What happens when a parking slot is occupied?',choices:['It becomes the preferred target','The algorithm stops permanently','It is excluded as a destination','Every road is blocked'],answer:2,why:'Occupied slots cannot be chosen as destinations.'}];let quizAt=0,score=0,answered=false;
function renderQuiz(){const q=questions[quizAt];document.getElementById('quiz-count').textContent=`QUESTION ${nf(quizAt+1)} / ${nf(questions.length)}`;document.getElementById('quiz-prompt').textContent=q.q;document.getElementById('quiz-feedback').textContent='Select one option to continue.';document.getElementById('quiz-next').hidden=true;document.getElementById('quiz-restart').hidden=true;answered=false;const root=document.getElementById('quiz-options');root.replaceChildren();q.choices.forEach((s,i)=>{const b=document.createElement('button');b.className='quiz-choice interactive';b.innerHTML=`<span class="letter">${'ABCD'[i]}</span><span></span>`;b.lastElementChild.textContent=s;b.addEventListener('click',()=>answerQuiz(i));root.appendChild(b)});[...document.getElementById('quiz-progress').children].forEach((p,i)=>p.classList.toggle('complete',i<quizAt))}
function answerQuiz(i){if(answered)return;answered=true;const q=questions[quizAt],right=i===q.answer;if(right)score++;[...document.querySelectorAll('.quiz-choice')].forEach((b,idx)=>{b.disabled=true;if(idx===q.answer)b.classList.add('correct');else if(idx===i)b.classList.add('wrong')});document.getElementById('quiz-feedback').textContent=`${right?'✓ Correct.':'Not quite.'} ${q.why}`;document.querySelectorAll('#quiz-progress div')[quizAt].classList.add('complete');document.getElementById('quiz-next').hidden=false;document.getElementById('quiz-next').textContent=quizAt===questions.length-1?'Show results →':'Next question →'}
document.getElementById('quiz-next').addEventListener('click',()=>{if(quizAt<questions.length-1){quizAt++;renderQuiz()}else{document.getElementById('quiz-count').textContent='QUIZ COMPLETE';document.getElementById('quiz-prompt').textContent=`${score} / ${questions.length} correct.`;document.getElementById('quiz-options').replaceChildren();document.getElementById('quiz-feedback').textContent='You have explored the basics of our project’s A* search algorithm.';document.getElementById('quiz-next').hidden=true;document.getElementById('quiz-restart').hidden=false}});document.getElementById('quiz-restart').addEventListener('click',()=>{quizAt=0;score=0;renderQuiz()});renderQuiz();

// Version 2: interactive website shell and cursor-reactive particle field.
const prefersReduced=window.matchMedia('(prefers-reduced-motion: reduce)').matches;
let fxOn=!prefersReduced,menuOpen=false,toastTimer=0;
const fxCanvas=document.getElementById('ambient-pixels'),fxCtx=fxCanvas.getContext('2d',{alpha:true});
const particles=[],trails=[],bursts=[];let cw=0,ch=0,dpr=1,lastSparkX=-100,lastSparkY=-100,frame=0;
function toast(msg){const el=document.getElementById('fx-toast');el.textContent=msg;el.classList.add('show');clearTimeout(toastTimer);toastTimer=setTimeout(()=>el.classList.remove('show'),1800)}
function resizeFX(){cw=window.innerWidth;ch=window.innerHeight;dpr=Math.min(window.devicePixelRatio||1,1.5);fxCanvas.width=Math.round(cw*dpr);fxCanvas.height=Math.round(ch*dpr);fxCtx.setTransform(dpr,0,0,dpr,0,0);particles.length=0;
 const count=Math.min(115,Math.max(52,Math.floor(cw*ch/13500)));for(let i=0;i<count;i++){const x=Math.random()*cw,y=Math.random()*ch;particles.push({x,y,hx:x,hy:y,vx:0,vy:0,size:Math.random()*1.3+1.1,p:i*.45})}}
resizeFX();window.addEventListener('resize',resizeFX,{passive:true});
function pixelBurst(x,y,count=23){if(!fxOn||prefersReduced||!pointerReady)return;for(let i=0;i<count;i++){const a=Math.random()*Math.PI*2,sp=1+Math.random()*4.8;bursts.push({x,y,vx:Math.cos(a)*sp,vy:Math.sin(a)*sp,life:1,size:Math.random()*2.4+1.3})}}
if(pointerReady){document.addEventListener('pointermove',e=>{
 if(!fxOn)return;const dist=Math.hypot(e.clientX-lastSparkX,e.clientY-lastSparkY);
 if(dist>10){lastSparkX=e.clientX;lastSparkY=e.clientY;trails.push({x:e.clientX,y:e.clientY,vx:(Math.random()-.5)*1.3,vy:(Math.random()-.5)*1.3,life:1,size:Math.random()*2+1});if(trails.length>42)trails.shift()}
 const active=slides[current];if(active){active.style.setProperty('--bgx',`${(e.clientX/cw-.5)*16}px`);active.style.setProperty('--bgy',`${(e.clientY/ch-.5)*12}px`)}
 if(current===0){const h=document.querySelector('.hero-visual');h.style.setProperty('--hero-x',`${(e.clientX/cw-.5)*14}px`);h.style.setProperty('--hero-y',`${(e.clientY/ch-.5)*11}px`)}
 },{passive:true});document.addEventListener('pointerdown',e=>{if(e.button===0)pixelBurst(e.clientX,e.clientY,15)})}
function animatePixels(){requestAnimationFrame(animatePixels);if(!fxOn||prefersReduced){fxCtx.clearRect(0,0,cw,ch);return}
 frame++;fxCtx.clearRect(0,0,cw,ch);const closeMouse=pointerReady&&mx>=0;
 for(const p of particles){const distance=closeMouse?Math.hypot(mx-p.x,my-p.y):Infinity;const influence=Math.max(0,1-distance/255);
  // Particles spring back to their original grid, but are gently drawn along with the cursor.
  p.vx+=(p.hx-p.x)*.011+(closeMouse?(mx-p.x)*influence*.009:0)+Math.sin(frame*.008+p.p)*.003;
  p.vy+=(p.hy-p.y)*.011+(closeMouse?(my-p.y)*influence*.009:0)+Math.cos(frame*.008+p.p)*.003;
  p.vx*=.87;p.vy*=.87;p.x+=p.vx;p.y+=p.vy;
  fxCtx.fillStyle=`rgba(179,251,200,${(.10+influence*.59).toFixed(3)})`;const z=p.size*(1+influence*.65);fxCtx.fillRect(p.x-z/2,p.y-z/2,z,z);
  if(influence>.58&&distance<170){fxCtx.beginPath();fxCtx.moveTo(p.x,p.y);fxCtx.lineTo(mx,my);fxCtx.strokeStyle=`rgba(102,236,188,${((influence-.55)*.14).toFixed(3)})`;fxCtx.lineWidth=.5;fxCtx.stroke()}
 }
 for(let i=trails.length-1;i>=0;i--){const p=trails[i];p.x+=p.vx;p.y+=p.vy;p.life-=.037;if(p.life<=0){trails.splice(i,1);continue}fxCtx.fillStyle=`rgba(184,255,208,${p.life*.73})`;fxCtx.fillRect(p.x,p.y,p.size,p.size)}
 for(let i=bursts.length-1;i>=0;i--){const p=bursts[i];p.x+=p.vx;p.y+=p.vy;p.vx*=.965;p.vy*=.965;p.life-=.029;if(p.life<=0){bursts.splice(i,1);continue}fxCtx.fillStyle=`rgba(184,255,208,${p.life*.86})`;fxCtx.fillRect(p.x,p.y,p.size,p.size)}
}
requestAnimationFrame(animatePixels);
function setFX(value){fxOn=value&&!prefersReduced;fxCanvas.style.opacity=fxOn?'.9':'0';const b=document.getElementById('fx-toggle');b.classList.toggle('on',fxOn);b.textContent=fxOn?'✦ PIXELS ON':'✧ PIXELS OFF';b.setAttribute('aria-pressed',String(fxOn));toast(fxOn?'CURSOR PIXELS ENABLED':'PIXEL EFFECTS PAUSED')}
document.getElementById('fx-toggle').addEventListener('click',()=>setFX(!fxOn));
document.getElementById('brand-home').addEventListener('click',()=>{go(0);toast('RETURNED TO INTRODUCTION')});
const sectionModal=document.getElementById('section-modal');
slides.forEach((s,i)=>{const b=document.createElement('button');b.className='section-jump interactive';b.innerHTML=`<small>${nf(i+1)} / 09</small><strong></strong>`;b.querySelector('strong').textContent=s.dataset.name;b.addEventListener('click',()=>{showSections(false);go(i);toast(`${s.dataset.name.toUpperCase()} · OPENED`)});document.getElementById('section-grid').appendChild(b)});
function showSections(v){menuOpen=v;sectionModal.classList.toggle('show',v);document.querySelectorAll('.section-jump').forEach((b,i)=>b.classList.toggle('selected',i===current));if(v){showHelp(false)}}
document.getElementById('section-menu').addEventListener('click',()=>showSections(!menuOpen));document.getElementById('close-sections').addEventListener('click',()=>showSections(false));sectionModal.addEventListener('click',e=>{if(e.target===sectionModal)showSections(false)});
document.getElementById('progress-scrubber').addEventListener('click',e=>{const r=e.currentTarget.getBoundingClientRect();const idx=Math.min(slides.length-1,Math.floor((e.clientX-r.left)/r.width*slides.length));go(Math.max(0,idx))});
document.getElementById('progress-scrubber').addEventListener('keydown',e=>{if(e.key==='ArrowRight'||e.key==='ArrowLeft'){e.preventDefault();e.stopPropagation();go(current+(e.key==='ArrowRight'?1:-1))}});
document.querySelectorAll('.flow-card').forEach((el,i)=>{el.tabIndex=0;el.setAttribute('role','button');el.title=`Explore ${i===2?'A* search':'the live parking system'}`;
 const fn=()=>{go(i===2?3:4);toast(i===2?'EXPLORING A* SEARCH':'OPENING LIVE PARKING LAB')};el.addEventListener('click',fn);el.addEventListener('keydown',e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();fn()}})});
document.querySelectorAll('.hero-lot .bay').forEach(el=>{el.tabIndex=0;el.setAttribute('role','button');el.setAttribute('aria-label',`Explore ${el.textContent.trim()} in the live parking simulator`);
 const fn=()=>{const id=el.textContent.trim();go(4);if(occupied.has(id)){toast(`${id} IS OCCUPIED · FREE IT IN THE GRID`);status.textContent=`${id} is occupied. Click its red bay to make it free, or select an available target.`}else{routeTarget=id;clearRun();updateGrid();void runParking({forcedId:id})}};el.addEventListener('click',fn);el.addEventListener('keydown',e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();fn()}})});
// Capture key combos only for the new functionality; old slide controls stay available.
document.addEventListener('keydown',e=>{
 if((e.ctrlKey||e.metaKey)&&e.key.toLowerCase()==='k'){e.preventDefault();showSections(!menuOpen);return}
 if(e.key==='Escape'&&menuOpen){showSections(false);return}
 if(e.target.matches('input,select,textarea'))return;
 if(!menuOpen&&!helpOpen&&e.key.toLowerCase()==='p'&&!e.ctrlKey&&!e.metaKey){pixelBurst(mx,my,55);toast('PIXEL BURST ✦')}
},true);
// Prevent the existing deck keyboard/wheel handlers from navigating while section map is open.
document.addEventListener('keydown',e=>{if(menuOpen&&e.key!=='Escape'&&!(e.ctrlKey||e.metaKey)){e.stopImmediatePropagation()}},true);
// Capture wheel on the modal to avoid unintentional slide changes.
sectionModal.addEventListener('wheel',e=>e.stopPropagation(),{passive:true});
// A tiny live engine status readout that remains truthful to the simulated data.
