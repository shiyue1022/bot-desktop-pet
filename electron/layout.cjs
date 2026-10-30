function clampToArea(x,y,width,height,area){return [Math.round(Math.min(Math.max(x,area.x),area.x+area.width-width)),Math.round(Math.min(Math.max(y,area.y),area.y+area.height-height))]}
function edgeAt(x,y,width,height,area,threshold=12){
 const distances=[['left',Math.abs(x-area.x)],['right',Math.abs(x+width-area.x-area.width)],['top',Math.abs(y-area.y)],['bottom',Math.abs(y+height-area.y-area.height)]];
 distances.sort((a,b)=>a[1]-b[1]);return distances[0][1]<=threshold?distances[0][0]:null;
}
function dockPosition(edge,x,y,width,height,area){const p=clampToArea(x,y,width,height,area);if(edge==='left')p[0]=area.x;if(edge==='right')p[0]=area.x+area.width-width;if(edge==='top')p[1]=area.y;if(edge==='bottom')p[1]=area.y+area.height-height;return p}
function dockOffset(edge){return {left:[-132,0],right:[132,0],top:[0,-134],bottom:[0,146]}[edge]||[0,0]}
module.exports={clampToArea,edgeAt,dockPosition,dockOffset};
