/* Original, locally synthesized sounds. No recordings or network requests. */
(function(root){
 const TAU=Math.PI*2, RATE=22050;
 const durations={click:.065,purr:1.6,eat:1.85,rest:3.1,ambience:24};
 function renderSound(kind,rate=RATE){
  if(!durations[kind])throw new Error('Unknown café sound');
  const length=Math.round(durations[kind]*rate),channels=kind==='ambience'?2:1;
  const result=Array.from({length:channels},()=>new Float32Array(length));
  const looped=kind==='purr'||kind==='ambience',fade=looped?Math.round(rate*(kind==='purr'?.035:.4)):0;
  let seed=kind.length*1907+37;const random=()=>{seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed/4294967296*2-1};
  const ring=(t,f,d)=>t<0||t>d?0:Math.sin(TAU*f*t)*Math.exp(-t*12/d)*Math.min(1,t/.003);
  for(let channel=0;channel<channels;channel++){
   let low=0,mid=0,slow=0,phase=0;const out=new Float32Array(length+fade);
   for(let i=0;i<out.length;i++){
    const t=i/rate,white=random();low+=.055*(white-low);mid+=.32*(white-mid);slow+=.004*(white-slow);let v=0;
    if(kind==='click'){
     const env=Math.exp(-t*95)*Math.min(1,t/.002);
     v=(Math.sin(TAU*(810*t-2700*t*t))*.15+(mid-low)*.1)*env;
    }else if(kind==='purr'){
     // A 210 Hz voiced layer adds a brighter, sweeter pitch to the 27.5 Hz flutter.
     const flutter=.56+.44*Math.sin(TAU*27.5*t),breath=.74+.26*Math.sin(TAU*1.25*t);
     phase=TAU*210*t+.12*Math.sin(TAU*3.75*t);
     v=(Math.sin(phase)*.19+Math.sin(phase*2)*.035+low*.24)*flutter*breath;
    }else if(kind==='eat'){
     const bites=[.12,.39,.7,1.02,1.35];
     for(let b=0;b<bites.length;b++){
      const d=t-bites[b];if(d>=0&&d<.16){const env=Math.exp(-d*39)*Math.min(1,d/.004);v+=((mid-low)*.75+Math.sin(TAU*(170+b*17)*d)*.09)*env;}
     }
     v+=ring(t-.025,1370,.24)*.06+ring(t-.025,2192,.12)*.016;
    }else if(kind==='rest'){
     // A gentle two-note settling chime followed by a soft, sleepy exhale.
     v=ring(t-.06,523.25,1.3)*.085+ring(t-.31,392,1.7)*.075;
     const d=t-.7;if(d>0&&d<2.25)v+=low*.29*Math.sin(Math.PI*d/2.25)**2;
    }else{
     // Filtered room hush and indistinct, distant conversation; no intelligible words.
     const murmur=(.53+.23*Math.sin(TAU*t/6+channel)+.12*Math.sin(TAU*t/2.4))*low;
     v=slow*.16+murmur*.12+(mid-low)*.003;
     for(const [at,pitch] of [[2.5,1730],[10.7,1480],[18.3,1860]]){
      const pan=channel===0?.85:.55;v+=pan*(ring(t-at,pitch,.65)*.014+ring(t-at,pitch*1.54,.3)*.004);
     }
     // An espresso machine softly steams far across the café.
     const steam=Math.max(0,Math.sin(Math.PI*(t-13)/3));if(t>13&&t<16)v+=(mid-low)*steam*.016;
    }
    out[i]=v;
   }
   if(looped){
    // Match both sides of the loop with a short wraparound crossfade.
    for(let i=0;i<fade;i++){const blend=i/fade;const a=out[i],b=out[length+i];out[i]=a*blend+b*(1-blend)}
   }else{
    const n=Math.round(rate*.015);for(let i=0;i<n;i++)out[length-1-i]*=i/n;
   }
   result[channel].set(out.subarray(0,length));
  }
  return {rate,channels:result,duration:length/rate};
 }
 function createAudio({contextFactory,doc=root.document}={}){
  let context,master,compressor,enabled=false,ambient=null,purrVoice=null,purrTimer,lastClick=-Infinity;
  const buffers=new Map(),voices=new Set();
  const hidden=()=>!!doc?.hidden;
  function ensure(){
   if(context)return true;
   try{
    const Ctor=root.AudioContext||root.webkitAudioContext;
    context=contextFactory?contextFactory():new Ctor();master=context.createGain();master.gain.value=0;
    compressor=context.createDynamicsCompressor();compressor.threshold.value=-15;compressor.knee.value=12;compressor.ratio.value=3;compressor.attack.value=.005;compressor.release.value=.18;
    master.connect(compressor);compressor.connect(context.destination);return true;
   }catch{enabled=false;context=null;return false}
  }
  function buffer(kind){if(!buffers.has(kind)){const data=renderSound(kind),b=context.createBuffer(data.channels.length,data.channels[0].length,data.rate);data.channels.forEach((arr,i)=>b.copyToChannel(arr,i));buffers.set(kind,b)}return buffers.get(kind)}
  function resume(){if(!enabled||hidden()||!ensure())return false;if(context.state==='suspended')context.resume().catch(()=>{});return true}
  function voice(kind,{loop=false,volume=1}={}){
   const source=context.createBufferSource(),gain=context.createGain();source.buffer=buffer(kind);source.loop=loop;gain.gain.value=volume;source.connect(gain);gain.connect(master);
   const v={source,gain,kind};voices.add(v);source.onended=()=>{voices.delete(v);source.disconnect();gain.disconnect()};source.start();return v;
  }
  function stop(v){if(!v)return;try{v.source.stop()}catch{}voices.delete(v)}
  function startAmbient(){if(!ambient&&enabled&&!hidden())ambient=voice('ambience',{loop:true,volume:.95})}
  function setEnabled(value){enabled=!!value;if(enabled){if(!ensure())return false;if(!hidden()){resume();master.gain.cancelScheduledValues(context.currentTime);master.gain.setTargetAtTime(.7,context.currentTime,.18);startAmbient()}}else if(context){master.gain.cancelScheduledValues(context.currentTime);master.gain.setValueAtTime(0,context.currentTime);clearTimeout(purrTimer);[...voices].forEach(stop);ambient=null;purrVoice=null}return enabled}
  function click(){if(!resume())return;const t=context.currentTime;if(t-lastClick<.035)return;lastClick=t;voice('click',{volume:.46})}
  function purr(){if(!resume())return;if(!purrVoice)purrVoice=voice('purr',{loop:true,volume:0});const g=purrVoice.gain.gain,t=context.currentTime;g.cancelScheduledValues(t);g.setTargetAtTime(.72,t,.07);g.setTargetAtTime(0,t+1.1,.2);clearTimeout(purrTimer);purrTimer=setTimeout(()=>{stop(purrVoice);purrVoice=null},2200)}
  function effect(kind){if(!resume())return;clearTimeout(purrTimer);stop(purrVoice);purrVoice=null;for(const v of [...voices])if(v.kind===kind)stop(v);voice(kind,{volume:kind==='eat'?.72:.85})}
  function visibility(){if(!context)return;if(hidden()){clearTimeout(purrTimer);[...voices].forEach(stop);ambient=null;purrVoice=null;master.gain.setValueAtTime(0,context.currentTime);context.suspend().catch(()=>{})}else if(enabled){resume();master.gain.setTargetAtTime(.7,context.currentTime,.25);startAmbient()}}
  doc?.addEventListener('visibilitychange',visibility);
  return {get enabled(){return enabled},unlock:resume,toggle(){return setEnabled(!enabled)},setEnabled,click,purr,eat(){effect('eat')},rest(){effect('rest')},dispose(){setEnabled(false);doc?.removeEventListener('visibilitychange',visibility);context?.close();buffers.clear()}};
 }
 root.CafeSound={renderSound,createAudio};
})(typeof window==='undefined'?globalThis:window);
