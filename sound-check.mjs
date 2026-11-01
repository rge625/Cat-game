import fs from 'node:fs';
import vm from 'node:vm';
import assert from 'node:assert/strict';
const timers=new Map();let timerId=0;
const scope=vm.createContext({console,Float32Array,Math,Map,Set,Error,Date,Infinity,setTimeout(fn){timers.set(++timerId,fn);return timerId},clearTimeout(id){timers.delete(id)}});
vm.runInContext(fs.readFileSync(new URL('dist/sound.js',import.meta.url),'utf8'),scope);
const {renderSound,createAudio}=scope.CafeSound;
for(const kind of ['purr','eat','ambience'])assert.throws(()=>renderSound(kind),'No synthetic animal sound or noise fallback remains');
for(const file of ['purr.mp3','eating.mp3','cafe-music.mp3']){const b=fs.readFileSync(new URL('dist/audio/'+file,import.meta.url));assert.equal(b.subarray(0,3).toString(),'ID3');assert.ok(b.length>100000)}
const credits=JSON.parse(fs.readFileSync(new URL('dist/audio/credits.json',import.meta.url)));assert.equal(credits.music.title,'Bossa Antigua');assert.ok(credits.purr.source.includes('commons.wikimedia.org'));
for(const kind of ['click','rest']){const data=renderSound(kind);let peak=0;for(const n of data.channels[0]){assert.ok(Number.isFinite(n));peak=Math.max(peak,Math.abs(n))}assert.ok(peak>0&&peak<.5)}
const param=()=>({value:0,cancelScheduledValues(){},setTargetAtTime(v){this.value=v},setValueAtTime(v){this.value=v}});
let created=0;const sources=[],requests=[];
const makeBuffer=(channels,length,rate)=>{const data=Array.from({length:channels},()=>new Float32Array(length));return {duration:length/rate,numberOfChannels:channels,sampleRate:rate,copyToChannel(a,i){data[i].set(a)},getChannelData(i){return data[i]}}};
const original=makeBuffer(2,6000,100);for(let ch=0;ch<2;ch++)for(let i=0;i<6000;i++)original.getChannelData(ch)[i]=Math.sin(i)*.2;
const music={paused:true,play(){this.paused=false;return Promise.resolve()},pause(){this.paused=true}};
const context={currentTime:0,state:'running',destination:{},createGain(){return {gain:param(),connect(){},disconnect(){}}},
 createDynamicsCompressor(){return {threshold:param(),knee:param(),ratio:param(),attack:param(),release:param(),connect(){}}},
 createMediaElementSource(){return {connect(){},disconnect(){}}},createBuffer:makeBuffer,decodeAudioData:async()=>original,
 createBufferSource(){const s={loop:false,connect(){},disconnect(){},start(){this.started=true},stop(){this.stopped=true;this.onended?.()}};sources.push(s);return s},
 resume(){this.state='running';return Promise.resolve()},suspend(){this.state='suspended';return Promise.resolve()},close(){return Promise.resolve()}};
const events={},doc={hidden:false,addEventListener(k,fn){events[k]=fn},removeEventListener(k){delete events[k]}};
const options={contextFactory(){created++;return context},mediaFactory(url){assert.ok(url.endsWith('cafe-music.mp3'));return music},fetcher:async url=>{requests.push(url);return {ok:true,arrayBuffer:async()=>new ArrayBuffer(1)}},doc};
const audio=createAudio(options);
audio.click();await audio.purr();await audio.rest();await audio.eat();assert.equal(created,0,'Muted actions do not initialize playback');
assert.equal(audio.toggle(),true);assert.equal(music.paused,false,'Music starts on the sound toggle');
await audio.purr();await audio.purr();assert.equal(sources.filter(s=>s.loop&&!s.stopped).length,1,'Repeated stroking shares one real purr voice');assert.ok(requests.includes('audio/purr.mp3'));assert.ok(requests.includes('audio/eating.mp3'));
assert.equal(sources.at(-1).buffer.duration,12,'Purr uses a real 12-second excerpt');
await audio.eat();assert.equal(sources.at(-1).buffer.duration,4.2,'Eating uses the real feeding excerpt');assert.equal(sources.filter(s=>s.loop&&!s.stopped).length,0,'Eating replaces purring');
await audio.rest();audio.click();audio.setEnabled(false);assert.ok(sources.every(s=>s.stopped));assert.equal(music.paused,true);assert.equal(timers.size,0);
audio.setEnabled(true);doc.hidden=true;events.visibilitychange();assert.equal(context.state,'suspended');assert.equal(music.paused,true);doc.hidden=false;events.visibilitychange();assert.equal(context.state,'running');assert.equal(music.paused,false);
audio.dispose();assert.equal(Object.keys(events).length,0);
let finish;const gate=new Promise(resolve=>finish=resolve);const delayed=createAudio({...options,fetcher:async()=>{await gate;return {ok:true,arrayBuffer:async()=>new ArrayBuffer(1)}}});delayed.toggle();const pending=delayed.purr();delayed.setEnabled(false);delayed.setEnabled(true);finish();await pending;assert.ok(sources.every(s=>s.stopped),'A slow recording load cannot replay a stale pet after mute/unmute');delayed.dispose();
console.log('Passed: real MP3 assets, no synthetic purr/eating/white-noise fallback, music, excerpt playback, async mute safety, and hidden-tab pause.');
