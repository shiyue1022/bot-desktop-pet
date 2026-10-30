<script setup lang="ts">
import {computed,onMounted,onBeforeUnmount,ref} from 'vue'
const seconds=ref(0)
let raf=0,start=0
function tick(ms:number){if(!start)start=ms;seconds.value=(ms-start)/1000;raf=requestAnimationFrame(tick)}
onMounted(()=>{raf=requestAnimationFrame(tick)})
onBeforeUnmount(()=>cancelAnimationFrame(raf))
const active=computed(()=>seconds.value%8.4<5.7)
const leftTap=computed(()=>active.value?(1+Math.sin(seconds.value*Math.PI*2/.42))*2.8:0)
const rightTap=computed(()=>active.value?(1-Math.sin(seconds.value*Math.PI*2/.42))*2.8:0)
const keys=Array.from({length:27},(_,i)=>({x:(i%9)*7.6,y:Math.floor(i/9)*7.5}))
</script>
<template>
 <svg class="laptop" :class="{paused:!active}" viewBox="0 0 240 240" aria-label="侧身使用笔记本电脑">
  <defs>
   <linearGradient id="work-lid" x1="0" y1="0" x2="1" y2="1"><stop stop-color="#444c60"/><stop offset="1" stop-color="#202737"/></linearGradient>
   <linearGradient id="work-base" x1="0" y1="0" x2="0" y2="1"><stop stop-color="#e2e7ef"/><stop offset="1" stop-color="#a7b2c4"/></linearGradient>
  </defs>
  <g transform="translate(6 10)">
  <ellipse cx="151" cy="227" rx="70" ry="5" fill="#202838" opacity=".13"/>
  <!-- Fixed screen and an exposed keyboard in the same perspective. -->
  <path d="M140 110 Q141 107 146 109 L227 131 Q231 132 230 138 L223 198 L217 202 L132 178Z" fill="#1d2432"/>
  <path d="M140 111 L225 134 L218 198 L133 174Z" fill="url(#work-lid)" stroke="#8f9bb0" stroke-width="1.4" stroke-linejoin="round"/>
  <path d="M146 120 L217 139 L211 186 L141 167Z" fill="#121d2c"/>
  <g transform="matrix(.96 .27 -.1 1 151 131)" fill="none" stroke-linecap="round" stroke-width="2.4">
   <path d="M0 0H22 M0 8H10 M16 8H42 M0 16H30 M0 24H17" stroke="#83bfd7" opacity=".9"/>
   <path d="M28 0H42 M0 32H12" stroke="#baa8f0"/>
   <path class="screen-caret" d="M17 29V35" stroke="#e8f3ff"/>
  </g>
  <path data-part="laptop-base" d="M133 175 L219 199 L167 232 Q165 233 161 232 L78 209 Q75 208 79 205Z" fill="#8491a5" stroke="#6e7c93" stroke-width="1" stroke-linejoin="round"/>
  <path d="M133 175 L218 199 L165 228 L78 205Z" fill="url(#work-base)"/>
  <path d="M133 176 L217 200" stroke="#66768e" stroke-width="2"/>
  <g class="keyboard" transform="matrix(1 .28 -1 .65 129 182)">
   <rect x="-3" y="-3" width="75" height="25" rx="2" fill="#7d8da4"/>
   <rect v-for="(key,i) in keys" :key="i" :x="key.x" :y="key.y" width="5.7" height="5" rx="1" fill="#25354b"/>
  </g>
  <path d="M105 206 L134 214 L120 222 L92 214Z" fill="#a8b5c9" stroke="#8d9db5" stroke-width=".8"/>
  <path d="M151 226 L163 229 L173 223" fill="none" stroke="#e7edf5" stroke-width="1.2"/>
  <ellipse cx="151" cy="195" rx="9" ry="3" fill="#1b293d" opacity=".17"/>
  <ellipse cx="176" cy="205" rx="9" ry="3" fill="#1b293d" opacity=".17"/>
  </g>
 </svg>
 <svg class="work-hands" viewBox="0 0 240 240" aria-label="两个小球交替敲键盘">
  <defs><radialGradient id="work-paw" cx=".35" cy=".28" r=".8"><stop offset="0" stop-color="#ffffff"/><stop offset=".7" stop-color="#ffffff"/><stop offset="1" stop-color="#e3e8ef"/></radialGradient></defs>
  <g transform="translate(6 10)">
   <g class="hand left" :transform="`translate(151 ${190-leftTap})`"><circle r="8.5" fill="url(#work-paw)" stroke="#ccd5e2" stroke-width=".8"/></g>
   <g class="hand right" :transform="`translate(176 ${201-rightTap})`"><circle r="8.5" fill="url(#work-paw)" stroke="#ccd5e2" stroke-width=".8"/></g>
  </g>
 </svg>
</template>
<style scoped>
.laptop{position:absolute;z-index:1;inset:0;width:240px;height:240px;overflow:visible;animation:open-laptop .25s ease-out both;pointer-events:none}
.work-hands{position:absolute;z-index:3;inset:0;width:240px;height:240px;overflow:visible;pointer-events:none;animation:open-laptop .25s ease-out both}
.screen-caret{animation:caret 1.2s steps(1) infinite}.paused .screen-caret{opacity:.4}
@keyframes caret{50%{opacity:0}}
@keyframes open-laptop{from{opacity:0;translate:0 12px}to{opacity:1;translate:0 0}}
</style>
