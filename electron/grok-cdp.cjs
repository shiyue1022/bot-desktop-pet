// Only current rendered agent props are authoritative. Hook state can retain old turns.
function readFacts(){
 let fiber;for(const el of document.querySelectorAll('*')){const k=Object.keys(el).find(k=>k.startsWith('__reactFiber$'));if(k){fiber=el[k];break}}
 if(!fiber)return {mode:'idle',observed:0};while(fiber.return)fiber=fiber.return;if(fiber.stateNode?.current)fiber=fiber.stateNode.current;
 let selectedId=null;
 for(const el of document.querySelectorAll('[aria-current="page"]')){if(el.getAttribute?.('aria-current')!=='page')continue;const k=Object.keys(el).find(k=>k.startsWith('__reactFiber$'));let f=k?el[k]:null;for(let n=0;f&&n<20;n++,f=f.return){const p=f.memoizedProps;if(p?.agent?.id){selectedId=p.agent.id;break}if(p?.agentId){selectedId=p.agentId;break}}if(selectedId)break}
 const stack=[fiber],seen=new Set(),agents=new Map();
 function take(v,depth=0){if(!v||typeof v!=='object'||depth>2)return;
  if(typeof v.isRunning==='boolean'&&(v.id||v.agentId)){
   const id=v.id??v.agentId,old=agents.get(id),seq=Number(v.snapshotSeq??0),settled=Number(v.lastTurnSettlement?.settledAtMs??0);
   if(!old||seq>Number(old.snapshotSeq??0)||(seq===Number(old.snapshotSeq??0)&&settled>Number(old.lastTurnSettlement?.settledAtMs??0)))agents.set(id,v);return;
  }
  for(const k of ['agent','value','roster'])if(v[k])take(v[k],depth+1);
 }
 while(stack.length){const f=stack.pop();if(!f||seen.has(f))continue;seen.add(f);if(f.sibling)stack.push(f.sibling);if(f.tag===22&&f.memoizedState)continue;if(f.child)stack.push(f.child);take(f.memoizedProps)}
 const focused=agents.get(selectedId)||[...agents.values()].find(v=>v.isActive===true),values=focused?[focused]:[...agents.values()];
 function modeOf(v){if(!v.isRunning||v.isRunningTurn===false||v.awaitingUserResponse)return 'idle';if(v.currentActivity?.kind==='thinking')return 'thinking';return v.isComposingMessage||v.currentActivity?.kind==='tool'?'working':'thinking'}
 const modes=values.map(modeOf),mode=modes.includes('working')?'working':modes.includes('thinking')?'thinking':'idle';
 const id=focused?.id??focused?.agentId??'all';let hash=2166136261;for(const c of String(id))hash=Math.imul(hash^c.charCodeAt(0),16777619);const sourceKey=String(hash>>>0);
 const pulse=globalThis.__botDesktopPulseV3||(globalThis.__botDesktopPulseV3={seq:0,at:0,sourceKey:null});pulse.currentSourceKey=sourceKey;
 if(!pulse.installed&&document.addEventListener){pulse.installed=true;
  const editorSelector='[contenteditable="true"][role="textbox"],textarea';
  function mark(){pulse.seq++;pulse.at=Date.now();pulse.sourceKey=pulse.currentSourceKey}
  document.addEventListener('keydown',e=>{if(e.key==='Enter'&&!e.shiftKey&&!e.isComposing&&e.target?.closest?.(editorSelector)&&e.target.textContent?.trim())mark()},true);
  document.addEventListener('submit',e=>{if(e.target?.querySelector?.(editorSelector))mark()},true);
  document.addEventListener('click',e=>{const b=e.target?.closest?.('button');if(!b||b.disabled)return;const label=(b.getAttribute('aria-label')||'')+' '+(b.getAttribute('title')||'');if((b.type==='submit'||/发送|提交|send/i.test(label))&&document.querySelector(editorSelector)?.textContent?.trim())mark()},true);
 }
 return {mode,observed:agents.size,sourceKey,focused:!!focused,submission:{seq:pulse.sourceKey===sourceKey?pulse.seq:0,at:pulse.sourceKey===sourceKey?pulse.at:0}};
}
let socket=null,connecting=null,nextId=0;const pending=new Map();
function disconnect(){const old=socket;socket=null;for(const p of pending.values()){clearTimeout(p.timer);p.reject(Error('Grok disconnected'))}pending.clear();if(old&&old.readyState<2)old.close()}
async function connect(){if(socket?.readyState===1)return socket;if(connecting)return connecting;
 connecting=(async()=>{const list=await(await fetch('http://127.0.0.1:19222/json/list',{signal:AbortSignal.timeout(1000)})).json();const target=list.find(v=>v.type==='page'&&v.url?.includes('Grok%20Bot/resources/app.asar/'));if(!target?.webSocketDebuggerUrl?.startsWith('ws://127.0.0.1:19222/'))throw Error('Grok page unavailable');
 const ws=new WebSocket(target.webSocketDebuggerUrl);await new Promise((resolve,reject)=>{const timer=setTimeout(()=>{ws.close();reject(Error('Grok connect timeout'))},1200);ws.addEventListener('open',()=>{clearTimeout(timer);resolve()},{once:true});ws.addEventListener('error',()=>{clearTimeout(timer);reject(Error('Grok connection failed'))},{once:true})});socket=ws;
 ws.addEventListener('message',event=>{let data;try{data=JSON.parse(event.data)}catch{return}const p=pending.get(data.id);if(!p)return;pending.delete(data.id);clearTimeout(p.timer);const v=data.result?.result?.value;if(data.error||!v?.observed)p.reject(Error('Grok status unavailable'));else p.resolve(v)});
 ws.addEventListener('close',()=>{if(socket===ws)disconnect()});ws.addEventListener('error',()=>{if(socket===ws)disconnect()});return ws;
 })();try{return await connecting}finally{connecting=null}
}
async function readGrok(){const ws=await connect();return new Promise((resolve,reject)=>{const id=++nextId,timer=setTimeout(()=>{pending.delete(id);reject(Error('Grok status timeout'));disconnect()},1500);pending.set(id,{resolve,reject,timer});try{ws.send(JSON.stringify({id,method:'Runtime.evaluate',params:{expression:`(${readFacts.toString()})()`,returnByValue:true}}))}catch(e){clearTimeout(timer);pending.delete(id);reject(e);disconnect()}})}
module.exports={readGrok,readFacts,disconnect};
