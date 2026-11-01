import fs from 'node:fs/promises';
const root=new URL('./',import.meta.url);
let html=await fs.readFile(new URL('dist/index.html',root),'utf8');
for(const name of ['styles.css','immersive.css']){
 const css=await fs.readFile(new URL('dist/'+name,root),'utf8');
 html=html.replace(`<link rel="stylesheet" href="${name}">`,()=>`<style>${css}</style>`);
}
for(const name of ['vendor/three.min.js','room3d.js','home3d.js','app.js']){
 const js=await fs.readFile(new URL('dist/'+name,root),'utf8');
 html=html.replace(`<script src="${name}"></script>`,()=>`<script>${js.replace(/<\/script/gi,'<\\/script')}</script>`);
}
const license=await fs.readFile(new URL('dist/vendor/THREE-LICENSE.txt',root),'utf8');
html=html.replace('</head>',`<!-- Three.js license:\n${license}\n--></head>`);
await fs.writeFile(new URL('Little Paws.html',root),html);
console.log('Saved standalone Little Paws.html with bundled 3D graphics.');
