(function(){
'use strict';
var $=function(s,r){return(r||document).querySelector(s)},$$=function(s,r){return[].slice.call((r||document).querySelectorAll(s))};
var scenes=$$('.scene'),cur=0,tgt=0,gen=0,modalOn=false,reduce=matchMedia('(prefers-reduced-motion: reduce)').matches;
var navB=$$('nav [data-go]'),dots=$$('.dots button');
function setNav(){navB.forEach(function(b){b.classList.toggle('on',+b.dataset.go===cur)});dots.forEach(function(d,i){d.classList.toggle('on',i===cur)});$('#pbar').style.width=(cur+1)/scenes.length*100+'%'}
/* ---- reveal masks + arrows ---- */
var FR=0,idle=0,act=[],parts=[],rings=[],cols=['#ffffff','#d9dedb','#a7f3d0','#eceeed','#34d399'],ci=0;
function apply(it){var s=it.el.style;s.webkitMaskImage=s.maskImage='url('+it.mc.toDataURL()+')';if(!it.sz){it.sz=1;s.webkitMaskSize=s.maskSize='100% 100%';s.webkitMaskRepeat=s.maskRepeat='no-repeat'}}
function addMask(el){var b=el.getBoundingClientRect(),it={el:el,w:Math.max(6,Math.round(b.width/4)),h:Math.max(6,Math.round(b.height/4))};it.mc=document.createElement('canvas');it.mc.width=it.w;it.mc.height=it.h;it.cx=it.mc.getContext('2d');apply(it);return it}
function unmask(it){var s=it.el.style;s.webkitMaskImage=s.maskImage='none';s.webkitMaskSize=s.maskSize='';if(it.el._b)it.el._b.live=true}
function pop(el){el.animate([{transform:'scale(.95)'},{transform:'scale(1.03)',offset:.5},{transform:'scale(1)'}],{duration:460,easing:'cubic-bezier(.3,1.4,.5,1)'})}
function spawn(it,delay,i,g){var b=it.el.getBoundingClientRect(),R=Math.max(40,Math.min(90,Math.min(b.width,b.height)/4)),mode=i%3,n=Math.max(1,Math.ceil((mode===1?b.width:b.height)/(R*1.4))),sd=Math.floor(Math.random()*4);
 act.push({it:it,g:g,t0:performance.now()+delay,x:sd===0?-70:sd===1?innerWidth+70:Math.random()*innerWidth,y:sd===2?-70:sd===3?innerHeight+70:Math.random()*innerHeight,p:0,st:0,c:cols[ci++%5],R:R,n:n,mode:mode,sw:Math.random()<.5?-1:1,fp:Math.max(5,Math.round(30/n)),dx:0,tr:[]})}
function enter(n,g){
 var sc=scenes[n];sc.classList.add('on');sc.scrollTop=0;var els=$$('.rv',sc);
 els.forEach(function(e){e.getAnimations().forEach(function(a){a.cancel()})});
 if(n===1){if(reduce)$$('[data-n]',sc).forEach(function(e){e.textContent=e.dataset.n});else setTimeout(function(){if(g===gen)countUp(sc)},450)}
 if(reduce)return;
 els.forEach(function(el,i){var it=addMask(el);spawn(it,i*48+20,i,g)});
 setTimeout(function(){if(g!==gen)return;els.forEach(function(e){e.style.webkitMaskImage=e.style.maskImage='none';if(e._b)e._b.live=true});act.forEach(function(a){a.st=1})},3600);
}
function leave(n,cb,dir){
 var els=$$('.rv',scenes[n]);if(reduce){cb();return}
 els.forEach(function(el,i){el.animate([{opacity:1,transform:'none'},{opacity:0,transform:'translateY('+(-dir*40)+'px) scale(.94)'}],{duration:320,delay:i*18,easing:'cubic-bezier(.5,0,.8,.4)',fill:'forwards'})});
 setTimeout(cb,320+els.length*18+20);
}
var SW=$('#sweep');
function go(n){n=Math.max(0,Math.min(scenes.length-1,n));if(n===tgt)return;var dir=n>tgt?1:-1;tgt=n;gen++;var g=gen,from=cur;
 act.forEach(function(a){a.st=1});
 if(!reduce)SW.animate([{transform:'translateX('+(dir>0?'-60vw':'110vw')+') skewX(-16deg)',opacity:0},{opacity:1,offset:.3},{opacity:1,offset:.7},{transform:'translateX('+(dir>0?'110vw':'-60vw')+') skewX(-16deg)',opacity:0}],{duration:850,easing:'cubic-bezier(.65,0,.35,1)'});
 leave(from,function(){if(g!==gen)return;scenes[from].classList.remove('on');cur=n;setNav();enter(n,g)},dir)}
document.addEventListener('click',function(e){var b=e.target.closest('[data-go]');if(b){if(modalOn)closeM();go(+b.dataset.go)}});
/* ---- scroll / swipe / keys ---- */
function canScroll(dir){var s=scenes[cur];if(s.scrollHeight<=s.clientHeight+4)return false;return dir>0?s.scrollTop+s.clientHeight<s.scrollHeight-2:s.scrollTop>0}
var acc=0,accT;
var blocked=false,lockUntil=0,lastW=0;function lockNav(ms){blocked=true;lockUntil=performance.now()+ms}
addEventListener('wheel',function(e){if(modalOn||canScroll(e.deltaY))return;var now=performance.now(),gap=now-lastW;lastW=now;
 if(blocked){if(now>lockUntil&&gap>140)blocked=false;else return}
 acc+=e.deltaY;clearTimeout(accT);accT=setTimeout(function(){acc=0},200);
 if(Math.abs(acc)>90){go(tgt+(acc>0?1:-1));acc=0;lockNav(1100)}},{passive:true});
var ty=0;addEventListener('touchstart',function(e){ty=e.touches[0].clientY},{passive:true});
addEventListener('touchend',function(e){if(modalOn)return;var d=ty-e.changedTouches[0].clientY;if(Math.abs(d)>70&&!canScroll(d)&&performance.now()>lockUntil){go(tgt+(d>0?1:-1));lockNav(900)}},{passive:true});
addEventListener('keydown',function(e){if(e.key==='Escape')closeM();if(modalOn)return;var kd=['ArrowDown','PageDown'].indexOf(e.key)>-1,ku=['ArrowUp','PageUp'].indexOf(e.key)>-1;if((kd||ku)&&performance.now()>lockUntil){go(tgt+(kd?1:-1));lockNav(800)}});
/* ---- hidden options, popups, copy ---- */
$$('.opt').forEach(function(o){var h=$('.oh',o);h.addEventListener('click',function(){var open=!o.classList.contains('open');
 $$('.opt',o.closest('.opts,.tl')).forEach(function(x){x.classList.remove('open');$('.oh',x).setAttribute('aria-expanded','false')});
 if(open){o.classList.add('open');h.setAttribute('aria-expanded','true');[].forEach.call($('.oi',o).children,function(c,i){c.style.setProperty('--i',i)})}})});
var PJ={rover:{t:'Mecanum-wheel rover',d:'Rover chassis with four mecanum wheels, hubs and mounts, modelled in Fusion 360.',img:$('[data-p=rover] img').src,tags:['Fusion 360','Mecanum wheels','Chassis design']},
 cpp:{t:'To-do list',d:'A to-do list program built in C++ to add, view and complete tasks.',img:$('[data-p=cpp] img').src,tags:['C++','Console app']},
 ansys:{t:'Hub analysis',d:'Static structural analysis of a hub in ANSYS (total deformation on the meshed model, maximum 9.1358e-5 mm).',img:$('[data-p=ansys] img').dataset.full,tags:['ANSYS','Static structural','Total deformation']}};
var SKL={C:['#00599c','hex','C'],'C++':['#1b6fb5','hex','C++'],H:['#e44d26','shield','5'],S:['#1572b6','shield','3'],F:['#ff6a00','box','F'],SW:['#d71920','box','SW'],A:['#ffc20e','box','A']};
$$('.tile').forEach(function(t){var s=SKL[t.dataset.k],f=t.dataset.k==='A'?'#6b4d00':s[0],tx='<text x="12" y="'+(s[1]==='shield'?'14.2':'15.4')+'" text-anchor="middle" font-size="'+(s[2].length>1?8.5:12)+'" font-weight="800" font-family="Manrope,sans-serif" fill="'+f+'">'+s[2]+'</text>',sh=s[1]==='hex'?'<path d="M12 2l8.5 5v10L12 22l-8.5-5V7z" fill="#fff"/>':s[1]==='shield'?'<path d="M4 3h16l-1.5 15L12 21l-6.5-3z" fill="#fff"/>':'<rect x="3" y="3" width="18" height="18" rx="5" fill="#fff"/>';
 t.style.background='linear-gradient(145deg,'+s[0]+','+s[0]+'cc)';t.innerHTML='<svg viewBox="0 0 24 24">'+sh+tx+'</svg>'});
function openM(k){var p=PJ[k];$('#mc').innerHTML='<button class="x" aria-label="Close"><svg class="ic"><use href="#i-x"/></svg></button>'+(p.img?'<img class="mimg" src="'+p.img+'" alt="">':'<div class="mph">'+p.ph+'</div>')+'<div class="tags" style="margin-bottom:12px">'+p.tags.map(function(t){return'<span>'+t+'</span>'}).join('')+'</div><h3>'+p.t+'</h3><p>'+p.d+'</p>';$('#modal').classList.add('on');modalOn=true;$('#mc .x').focus()}
function closeM(){$('#modal').classList.remove('on');modalOn=false}
$$('.pc').forEach(function(c){c.addEventListener('click',function(){openM(c.dataset.p)});c.addEventListener('keydown',function(e){if(e.key==='Enter'||e.key===' '){e.preventDefault();openM(c.dataset.p)}})});
$('#modal').addEventListener('click',function(e){if(e.target===this||e.target.closest('.x'))closeM()});
$$('.copy').forEach(function(b){b.addEventListener('click',function(){var t=$('#toast');copyMail();t.classList.add('on');setTimeout(function(){t.classList.remove('on')},1600)})});
function copyMail(){var t='piyushwarudkar215@gmail.com',fb=function(){try{var a=document.createElement('textarea');a.value=t;a.style.cssText='position:fixed;opacity:0';document.body.appendChild(a);a.select();document.execCommand('copy');a.remove()}catch(e){}};try{navigator.clipboard.writeText(t).catch(fb)}catch(e){fb()}}
/* ---- footer appears on hover ---- */
var ft=$('#foot'),ftOn=false;function showF(v){ftOn=v;ft.classList.toggle('on',v)}
addEventListener('pointermove',function(e){if(e.clientY>innerHeight-56)showF(true);else if(ftOn&&e.clientY<innerHeight-130)showF(false)});
$('#fh').addEventListener('click',function(){showF(!ftOn)});
/* ---- motion polish ---- */
var sp0=$('#spot'),tl=$('#tilt');
var pmE=null,pmR=0;addEventListener('pointermove',function(e){pmE=e;if(!pmR){pmR=1;requestAnimationFrame(function(){pmR=0;pmove(pmE)})}});
function pmove(e){elastic(e);sp0.style.transform='translate('+e.clientX+'px,'+e.clientY+'px)';
 if(cur===0){tl.style.setProperty('--ry',(e.clientX/innerWidth-.5)*16+'deg');tl.style.setProperty('--rx',-(e.clientY/innerHeight-.5)*10+'deg')}
 var c=e.target.closest&&e.target.closest('.opt,.pc,.learn,.sk-card,.ac');if(c){var r=c.getBoundingClientRect();c.style.setProperty('--mx',e.clientX-r.left+'px');c.style.setProperty('--my',e.clientY-r.top+'px')}
 var bt=e.target.closest&&e.target.closest('.btn');if(bt){var q=bt.getBoundingClientRect();bt.style.setProperty('--tx',(e.clientX-q.left-q.width/2)*.18+'px');bt.style.setProperty('--ty',(e.clientY-q.top-q.height/2)*.28+'px')}}
$$('.btn').forEach(function(b){b.addEventListener('pointerleave',function(){b.style.setProperty('--tx','0px');b.style.setProperty('--ty','0px')})});
/* ---- arrow engine ---- */
var AC=$('#arrows'),ax=AC.getContext('2d');function rs(){AC.width=innerWidth;AC.height=innerHeight}rs();addEventListener('resize',rs);
function brush(it,x,y,R){var c=it.cx,r=Math.max(6,R/4),g=c.createRadialGradient(x,y,0,x,y,r);g.addColorStop(0,'rgba(0,0,0,1)');g.addColorStop(.55,'rgba(0,0,0,.95)');g.addColorStop(1,'rgba(0,0,0,0)');c.fillStyle=g;c.beginPath();c.arc(x,y,r,0,6.2832);c.fill()}
function ptAt(a,b){var p=a.p,n=a.n,u,v;
 if(a.mode===0){var row=Math.min(n-1,Math.floor(p*n)),f=p*n-row;if(row%2)f=1-f;u=f;v=(row+.5)/n+Math.sin(f*6.283)*.06}
 else if(a.mode===1){var col=Math.min(n-1,Math.floor(p*n)),f2=p*n-col;if(col%2)f2=1-f2;v=f2;u=(col+.5)/n+Math.sin(f2*6.283)*.05}
 else{u=Math.abs(((p*n*1.3)%2+2)%2-1);v=p}
 return[b.left+6+(b.width-12)*u,b.top+4+(b.height-8)*v]}
function loop(){
 requestAnimationFrame(loop);if(!act.length&&!parts.length&&!rings.length){if(!idle){ax.clearRect(0,0,AC.width,AC.height);idle=1}return}idle=0;ax.clearRect(0,0,AC.width,AC.height);var now=performance.now();
 for(var i=act.length-1;i>=0;i--){var a=act[i],it=a.it;if(now<a.t0)continue;
  if(a.st===0){var b=it.el.getBoundingClientRect();if(b.width<1)a.p=1;
   var pt=ptAt(a,b),tx=pt[0],ty=pt[1];if(!a.arrived){var ex=tx-a.x,ey=ty-a.y,dl=Math.hypot(ex,ey)||1;tx+=-ey/dl*dl*.28*a.sw;ty+=ex/dl*dl*.28*a.sw}
   if(a.arrived)a.p+=1/(a.fp*a.n);var ox=a.x;a.x+=(tx-a.x)*.36;a.y+=(ty-a.y)*.36;a.dx=a.x-ox;
   if(Math.hypot(pt[0]-a.x,pt[1]-a.y)<70)a.arrived=1;
   if(a.arrived&&b.width>0){var lx=(a.x-b.left)/b.width*it.w,ly=(a.y-b.top)/b.height*it.h;if(a.lx==null){a.lx=lx;a.ly=ly}
    var d=Math.hypot(lx-a.lx,ly-a.ly),st=Math.max(1,Math.ceil(d/(a.R/9)));for(var s=1;s<=st;s++)brush(it,a.lx+(lx-a.lx)*s/st,a.ly+(ly-a.ly)*s/st,a.R);a.lx=lx;a.ly=ly;if((FR++&1)===0)apply(it);
    if(Math.random()<.8)parts.push({x:a.x,y:a.y,vx:(Math.random()-.5)*3,vy:(Math.random()-.5)*3-1,l:1,c:a.c})}
   if(a.p>=1){unmask(it);pop(it.el);rings.push({x:b.left+b.width/2,y:b.top+b.height/2,r:12,m:Math.min(260,Math.max(b.width,b.height)*.45),c:a.c});a.st=1}
  }else{if(a.ex==null)a.ex=a.x>innerWidth/2?1:-1;a.vx=(a.vx||14)*1.1;a.x+=a.ex*a.vx;a.y-=a.vx*.35;a.dx=a.ex*a.vx;if(a.x<-100||a.x>innerWidth+100||a.y<-100){act.splice(i,1);continue}}
  a.tr.push([a.x,a.y]);if(a.tr.length>10)a.tr.shift();
  ax.strokeStyle=a.c;ax.lineCap='round';for(var k=1;k<a.tr.length;k++){ax.globalAlpha=k/a.tr.length*.4;ax.lineWidth=1.5+k*.45;ax.beginPath();ax.moveTo(a.tr[k-1][0],a.tr[k-1][1]);ax.lineTo(a.tr[k][0],a.tr[k][1]);ax.stroke()}ax.globalAlpha=1;
  ax.save();ax.translate(a.x,a.y);var gr=ax.createRadialGradient(0,0,0,0,0,26);gr.addColorStop(0,a.c+'aa');gr.addColorStop(1,a.c+'00');ax.fillStyle=gr;ax.beginPath();ax.arc(0,0,26,0,6.2832);ax.fill();
  ax.rotate(Math.max(-.4,Math.min(.4,(a.dx||0)*.03)));ax.fillStyle='#fff';ax.strokeStyle=a.c;ax.lineWidth=2;ax.lineJoin='round';
  ax.beginPath();ax.moveTo(0,0);ax.lineTo(0,21);ax.lineTo(5.5,16);ax.lineTo(11,26);ax.lineTo(15,24);ax.lineTo(9.5,14.5);ax.lineTo(16,14.5);ax.closePath();ax.fill();ax.stroke();ax.restore();
 }
 for(var k=parts.length-1;k>=0;k--){var p=parts[k];p.x+=p.vx;p.y+=p.vy;p.vy+=.06;p.l-=.035;if(p.l<=0){parts.splice(k,1);continue}ax.globalAlpha=p.l;ax.fillStyle=p.c;ax.fillRect(p.x,p.y,3,3)}
 for(var k=rings.length-1;k>=0;k--){var r=rings[k];r.r+=(r.m-r.r)*.12;var al=1-r.r/r.m;if(al<.03){rings.splice(k,1);continue}ax.globalAlpha=al;ax.strokeStyle=r.c;ax.lineWidth=3;ax.beginPath();ax.arc(r.x,r.y,r.r,0,6.2832);ax.stroke()}
 ax.globalAlpha=1;
}
function countUp(sc){$$('[data-n]',sc).forEach(function(el){var n=+el.dataset.n,t0=performance.now();(function f(t){var k=Math.min(1,(t-t0)/900);el.textContent=Math.round(n*(1-Math.pow(1-k,3)));if(k<1)requestAnimationFrame(f)})(t0)})}
var RT=['Mechanical Engineering student','Fusion 360 modeller','C++ learner','ANSYS learner'],ri=0,rc=0,rd=false,rtEl=$('#rt');
function type(){var w=RT[ri];if(!rd){rc++;rtEl.textContent=w.slice(0,rc);if(rc===w.length){rd=true;setTimeout(type,1500);return}}else{rc--;rtEl.textContent=w.slice(0,rc);if(rc===0){rd=false;ri=(ri+1)%RT.length}}setTimeout(type,rd?32:70)}

var cu=$('#cur'),cx=0,cy=0,px=0,py=0;addEventListener('pointermove',function(e){px=e.clientX;py=e.clientY;cu.classList.toggle('big',!!(e.target.closest&&e.target.closest('a,button,.pc,.opt,.sk-card,.it,.fb,.ac')))});
(function cl(){requestAnimationFrame(cl);cx+=(px-cx)*.2;cy+=(py-cy)*.2;cu.style.transform='translate('+cx+'px,'+cy+'px)'})();
$$('.star').forEach(function(b){b.addEventListener('click',function(){b.classList.remove('pulse');void b.offsetWidth;b.classList.add('pulse')})});
/* ---- elastic lettering: letters stretch toward the pointer and spring back ---- */
function splitEl(el){el.setAttribute('aria-label',el.textContent.replace(/\s+/g,' ').trim());
 (function walk(n){[].slice.call(n.childNodes).forEach(function(c){
  if(c.nodeType===3){var t=c.textContent;if(!t.trim()&&t.indexOf(' ')<0)return;var fr=document.createDocumentFragment();
   t.split(/(\s+)/).forEach(function(p){if(!p)return;if(/^\s+$/.test(p)){fr.appendChild(document.createTextNode(' '));return}
    var w=document.createElement('span');w.className='wd';w.setAttribute('aria-hidden','true');
    p.split('').forEach(function(ch){var l=document.createElement('span');l.className='lt';l.textContent=ch;w.appendChild(l)});fr.appendChild(w)});
   n.replaceChild(fr,c)}
  else if(c.nodeType===1&&!c.matches('svg,br'))walk(c)})})(el);
 el.classList.add('el');el._lt=[].slice.call(el.querySelectorAll('.lt'))}
$$('h1,h2,h3,h4').forEach(splitEl);
var ER=120,EM=1.5;
function elastic(e){if(reduce)return;
 $$('.el',scenes[cur]).forEach(function(el){var r=el.getBoundingClientRect(),near=r.width>0&&e.clientX>r.left-ER&&e.clientX<r.right+ER&&e.clientY>r.top-ER&&e.clientY<r.bottom+ER;
  if(!near){if(el._on){el._on=false;el._c=null;el.classList.remove('on');el._lt.forEach(function(l){l.style.transform=''})}return}
  if(!el._on){el._on=true;el.classList.add('on')}
  if(!el._c)el._c=el._lt.map(function(l){var b=l.getBoundingClientRect();return[b.left+b.width/2,b.top+b.height/2]});
  el._lt.forEach(function(l,i){var c=el._c[i],dx=e.clientX-c[0],dy=e.clientY-c[1],k=Math.max(0,1-Math.hypot(dx,dy)/ER);k=k*k*(3-2*k);
   if(k<.01){l.style.transform='';return}
   l.style.transformOrigin='50% '+(dy<0?'100%':'0%');l.style.transform='translateX('+dx*.1*k+'px) scale('+(1-.2*k)+','+(1+(EM-1)*k)+')'})})}
addEventListener('resize',function(){$$('.el').forEach(function(x){x._c=null})});

/* ---- stacked project cards: later cards slide over earlier ones, which shrink and dim ---- */
var pcs=$$('.pc'),s3=$('#s3'),stk=0,tops=[],hs=[],dims=pcs.map(function(c){return $('.dim',c)});
pcs.forEach(function(c){var im=$('.t1 img',c),src=im.src;
 (window.fetch?fetch(src).then(function(r){return r.blob()}).then(function(b){return URL.createObjectURL(b)}):Promise.reject()).catch(function(){return src}).then(function(u){c.style.setProperty('--img','url("'+u+'")')})});
function stackMeasure(){tops=pcs.map(function(c){return parseFloat(getComputedStyle(c).top)||0});hs=pcs.map(function(c){return c.offsetHeight})}
function stackUpd(){stk=0;if(!s3.classList.contains('on'))return;if(!tops.length)stackMeasure();
 var sc0=s3.getBoundingClientRect().top,rt=pcs.map(function(c){return c.getBoundingClientRect().top});
 for(var i=0;i<pcs.length;i++){var sum=0;for(var j=i+1;j<pcs.length;j++){var d=rt[j]-sc0-tops[j];sum+=Math.max(0,Math.min(1,1-d/(hs[j]*.8)))}
  var t=sum>.001?'scale('+(1-.035*sum).toFixed(4)+')':'';if(pcs[i]._t!==t){pcs[i]._t=t;pcs[i].style.transform=t}
  var o=Math.min(.55,sum*.3).toFixed(3);if(dims[i]._o!==o){dims[i]._o=o;dims[i].style.opacity=o}}}
function stackReq(){if(!stk){stk=1;requestAnimationFrame(stackUpd)}}
s3.addEventListener('scroll',stackReq,{passive:true});addEventListener('resize',function(){tops=[];stackReq()});
setNav();loop();
function start(){enter(0,0);document.body.classList.add('ready');type()}
var booted=false;function boot(){if(booted)return;booted=true;start()}
(document.fonts&&document.fonts.ready?Promise.race([document.fonts.ready,new Promise(function(r){setTimeout(r,800)})]):Promise.resolve()).then(function(){requestAnimationFrame(boot)});
})();
