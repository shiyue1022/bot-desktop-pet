const {app,BrowserWindow,Tray,Menu,ipcMain,screen,shell,nativeImage}=require('electron');
const fs=require('node:fs'), path=require('node:path');
const {ActivityController}=require('./activity.cjs');const activity=new ActivityController();
const {clampToArea,edgeAt,dockPosition,dockOffset}=require('./layout.cjs');

app.setName('bot');app.setPath('userData',process.env.BOT_SELFTEST==='1'?path.join(process.env.BOT_TEST_OUTPUT,'profile'):path.join(app.getPath('appData'),'bot-desktop-pet'));
if(!app.requestSingleInstanceLock())app.quit();
let dragMoved=false,lastTrayConnected=null,trayMenuSignature=null;
let win,tray,drag,dragOrigin,moveTimer,actionTimer,hopTimer,menuOpen=false,quitting=false;const intervals=[];const every=(fn,ms)=>{const id=setInterval(()=>{if(!quitting)fn()},ms);intervals.push(id);return id};
const defaults={shape:'cercle',color:'creme',expression:'neutre',roam:true,scale:.5,dock:null,settingsVersion:2};
const configPath=path.join(app.getPath('userData'),'settings.json');
let config={...defaults};try{const saved=JSON.parse(fs.readFileSync(configPath,'utf8'));if(saved.settingsVersion!==2){saved.scale=(Number(saved.scale)||1)/2;saved.dock=null;saved.settingsVersion=2}config={...defaults,...saved}}catch{}
let trayTooltip='';
let mode='idle',action='idle',connected=false,lastStatus=null,previewUntil=0;

const names={idle:'发呆',wink:'眨眼',wide:'惊讶',sleep:'打瞌睡',egg:'变鸡蛋',hexagon:'变六边形',play:'变播放键',orbit:'星环',swirl:'旋转',burst:'粒子爆开',comet:'小彗星',alert:'警觉',notify:'蓝色通知',exclaim:'感叹号'};
function snapshot(extra={}){return{mode,action,connected,config,...extra}}
function send(extra={}){if(!quitting&&win&&!win.isDestroyed())win.webContents.send('snapshot',snapshot(extra));if(!quitting&&tray&&!tray.isDestroyed()){trayTooltip=`bot\nGrok：${connected?'已连接':'未连接'}\n状态：${{idle:'空闲',thinking:'思考中',working:'工作中'}[mode]}`;tray.setToolTip(trayTooltip)}}
function save(){fs.mkdirSync(path.dirname(configPath),{recursive:true});fs.writeFileSync(configPath,JSON.stringify(config,null,2));send();updateTray()}
function setAction(a){if(mode!=='idle')return;clearTimeout(actionTimer);action=a;send();actionTimer=setTimeout(()=>{action='idle';send()},a==='sleep'?14000:4500)}
function random(){const keys=Object.keys(names).filter(k=>k!=='idle'&&k!==action);setAction(keys[Math.floor(Math.random()*keys.length)])}
function areaFor(x,y){const {width,height}=win.getBounds();return screen.getDisplayNearestPoint({x:Math.round(x+width/2),y:Math.round(y+height/2)}).workArea}
function resetPosition(){config.dock=null;const b=screen.getPrimaryDisplay().workArea,{width,height}=win.getBounds();win.setPosition(b.x+b.width-width-30,b.y+b.height-height-30);win.showInactive();savePosition()}
function clampPosition(x,y){const {width,height}=win.getBounds();return clampToArea(x,y,width,height,areaFor(x,y))}
function setDock(edge){config.dock=edge;const [x,y]=win.getPosition(),{width,height}=win.getBounds();win.setPosition(...dockPosition(edge,x,y,width,height,areaFor(x,y)));send()}
function finishDrag(){if(!drag)return;drag=null;if(!dragMoved){savePosition();return}const [x,y]=win.getPosition(),{width,height}=win.getBounds();setDock(edgeAt(x,y,width,height,areaFor(x,y)));savePosition()}
function resize(scale){config.scale=scale;win.setSize(Math.round(264*scale),Math.round(280*scale));win.webContents.setZoomFactor(scale);setDock(config.dock);save()}
function hop(){if(!win||win.isDestroyed()||drag||menuOpen||mode!=='idle'||!config.roam||config.dock)return;const [x,y]=win.getPosition();const target=clampPosition(x+(Math.random()-.5)*340,y+(Math.random()-.5)*200);const start=Date.now();send({hop:true});clearInterval(hopTimer);hopTimer=every(()=>{const t=Math.min(1,(Date.now()-start)/700),q=t*t*(3-2*t);win.setPosition(Math.round(x+(target[0]-x)*q),Math.round(y+(target[1]-y)*q));if(t===1){clearInterval(hopTimer);savePosition()}},16)}
function savePosition(){if(!win||win.isDestroyed())return;config.position=win.getPosition();save()}
function launchGrok(){const p=path.join(app.getPath('home'),'AppData','Local','Programs','Grok Bot','Grok Bot.exe');require('node:child_process').spawn(p,['--remote-debugging-address=127.0.0.1','--remote-debugging-port=19222'],{detached:true,stdio:'ignore',windowsHide:true}).unref()}
function template(){return[
 {label:`Grok：${connected?'已连接':'未连接'} · ${{idle:'空闲',thinking:'思考中',working:'工作中'}[mode]}`,enabled:false},
 {label:'随机动作',click:random,enabled:mode==='idle'},
 {label:'选择动作',submenu:[...Object.entries(names).map(([id,label])=>({label,enabled:mode==='idle',click:()=>setAction(id)})),{label:'跳一下',click:()=>{send({hop:true})},enabled:mode==='idle'}]},
 {type:'separator'},
 {label:'小球款式',submenu:Object.entries({cercle:'默认白球',galet:'鹅卵石',squircle:'圆角方形',capsule:'胶囊',triangle:'三角形',hexagone:'六边形',nuage:'云朵',goutte:'水滴'}).map(([id,label])=>({label,type:'radio',checked:config.shape===id,click:()=>{config.shape=id;save()}}))},
 {label:'小球颜色',submenu:Object.entries({creme:'默认白色',brun:'可可',rouge:'红色',orange:'橙色',ambre:'琥珀',vert:'薄荷绿',turquoise:'青色',bleu:'蓝色',violet:'紫色',rose:'粉色',gris:'灰色'}).map(([id,label])=>({label,type:'radio',checked:config.color===id,click:()=>{config.color=id;save()}}))},
 {label:'空闲表情',submenu:Object.entries({neutre:'自然',heureux:'开心',confus:'疑惑',curieux:'好奇',timide:'害羞',blase:'无语',somnolent:'困困',fier:'得意'}).map(([id,label])=>({label,type:'radio',checked:config.expression===id,click:()=>{config.expression=id;save()}}))},
 {label:'空闲时四处跳',type:'checkbox',checked:config.roam,click:i=>{config.roam=i.checked;save()}},
 {label:'恢复完整显示',enabled:!!config.dock,click:()=>{setDock(null);savePosition()}},
 {label:'大小',submenu:[.25,.375,.5,.625,.75,1].map(scale=>({label:`${Math.round(scale*100)}%${scale===.5?'（默认）':''}`,type:'radio',checked:config.scale===scale,click:()=>resize(scale)}))},
 {type:'separator'},{label:'打开 Grok Bot',click:launchGrok},
 {label:'联动状态',click:()=>{const {dialog}=require('electron');dialog.showMessageBox(win,{title:'bot · Grok 联动',message:connected?'Grok Bot 已连接':'等待 Grok Bot 状态桥接',detail:connected?`当前：${mode}\n思考显示问号，执行工具或生成回复时使用电脑。`:'请通过桌面的 Grok Bot 快捷方式启动。\n无需 API Key。\n如果连接断开，请退出 Grok Bot 再用快捷方式重开。',buttons:['知道了']})}},
 {label:'动作预览',submenu:['idle','thinking','working'].map(m=>({label:{idle:'空闲',thinking:'疑惑 / 问号',working:'电脑工作'}[m],click:()=>{mode=m;previewUntil=Date.now()+8000;send();clearTimeout(actionTimer);actionTimer=setTimeout(()=>{mode=lastStatus?.mode||'idle';send()},8000)}}))},
 {label:win?.isVisible()?'暂时隐藏':'显示 bot',click:()=>{win.isVisible()?win.hide():win.showInactive();updateTray()}},
 {label:'找回桌宠位置',click:resetPosition},{type:'separator'},{label:'退出 bot',click:()=>app.quit()}
]}
function updateTray(){if(quitting||!tray||tray.isDestroyed())return;if(lastTrayConnected!==connected){lastTrayConnected=connected;tray.setImage(nativeImage.createFromPath(path.join(__dirname,connected?'../assets/bot-connected.png':'../assets/bot-disconnected.png')).resize({width:24,height:24}))}const signature=JSON.stringify({connected,mode,config,visible:win?.isVisible()});if(signature===trayMenuSignature)return;trayMenuSignature=signature;tray.setContextMenu(Menu.buildFromTemplate(template()))}
function menu(){menuOpen=true;clearInterval(hopTimer);const m=Menu.buildFromTemplate(template());m.once('menu-will-close',()=>menuOpen=false);m.popup({window:win});return m}
app.whenReady().then(()=>{
 win=new BrowserWindow({width:Math.round(264*config.scale),height:Math.round(280*config.scale),transparent:true,frame:false,resizable:false,alwaysOnTop:true,skipTaskbar:true,hasShadow:false,show:false,backgroundColor:'#00000000',webPreferences:{preload:path.join(__dirname,'preload.cjs'),contextIsolation:true,nodeIntegration:false,backgroundThrottling:false}});
 win.setAlwaysOnTop(true,'floating');win.setVisibleOnAllWorkspaces(true);win.setMenu(null);
 win.loadFile(path.join(__dirname,'../dist/index.html'));
 win.once('ready-to-show',()=>{win.webContents.setZoomFactor(config.scale);if(Array.isArray(config.position))win.setPosition(...clampPosition(...config.position));else resetPosition();setDock(config.dock);win.showInactive();send()});
 win.webContents.on('render-process-gone',(_e,d)=>fs.appendFileSync(path.join(app.getPath('userData'),'error.log'),JSON.stringify(d)+'\n'));
 const icon=nativeImage.createFromPath(path.join(__dirname,'../assets/bot.png'));tray=new Tray(icon.resize({width:24,height:24}));tray.on('double-click',()=>{win.showInactive();updateTray()});updateTray();send();
 ipcMain.handle('snapshot',()=>snapshot());ipcMain.on('random',random);ipcMain.on('menu',menu);
 ipcMain.on('drag',(_e,phase)=>{if(phase==='start'){clearInterval(hopTimer);dragMoved=false;drag=screen.getCursorScreenPoint();dragOrigin=win.getPosition()}else if(phase==='move'&&drag){dragMoved=true;if(config.dock){config.dock=null;send()}const p=screen.getCursorScreenPoint();win.setPosition(...clampPosition(dragOrigin[0]+p.x-drag.x,dragOrigin[1]+p.y-drag.y))}else if(phase==='end'){finishDrag()}});
 let polling=false;
 every(async()=>{if(polling||process.env.BOT_SELFTEST==='1')return;polling=true;try{const data=await require('./grok-cdp.cjs').readGrok();if(quitting)return;connected=true;const nextMode=activity.update(data);lastStatus={mode:nextMode};if(Date.now()>=previewUntil)mode=nextMode;if(mode!=='idle'){clearTimeout(actionTimer);clearInterval(hopTimer);action='idle'}send();updateTray();fs.writeFileSync(path.join(app.getPath('userData'),'connection.json'),JSON.stringify({connected,mode,rawMode:data.mode,observed:data.observed,focused:data.focused,submissionSeq:data.submission?.seq??0,at:Date.now()}))}catch{if(!quitting){connected=false;activity.update(null);if(Date.now()>=previewUntil)mode='idle';send();updateTray()}}finally{polling=false}},250);
 every(()=>{if(Math.random()<.45)hop()},16000);
 // Transparent margins pass clicks through to the underlying desktop.
 every(()=>{if(process.env.BOT_SELFTEST==='1'||drag||menuOpen||!win||win.isDestroyed()||!win.isVisible())return;const p=screen.getCursorScreenPoint(),b=win.getBounds(),offset=dockOffset(config.dock),x=(p.x-b.x)/config.scale-offset[0],y=(p.y-b.y)/config.scale-offset[1];const hit=Math.hypot((x-(mode==='working'?101:132))/1.05,y-(mode==='working'?174:135))<(mode==='working'?80:87)||(mode==='working'&&x>75&&x<262&&y>120&&y<263)||(mode==='thinking'&&x>145&&x<240&&y<100);win.setIgnoreMouseEvents(!hit,{forward:true})},70);
 if(process.env.BOT_SELFTEST==='1')require('./selftest.cjs').run({win,snapshot,setAction,hop,menu,setDock,resize,setConnection:value=>{connected=value;send();updateTray()},trayText:()=>trayTooltip,setMode:m=>{mode=m;send()},setConfig:c=>{Object.assign(config,c);send()},quit:()=>app.quit(),output:process.env.BOT_TEST_OUTPUT});
});
app.on('second-instance',()=>{win?.showInactive()});app.on('before-quit',()=>{quitting=true;require('./grok-cdp.cjs').disconnect();clearTimeout(actionTimer);clearInterval(hopTimer);intervals.forEach(clearInterval);if(win&&!win.isDestroyed()){config.position=win.getPosition();fs.mkdirSync(path.dirname(configPath),{recursive:true});fs.writeFileSync(configPath,JSON.stringify(config,null,2))}});app.on('window-all-closed',()=>app.quit());
