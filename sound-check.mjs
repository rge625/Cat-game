import fs from 'node:fs';
import vm from 'node:vm';
import assert from 'node:assert/strict';
const timers=new Map();let timerId=0;
const scope=vm.createContext({Float32Array,Math,Map,Set,Error,Infinity,setTimeout(fn){timers.set(++timerId,fn);return timerId},clearTimeout(id){timers.delete(id)}});
vm.runInContext(fs.readFileSync(new URL('dist/sound.js',import.meta.url),'utf8'),scope);
const {renderSound,createAudio}=scope.CafeSound;
const sounds={};
for(const kind of ['click','purr','eat','rest','ambience']){
 const data=renderSound(kind);sounds[kind]=data;let peak=0,sum=0;
 for(const channel of data.channels)for(const n of channel){assert.ok(Number.isFinite(n));peak=Math.max(peak,Math.abs(n));sum+=n*n}
 assert.ok(peak>0&&peak<.85,`${kind}: audible signal with headroom`);
 assert.ok(sum/data.channels[0].length>1e-7,`${kind}: non-silent audio`);
 if(kind==='ambience')assert.equal(data.channels.length,2);
}
function amplitude(data,frequency){let real=0,imag=0;for(let i=0;i<data.channels[0].length;i++){const phase=2*Math.PI*frequency*i/data.rate;real+=data.channels[0][i]*Math.cos(phase);imag+=data.channels[0][i]*Math.sin(phase)}return Math.hypot(real,imag)}
assert.ok(amplitude(sounds.purr,210)>amplitude(sounds.purr,110)*20,'Purr has a distinct brighter 210 Hz voiced pitch');
const param=()=>({value:0,cancelScheduledValues(){},setTargetAtTime(v){this.value=v},setValueAtTime(v){this.value=v}});
let created=0;const sources=[];
const context={currentTime:0,state:'running',destination:{},
 createGain(){return {gain:param(),connect(){},disconnect(){}}},
 createDynamicsCompressor(){return {threshold:param(),knee:param(),ratio:param(),attack:param(),release:param(),connect(){}}},
 createBuffer(channels,length,rate){const data=Array.from({length:channels},()=>new Float32Array(length));return {data,copyToChannel(a,i){data[i].set(a)}}},
 createBufferSource(){const s={loop:false,connect(){},disconnect(){},start(){this.started=true},stop(){this.stopped=true;this.onended?.()}};sources.push(s);return s},
 resume(){this.state='running';return Promise.resolve()},suspend(){this.state='suspended';return Promise.resolve()},close(){return Promise.resolve()}};
const events={},doc={hidden:false,addEventListener(k,fn){events[k]=fn},removeEventListener(k){delete events[k]}};
const audio=createAudio({contextFactory(){created++;return context},doc});
audio.click();audio.purr();audio.rest();audio.eat();assert.equal(created,0,'Muted actions never create audio or start playback');
assert.equal(audio.toggle(),true);assert.equal(created,1);assert.equal(sources.filter(s=>s.loop&&!s.stopped).length,1,'Only one café ambience loop starts');
audio.purr();audio.purr();audio.purr();assert.equal(sources.filter(s=>s.loop&&!s.stopped).length,2,'Repeated petting reuses one purr, rather than stacking loops');
audio.eat();assert.equal(sources.filter(s=>s.loop&&!s.stopped).length,1,'Eating replaces purring');
audio.rest();audio.click();audio.setEnabled(false);assert.ok(sources.every(s=>s.stopped),'Mute stops every active sound');assert.equal(timers.size,0);
audio.setEnabled(true);doc.hidden=true;events.visibilitychange();assert.equal(context.state,'suspended');assert.ok(sources.every(s=>s.stopped));
doc.hidden=false;events.visibilitychange();assert.equal(context.state,'running');assert.equal(sources.filter(s=>s.loop&&!s.stopped).length,1,'Returning to the tab restores exactly one ambience loop');
audio.dispose();assert.equal(Object.keys(events).length,0);
console.log('Passed: sound waveforms, higher purr pitch, silent startup, single ambient/purr loops, eating, resting, mute, and tab visibility.');

// Optional listening sample: café ambience → clicks → purr → eating → rest.
if(process.argv.includes('--preview')){
 const rate=22050,seconds=10,mix=new Float32Array(seconds*rate);
 const add=(sound,at,volume)=>{for(let i=0;i<sound.channels[0].length&&i+Math.round(at*rate)<mix.length;i++)mix[i+Math.round(at*rate)]+=sound.channels[0][i]*volume};
 add(sounds.ambience,0,.7*.95);add(sounds.click,.8,.7*.46);add(sounds.click,1.05,.7*.46);add(sounds.purr,1.5,.7*.72);add(sounds.eat,3.8,.7*.72);add(sounds.rest,6,.7*.85);
 for(let i=0;i<rate/5;i++){mix[i]*=i/(rate/5);mix[mix.length-1-i]*=i/(rate/5)}
 const wav=Buffer.alloc(44+mix.length*2);wav.write('RIFF');wav.writeUInt32LE(wav.length-8,4);wav.write('WAVEfmt ',8);wav.writeUInt32LE(16,16);wav.writeUInt16LE(1,20);wav.writeUInt16LE(1,22);wav.writeUInt32LE(rate,24);wav.writeUInt32LE(rate*2,28);wav.writeUInt16LE(2,32);wav.writeUInt16LE(16,34);wav.write('data',36);wav.writeUInt32LE(mix.length*2,40);for(let i=0;i<mix.length;i++)wav.writeInt16LE(Math.round(Math.max(-1,Math.min(1,mix[i]))*32767),44+i*2);
 fs.writeFileSync(new URL('sound-preview.wav',import.meta.url),wav);console.log('Saved sound-preview.wav');
}
