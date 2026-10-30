import electron from 'electron'
import path from 'node:path'
import {fileURLToPath} from 'node:url'
import {mkdirSync,readFileSync,existsSync,rmSync} from 'node:fs'
import {spawnSync} from 'node:child_process'
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..')
const output=path.join(root,'test-artifacts','ui')
mkdirSync(output,{recursive:true})
const report=path.join(output,'ui-test.txt')
if(existsSync(report))rmSync(report)
const env={...process.env,BOT_SELFTEST:'1',BOT_TEST_OUTPUT:output}
delete env.ELECTRON_RUN_AS_NODE
const child=spawnSync(electron,[root],{cwd:root,env,stdio:'inherit',timeout:60000,windowsHide:true})
if(child.status!==0||!existsSync(report)||readFileSync(report,'utf8').includes('FAIL'))throw Error('UI checks failed. Inspect test-artifacts/ui.')
console.log(readFileSync(report,'utf8'))
