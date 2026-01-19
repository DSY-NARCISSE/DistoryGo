/* --- MEMOIRE DU JEU (STATE) --- */
window.State = {
    // Données sauvegardées
    data: {
        gold: 0,
        perls: 50,
        level: 1,
        stats: { hp: 0, atk: 0, def: 0 },
        weapon: null,
        head: null,
        pet: null,
        inventory: [], // Liste des objets
        char: null     // Emoji du héros
    },

    // Données de la run actuelle
    run: {
        active: false,
        day: 0,
        hp: 100,
        maxHp: 100,
        atk: 10,
        def: 0,
        crit: 5,
        spd: 1,
        skills: [],
        shield: 0
    },

    // Combat et Config
    combat: { active: false, hp: 0, max: 0, atk: 0, boss: false },
    conf: { auto: false, speed: 1, tmr: null, action: null }
};
