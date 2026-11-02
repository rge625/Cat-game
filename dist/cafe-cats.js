/* Coat references and portraits from the café's supplied October 4 poster.
   These descriptions do not assume the cats' personalities or current availability. */
window.CAFE_CATS=[
 ['ralph','Ralph','tuxedo','Black tuxedo with a snowy bib.',102,181,'#bba14e'],
 ['8-ball','8-Ball','black','A sleek black coat and bright eyes.',194,181,'#a9ad54'],
 ['charlie','Charlie','blaze','A tuxedo coat with a white nose blaze.',285,181,'#a5aa60'],
 ['mira','Mira','black','Dark fur with a warm brown sheen.',379,181,'#9d9b51'],
 ['izzy','Izzy','brownwhite','Fluffy tabby fur with a white chest.',103,281,'#a6a875'],
 ['star','Star','gray','A soft blue-gray coat and golden eyes.',197,281,'#b39b3e'],
 ['ruby','Ruby','silver','Silver tabby stripes and green eyes.',288,281,'#91a784'],
 ['carrot-cake','Carrot Cake','calico','Warm ginger, dark patches, and white.',381,281,'#9ba46c'],
 ['teddy-bear','Teddy Bear','silverwhite','A gray tabby with a white bib.',94,382,'#8ea58d'],
 ['goose','Goose','cow','Black head markings over a white coat.',192,382,'#aa9c57'],
 ['pumpkin-pie','Pumpkin Pie','brown','A brown tabby with a pale chin.',290,382,'#a5af80'],
 ['zoey','Zoey','black','A midnight-black coat and golden eyes.',387,382,'#b9a251'],
 ['kieran','Kieran','gray','A plush charcoal-gray coat.',133,480,'#aaa05a'],
 ['zeus','Zeus','ginger','An orange tabby with warm golden fur.',246,480,'#b6aa63'],
 ['buttercup','Buttercup','silver','Silver-gray tabby fur and green eyes.',348,480,'#8fa675'],
 ['soda-pop','Soda Pop','point','Cream fur, a dark face, and blue eyes.',196,574,'#7fa9c4'],
 ['jelly','Jelly','silver','A soft silver tabby coat.',302,574,'#8fa981']
].map(([id,name,coat,bio,x,y,eyeColor])=>({id,name,coat,bio,portrait:[x,y],eyeColor}));
window.cafeImage=name=>window.CAFE_IMAGE_ASSETS?.[name]||'assets/'+name;
window.cafePortrait=c=>{
 const [x,y]=c.portrait||[102,181];
 return `<div class="cafe-portrait" role="img" aria-label="${c.name.replace(/["<>]/g,'')} — café reference photo" style="background-image:url('${cafeImage('cafe-cats.png')}');background-position:${(x-36)/423*100}% ${(y-36)/547*100}%"></div>`;
};
window.createCafeSave=(old,date)=>{
 const care=()=>({hunger:72,happiness:85,energy:64,health:100,sick:false,medicated:false,xp:20,accessory:'none',lastUpdate:Date.now()});
 const fresh={version:2,coins:120,selected:0,cats:CAFE_CATS.map(c=>({...c,...care()})),inventory:{kibble:3,salmon:1,medicine:0},owned:[],daily:{date,pet:false,feed:false,play:false,claimed:false},lastCheckin:'',streak:0,stamps:0,games:0};
 if(!old||![1,2].includes(old.version)||!Array.isArray(old.cats)||!old.inventory||!old.daily)return fresh;
 const legacy=['zeus','ralph','star'];
 for(const c of fresh.cats){
  const previous=old.version===1?old.cats[legacy.indexOf(c.id)]:old.cats.find(o=>o.id===c.id);
  if(!previous)continue;
  for(const key of Object.keys(care()))if(previous[key]!==undefined)c[key]=previous[key];
  if(old.version===2)for(const key of ['name','bio','photo','coat'])if(previous[key])c[key]=previous[key];
 }
 const selectedId=old.version===1?legacy[old.selected]:old.cats[old.selected]?.id;
 return {...fresh,...old,version:2,cats:fresh.cats,selected:Math.max(0,fresh.cats.findIndex(c=>c.id===selectedId))};
};
