const {test}=require('node:test'),assert=require('node:assert/strict');
const {clampToArea,edgeAt,dockPosition,dockOffset}=require('./layout.cjs');
const area={x:-1920,y:0,width:1920,height:1040},w=132,h=140;
test('all four edges dock using the current display work area',()=>{
 assert.equal(edgeAt(-1915,400,w,h,area),'left');assert.equal(edgeAt(-135,400,w,h,area),'right');assert.equal(edgeAt(-900,3,w,h,area),'top');assert.equal(edgeAt(-900,898,w,h,area),'bottom');assert.equal(edgeAt(-900,400,w,h,area),null);
 assert.deepEqual(dockPosition('right',-135,400,w,h,area),[-132,400]);assert.deepEqual(clampToArea(-2500,1200,w,h,area),[-1920,900]);
});
test('clipping places the head midpoint on each window edge',()=>{
 assert.equal(132+dockOffset('left')[0],0);assert.equal(132+dockOffset('right')[0],264);assert.equal(134+dockOffset('top')[1],0);assert.equal(134+dockOffset('bottom')[1],280);assert.deepEqual(dockOffset(null),[0,0]);
});
