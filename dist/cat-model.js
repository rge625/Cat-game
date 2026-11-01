/* Original adult-cat proportions, fur surfaces, glossy irises, and delicate whiskers. */
(function(){
 const cache=new Map();
 window.buildCafeCat=function(T,root,c){
  const colors={ginger:['#c99159','#f0d6b2','#a27c35'],tuxedo:['#444941','#e8e3d4','#929346'],gray:['#8f9696','#d9dcd5','#718d71']}[c.coat]||['#c99159','#f0d6b2','#a27c35'];
  function fur(color,striped=false){const key=color+striped;if(cache.has(key))return cache.get(key);
   const canvas=document.createElement('canvas');canvas.width=512;canvas.height=512;const ctx=canvas.getContext('2d');ctx.fillStyle=color;ctx.fillRect(0,0,512,512);
   let seed=91;const random=()=>{seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed/4294967296};
   if(striped){ctx.strokeStyle=c.coat==='ginger'?'#835b35':'#565e60';ctx.globalAlpha=.25;ctx.lineWidth=13;for(let i=0;i<11;i++){ctx.beginPath();for(let y=0;y<=512;y+=8){const x=i*52+Math.sin(y*.025+i)*14;y?ctx.lineTo(x,y):ctx.moveTo(x,y)}ctx.stroke()}ctx.globalAlpha=1}
   ctx.lineWidth=.7;for(let i=0;i<17000;i++){const x=random()*512,y=random()*512;ctx.strokeStyle=random()>.5?'rgba(255,248,225,.19)':'rgba(25,25,18,.13)';ctx.beginPath();ctx.moveTo(x,y);ctx.lineTo(x+(random()-.5)*2,y+2+random()*5);ctx.stroke()}
   const texture=new T.CanvasTexture(canvas);texture.colorSpace=T.SRGBColorSpace;texture.wrapS=texture.wrapT=T.RepeatWrapping;texture.anisotropy=4;
   const m=new T.MeshStandardMaterial({map:texture,bumpMap:texture,bumpScale:.012,roughness:.97});cache.set(key,m);return m;
  }
  function material(color,gloss=false){const key=color+gloss;if(!cache.has(key))cache.set(key,gloss?new T.MeshPhysicalMaterial({color,roughness:.16,clearcoat:1,clearcoatRoughness:.1}):new T.MeshStandardMaterial({color,roughness:.85}));return cache.get(key)}
  function mesh(geometry,m,pos,scale=[1,1,1],parent=root){const o=new T.Mesh(geometry,m);o.position.set(...pos);o.scale.set(...scale);o.castShadow=o.receiveShadow=true;parent.add(o);return o}
  const sphere=(size,m,pos,parent=root)=>mesh(new T.SphereGeometry(1,40,28),m,pos,size,parent);
  function line(points,width,m,parent=root){return mesh(new T.TubeGeometry(new T.CatmullRomCurve3(points.map(p=>new T.Vector3(...p))),24,width,6,false),m,[0,0,0],[1,1,1],parent)}
  const coat=fur(colors[0],c.coat!=='tuxedo'),cream=fur(colors[1]),noseMat=material('#aa7f77'),dark=material('#30332c'),whiskerMat=material(c.coat==='tuxedo'?'#d6d4bf':'#9f9a83');
  const torso=sphere([.47,.73,.43],coat,[0,.78,-.08]);torso.name='Cat torso';sphere([.36,.46,.35],coat,[0,1.16,.015]);sphere([.25,.23,.27],coat,[0,1.4,.015]);
  sphere([.28,.47,.095],cream,[0,.98,.33]);
  for(const side of[-1,1]){
   sphere([.3,.38,.34],coat,[side*.33,.39,-.08]);sphere([.18,.115,.29],coat,[side*.38,.11,.11]);
   sphere([.115,.47,.13],coat,[side*.225,.52,.32]);sphere([.145,.105,.255],cream,[side*.225,.105,.43]);
   for(const toe of[-1,1])line([[side*.225+toe*.045,.112,.66],[side*.225+toe*.045,.15,.61]],.0025,material('#9c9988'));
  }
  const head=new T.Group();head.position.set(0,1.73,.075);root.add(head);sphere([.435,.40,.36],coat,[0,0,0],head);
  const ears=[];
  for(const side of[-1,1]){
   const ear=new T.Group();ear.position.set(side*.29,.255,-.015);ear.rotation.z=side*-.20;head.add(ear);ears.push(ear);
   const shape=new T.Shape();shape.moveTo(-.155,0);shape.quadraticCurveTo(-.17,.13,-.035,.39);shape.quadraticCurveTo(0,.43,.025,.38);shape.quadraticCurveTo(.15,.17,.155,0);shape.closePath();
   const geo=new T.ExtrudeGeometry(shape,{depth:.085,bevelEnabled:true,bevelSize:.018,bevelThickness:.018,bevelSegments:3,steps:1});geo.translate(0,0,-.055);mesh(geo,coat,[0,0,0],[1,1,1],ear);
   const inside=mesh(new T.ShapeGeometry(shape),material('#bd9990'),[0,.035,.052],[.66,.76,1],ear);inside.receiveShadow=false;
   for(let j=0;j<3;j++)line([[side*.05,.1,.065],[side*(.09+j*.025),.18+j*.025,.065]],.0028,cream,ear);
  }
  const eyes=[];
  for(const side of[-1,1]){
   const eye=new T.Group();eye.position.set(side*.18,.065,.322);eye.rotation.y=side*.22;head.add(eye);eyes.push(eye);
   sphere([.112,.068,.031],dark,[0,0,0],eye);sphere([.065,.059,.023],material(colors[2],true),[0,0,.024],eye);sphere([.014,.053,.008],material('#0f1713',true),[0,0,.045],eye);
   sphere([.008,.012,.004],material('#ffffed'),[-.02,.025,.052],eye);sphere([.004,.005,.003],material('#eceddd'),[.018,-.019,.05],eye);
   sphere([.13,.10,.09],cream,[side*.095,-.145,.326],head);
   for(let j=0;j<4;j++)line([[side*.16,-.14+j*.027,.39],[side*.31,-.14+j*.036,.40],[side*(.49+j*.018),-.17+j*.045,.35]],.0028,whiskerMat,head);
  }
  const nose=new T.Shape();nose.moveTo(-.041,0);nose.quadraticCurveTo(0,.015,.041,0);nose.lineTo(0,-.035);nose.closePath();mesh(new T.ShapeGeometry(nose),noseMat,[0,-.10,.425],[1,1,1],head);
  line([[0,-.132,.424],[0,-.19,.421],[-.038,-.204,.405]],.004,material('#78695c'),head);line([[0,-.19,.421],[.038,-.204,.405]],.004,material('#78695c'),head);
  const tail=new T.Group();tail.position.set(.34,.21,-.3);root.add(tail);line([[0,0,0],[.43,-.08,-.08],[.83,-.09,.11],[.98,-.06,.46],[.87,.02,.7]],.082,coat,tail);sphere([.081,.081,.081],coat,[.87,.02,.7],tail);
  const bow=new T.Group();bow.position.set(0,1.36,.29);root.add(bow);for(const side of[-1,1]){const lobe=sphere([.12,.077,.035],material('#b88073'),[side*.09,0,0],bow);lobe.rotation.z=side*-.3}sphere([.035,.04,.035],material('#d3a48f'),[0,0,.02],bow);bow.visible=c.accessory==='bow';
  const hat=new T.Group();hat.position.set(0,.39,-.015);head.add(hat);mesh(new T.CylinderGeometry(.51,.51,.045,40),material('#899d71'),[0,.02,0],[1,1,1],hat);mesh(new T.CylinderGeometry(.3,.35,.23,40),material('#a5b88b'),[0,.14,0],[1,1,1],hat);hat.visible=c.accessory==='hat';
  const scarf=mesh(new T.TorusGeometry(.26,.055,12,40),material('#8ea6ac'),[0,1.38,.015]);scarf.rotation.x=Math.PI/2;scarf.visible=c.accessory==='scarf';const end=mesh(new T.BoxGeometry(.1,.28,.045),material('#8ea6ac'),[.19,1.23,.31]);end.rotation.z=.2;end.visible=scarf.visible;
  return {head,tail,eyes,ears};
 };
 window.disposeCafeCatMaterials=function(){for(const m of cache.values()){m.map?.dispose();m.dispose()}cache.clear()};
})();
