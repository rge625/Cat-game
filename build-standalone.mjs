import fs from 'node:fs/promises';
const root=new URL('./',import.meta.url);
let html=await fs.readFile(new URL('dist/index.html',root),'utf8');
for(const name of ['styles.css','immersive.css']){
 const css=await fs.readFile(new URL('dist/'+name,root),'utf8');
 html=html.replace(`<link rel="stylesheet" href="${name}">`,()=>`<style>${css}</style>`);
}
for(const name of ['vendor/three.min.js','sound.js','cat-model.js','room3d.js','home3d.js','app.js']){
 const js=await fs.readFile(new URL('dist/'+name,root),'utf8');
 html=html.replace(`<script src="${name}"></script>`,()=>`<script>${js.replace(/<\/script/gi,'<\\/script')}</script>`);
}
const embeddedAudio={};
for(const [kind,name] of Object.entries({purr:'purr.mp3',eat:'eating.mp3',music:'cafe-music.mp3'}))embeddedAudio[kind]='data:audio/mpeg;base64,'+(await fs.readFile(new URL('dist/audio/'+name,root))).toString('base64');
html=html.replace('<script>',()=>'<script>window.CAFE_AUDIO_ASSETS='+JSON.stringify(embeddedAudio)+';</script><script>');
const license=await fs.readFile(new URL('dist/vendor/THREE-LICENSE.txt',root),'utf8');
html=html.replace('</head>',`<!-- Three.js license:\n${license}\n--></head>`);
await fs.writeFile(new URL('Little Paws.html',root),html);
console.log('Saved standalone Little Paws.html with bundled 3D graphics.');
