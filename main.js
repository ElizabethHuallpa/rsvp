const TARGET=new Date('2026-12-05T10:30:00-05:00'); // 10:30 hora de Lima: mismo instante para todos los países
const $=i=>document.getElementById(i),au=$('bg'),mc=$('mc');let opened=false;
function tick(){const t=Math.max(0,TARGET-Date.now()),p=n=>String(n).padStart(2,'0');
 $('d').textContent=p(Math.floor(t/864e5));$('h').textContent=p(Math.floor(t%864e5/36e5));$('m').textContent=p(Math.floor(t%36e5/6e4));$('s').textContent=p(Math.floor(t%6e4/1e3))}
tick();setInterval(tick,1000);
try{const tz=Intl.DateTimeFormat().resolvedOptions().timeZone;
 if(tz&&tz!=='America/Lima')$('local').textContent='En tu zona horaria ('+tz.replace('_',' ')+'): '+TARGET.toLocaleString('es',{weekday:'long',day:'numeric',month:'long',hour:'2-digit',minute:'2-digit'})}catch(e){}
function petals(){const C=['#a9c4d9','#8fb0cf','#c6d8e8','#7a9cc0','#b7cce0'];for(let i=0;i<16;i++){const p=document.createElement('div'),s=13+Math.random()*13,pt=document.createElement('span');p.className='petal';p.style.cssText=`left:${Math.random()*100}vw;width:${s}px;height:${s*1.15}px;animation-duration:${11+Math.random()*9}s;animation-delay:${-Math.random()*14}s`;pt.className='pt';pt.style.cssText=`--c:${C[i%C.length]};animation-duration:${3+Math.random()*3}s,${5+Math.random()*4}s;animation-delay:${-Math.random()*5}s`;p.appendChild(pt);document.body.appendChild(p)}}
function openInv(){
 if(opened)return;opened=true;
 $('env').classList.add('open');
 try{au.volume=.6;au.play().then(()=>{mc.style.display='grid'}).catch(()=>{})}catch(e){}
 setTimeout(()=>{
  $('env').classList.add('gone');document.body.classList.remove('lock');
  $('main').classList.add('show');window.scrollTo(0,0);petals();
  const io=new IntersectionObserver(es=>es.forEach(e=>{if(e.isIntersecting){e.target.classList.add('in');io.unobserve(e.target)}}),{threshold:.12});
  document.querySelectorAll('.rv').forEach(el=>io.observe(el));
 },3900);
}
au.addEventListener('error',()=>{mc.style.display='none'});
au.addEventListener('playing',()=>{mc.style.display='grid';mc.textContent='🔊'});
function toggleMusic(){if(au.paused){au.play().catch(()=>{});mc.textContent='🔊'}else{au.pause();mc.textContent='🔇'}}
