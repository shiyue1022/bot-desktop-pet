import {packager} from '@electron/packager'
import {copyFileSync,existsSync,unlinkSync} from 'node:fs'
import path from 'node:path'
import {fileURLToPath} from 'node:url'
import {spawnSync} from 'node:child_process'
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..')
if(process.platform!=='win32')throw Error('Package the Windows release on Windows.')
const result=await packager({dir:root,name:'bot',platform:'win32',arch:'x64',out:path.join(root,'release'),overwrite:true,asar:true,icon:path.join(root,'assets/bot.ico'),ignore:[/^\/(src|scripts|docs|release|test-artifacts|\.git|\.github)(\/|$)/,/^\/README.*\.md$/,/^\/vite\.config\.ts$/,/^\/tsconfig\.json$/,/^\/index\.html$/,/\.test\.cjs$/,/selftest\.cjs$/]})
const bundle=result[0]
for(const [from,to] of [['scripts/install.ps1','install.ps1'],['scripts/Install.cmd','Install.cmd'],['assets/bot.ico','bot.ico'],['LICENSE','LICENSE.bot'],['LICENSE.bloub','LICENSE.bloub'],['THIRD_PARTY.md','THIRD_PARTY.md']])copyFileSync(path.join(root,from),path.join(bundle,to))
const zip=path.join(root,'release','bot-desktop-pet-windows-x64.zip')
const escape=s=>s.replaceAll("'","''")
if(existsSync(zip))unlinkSync(zip)
const script=`Add-Type -AssemblyName System.IO.Compression.FileSystem; [IO.Compression.ZipFile]::CreateFromDirectory('${escape(bundle)}','${escape(zip)}',[IO.Compression.CompressionLevel]::Optimal,$true)`
const packed=spawnSync('powershell.exe',['-NoProfile','-Command',script],{stdio:'inherit',windowsHide:true})
if(packed.status!==0||!existsSync(zip))throw Error('Release ZIP could not be created.')
console.log(zip)
