/* Compact interior with real window openings, PBR surfaces, and a sunny garden. */
window.createCafeRoom=function({canvas,onStroke,audio}){
 const T=window.THREE;if(!T)throw new Error('3D library unavailable');
 const renderer=new T.WebGLRenderer({canvas,antialias:true,alpha:false,powerPreference:'high-performance'});
 const phone=canvas.clientWidth<700,lowMemory=(window.navigator?.deviceMemory||8)<=4;let renderScale=Math.min(devicePixelRatio,phone||lowMemory?1:1.25);renderer.setPixelRatio(renderScale);canvas.dataset.renderScale=renderScale.toFixed(2);renderer.shadowMap.enabled=true;renderer.shadowMap.type=T.PCFSoftShadowMap;renderer.shadowMap.autoUpdate=false;renderer.shadowMap.needsUpdate=true;renderer.outputColorSpace=T.SRGBColorSpace;renderer.toneMapping=T.ACESFilmicToneMapping;renderer.toneMappingExposure=.95;
 const scene=new T.Scene();scene.background=new T.Color('#b9d5e8');
 const camera=new T.PerspectiveCamera(58,1,.08,140),target=new T.Vector3(0,.99,.55),ray=new T.Raycaster(),pointer=new T.Vector2();
 let yaw=.12,pitch=.10,distance=4.65,wantedYaw=yaw,wantedPitch=pitch,wantedDistance=distance,active=true,currentCat=null,catKey='',petUntil=0,lastReward=0,frame=0,lastFrame=0,drag=null,hover=null,strokeDistance=0,strokeDirection=0,reversals=0,disposed=false;
 let sampleStart=0,sampleFrames=0;const reduceMotion=matchMedia('(prefers-reduced-motion: reduce)').matches;
 const materials=new Map(),textures=new Set();
 const mat=(color,extra={})=>{const key=color+Object.entries(extra).map(([k,v])=>k+':'+(v?.uuid||JSON.stringify(v))).join('|');if(!materials.has(key))materials.set(key,new T.MeshStandardMaterial({color,roughness:.75,metalness:0,envMapIntensity:.45,...extra}));return materials.get(key)};
 const room=new T.Group();scene.add(room);
 function mesh(geo,color,pos=[0,0,0],scale=[1,1,1],parent=room){const m=new T.Mesh(geo,typeof color==='string'?mat(color):color);m.position.set(...pos);m.scale.set(...scale);m.castShadow=true;m.receiveShadow=true;parent.add(m);return m}
 const box=(s,m,p,parent=room)=>mesh(new T.BoxGeometry(...s),m,p,[1,1,1],parent);
 const ball=(s,m,p,parent=room)=>mesh(new T.SphereGeometry(1,36,24),m,p,s,parent);
 const cylinder=(a,b,h,m,p,parent=room)=>mesh(new T.CylinderGeometry(a,b,h,48),m,p,[1,1,1],parent);
 function tube(points,r,m,parent=room){return mesh(new T.TubeGeometry(new T.CatmullRomCurve3(points.map(p=>new T.Vector3(...p))),32,r,6,false),m,[0,0,0],[1,1,1],parent)}
 function rounded(w,h,d,r,m,p,parent=room){
  r=Math.min(r,w/2-.001,h/2-.001,d/2-.001);const s=new T.Shape(),x=-w/2+r,y=-h/2+r,a=w-2*r,b=h-2*r;
  s.moveTo(x,y-r);s.lineTo(x+a,y-r);s.quadraticCurveTo(x+a+r,y-r,x+a+r,y);s.lineTo(x+a+r,y+b);s.quadraticCurveTo(x+a+r,y+b+r,x+a,y+b+r);s.lineTo(x,y+b+r);s.quadraticCurveTo(x-r,y+b+r,x-r,y+b);s.lineTo(x-r,y);s.quadraticCurveTo(x-r,y-r,x,y-r);
  const geo=new T.ExtrudeGeometry(s,{depth:d-2*r,bevelEnabled:true,bevelThickness:r,bevelSize:r*.5,bevelSegments:4,curveSegments:10,steps:1});geo.translate(0,0,-d/2+r);
  return mesh(geo,m,p,[1,1,1],parent);
 }
 function cushion(w,h,d,m,p,parent=room){const geo=new T.SphereGeometry(1,48,32),v=geo.attributes.position;const soft=n=>Math.sign(n)*Math.pow(Math.abs(n),.43);for(let i=0;i<v.count;i++){const x=v.getX(i),y=v.getY(i),z=v.getZ(i);v.setXYZ(i,soft(x)*w/2,soft(y)*h/2-.018*(1-x*x)*(1-z*z),soft(z)*d/2)}geo.computeVertexNormals();return mesh(geo,m,p,[1,1,1],parent)}
 function canvasTexture(draw,size=512){const c=document.createElement('canvas');c.width=c.height=size;draw(c.getContext('2d'),size);const tex=new T.CanvasTexture(c);tex.colorSpace=T.SRGBColorSpace;tex.wrapS=tex.wrapT=T.RepeatWrapping;textures.add(tex);return tex}
 let seed=472;const random=()=>{seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed/4294967296};
 const weave=canvasTexture((ctx,s)=>{ctx.fillStyle='#b7b3a3';ctx.fillRect(0,0,s,s);for(let i=0;i<18000;i++){const x=random()*s,y=random()*s;ctx.fillStyle=i%2?'#fff4':'#302b231a';ctx.fillRect(x,y,.6,2.5)}});weave.repeat.set(3,3);
 const plaster=canvasTexture((ctx,s)=>{ctx.fillStyle='#c8c6bd';ctx.fillRect(0,0,s,s);for(let i=0;i<32000;i++){ctx.fillStyle=i%2?'#fff2':'#0001';ctx.fillRect(random()*s,random()*s,1,1)}});plaster.repeat.set(4,3);
 const fabric=color=>{const m=new T.MeshStandardMaterial({color,map:weave,bumpMap:weave,bumpScale:.007,roughness:.94,envMapIntensity:.25});materials.set('fabric'+color,m);return m};
 const sage=fabric('#8c9b83'),ivory=fabric('#e9e1d0'),rose=fabric('#ad7d66'),sand=fabric('#c2ac8b');
 const wallMat=new T.MeshStandardMaterial({color:'#e7dfd0',map:plaster,bumpMap:plaster,bumpScale:.012,roughness:1});materials.set('plaster',wallMat);
 const greenWall=wallMat.clone();greenWall.color.set('#a8b29c');materials.set('greenWall',greenWall);
 const loader=new T.TextureLoader();
 function imageTexture(path,repeat=[1,1],color=false){const t=loader.load(cafeImage(path));if(color)t.colorSpace=T.SRGBColorSpace;t.wrapS=t.wrapT=T.RepeatWrapping;t.repeat.set(...repeat);t.anisotropy=8;textures.add(t);return t}
 const woodColor=imageTexture('materials/wood-color.jpg',[4.5,4.5],true),woodNormal=imageTexture('materials/wood-normal.jpg',[4.5,4.5]),woodRough=imageTexture('materials/wood-roughness.jpg',[4.5,4.5]);
 const floorMat=new T.MeshStandardMaterial({map:woodColor,normalMap:woodNormal,normalScale:new T.Vector2(.35,.35),roughnessMap:woodRough,roughness:.85,envMapIntensity:.35});materials.set('floor',floorMat);
 const furnitureWood=mat('#d2bc9a',{map:woodColor,roughness:.55});
 const floor=mesh(new T.PlaneGeometry(9,9.4),floorMat,[0,-.025,1]);floor.rotation.x=-Math.PI/2;floor.castShadow=false;
 // Four close walls: no extended empty floor. The back wall has a real hole.
 const backZ=-3.7,leftX=-4.5,rightX=4.5,frontZ=5.7,ceilingY=3.8;
 box([1.4,3.8,.18],wallMat,[-3.8,1.9,backZ]);box([4.2,3.8,.18],wallMat,[2.4,1.9,backZ]);
 box([3.4,1.05,.18],wallMat,[-1.4,.525,backZ]);box([3.4,.35,.18],wallMat,[-1.4,3.625,backZ]);
 box([.18,3.8,9.4],greenWall,[leftX,1.9,1]);box([.18,3.8,9.4],wallMat,[rightX,1.9,1]);box([9,3.8,.18],greenWall,[0,1.9,frontZ]);box([9,.13,9.4],mat('#f2eee5'),[0,3.86,1]);
 for(const z of[backZ+.12,frontZ-.12])box([9,.15,.05],'#f2e9da',[0,.075,z]);for(const x of[leftX+.12,rightX-.12])box([.05,.15,9.4],'#f2e9da',[x,.075,1]);
 scene.add(new T.HemisphereLight('#eaf4ff','#b5a48f',1.1));scene.add(new T.AmbientLight('#fff7ea',.45));
 const sun=new T.DirectionalLight('#fff1d8',3.6);sun.position.set(-2.7,7,-13);sun.target.position.set(.7,0,2);scene.add(sun.target);sun.castShadow=true;sun.shadow.mapSize.set(phone||lowMemory?512:1024,phone||lowMemory?512:1024);Object.assign(sun.shadow.camera,{left:-7,right:7,top:7,bottom:-7,near:1,far:32});sun.shadow.normalBias=.025;sun.shadow.bias=-.00012;sun.shadow.radius=3;scene.add(sun);
 const bounce=new T.DirectionalLight('#ffeddb',1.8);bounce.position.set(1,3.4,4);scene.add(bounce);
 let gardenEnv=null;
 if(window.RGBELoader)new RGBELoader().load(cafeImage('materials/garden.hdr'),t=>{if(disposed){t.dispose();return}gardenEnv=t;t.mapping=T.EquirectangularReflectionMapping;scene.background=t;scene.environment=t;canvas.dataset.garden='loaded'},undefined,()=>{canvas.dataset.garden='fallback'});
 // Transparent glass: everything behind it belongs to the outside world.
 const windowGroup=new T.Group();windowGroup.position.set(-1.4,2.25,backZ+.08);room.add(windowGroup);
 const glass=new T.MeshPhysicalMaterial({color:'#f3fcff',metalness:0,roughness:.025,transparent:true,opacity:.24,transmission:0,thickness:.015,ior:1.46,clearcoat:1,envMapIntensity:.8,depthWrite:false,side:T.DoubleSide});materials.set('glass',glass);
 const pane=mesh(new T.PlaneGeometry(3.3,2.3),glass,[0,0,0],[1,1,1],windowGroup);pane.castShadow=false;pane.name='Transparent window glass';
 for(const x of[-1.72,0,1.72])rounded(.065,2.5,.1,.022,'#e8e3d8',[x,0,.04],windowGroup);
 for(const y of[-1.22,0,1.22])rounded(3.5,.065,.1,.022,'#e8e3d8',[0,y,.04],windowGroup);
 rounded(3.75,.085,.4,.025,furnitureWood,[0,-1.25,.13],windowGroup);
 // Soft linen curtains have actual folds, thickness, and a gently uneven hem.
 const curtainMat=fabric('#e5dccc');curtainMat.side=T.DoubleSide;
 for(const side of[-1,1]){const geo=new T.PlaneGeometry(.65,2.65,32,30),p=geo.attributes.position;for(let i=0;i<p.count;i++){const x=p.getX(i),y=p.getY(i);p.setZ(i,Math.cos((x+.325)*50)*.055);p.setY(i,y+Math.sin(x*19)*.014)}geo.computeVertexNormals();mesh(geo,curtainMat,[side*1.99,0,.18],[1,1,1],windowGroup)}
 cylinder(.018,.018,4.8,mat('#66533e',{metalness:.65,roughness:.35}),[-1.4,3.65,backZ+.3]).rotation.z=Math.PI/2;
 const outside=new T.Group();scene.add(outside);
 const lawn=mesh(new T.PlaneGeometry(35,30),mat('#66844e'),[0,-.08,-18],[1,1,1],outside);lawn.rotation.x=-Math.PI/2;
 const sunDisk=ball([.46,.46,.46],new T.MeshBasicMaterial({color:'#fff3bd',toneMapped:false}),[-3.7,5.8,-17],outside);sunDisk.castShadow=false;sunDisk.name='Visible garden sun';
 // A stone path, low timber fence, and flowering beds give nearby parallax.
 for(let i=0;i<12;i++)rounded(1.25,.05,.8,.02,mat(i%2?'#bdb6a4':'#cec4b1'),[-1.4+Math.sin(i*.4)*.3,-.015,-5.1-i*.88],outside);
 for(let i=0;i<14;i++)rounded(.12,1.05,.1,.025,furnitureWood,[-6+i*.85,.48,-10],outside);
 for(const y of[.35,.83])rounded(12,.09,.08,.022,furnitureWood,[0,y,-10],outside);
 function plant(x,z,scale=1,parent=room){const g=new T.Group();g.position.set(x,0,z);g.scale.setScalar(scale);parent.add(g);
  const pot=mesh(new T.LatheGeometry([[.16,0],[.22,.03],[.28,.45],[.29,.49],[.255,.5],[.25,.44],[.2,.05]].map(p=>new T.Vector2(...p)),48),mat('#b08b70',{roughness:.92}),[0,0,0],[1,1,1],g);cylinder(.25,.25,.02,'#443828',[0,.46,0],g);
  for(let j=0;j<11;j++){const a=j*2.4,h=.75+(j%4)*.17,r=.2+(j%3)*.04;const end=[Math.sin(a)*r,h,Math.cos(a)*r];tube([[0,.46,0],[end[0]*.3,h*.75,end[2]*.3],end],.009,'#51603b',g);
   const shape=new T.Shape();shape.moveTo(0,0);shape.bezierCurveTo(-.13,.12,-.11,.33,0,.43);shape.bezierCurveTo(.12,.31,.13,.12,0,0);const leaf=mesh(new T.ShapeGeometry(shape,12),mat(['#3e5c32','#557442','#6f884b'][j%3],{side:T.DoubleSide,roughness:.65}),end,[1,1,1],g);leaf.rotation.set(-.6,a,Math.sin(a)*.6);}
  return g;
 }
 plant(-3.7,-2.7,1.35);plant(3.9,-2.9,.9);plant(3.8,3.4,1.15);
 for(let i=0;i<8;i++){const g=plant(-5+i*1.4,-8,1.3,outside);for(let j=0;j<4;j++)ball([.06,.045,.06],mat(j%2?'#d4ab75':'#d2a0a4'),[Math.sin(j*2)*.16,1.5+Math.cos(j)*.15,Math.cos(j*2)*.16],g)}
 // Upholstered sofa: rounded timber, tailored cushions, angled back, and piping.
 const sofa=new T.Group();sofa.position.set(2.15,0,-2.45);sofa.rotation.y=-.06;room.add(sofa);
 for(const x of[-1.15,1.15])for(const z of[-.4,.4])cylinder(.045,.032,.26,furnitureWood,[x,.13,z],sofa);
 rounded(2.8,.22,1.15,.09,furnitureWood,[0,.36,0],sofa);
 const back=cushion(2.72,.94,.24,sage,[0,.91,-.47],sofa);back.rotation.x=-.10;
 for(const x of[-1.32,1.32])cushion(.23,.55,1.18,sage,[x,.68,0],sofa);
 for(const x of[-.63,.63]){cushion(1.23,.21,1.01,sage,[x,.55,.03],sofa);tube([[x-.52,.59,.49],[x,.59,.51],[x+.52,.59,.49]],.006,'#5f725a',sofa)}
 for(const [x,m,angle]of[[-.88,ivory,-.12],[.83,rose,.17]]){const p=cushion(.56,.57,.15,m,[x,.96,-.19],sofa);p.rotation.z=angle;p.rotation.x=-.16;}
 // Oval coffee table with tapered legs and a glazed ceramic cup.
 const table=new T.Group();table.position.set(2.43,0,-.2);room.add(table);
 const top=rounded(1.35,.07,.94,.032,furnitureWood,[0,.65,0],table);top.rotation.y=.08;
 for(const x of[-.45,.45])for(const z of[-.29,.29]){const leg=cylinder(.025,.018,.62,furnitureWood,[x,.32,z],table);leg.rotation.z=-x*.1}
 const ceramic=mat('#e8dfcd',{roughness:.2,metalness:.05});mesh(new T.LatheGeometry([[0,0],[.065,0],[.075,.02],[.088,.14],[.084,.15],[.073,.14],[.063,.025]].map(p=>new T.Vector2(...p)),48),ceramic,[.2,.69,.03],[1,1,1],table);
 const handle=mesh(new T.TorusGeometry(.047,.009,10,32),ceramic,[.29,.78,.03],[1,1,1],table);cylinder(.07,.07,.004,'#493324',[.2,.82,.03],table);
 rounded(.45,.025,.34,.011,'#68775c',[-.28,.7,-.1],table);
 // Bookshelf, individually bound books, framed branding and a radiator.
 const shelf=new T.Group();shelf.position.set(-3.83,0,-.65);shelf.rotation.y=Math.PI/2;room.add(shelf);
 for(const y of[.13,.73,1.34])rounded(1.8,.055,.48,.02,furnitureWood,[0,y,0],shelf);
 for(const x of[-.86,.86])rounded(.045,1.37,.48,.02,furnitureWood,[x,.68,0],shelf);
 for(let i=0;i<8;i++){const x=-.72+i*.18,color=['#637868','#b7a17d','#9b6d5d','#707c86'][i%4];rounded(.13,.45,.29,.012,color,[x,.39,.04],shelf);box([.09,.40,.295],'#dfd4bd',[x,.39,.042],shelf);box([.13,.45,.018],color,[x,.39,.204],shelf)}
 const print=new T.Group();print.position.set(1.88,2.8,backZ+.15);room.add(print);rounded(1.08,1.3,.06,.025,furnitureWood,[0,0,0],print);
 const logoTexture=imageTexture('little-beans-logo.png',[1,1],true);mesh(new T.PlaneGeometry(.95,1.14),new T.MeshStandardMaterial({map:logoTexture,roughness:.9}),[0,0,.045],[1,1,1],print);
 for(let i=0;i<17;i++)rounded(.07,.59,.14,.025,'#ddd7ca',[-2.5+i*.14,.43,backZ+.23]);
 // A second seating corner, floor lamp, small side table, and a low cat perch.
 const bench=new T.Group();bench.position.set(-2.7,0,3.55);bench.rotation.y=Math.PI+.14;room.add(bench);
 for(const x of[-.75,.75])for(const z of[-.3,.3])cylinder(.035,.025,.34,furnitureWood,[x,.17,z],bench);
 rounded(1.85,.12,.85,.05,furnitureWood,[0,.4,0],bench);cushion(1.8,.2,.82,sand,[0,.56,0],bench);cushion(1.83,.67,.18,sand,[0,.89,-.37],bench);const bp=cushion(.5,.46,.13,ivory,[.5,.9,-.15],bench);bp.rotation.z=.18;
 cylinder(.25,.25,.035,mat('#534838',{metalness:.7,roughness:.35}),[-3.45,.04,1.7]);cylinder(.012,.012,1.85,'#554b3d',[-3.45,.97,1.7]);
 mesh(new T.ConeGeometry(.37,.47,48,1,true),mat('#e8dec8',{side:T.DoubleSide,roughness:.85}),[-3.45,2,1.7]);const lamp=new T.PointLight('#ffdab0',3.5,4,2);lamp.position.set(-3.45,1.8,1.7);scene.add(lamp);
 rounded(.6,.05,.6,.02,furnitureWood,[-2.15,.9,-2.45]);for(const x of[-2.4,-1.9])for(const z of[-2.7,-2.2])cylinder(.02,.015,.88,furnitureWood,[x,.44,z]);
 // Woven rug and shallow ceramic food bowl anchor the cat's smaller nook.
 const rugTexture=canvasTexture((ctx,s)=>{ctx.fillStyle='#d0bd9d';ctx.fillRect(0,0,s,s);for(let y=0;y<s;y+=3){ctx.strokeStyle=y%2?'#efe2ca80':'#a38b6640';ctx.beginPath();ctx.moveTo(0,y);ctx.lineTo(s,y);ctx.stroke()}for(let x=0;x<s;x+=7){ctx.fillStyle='#fff2';ctx.fillRect(x,0,1,s)}});rugTexture.repeat.set(6,6);
 const rugMat=new T.MeshStandardMaterial({map:rugTexture,bumpMap:rugTexture,bumpScale:.006,roughness:1});materials.set('rug',rugMat);
 const rug=mesh(new T.CylinderGeometry(1.5,1.5,.018,96),rugMat,[0,.007,.55],[1,1,.77]);
 for(const r of[1.36,1.43,1.48]){const ring=mesh(new T.TorusGeometry(r,.009,5,96),'#a78d6c',[0,.02,.55]);ring.rotation.x=Math.PI/2;ring.scale.y=.77}
 const bowl=new T.Group();bowl.position.set(-1.2,.02,.94);room.add(bowl);mesh(new T.LatheGeometry([[0,0],[.21,0],[.26,.10],[.27,.15],[.24,.16],[.19,.045],[0,.04]].map(p=>new T.Vector2(...p)),48),mat('#668d83',{roughness:.2}),[0,0,0],[1,1,1],bowl);
 for(let i=0;i<24;i++)ball([.021,.016,.02],'#86603c',[Math.sin(i*2.4)*(.08+i*.004),.07,Math.cos(i*2.4)*(.08+i*.004)],bowl);
 const yarn=ball([.13,.13,.13],rose,[1.21,.14,1.17]);for(let i=0;i<9;i++){const ring=mesh(new T.TorusGeometry(.132,.004,5,40),'#d5b09a',[1.21,.14,1.17]);ring.rotation.set(i*.8,i*.6,i*.4)}tube([[1.2,.02,1.27],[1.5,.02,1.5],[1.85,.02,1.4]],.005,'#b98f7b');
 cylinder(.35,.35,.04,furnitureWood,[-1.85,.025,-1.2]);cylinder(.09,.09,.95,sand,[-1.85,.51,-1.2]);for(let i=0;i<36;i++){const ring=mesh(new T.TorusGeometry(.094,.007,5,24),'#ac9876',[-1.85,.08+i*.024,-1.2]);ring.rotation.x=Math.PI/2}cushion(.43,.08,.43,ivory,[-1.85,1,-1.2]);
 // Merge static geometry by surface material. Furniture no longer makes hundreds
 // of separate draw calls; the cat and transparent window remain independent.
 scene.updateMatrixWorld(true);
 const buckets=new Map();let staticMeshes=0;
 scene.traverse(o=>{
  if(!o.isMesh||o.name||o.material.transparent||Array.isArray(o.material))return;
  const key=o.material.uuid+'|'+o.castShadow+'|'+o.receiveShadow;
  if(!buckets.has(key))buckets.set(key,[]);buckets.get(key).push(o);staticMeshes++;
 });
 let staticBatches=0;
 for(const objects of buckets.values()){
  if(objects.length<2){staticBatches++;continue}
  const parts=objects.map(o=>{const g=o.geometry.index?o.geometry.toNonIndexed():o.geometry.clone();g.applyMatrix4(o.matrixWorld);return g});
  const total=parts.reduce((n,g)=>n+g.attributes.position.count,0),g=new T.BufferGeometry();
  for(const [name,size]of[['position',3],['normal',3],['uv',2]]){
   const values=new Float32Array(total*size);let offset=0;
   for(const part of parts){const a=part.getAttribute(name);if(a)values.set(a.array,offset);offset+=part.attributes.position.count*size}
   g.setAttribute(name,new T.BufferAttribute(values,size));
  }
  g.computeBoundingSphere();const merged=new T.Mesh(g,objects[0].material);merged.castShadow=objects[0].castShadow;merged.receiveShadow=objects[0].receiveShadow;scene.add(merged);
  objects.forEach(o=>{o.parent.remove(o);o.geometry.dispose()});parts.forEach(p=>p.dispose());staticBatches++;
 }
 canvas.dataset.staticMeshes=String(staticMeshes);canvas.dataset.staticBatches=String(staticBatches);
 // Reference-based dimensional resident, animated independently of camera movement.
 const CAT_SCALE=.76;const catRoot=new T.Group();catRoot.scale.setScalar(CAT_SCALE);catRoot.position.set(0,.035,.55);room.add(catRoot);let head,tail,eyes=[],ears=[],petMeshes=[],accessories=[];
 function rebuild(c){renderer.shadowMap.needsUpdate=true;catRoot.traverse(o=>o.geometry?.dispose());catRoot.userData.hairMaterial?.dispose();catRoot.clear();petMeshes=[];const model=buildCafeCat(T,catRoot,c);head=model.head;tail=model.tail;eyes=model.eyes;ears=model.ears;catRoot.traverse(o=>{if(o.isMesh)petMeshes.push(o)});currentCat={...c};catKey=[c.id,c.coat,c.eyeColor,c.accessory,c.sick].join('|');}

 function sync(c){const key=[c.id,c.coat,c.eyeColor,c.accessory,c.sick].join('|');if(key!==catKey)rebuild(c);currentCat={...c}}
 function setCamera(){const portrait=canvas.clientWidth<650;let r=distance*(portrait?1.08:1);const sx=Math.sin(yaw)*Math.cos(pitch),sz=Math.cos(yaw)*Math.cos(pitch);r=Math.min(r,4.15/Math.max(.001,Math.abs(sx)),(sz>0?4.82:3.95)/Math.max(.001,Math.abs(sz)),2.45/Math.max(.001,Math.sin(pitch)));camera.position.set(Math.sin(yaw)*Math.cos(pitch)*r,target.y+Math.sin(pitch)*r,Math.cos(yaw)*Math.cos(pitch)*r+target.z);camera.lookAt(target);camera.updateMatrixWorld();canvas.dataset.viewYaw=yaw.toFixed(3);canvas.dataset.viewPitch=pitch.toFixed(3)}
 function resize(){const w=canvas.clientWidth,h=canvas.clientHeight;renderer.setSize(w,h,false);camera.aspect=w/h;camera.updateProjectionMatrix();setCamera()}
 const ro=new ResizeObserver(resize);ro.observe(canvas);
 function catAt(e){const r=canvas.getBoundingClientRect();pointer.set((e.clientX-r.left)/r.width*2-1,-(e.clientY-r.top)/r.height*2+1);ray.setFromCamera(pointer,camera);return ray.intersectObjects(petMeshes,false).length>0}
 function stroke(e,previous){if(!previous)return;const dy=e.clientY-previous.y,dx=e.clientX-previous.x;if(Math.abs(dy)<1||Math.abs(dx)>Math.abs(dy)*2.5)return;const direction=Math.sign(dy);if(strokeDirection&&direction!==strokeDirection)reversals++;strokeDirection=direction;strokeDistance+=Math.abs(dy);if(strokeDistance>12){petUntil=performance.now()+1400;startPurr()}if(strokeDistance>=42){strokeDistance=0;reversals=0;if(performance.now()-lastReward>1100){lastReward=performance.now();canvas.dataset.petStrokes=String(+(canvas.dataset.petStrokes||0)+1);onStroke();}}}
 canvas.addEventListener('pointerdown',e=>{if(e.button>0||drag)return;unlockAudio();const pet=catAt(e);drag={id:e.pointerId,x:e.clientX,y:e.clientY,pet,moved:0};strokeDistance=0;reversals=0;strokeDirection=0;hover={x:e.clientX,y:e.clientY};canvas.setPointerCapture(e.pointerId);canvas.classList.toggle('orbiting',!pet);canvas.classList.toggle('petting',pet)});
 canvas.addEventListener('pointermove',e=>{if(drag&&drag.id!==e.pointerId)return;const hit=catAt(e);canvas.classList.toggle('over-cat',hit);if(drag){const dx=e.clientX-drag.x,dy=e.clientY-drag.y;drag.moved+=Math.hypot(dx,dy);if(drag.pet)stroke(e,{x:drag.x,y:drag.y});else{wantedYaw-=dx*.006;wantedPitch=Math.max(.06,Math.min(.65,wantedPitch+dy*.004))}drag.x=e.clientX;drag.y=e.clientY}else if(e.pointerType==='mouse'&&hit)stroke(e,hover);else{strokeDistance=0;reversals=0;strokeDirection=0}hover={x:e.clientX,y:e.clientY}});
 function end(e){if(drag?.id!==e.pointerId)return;if(e.type!=='pointercancel'&&drag.pet&&drag.moved<7){petUntil=performance.now()+1600;startPurr();onStroke()}drag=null;canvas.classList.remove('orbiting');canvas.classList.remove('petting');if(canvas.hasPointerCapture(e.pointerId))canvas.releasePointerCapture(e.pointerId)}canvas.addEventListener('pointerup',end);canvas.addEventListener('pointercancel',end);canvas.addEventListener('lostpointercapture',()=>{drag=null;canvas.classList.remove('orbiting');canvas.classList.remove('petting')});canvas.addEventListener('pointerleave',()=>{hover=null;strokeDistance=0;reversals=0});
 canvas.addEventListener('wheel',e=>{e.preventDefault();wantedDistance=Math.max(3.2,Math.min(5.2,wantedDistance+e.deltaY*.008))},{passive:false});canvas.addEventListener('keydown',e=>{if(!['ArrowLeft','ArrowRight','ArrowUp','ArrowDown','+','=','-','Home'].includes(e.key))return;e.preventDefault();if(e.key==='ArrowLeft')wantedYaw-=.16;if(e.key==='ArrowRight')wantedYaw+=.16;if(e.key==='ArrowUp')wantedPitch=Math.min(.65,wantedPitch+.1);if(e.key==='ArrowDown')wantedPitch=Math.max(.06,wantedPitch-.1);if(e.key==='+'||e.key==='=')wantedDistance=Math.max(3.2,wantedDistance-.6);if(e.key==='-')wantedDistance=Math.min(5.2,wantedDistance+.6);if(e.key==='Home')reset()});
 function unlockAudio(){audio?.unlock()}
 function startPurr(){audio?.purr()}
 function reset(){wantedYaw=.12;wantedPitch=.10;wantedDistance=4.65}
 function purr(){petUntil=performance.now()+1800;startPurr()}
 function toggleSound(){return audio?.toggle()||false}
 const headWorld=new T.Vector3(),screen=new T.Vector3();
 function draw(now){frame=requestAnimationFrame(draw);if(!active||document.hidden)return;if(now-lastFrame<1000/(phone||lowMemory?30:60)-1)return;const dt=Math.min(.1,Math.max(.001,(now-lastFrame)/1000)),blend=1-Math.exp(-20*dt);lastFrame=now;yaw+=(wantedYaw-yaw)*blend;pitch+=(wantedPitch-pitch)*blend;distance+=(wantedDistance-distance)*blend;setCamera();const t=now*.001,purring=now<petUntil;canvas.dataset.purring=String(purring);if(head){head.rotation.z=purring&&!reduceMotion?Math.sin(t*10)*.035:0;head.rotation.x=purring?-.06:0;catRoot.scale.y=CAT_SCALE*(reduceMotion?1:1+Math.sin(t*(purring?8:1.8))*(purring?.004:.006));tail.rotation.y=reduceMotion?0:Math.sin(t*(purring?1.5:.65))*.065;eyes.forEach(eye=>eye.scale.y=purring?.3:currentCat?.sick?.45:Math.sin(t*.7)>.995?.08:1);head.getWorldPosition(headWorld);headWorld.y+=.75;screen.copy(headWorld).project(camera);const speech=document.querySelector('#speech');if(speech){speech.style.left=`${(screen.x*.5+.5)*canvas.clientWidth}px`;speech.style.top=`${(-screen.y*.5+.5)*canvas.clientHeight}px`;speech.classList.toggle('purring',purring);if(purring)speech.textContent='Prrrr… that’s the spot. ♡'}}
 renderer.render(scene,camera);sampleFrames++;if(!sampleStart)sampleStart=now;if(now-sampleStart>1200){const fps=sampleFrames*1000/(now-sampleStart);canvas.dataset.renderFps=String(Math.round(fps));canvas.dataset.drawCalls=String(renderer.info?.render?.calls||0);if(fps<24&&renderScale>.75){renderScale=Math.max(.75,renderScale*.85);renderer.setPixelRatio(renderScale);canvas.dataset.renderScale=renderScale.toFixed(2)}sampleStart=now;sampleFrames=0}}
 resize();frame=requestAnimationFrame(draw);
 return {sync,purr,reset,toggleSound,get soundEnabled(){return audio?.enabled||false},setActive(v){active=v;canvas.tabIndex=v?0:-1},get interacting(){return !!drag},dispose(){disposed=true;cancelAnimationFrame(frame);ro.disconnect();scene.traverse(o=>o.geometry?.dispose());textures.forEach(t=>t.dispose());gardenEnv?.dispose();catRoot.userData.hairMaterial?.dispose();materials.forEach(m=>m.dispose());window.disposeCafeCatMaterials?.();renderer.dispose()}};
};
