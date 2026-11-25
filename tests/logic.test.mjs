import fs from 'node:fs';
function verify(source,btoa,atob){
const check=(ok,message)=>{if(!ok)throw Error(message)};
const codec=source.slice(source.indexOf('const meshBaselines='),source.indexOf('function validateProject'));
const curves=source.slice(source.indexOf('const KEY_EASES='),source.indexOf('function selectedKey()'));
const validate=source.slice(source.indexOf('function validateProject'),source.indexOf('function loadProject'));
const api=new Function('btoa','atob',codec+curves+validate+';return {packFloats,unpackFloats,easeProgress,validateProject}') (btoa,atob);
let passed=0;const run=(name,fn)=>{fn();passed++;};const rejects=fn=>{let rejected=false;try{fn()}catch{rejected=true}check(rejected,'Expected rejection')};
run('codec roundtrip',()=>{const values=new Float32Array([.25,-1.125,3.75,0]);const result=api.unpackFloats(api.packFloats(values),4,-10,10);check(values.every((v,i)=>v===result[i]),'Float32 roundtrip')});
for(const [name,values,lo,hi] of [['nonfinite',[NaN],-10,10],['infinity',[Infinity],-10,10],['color range',[2],0,1]])run(name,()=>rejects(()=>api.unpackFloats(api.packFloats(values),1,lo,hi)));
run('invalid alphabet',()=>rejects(()=>api.unpackFloats('!!!!!!!!',1,-10,10)));
run('invalid length',()=>rejects(()=>api.unpackFloats(api.packFloats([1]),2,-10,10)));
for(const [mode,x,y] of [['linear',.25,.25],['smooth',.25,.15625],['in',.5,.25],['out',.5,.75],['hold',.999,0],['hold',1,1],['linear',-1,0],['smooth',2,1],['unknown',.5,.5]])run(mode+' '+x,()=>check(Math.abs(api.easeProgress(mode,x)-y)<1e-8,'curve mismatch'));
const o={type:'box',name:'A',color:'#ffffff',position:[0,0,0],rotation:[0,0,0],scale:[1,1,1]},k={name:'A',t:1,p:[0,0,0],r:[0,0,0],s:[1,1,1],ease:'smooth'};
run('valid legacy project',()=>api.validateProject({version:1,objects:[o],keys:[{...k,ease:undefined}]}));
run('valid curve project',()=>api.validateProject({version:1,objects:[o],keys:[k]}));
for(const [name,p] of [['duplicate object',{objects:[o,o]}],['orphan',{objects:[o],keys:[{...k,name:'B'}]}],['duplicate key',{objects:[o],keys:[k,k]}],['out of range time',{objects:[o],keys:[{...k,t:11}]}],['invalid curve',{objects:[o],keys:[{...k,ease:'bad'}]}],['bad scale',{objects:[{...o,scale:[0,1,1]}]}],['invalid encoding',{objects:[{...o,mesh:{encoding:'bad'}}]}]])run(name,()=>rejects(()=>api.validateProject({version:1,...p})));
return passed;
}
const source=fs.readFileSync(new URL('../index.html',import.meta.url),'utf8');
// Core logic is extracted from the actual editor rather than duplicated.
console.log('Dependency-free editor checks passed:',verify(source,btoa,atob));
