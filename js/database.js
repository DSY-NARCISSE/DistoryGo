const DB = {
    chars: [
        {id:"🐙", n:"Poulpe", d:"Polyvalent"},
        {id:"🦈", n:"Requin", d:"Offensif"},
        {id:"🐢", n:"Tortue", d:"Défensif"},
        {id:"👽", n:"Alien", d:"Tech"}
    ],
    items: [
        {n:"Dague",e:"🗡️",s:10,t:"weapon",r:"r-common"},
        {n:"Trident",e:"🔱",s:20,t:"weapon",r:"r-rare"},
        {n:"Casque",e:"🪖",s:10,t:"head",r:"r-common"},
        {n:"Bouclier",e:"🛡️",s:25,t:"head",r:"r-rare"},
        {n:"Dragon",e:"🐉",s:15,t:"pet",r:"r-legendary"},
        {n:"Crabe",e:"🦀",s:5,t:"pet",r:"r-common"}
    ],
    skills: { 
        'fire': {n:"Feu", i:"🔥", c:"text-orange-500"}, 
        'heal': {n:"Soin", i:"💚", c:"text-green-500"},
        'bolt': {n:"Eclair", i:"⚡", c:"text-yellow-400"}, 
        'shield': {n:"Bouclier", i:"🛡️", c:"text-blue-400"}
    },
    enemies: {
        z1: [{n:"Crabe",hp:60,atk:6,i:"🦀"}, {n:"Poisson",hp:50,atk:5,i:"🐟"}],
        boss: [{n:"KRAKEN",hp:500,atk:20,i:"🦑"}]
    }
};
