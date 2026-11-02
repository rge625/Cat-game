/* Anatomical seated cat with reference-based coats, short guard hairs, detailed irises, and whiskers. */
(function(){
 const cache=new Map();
 window.buildCafeCat=function(T,root,c){
  const palettes={
   ginger:['#c29462','#e1c39a','#a27c35'],tuxedo:['#151715','#eee9de','#bba14e'],
   blaze:['#151715','#eee9de','#a5aa60'],black:['#151413','#302b26','#b2a251'],
   gray:['#60666b','#747b80','#b39b3e'],silver:['#9b9b96','#c2c0b7','#91a784'],
   silverwhite:['#7c7d78','#f0ede4','#8ea58d'],brown:['#7d6b4a','#c5b996','#a5af80'],
   brownwhite:['#6f6550','#eae7dd','#a6a875'],calico:['#8c5835','#eee7d8','#9ba46c'],
   cow:['#151715','#eeeae1','#aa9c57'],point:['#e3d8bf','#453831','#7fa9c4']
  };
  const colors=palettes[c.coat]||palettes.tuxedo,whiteChest=['tuxedo','blaze','silverwhite','brownwhite','calico','cow'].includes(c.coat);
  const striped=['ginger','silver','silverwhite','brown','brownwhite','calico'].includes(c.coat);
  function fur(color,striped=false,region="coat"){const key=color+striped+c.coat+region;if(cache.has(key))return cache.get(key);
   const canvas=document.createElement('canvas');canvas.width=512;canvas.height=512;const ctx=canvas.getContext('2d');ctx.fillStyle=color;ctx.fillRect(0,0,512,512);
   let seed=91;const random=()=>{seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed/4294967296};
   if(striped){
    // Broken transverse mackerel bands instead of all-over wood-like streaks.
    ctx.strokeStyle=c.coat==='ginger'?'#926542':'#45453c';ctx.globalAlpha=c.coat==='ginger'?.24:.32;
    for(let j=0;j<13;j++){ctx.lineWidth=6+random()*8;ctx.beginPath();const y=j*43;
     for(let x=0;x<=512;x+=5){const yy=y+Math.sin(x*.019+j*.8)*16+Math.sin(x*.061)*3;x?ctx.lineTo(x,yy):ctx.moveTo(x,yy)}ctx.stroke()}
    ctx.globalAlpha=1;
   }
   if(region==='body'&&whiteChest){ctx.fillStyle=colors[1];for(const edge of[0,512]){ctx.beginPath();ctx.moveTo(edge,20);ctx.bezierCurveTo(edge+(edge? -1:1)*40,70,edge+(edge? -1:1)*74,140,edge+(edge? -1:1)*58,240);ctx.bezierCurveTo(edge+(edge? -1:1)*35,300,edge+(edge? -1:1)*18,260,edge,320);ctx.closePath();ctx.fill()}}
   if(c.coat==='calico'&&region==='body'){ctx.fillStyle='#342c22';for(const [x,y]of[[170,200],[320,360]]){ctx.beginPath();ctx.ellipse(x,y,45,82,.3,0,Math.PI*2);ctx.fill()}}
   ctx.lineWidth=.7;for(let i=0;i<17000;i++){const x=random()*512,y=random()*512;ctx.strokeStyle=random()>.5?'rgba(255,248,225,.19)':'rgba(25,25,18,.13)';ctx.beginPath();ctx.moveTo(x,y);ctx.lineTo(x+(random()-.5)*2,y+2+random()*5);ctx.stroke()}
   const texture=new T.CanvasTexture(canvas);texture.colorSpace=T.SRGBColorSpace;texture.wrapS=texture.wrapT=T.RepeatWrapping;texture.anisotropy=4;
   const m=new T.MeshPhysicalMaterial({map:texture,roughness:.97,sheen:.8,sheenRoughness:.9,sheenColor:new T.Color(color).lerp(new T.Color("#ded4bd"),.25),envMapIntensity:.25});cache.set(key,m);return m;
  }
  function material(color,gloss=false){const key=color+gloss;if(!cache.has(key))cache.set(key,gloss?new T.MeshPhysicalMaterial({color,roughness:.16,clearcoat:1,clearcoatRoughness:.1}):new T.MeshStandardMaterial({color,roughness:.85}));return cache.get(key)}
  function mesh(geometry,m,pos,scale=[1,1,1],parent=root){const o=new T.Mesh(geometry,m);o.position.set(...pos);o.scale.set(...scale);o.castShadow=o.receiveShadow=true;parent.add(o);return o}
  const sphere=(size,m,pos,parent=root)=>mesh(new T.SphereGeometry(1,40,28),m,pos,size,parent);
  function line(points,width,m,parent=root){return mesh(new T.TubeGeometry(new T.CatmullRomCurve3(points.map(p=>new T.Vector3(...p))),24,width,6,false),m,[0,0,0],[1,1,1],parent)}
  function iris(color){
   const key='iris'+color;if(cache.has(key))return cache.get(key);
   const cn=document.createElement('canvas');cn.width=cn.height=256;const ctx=cn.getContext('2d');
   ctx.fillStyle=color;ctx.fillRect(0,0,256,256);
   for(let i=0;i<500;i++){const a=i*2.39996,r=20+(i%31);ctx.strokeStyle=i%2?'rgba(35,24,9,.36)':'rgba(250,239,170,.35)';ctx.lineWidth=.8;ctx.beginPath();ctx.moveTo(128+Math.cos(a)*r,128+Math.sin(a)*r);ctx.lineTo(128+Math.cos(a)*122,128+Math.sin(a)*122);ctx.stroke()}
   const tex=new T.CanvasTexture(cn);tex.colorSpace=T.SRGBColorSpace;
   const m=new T.MeshPhysicalMaterial({map:tex,roughness:.2,clearcoat:1,clearcoatRoughness:.08});cache.set(key,m);return m;
  }
  const coat=fur(colors[0],striped),cream=fur(colors[1]),noseMat=material(['black','point'].includes(c.coat)?'#4a3431':'#b77979'),dark=material('#30332c'),whiskerMat=material(c.coat==='tuxedo'?'#d6d4bf':'#9f9a83');
  // A continuous neck-to-haunch silhouette replaces stacked body spheres.
  const profile=[[.04,.12],[.25,.15],[.43,.3],[.48,.55],[.43,.83],[.34,1.13],[.255,1.42],[.19,1.58],[.04,1.64]].map(([r,y])=>new T.Vector2(r,y));
  const torso=mesh(new T.LatheGeometry(profile,64),c.coat==='cow'?cream:fur(colors[0],striped,'body'),[0,0,-.09],[1,1,.86]);torso.name='Continuous cat torso';

  for(const side of[-1,1]){
   sphere([.3,.38,.34],coat,[side*.33,.39,-.08]);sphere([.18,.115,.29],coat,[side*.38,.11,.11]);
   sphere([.105,.47,.115],c.coat==='cow'?cream:coat,[side*.225,.52,.32]);sphere([.135,.095,.225],whiteChest?cream:coat,[side*.225,.105,.43]);
   for(const toe of[-1,1])line([[side*.225+toe*.045,.112,.66],[side*.225+toe*.045,.15,.61]],.0025,material('#9c9988'));
  }
  const head=new T.Group();head.position.set(0,1.73,.075);root.add(head);const skull=sphere([.365,.335,.315],c.coat==='point'?cream:coat,[0,0,0],head);
  // Narrow the forehead while retaining broad cheekbones and a feline brow.
  const positions=skull.geometry.attributes.position;
  for(let i=0;i<positions.count;i++){const y=positions.getY(i),z=positions.getZ(i);positions.setX(i,positions.getX(i)*(y>.2?.9:1));if(z>.35&&y<0)positions.setZ(i,z*.94)}
  positions.needsUpdate=true;skull.geometry.computeVertexNormals();
  if(['blaze','cow'].includes(c.coat))sphere([.055,.19,.028],cream,[0,-.025,.305],head);
  if(c.coat==='calico'){sphere([.17,.19,.028],fur('#28231d'),[-.17,.1,.25],head);sphere([.12,.2,.028],fur('#c18a4b'),[.21,.04,.25],head)}

  const ears=[];
  for(const side of[-1,1]){
   const ear=new T.Group();ear.position.set(side*.255,.24,-.015);ear.rotation.z=side*-.15;head.add(ear);ears.push(ear);
   const shape=new T.Shape();shape.moveTo(-.155,0);shape.quadraticCurveTo(-.17,.13,-.035,.39);shape.quadraticCurveTo(0,.43,.025,.38);shape.quadraticCurveTo(.15,.17,.155,0);shape.closePath();
   const geo=new T.ExtrudeGeometry(shape,{depth:.085,bevelEnabled:true,bevelSize:.018,bevelThickness:.018,bevelSegments:3,steps:1});geo.translate(0,0,-.055);mesh(geo,c.coat==='point'?cream:coat,[0,0,0],[.9,.87,1],ear);
   const inside=mesh(new T.ShapeGeometry(shape),material(c.coat==='black'?'#5f4b46':'#b28b80'),[0,.035,.052],[.66,.76,1],ear);inside.receiveShadow=false;
   for(let j=0;j<3;j++)line([[side*.05,.1,.065],[side*(.09+j*.025),.18+j*.025,.065]],.0028,cream,ear);
  }
  const eyes=[];
  for(const side of[-1,1]){
   const eye=new T.Group();eye.position.set(side*.153,.044,.28);eye.rotation.y=side*.22;head.add(eye);eyes.push(eye);
   sphere([.081,.049,.023],dark,[0,0,0],eye);sphere([.047,.043,.018],iris(c.eyeColor||colors[2]),[0,0,.024],eye);sphere([.009,.039,.007],material('#0f1713',true),[0,0,.045],eye);
   sphere([.008,.012,.004],material('#ffffed'),[-.02,.025,.052],eye);sphere([.004,.005,.003],material('#eceddd'),[.018,-.019,.05],eye);
   sphere([.077,.055,.038],whiteChest||c.coat==='ginger'?cream:c.coat==='point'?cream:coat,[side*.063,-.12,.315],head);
   for(let j=0;j<4;j++)line([[side*.145,-.12+j*.027,.35],[side*.29,-.12+j*.036,.36],[side*(.49+j*.018),-.17+j*.045,.35]],.0014,whiskerMat,head);
  }
  const nose=new T.Shape();nose.moveTo(-.041,0);nose.quadraticCurveTo(0,.015,.041,0);nose.lineTo(0,-.035);nose.closePath();mesh(new T.ShapeGeometry(nose),noseMat,[0,-.09,.371],[1,1,1],head);
  line([[0,-.132,.37],[0,-.19,.363],[-.038,-.204,.35]],.004,material('#78695c'),head);line([[0,-.19,.363],[.038,-.204,.35]],.004,material('#78695c'),head);
  const tail=new T.Group();tail.position.set(.34,.21,-.3);root.add(tail);line([[0,0,0],[.43,-.08,-.08],[.83,-.09,.11],[.98,-.06,.46],[.87,.02,.7]],.082,coat,tail);sphere([.081,.081,.081],coat,[.87,.02,.7],tail);
  // Short tapered-looking guard hairs catch light without a solid clay outline.
  const surfaces=[];root.traverse(o=>{if(o.isMesh&&o.material.map&&o.material.roughness>.7&&o.geometry.type!=='TubeGeometry'&&!o.parent.parent?.name?.includes('eye'))surfaces.push(o)});
  let seed=123;const rnd=()=>{seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed/4294967296};
  const hairMaterial=new T.LineBasicMaterial({color:c.coat==='black'||['tuxedo','blaze'].includes(c.coat)?'#655f54':'#c4bda8',transparent:true,opacity:.18,depthWrite:false});
  root.userData.hairMaterial=hairMaterial;
  for(const surface of surfaces){
   if(!['SphereGeometry','LatheGeometry'].includes(surface.geometry.type))continue;
   const p=surface.geometry.attributes.position,n=surface.geometry.attributes.normal,verts=[];
   for(let i=0;i<1500;i++){const j=Math.floor(rnd()*p.count),x=p.getX(j),y=p.getY(j),z=p.getZ(j),len=.008+rnd()*.014;verts.push(x,y,z,x+n.getX(j)*len,y+n.getY(j)*len-.008,z+n.getZ(j)*len)}
   const g=new T.BufferGeometry();g.setAttribute('position',new T.Float32BufferAttribute(verts,3));const hairs=new T.LineSegments(g,hairMaterial);surface.add(hairs);
  }
  const bow=new T.Group();bow.position.set(0,1.36,.29);root.add(bow);for(const side of[-1,1]){const lobe=sphere([.12,.077,.035],material('#b88073'),[side*.09,0,0],bow);lobe.rotation.z=side*-.3}sphere([.035,.04,.035],material('#d3a48f'),[0,0,.02],bow);bow.visible=c.accessory==='bow';
  const hat=new T.Group();hat.position.set(0,.39,-.015);head.add(hat);mesh(new T.CylinderGeometry(.51,.51,.045,40),material('#899d71'),[0,.02,0],[1,1,1],hat);mesh(new T.CylinderGeometry(.3,.35,.23,40),material('#a5b88b'),[0,.14,0],[1,1,1],hat);hat.visible=c.accessory==='hat';
  const scarf=mesh(new T.TorusGeometry(.26,.055,12,40),material('#8ea6ac'),[0,1.38,.015]);scarf.rotation.x=Math.PI/2;scarf.visible=c.accessory==='scarf';const end=mesh(new T.BoxGeometry(.1,.28,.045),material('#8ea6ac'),[.19,1.23,.31]);end.rotation.z=.2;end.visible=scarf.visible;
  return {head,tail,eyes,ears};
 };
 window.disposeCafeCatMaterials=function(){for(const m of cache.values()){m.map?.dispose();m.dispose()}cache.clear()};
})();
