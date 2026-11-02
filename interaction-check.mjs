import fs from 'node:fs';
import vm from 'node:vm';
import assert from 'node:assert/strict';

// Exercise the actual pointer handlers without a browser or an audio device.
const handlers={}, classes=new Set();
let hitCat=true, now=10000, draw, rewards=0, captured=null;
const canvas={clientWidth:1000,clientHeight:700,dataset:{},tabIndex:0,
 classList:{toggle(k,on){on?classes.add(k):classes.delete(k)},remove(k){classes.delete(k)}},
 addEventListener(k,fn){handlers[k]=fn},getBoundingClientRect(){return {left:0,top:0,width:1000,height:700}},
 setPointerCapture(id){captured=id},hasPointerCapture(id){return captured===id},releasePointerCapture(){captured=null}};
const context=vm.createContext({console:{warn(){}},Math,devicePixelRatio:1,
 performance:{now:()=>now},matchMedia:()=>({matches:true}),
 requestAnimationFrame(fn){draw=fn;return 1},cancelAnimationFrame(){},
 ResizeObserver:class{observe(){}disconnect(){}},
 document:{hidden:false,querySelector:()=>null,createElement(){return {getContext(){return new Proxy({},{get:(t,k)=>t[k]||(()=>{}),set:(t,k,v)=>(t[k]=v,true)})}}}}});
context.window=context;
vm.runInContext(fs.readFileSync(new URL('dist/vendor/three.min.js',import.meta.url),'utf8'),context);
context.THREE.WebGLRenderer=class{constructor(){this.shadowMap={}}setPixelRatio(){}setSize(){}render(){}dispose(){}};
context.THREE.Raycaster=class{setFromCamera(){}intersectObjects(){return hitCat?[{}]:[]}};
context.THREE.TextureLoader=class{load(){return new context.THREE.Texture()}};
vm.runInContext(fs.readFileSync(new URL('dist/cafe-cats.js',import.meta.url),'utf8'),context);
vm.runInContext(fs.readFileSync(new URL('dist/cat-model.js',import.meta.url),'utf8'),context);
vm.runInContext(fs.readFileSync(new URL('dist/room3d.js',import.meta.url),'utf8'),context);
const oldSave={version:1,coins:387,selected:1,cats:[{xp:21},{hunger:33,xp:79,accessory:'bow'},{xp:9}],inventory:{kibble:4,medicine:2},owned:['bow'],daily:{date:'2026-11-02'}};
const migrated=context.createCafeSave(oldSave,'2026-11-02');
assert.equal(migrated.cats.length,17);assert.equal(migrated.coins,387);assert.equal(migrated.inventory.medicine,2);
assert.equal(migrated.cats[migrated.selected].id,'ralph');assert.equal(migrated.cats[migrated.selected].hunger,33);assert.equal(migrated.cats[migrated.selected].accessory,'bow');
migrated.cats[0].coat='ginger';assert.equal(context.createCafeSave(migrated,'2026-11-02').cats[0].coat,'ginger');
const room=context.createCafeRoom({canvas,onStroke:()=>rewards++});
for(const c of context.CAFE_CATS)room.sync({...c,accessory:'none',sick:false});
room.sync({coat:'tuxedo',accessory:'none',sick:false});
room.sync({coat:'ginger',accessory:'bow',sick:false});
room.sync({coat:'gray',accessory:'hat',sick:false});
room.sync({coat:'gray',accessory:'scarf',sick:true});
const pointer=(x,y,id=1,pointerType='mouse')=>({clientX:x,clientY:y,pointerId:id,pointerType,button:0,type:'pointerup'});

// Hover strokes count without requiring a click.
handlers.pointermove(pointer(400,300));handlers.pointermove(pointer(400,325));handlers.pointermove(pointer(400,345));
assert.equal(rewards,1,'Mouse hover should pet after a deliberate vertical stroke');
draw(now);assert.equal(canvas.dataset.purring,'true');
const initialYaw=canvas.dataset.viewYaw;

// A finger that starts on the cat pets it and never rotates the room.
now+=2000;handlers.pointerdown(pointer(400,300,2,'touch'));
handlers.pointermove(pointer(401,360,2,'touch'));draw(now);
assert.equal(rewards,2);assert.equal(canvas.dataset.viewYaw,initialYaw);
handlers.pointerup(pointer(401,360,2,'touch'));

// Dragging the background rotates the camera, with no petting reward.
hitCat=false;handlers.pointerdown(pointer(700,400));handlers.pointermove(pointer(800,450));draw(now+30);
assert.notEqual(canvas.dataset.viewYaw,initialYaw);assert.equal(rewards,2);
handlers.pointercancel({...pointer(800,450),type:'pointercancel'});assert.equal(room.interacting,false);

// A second touch must not steal an in-progress gesture.
handlers.pointerdown(pointer(600,400,3,'touch'));handlers.pointerdown(pointer(300,200,4,'touch'));
assert.equal(captured,3);handlers.pointerup(pointer(600,400,3,'touch'));
assert.equal(room.interacting,false);
room.setActive(false);assert.equal(canvas.tabIndex,-1);
room.setActive(true);assert.equal(canvas.tabIndex,0);
room.dispose();
console.log('Passed: hover petting, touch petting, orbit separation, cancellation, second-touch handling, and keyboard focus.');
