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
  assert.equal(new URL(feedbackUrl).searchParams.get('body').includes('Version: v3.0.0-beta.1'),true);
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

test('automatic recovery can restore a changed scene when manual snapshots are absent',async()=>{
 const page=await openApp();
 const initial=await page.evaluate(()=>window.__studioDebug.objectCount());
 await page.evaluate(()=>window.dispatchEvent(new Event('pagehide')));
 await page.evaluate(()=>window.__studioDebug.duplicateSelected());
 await page.evaluate(()=>{localStorage.removeItem('animation-studio-community-recovery-v1');localStorage.removeItem('animation-studio-community-recovery-v1-previous')});
 page.on('dialog',dialog=>dialog.accept());
 await page.locator('#recoveryRestoreBtn').click();
 assert.equal(await page.evaluate(()=>window.__studioDebug.objectCount()),initial);
 await page.close();
});
test('invalid automatic snapshot does not destroy current scene',async()=>{
 const page=await openApp();
 const initial=await page.evaluate(()=>window.__studioDebug.objectCount());
 await page.evaluate(()=>{localStorage.removeItem('animation-studio-community-recovery-v1');localStorage.removeItem('animation-studio-community-recovery-v1-previous');localStorage.setItem('animation-studio-community-recovery-v1-autosave','{bad')});
 await page.locator('#recoveryRestoreBtn').click();
 assert.equal(await page.evaluate(()=>window.__studioDebug.objectCount()),initial);
 await page.close();
});

test('recovery respects cancellation and keeps edited scene intact',async()=>{
 const page=await openApp();
 await page.locator('#recoverySaveBtn').click();
 await page.evaluate(()=>window.__studioDebug.duplicateSelected());
 const edited=await page.evaluate(()=>window.__studioDebug.objectCount());
 page.on('dialog',dialog=>dialog.dismiss());
 await page.locator('#recoveryRestoreBtn').click();
 assert.equal(await page.evaluate(()=>window.__studioDebug.objectCount()),edited);
 await page.close();
});
test('recovery rejects oversized saved data without changing the scene',async()=>{
 const page=await openApp();
 const count=await page.evaluate(()=>window.__studioDebug.objectCount());
 await page.evaluate(()=>{localStorage.setItem('animation-studio-community-recovery-v1','x'.repeat(1500001));localStorage.removeItem('animation-studio-community-recovery-v1-previous');localStorage.removeItem('animation-studio-community-recovery-v1-autosave')});
 await page.locator('#recoveryRestoreBtn').click();
 assert.equal(await page.evaluate(()=>window.__studioDebug.objectCount()),count);
 await page.close();
});

test('invalid project keyframe is rejected before changing current scene',async()=>{
 const page=await openApp();
 const count=await page.evaluate(()=>window.__studioDebug.objectCount());
 const result=await page.evaluate(()=>{try{window.__studioDebug.loadProject({version:1,objects:[],keys:[{name:'sphere',t:1,p:[0,Infinity,0],r:[0,0,0],s:[1,1,1]}]});return 'accepted'}catch{return 'rejected'}});
 assert.equal(result,'rejected');
 assert.equal(await page.evaluate(()=>window.__studioDebug.objectCount()),count);
 await page.close();
});
test('invalid project object transform is rejected without scene mutation',async()=>{
 const page=await openApp();
 const count=await page.evaluate(()=>window.__studioDebug.objectCount());
 const result=await page.evaluate(()=>{try{window.__studioDebug.loadProject({version:1,objects:[{type:'box',name:'bad',color:'#ffffff',position:[0,0,0],rotation:[0,0,0],scale:[0,0,0]}]});return 'accepted'}catch{return 'rejected'}});
 assert.equal(result,'rejected');
 assert.equal(await page.evaluate(()=>window.__studioDebug.objectCount()),count);
 await page.close();
});

test('keyframe project round trip restores objects and animation keys',async()=>{
 const page=await openApp();
 const initial=await page.evaluate(()=>window.__studioDebug.objectCount());
 await page.evaluate(()=>window.__studioDebug.addKey());
 const saved=await page.evaluate(()=>JSON.parse(localStorage.getItem('animation-studio-community-recovery-v1')||'null'));
 await page.locator('#recoverySaveBtn').click();
 const snapshot=await page.evaluate(()=>JSON.parse(localStorage.getItem('animation-studio-community-recovery-v1')));
 assert.equal(snapshot.keys.length,1);
 await page.evaluate(()=>window.__studioDebug.duplicateSelected());
 page.on('dialog',dialog=>dialog.accept());
 await page.locator('#recoveryRestoreBtn').click();
 assert.equal(await page.evaluate(()=>window.__studioDebug.objectCount()),initial);
 assert.equal(await page.evaluate(()=>window.__studioDebug.keyCount()),1);
 await page.close();
});

test('timeline upserts same-time keyframes instead of duplicating',async()=>{
 const page=await openApp();
 await page.evaluate(()=>{window.__studioDebug.addKey();window.__studioDebug.addKey()});
 assert.equal(await page.evaluate(()=>window.__studioDebug.keyCount()),1);
 await page.close();
});
test('timeline keyframe delete removes current key and keeps objects',async()=>{
 const page=await openApp();
 const before=await page.evaluate(()=>window.__studioDebug.objectCount());
 await page.evaluate(()=>window.__studioDebug.addKey());
 await page.locator('#deleteKeyBtn').click();
 assert.equal(await page.evaluate(()=>window.__studioDebug.keyCount()),0);
 assert.equal(await page.evaluate(()=>window.__studioDebug.objectCount()),before);
 await page.close();
});

test('duplicating animated object preserves independent keyframes',async()=>{
 const page=await openApp();
 await page.evaluate(()=>window.__studioDebug.addKey());
 const before=await page.evaluate(()=>window.__studioDebug.keyCount());
 await page.evaluate(()=>window.__studioDebug.duplicateSelected());
 assert.equal(await page.evaluate(()=>window.__studioDebug.keyCount()),before*2);
 await page.evaluate(()=>window.__studioDebug.deleteKeyAtPlayhead());
 assert.equal(await page.evaluate(()=>window.__studioDebug.keyCount()),before);
 await page.close();
});

test('timeline previous and next keyframe navigation',async()=>{
 const page=await openApp();
 await page.evaluate(()=>{window.__studioDebug.addKey();window.__studioDebug.seek(2);window.__studioDebug.addKey();window.__studioDebug.seek(5);window.__studioDebug.addKey();window.__studioDebug.seek(3)});
 await page.locator('#previousKeyBtn').click();
 assert.equal(await page.evaluate(()=>window.__studioDebug.currentTime()),2);
 await page.locator('#nextKeyBtn').click();
 assert.equal(await page.evaluate(()=>window.__studioDebug.currentTime()),5);
 await page.close();
});
