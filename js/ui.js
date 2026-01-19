const UI = {
    upd: () => {
        document.getElementById('ui-gold').innerText = D.gold;
        document.getElementById('ui-perls').innerText = D.perls;
        
        if(R.active || D.char) {
            document.getElementById('ui-day').innerText = R.day;
            document.getElementById('ui-hp-txt').innerText = `${Math.floor(R.hp)}/${R.max}`;
            document.getElementById('ui-hp-bar').style.width = (R.hp/R.max*100)+"%";
            document.getElementById('ui-atk').innerText = R.atk;
            document.getElementById('ui-def').innerText = R.def;
            
            let ls = document.getElementById('list-skills'); 
            ls.innerHTML = '';
            if(R.skills.length === 0) ls.innerHTML = `<div class="text-xs text-center text-gray-600 mt-4">Vide</div>`;
            R.skills.forEach(s => { 
                let d = DB.skills[s.id]; 
                ls.innerHTML += `<div class="text-xs bg-white/10 p-1 mb-1 rounded flex justify-between"><span class="${d.c} font-bold">${d.i} ${d.n}</span><span>L.${s.lvl}</span></div>`; 
            });
        }
        
        const set = (id, it, p) => { document.getElementById(id).innerText = it ? it.e : p; };
        set('s-w', D.weapon, '⚔️'); 
        set('s-h', D.head, '🛡️'); 
        set('s-p', D.pet, '🐾');
        
        let gi = document.getElementById('inv-grid'); 
        gi.innerHTML = '';
        D.inv.forEach((it, i) => { 
            let d = document.createElement('div'); 
            d.className = `slot ${it.r}`; 
            d.innerText = it.e; 
            d.onclick = () => Core.equip(i); 
            gi.appendChild(d);
        });
        
        if(D.char) document.getElementById('vis-hero').innerText = D.char;
    },

    bar: () => document.getElementById('ui-en-bar').style.width = (C.hp/C.max*100)+"%",

    scene: (t) => {
        let e = document.getElementById('enemy-container');
        let tx = document.getElementById('text-container');
        if(t === 'com') { e.classList.remove('hidden'); tx.classList.add('hidden'); }
        else { e.classList.add('hidden'); tx.classList.remove('hidden'); }
    },

    btn: (t, a, dis) => { 
        let b = document.getElementById('btn-act'); 
        b.innerText = t; 
        Conf.act = a; 
        b.disabled = dis; 
    },

    txt: (t, s) => { 
        document.getElementById('txt-1').innerText = t; 
        document.getElementById('txt-2').innerText = s; 
    },

    log: (m, type='info') => { 
        let c = type==='err' ? 'text-red-400' : (type==='loot' ? 'text-purple-400' : 'text-gray-400');
        let l = document.getElementById('logs'); 
        l.innerHTML = `<div><span class="${c}">> ${m}</span></div>` + l.innerHTML; 
    },

    fx: (t, c, id) => {
        let el = document.createElement('div'); 
        el.className = 'dmg'; 
        el.style.color = c; 
        el.innerText = t;
        let r = document.getElementById(id).getBoundingClientRect();
        el.style.left = (r.left + 20) + 'px'; 
        el.style.top = r.top + 'px';
        document.getElementById('particle-layer').appendChild(el); 
        setTimeout(() => el.remove(), 800);
    },

    toast: (m, t) => {
        let d = document.createElement('div'); 
        let c = t==='loot' ? 'border-purple-500' : (t==='err' ? 'border-red-500' : 'border-green-500');
        d.className = `toast ${c}`; 
        d.innerText = m;
        document.getElementById('toast-layer').appendChild(d); 
        setTimeout(() => d.remove(), 2500);
    },

    modal: (t) => {
        let l = document.getElementById('modal-layer');
        let c = document.getElementById('modal-content');
        l.classList.add('show');
        
        if(t === 'char') {
            c.innerHTML = `<h2 class="text-white text-2xl font-bold mb-4 font-tech">IDENTIFICATION</h2><div class="flex gap-2 justify-center">${DB.chars.map(x => `<button onclick="Core.pick('${x.id}')" class="text-5xl p-2 bg-slate-800 rounded hover:scale-110 border border-blue-500/50">${x.id}</button>`).join('')}</div>`;
        } 
        else if(t === 'shop') {
            c.innerHTML = `<h2 class="text-emerald-400 text-xl font-bold mb-2">RAVITAILLEMENT</h2><button onclick="Core.heal(R.max/2);document.getElementById('modal-layer').classList.remove('show');Core.auto()" class="w-full p-2 bg-slate-800 mb-2 border border-emerald-500 rounded text-emerald-400 font-bold">💊 Soin 50%</button>`;
        }
        else if(t === 'skill') {
            let k = Object.keys(DB.skills)[Math.floor(Math.random()*4)]; 
            let s = DB.skills[k];
            c.innerHTML = `<h2 class="text-yellow-400 text-xl font-bold mb-2">MODULE</h2><div class="text-4xl mb-2">${s.i}</div><div class="text-white mb-4 font-bold">${s.n}</div><button onclick="Core.addSkill('${k}')" class="bg-yellow-600 text-black px-4 py-2 rounded font-bold w-full hover:bg-yellow-500">INSTALLER</button>`;
        }
    },

    tab: (t) => { 
        document.getElementById('view-hub').classList.toggle('hidden', t !== 'hub'); 
    }
};
