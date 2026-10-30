<script setup lang="ts">
import {ref, computed,onMounted,onBeforeUnmount} from 'vue'
import BloubBot from './components/BloubBot.vue'
import WorkingLaptop from './components/WorkingLaptop.vue'
import type {StateId} from './bot/states'
const cfg=ref({shape:'cercle',color:'creme',expression:'neutre',roam:true,scale:.5,dock:null as string|null})
const mode=ref('idle'), action=ref<StateId>('idle'), connected=ref(false), hopping=ref(false)
const held=ref(false),tilt=ref(0)
const dockOffset=computed(()=>({left:[-132,0],right:[132,0],top:[0,-134],bottom:[0,146]}[cfg.value.dock||'']||[0,0]))
const dockGaze=computed(()=>cfg.value.dock?()=>({yaw:cfg.value.dock==='left'?34:cfg.value.dock==='right'?-34:0,pitch:cfg.value.dock==='top'?-32:cfg.value.dock==='bottom'?32:0,spin:0,wander:0,mix:1}):null)
const workGaze=(t:number)=>{const phase=t%8.4;const lift=phase>5.7&&phase<7.8?Math.sin((phase-5.7)/2.1*Math.PI):0;return{yaw:20-18*lift,pitch:6+18*lift,mix:1,spin:0,wander:.08}}
const gaze=computed(()=>dockGaze.value||(mode.value==='working'&&!held.value?workGaze:null))
const state=computed(()=>held.value?'wide':mode.value==='thinking'?'idle':mode.value==='working'?'idle':action.value)
const expression=computed(()=>held.value?'surpris':mode.value==='thinking'?'confus':mode.value==='working'?'attentif':cfg.value.expression)
let unsub:()=>void
let pointer:{x:number,y:number,drag:boolean}|null=null
const api=(window as any).bot
function receive(data:any){cfg.value=data.config;mode.value=data.mode;action.value=data.action;connected.value=data.connected;if(data.hop){hopping.value=true;setTimeout(()=>hopping.value=false,700)}}
onMounted(async()=>{receive(await api.snapshot());unsub=api.subscribe(receive)})
onBeforeUnmount(()=>{unsub?.()})
function down(e:PointerEvent){if(e.button!==0)return;pointer={x:e.screenX,y:e.screenY,drag:false};(e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);api.drag('start')}
function move(e:PointerEvent){if(pointer){if(Math.hypot(e.screenX-pointer.x,e.screenY-pointer.y)>5)pointer.drag=true;if(pointer.drag){held.value=true;tilt.value=Math.max(-12,Math.min(12,e.movementX*1.8));api.drag('move')}}}
function up(){if(!pointer)return;const click=!pointer.drag;pointer=null;held.value=false;tilt.value=0;api.drag('end');if(click)api.random()}
</script>
<template>
 <main :class="{docked:!!cfg.dock}" :style="{transform:`translate(${dockOffset[0]}px,${dockOffset[1]}px)`}" @contextmenu.prevent="api.menu()" @pointerdown="down" @pointermove="move" @pointerup="up" @lostpointercapture="pointer && up()">
  <div class="pet" :style="{'--tilt':tilt+'deg'}" :class="{hop:hopping,working:mode==='working',dragging:held}">
   <WorkingLaptop v-if="mode==='working'" />
   <BloubBot class="bot-body" :size="240" :state="state" :shape="cfg.shape" :color="cfg.color" :expression="expression" paper="#ffffff" :cycle="[]" :follow="!cfg.dock && !held && mode!=='working'" :gaze="gaze" />
   <div v-if="mode==='thinking'" class="questions" aria-label="思考中">?<i>?</i><b>?</b></div>
   <div v-if="action==='sleep' && mode==='idle'" class="zzz">z z Z</div>
  </div>
 </main>
</template>
<style>
*{box-sizing:border-box}html,body,#app{margin:0;width:100%;height:100%;background:transparent!important;overflow:hidden;user-select:none;font-family:'Microsoft YaHei',sans-serif}main{width:264px;height:280px;position:relative;cursor:grab;touch-action:none}main:active{cursor:grabbing}.pet{position:absolute;left:12px;top:14px;width:240px;height:240px;filter:drop-shadow(0 4px 5px #0002);transform-origin:center 75%}.pet svg{display:block}.bot-body{position:relative;z-index:2}.questions{position:absolute;top:5px;right:35px;color:#505568;font:bold 42px 'Segoe UI';transform:rotate(13deg);animation:question 1.9s infinite}.questions i{position:absolute;font-size:21px;right:-21px;top:27px;font-style:normal;transform:rotate(20deg)}.questions b{position:absolute;font-size:17px;left:-25px;top:12px;transform:rotate(-25deg)}.zzz{position:absolute;top:16px;right:32px;font:bold 21px 'Segoe UI';color:#8894b0;animation:question 3s infinite}.hop{animation:jump .7s ease-in-out}.working>.bot-body{transform:translate(-34px,36px) rotate(7deg) scale(.96,.98);transform-origin:110px 160px;transition:transform .25s ease-out}@keyframes jump{0%,100%{transform:translateY(0) scale(1)}15%{transform:scale(1.12,.86)}50%{transform:translateY(-46px) rotate(-10deg) scale(.95,1.08)}85%{transform:translateY(0) scale(1.08,.92)}}@keyframes question{0%,100%{opacity:.65;translate:0 3px}50%{opacity:1;translate:0 -5px}}
</style>

<style>
.pet{transition:transform .18s ease-out}.pet.dragging{animation:none;transform:translateY(-6px) scale(.9,1.12) rotate(var(--tilt));filter:drop-shadow(0 12px 8px #0003)}main:has(.dragging){cursor:grabbing}
</style>
