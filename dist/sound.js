/* Recorded cat sounds and licensed café music. Credits are in audio/credits.json. */
(function(root){
 const assets={purr:'audio/purr.mp3',eat:'audio/eating.mp3',music:'audio/cafe-music.mp3'};
 const asset=kind=>root.CAFE_AUDIO_ASSETS?.[kind]||assets[kind];
 function renderSound(kind,rate=22050){
  if(!['click','rest'].includes(kind))throw new Error('Cat sounds and music use real recordings');
  const duration=kind==='click'?.065:2.2,out=new Float32Array(Math.round(duration*rate));
  for(let i=0;i<out.length;i++){const t=i/rate;let value=0;
   if(kind==='click')value=Math.sin(2*Math.PI*(810*t-2700*t*t))*.15*Math.exp(-t*95)*Math.min(1,t/.002);
   else for(const [start,freq,volume,decay] of [[.06,523.25,.085,1.3],[.31,392,.075,1.7]]){const d=t-start;if(d>=0)value+=Math.sin(2*Math.PI*freq*d)*volume*Math.exp(-d*12/decay)*Math.min(1,d/.003)}
   out[i]=value*Math.min(1,(out.length-1-i)/(rate*.015));
  }return {rate,channels:[out],duration};
 }
 function createAudio({contextFactory,mediaFactory,fetcher=root.fetch?.bind(root),doc=root.document,onError=()=>{}}={}){
  let context,master,compressor,enabled=false,music,musicSource,musicGain,purrVoice,purrTimer,lastClick=-Infinity,epoch=0,purrUntil=0,effectTicket=0;
  const buffers=new Map(),loading=new Map(),voices=new Set();const hidden=()=>!!doc?.hidden;
  function report(error){console.warn('Café audio:',error?.message||error);onError()}
  function ensure(){if(context)return true;try{
   const Ctor=root.AudioContext||root.webkitAudioContext;context=contextFactory?contextFactory():new Ctor();
   master=context.createGain();master.gain.value=0;compressor=context.createDynamicsCompressor();compressor.threshold.value=-15;compressor.knee.value=12;compressor.ratio.value=3;compressor.attack.value=.005;compressor.release.value=.18;master.connect(compressor);compressor.connect(context.destination);
   music=mediaFactory?mediaFactory(asset('music')):new root.Audio(asset('music'));music.loop=true;music.preload='auto';music.id='cafe-music';music.hidden=true;doc?.body?.append?.(music);musicSource=context.createMediaElementSource(music);musicGain=context.createGain();musicGain.gain.value=.15;musicSource.connect(musicGain);musicGain.connect(master);return true;
  }catch(error){report(error);enabled=false;context=null;return false}}
  function buffer(kind){if(!buffers.has(kind)){const data=renderSound(kind),b=context.createBuffer(1,data.channels[0].length,data.rate);b.copyToChannel(data.channels[0],0);buffers.set(kind,b)}return buffers.get(kind)}
  async function recording(kind){if(buffers.has(kind))return buffers.get(kind);if(loading.has(kind))return loading.get(kind);
   const task=(async()=>{const response=await fetcher(asset(kind));if(!response.ok)throw new Error(`Cannot load ${kind} recording`);const original=await context.decodeAudioData(await response.arrayBuffer());
    const start=Math.min(kind==='purr'?10:5,Math.max(0,original.duration-1)),duration=Math.min(kind==='purr'?12:4.2,original.duration-start),first=Math.floor(start*original.sampleRate),length=Math.floor(duration*original.sampleRate),b=context.createBuffer(original.numberOfChannels,length,original.sampleRate);
    let peak=0;for(let c=0;c<original.numberOfChannels;c++){const samples=original.getChannelData(c).subarray(first,first+length);b.copyToChannel(samples,c);for(const n of samples)peak=Math.max(peak,Math.abs(n))}
    const level=Math.min(4,.55/Math.max(.001,peak)),fade=Math.min(Math.floor(original.sampleRate*.018),Math.floor(length/2));
    for(let c=0;c<b.numberOfChannels;c++){const data=b.getChannelData(c);for(let i=0;i<length;i++)data[i]*=level*Math.min(1,i/fade,(length-1-i)/fade)}
    buffers.set(kind,b);return b;
   })();loading.set(kind,task);try{return await task}finally{loading.delete(kind)}
  }
  function resume(){if(!enabled||hidden()||!ensure())return false;if(context.state==='suspended')context.resume().catch(report);return true}
  function startMusic(){if(enabled&&!hidden()&&music?.paused)music.play().catch(report)}
  function voice(kind,b,{loop=false,volume=1}={}){const source=context.createBufferSource(),gain=context.createGain();source.buffer=b;source.loop=loop;gain.gain.value=volume;source.connect(gain);gain.connect(master);const v={source,gain,kind};voices.add(v);source.onended=()=>{voices.delete(v);source.disconnect();gain.disconnect()};source.start();return v}
  function stop(v){if(!v)return;try{v.source.stop()}catch{}voices.delete(v)}
  function stopEffects(){clearTimeout(purrTimer);[...voices].forEach(stop);purrVoice=null;effectTicket++}
  function duck(seconds=2){const t=context.currentTime,g=musicGain.gain;g.cancelScheduledValues(t);g.setTargetAtTime(.065,t,.15);g.setTargetAtTime(.15,t+seconds,.6)}
  function setEnabled(value){const next=!!value;if(next===enabled)return enabled;enabled=next;epoch++;
   if(enabled){if(!ensure())return false;if(!hidden()){resume();master.gain.cancelScheduledValues(context.currentTime);master.gain.setTargetAtTime(.75,context.currentTime,.18);startMusic();recording('purr').catch(report);recording('eat').catch(report)}}
   else if(context){master.gain.cancelScheduledValues(context.currentTime);master.gain.setValueAtTime(0,context.currentTime);music.pause();stopEffects()}return enabled;
  }
  function click(){if(!resume())return;const t=context.currentTime;if(t-lastClick<.035)return;lastClick=t;voice('click',buffer('click'),{volume:.46})}
  async function purr(){if(!resume())return;const request=epoch;purrUntil=Date.now()+1800;try{const b=await recording('purr');if(!enabled||hidden()||epoch!==request||Date.now()>purrUntil)return;
   if(!purrVoice)purrVoice=voice('purr',b,{loop:true,volume:0});const t=context.currentTime,g=purrVoice.gain.gain;g.cancelScheduledValues(t);g.setTargetAtTime(.72,t,.08);g.setTargetAtTime(0,t+1.3,.25);duck(1.8);clearTimeout(purrTimer);purrTimer=setTimeout(()=>{stop(purrVoice);purrVoice=null},2500);
  }catch(error){report(error)}}
  async function effect(kind){if(!resume())return;const request=epoch,ticket=++effectTicket;try{const b=kind==='eat'?await recording('eat'):buffer(kind);if(!enabled||hidden()||epoch!==request||ticket!==effectTicket)return;
   clearTimeout(purrTimer);stop(purrVoice);purrVoice=null;for(const v of [...voices])if(v.kind==='eat'||v.kind==='rest')stop(v);voice(kind,b,{volume:kind==='eat'?.62:.85});duck(kind==='eat'?4.4:2.2);
  }catch(error){report(error)}}
  function visibility(){if(!context)return;epoch++;if(hidden()){music.pause();stopEffects();master.gain.setValueAtTime(0,context.currentTime);context.suspend().catch(report)}else if(enabled){resume();master.gain.setTargetAtTime(.75,context.currentTime,.25);startMusic()}}
  doc?.addEventListener('visibilitychange',visibility);
  return {get enabled(){return enabled},unlock:resume,toggle(){return setEnabled(!enabled)},setEnabled,click,purr,eat(){return effect('eat')},rest(){return effect('rest')},dispose(){setEnabled(false);doc?.removeEventListener('visibilitychange',visibility);music?.removeAttribute?.('src');music?.load?.();music?.remove?.();musicSource?.disconnect();context?.close();buffers.clear()}};
 }
 root.CafeSound={renderSound,createAudio};
})(typeof window==='undefined'?globalThis:window);
