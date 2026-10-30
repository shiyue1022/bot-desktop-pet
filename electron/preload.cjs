const {contextBridge,ipcRenderer}=require('electron');
contextBridge.exposeInMainWorld('bot',{
 snapshot:()=>ipcRenderer.invoke('snapshot'),
 subscribe:fn=>{const handler=(_e,v)=>fn(v);ipcRenderer.on('snapshot',handler);return()=>ipcRenderer.removeListener('snapshot',handler)},
 menu:()=>ipcRenderer.send('menu'),random:()=>ipcRenderer.send('random'),
 drag:phase=>ipcRenderer.send('drag',phase)
});
