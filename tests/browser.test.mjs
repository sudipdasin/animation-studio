import test from 'node:test';
import assert from 'node:assert/strict';
import {spawn} from 'node:child_process';
import {chromium} from 'playwright';
const port=8765;
const server=spawn('python3',['-m','http.server',String(port),'--bind','127.0.0.1','--directory','web-dist'],{stdio:'ignore'});
const browser=await chromium.launch({channel:'chrome',headless:true,args:['--use-gl=angle','--use-angle=swiftshader','--enable-webgl','--disable-web-security','--no-sandbox']});
async function openApp(){
  const page=await browser.newPage({viewport:{width:1440,height:900}});
  const errors=[];page.on('pageerror',e=>errors.push(e.message));
  for(let i=0;i<30;i++){try{await page.goto('http://127.0.0.1:'+port+'/?test=1',{waitUntil:'domcontentloaded'});break}catch{await new Promise(r=>setTimeout(r,200))}}
  await page.waitForFunction(()=>window.__studioDebug?.ready===true,{timeout:30000});
  await page.waitForFunction(()=>window.__studioDebug?.meshes().length>=2,{timeout:10000});
  assert.deepEqual(errors,[],'JavaScript runtime errors');
  return page;
}
test.after(async()=>{await browser.close();server.kill()});
test('offline-bundled 3D application initializes with cube and sphere',async()=>{
  const page=await openApp();
  const meshes=await page.evaluate(()=>window.__studioDebug.meshes());
  assert(meshes.some(m=>m.type==='box'));
  assert(meshes.some(m=>m.type==='sphere'));
  const bundles=await page.locator('script[src$="app.bundle.js"]').count();
  assert.equal(bundles,1);
  await page.close();
});
test('sculpt stroke changes only sphere and undo/redo restores it',async()=>{
  const page=await openApp();
  await page.locator('[data-mode="sculpt"]').click();
  await page.evaluate(()=>window.__studioDebug.select('sphere'));
  await page.locator('[data-brush="inflate"]').click();
  const before=await page.evaluate(()=>({sphere:window.__studioDebug.signature('sphere'),box:window.__studioDebug.signature('box')}));
  const p=await page.evaluate(()=>window.__studioDebug.project('sphere'));
  await page.mouse.move(p.x,p.y);
  await page.mouse.down();
  await page.mouse.move(p.x+12,p.y+6,{steps:4});
  await page.mouse.up();
  const after=await page.evaluate(()=>({sphere:window.__studioDebug.signature('sphere'),box:window.__studioDebug.signature('box')}));
  assert.notEqual(after.sphere.weighted,before.sphere.weighted,'sphere vertices should change');
  assert.deepEqual(after.box,before.box,'cube geometry must remain unchanged');
  await page.locator('#undoSculpt').click();
  assert.deepEqual(await page.evaluate(()=>window.__studioDebug.signature('sphere')),before.sphere,'undo should restore sphere');
  await page.locator('#redoSculpt').click();
  assert.deepEqual(await page.evaluate(()=>window.__studioDebug.signature('sphere')),after.sphere,'redo should reapply stroke');
  await page.close();
});
test('paint fill changes only selected sphere colors',async()=>{
  const page=await openApp();
  await page.locator('[data-mode="paint"]').click();
  await page.evaluate(()=>window.__studioDebug.select('sphere'));
  const before=await page.evaluate(()=>({sphere:window.__studioDebug.signature('sphere','color'),box:window.__studioDebug.signature('box','color')}));
  await page.locator('#paintBrushColor').fill('#ff0000');
  await page.locator('#paintFill').click();
  const after=await page.evaluate(()=>({sphere:window.__studioDebug.signature('sphere','color'),box:window.__studioDebug.signature('box','color')}));
  assert.notDeepEqual(after.sphere,before.sphere);
  assert.deepEqual(after.box,before.box);
  await page.close();
});
test('animation keyframes are added for selected sphere',async()=>{
  const page=await openApp();
  await page.locator('[data-mode="animate"]').click();
  await page.evaluate(()=>window.__studioDebug.select('sphere'));
  const count=await page.evaluate(()=>window.__studioDebug.keyCount());
  await page.locator('#keyBtn').click();
  assert.equal(await page.evaluate(()=>window.__studioDebug.keyCount()),count+1);
  await page.close();
});

test('Community feedback identifies current beta and responsive viewport remains usable',async()=>{
  const page=await openApp();
  await page.locator('#feedback-toggle').click();
  await page.locator('#feedback-description').fill('Test feedback draft');
  await page.evaluate(()=>{window.__feedbackUrl=null;window.open=(url)=>{window.__feedbackUrl=url;return null}});
  await page.locator('#feedback-submit').click();
  const feedbackUrl=await page.evaluate(()=>window.__feedbackUrl);
  assert.equal(new URL(feedbackUrl).searchParams.get('body').includes('Version: v0.6.4-beta.1'),true);
  await page.setViewportSize({width:720,height:740});
  assert.equal(await page.locator('#viewport').isVisible(),true);
  assert.equal(await page.locator('[data-mode="sculpt"]').isVisible(),true);
  await page.close();
});

test('invalid project import is rejected without destroying current scene',async()=>{
 const page=await openApp();
 const before=await page.evaluate(()=>window.__studioDebug.objectCount());
 await assert.rejects(page.evaluate(()=>window.__studioDebug.loadProject({version:1,objects:[{type:'sphere',name:'broken',color:'#ffffff',position:[0,0,0],rotation:[0,0,0],scale:[Infinity,1,1]}]})));
 assert.equal(await page.evaluate(()=>window.__studioDebug.objectCount()),before);
 await page.close();
});

test('duplicating an object preserves source and creates independently editable geometry',async()=>{
 const page=await openApp();
 const before=await page.evaluate(()=>window.__studioDebug.signature('sphere'));
 const count=await page.evaluate(()=>window.__studioDebug.objectCount());
 await page.evaluate(()=>window.__studioDebug.select('sphere'));
 await page.locator('#duplicateBtn').click();
 assert.equal(await page.evaluate(()=>window.__studioDebug.objectCount()),count+1);
 assert.deepEqual(await page.evaluate(()=>window.__studioDebug.signature('sphere')),before);
 await page.close();
});

test('local recovery snapshot can be saved without leaving the editor',async()=>{
 const page=await openApp();
 await page.locator('#recoverySaveBtn').click();
 assert.equal(await page.evaluate(()=>Boolean(localStorage.getItem('animation-studio-community-recovery-v1'))),true);
 assert.equal(await page.locator('#viewport').isVisible(),true);
 await page.close();
});

test('recovery restores the saved scene after edits',async()=>{
 const page=await openApp();
 const initial=await page.evaluate(()=>window.__studioDebug.objectCount());
 await page.locator('#recoverySaveBtn').click();
 await page.evaluate(()=>window.__studioDebug.duplicateSelected());
 assert.equal(await page.evaluate(()=>window.__studioDebug.objectCount()),initial+1);
 page.on('dialog',dialog=>dialog.accept());
 await page.locator('#recoveryRestoreBtn').click();
 assert.equal(await page.evaluate(()=>window.__studioDebug.objectCount()),initial);
 await page.close();
});
test('corrupted recovery never clears existing scene',async()=>{
 const page=await openApp();
 const initial=await page.evaluate(()=>window.__studioDebug.objectCount());
 await page.evaluate(()=>localStorage.setItem('animation-studio-community-recovery-v1','{broken json'));
 await page.locator('#recoveryRestoreBtn').click();
 assert.equal(await page.evaluate(()=>window.__studioDebug.objectCount()),initial);
 await page.close();
});

test('recovery falls back to previous valid snapshot when latest is corrupt',async()=>{
 const page=await openApp();
 const original=await page.evaluate(()=>window.__studioDebug.objectCount());
 await page.locator('#recoverySaveBtn').click();
 await page.evaluate(()=>window.__studioDebug.duplicateSelected());
 await page.locator('#recoverySaveBtn').click();
 await page.evaluate(()=>localStorage.setItem('animation-studio-community-recovery-v1','{corrupt'));
 page.on('dialog',dialog=>dialog.accept());
 await page.locator('#recoveryRestoreBtn').click();
 assert.equal(await page.evaluate(()=>window.__studioDebug.objectCount()),original);
 await page.close();
});

test('automatic recovery preserves a scene on pagehide',async()=>{
 const page=await openApp();
 const count=await page.evaluate(()=>window.__studioDebug.objectCount());
 await page.evaluate(()=>window.dispatchEvent(new Event('pagehide')));
 const stored=await page.evaluate(()=>JSON.parse(localStorage.getItem('animation-studio-community-recovery-v1-autosave')));
 assert.equal(stored.objects.length,count);
 await page.close();
});
test('manual recovery snapshot is not overwritten by automatic recovery',async()=>{
 const page=await openApp();
 await page.locator('#recoverySaveBtn').click();
 const original=await page.evaluate(()=>localStorage.getItem('animation-studio-community-recovery-v1'));
 await page.evaluate(()=>{window.__studioDebug.duplicateSelected();window.dispatchEvent(new Event('pagehide'))});
 assert.equal(await page.evaluate(()=>localStorage.getItem('animation-studio-community-recovery-v1')),original);
 await page.close();
});
