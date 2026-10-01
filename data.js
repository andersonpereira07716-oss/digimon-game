const GAME_DATA = {
    // Múltiplos parceiros iniciais para escolher
    partners: [
        {
            id: "agumon",
            name: "Agumon",
            sprite: "🦖",
            evos: [
                { level: 1, name: "Agumon", sprite: "🦖", hp: 100, atk: 22, def: 5, specialName: "Bafo de Pimenta" },
                { level: 2, name: "Greymon", sprite: "🦕", hp: 150, atk: 35, def: 10, specialName: "Chama Nova" },
                { level: 3, name: "MetalGreymon", sprite: "🦾", hp: 220, atk: 52, def: 16, specialName: "Giga Blaster" },
                { level: 4, name: "WarGreymon", sprite: "🛡️", hp: 300, atk: 75, def: 25, specialName: "Força de Gaia" }
            ]
        },
        {
            id: "gabumon",
            name: "Gabumon",
            sprite: "🐺",
            evos: [
                { level: 1, name: "Gabumon", sprite: "🐺", hp: 95, atk: 24, def: 4, specialName: "Fogo Azul" },
                { level: 2, name: "Garurumon", sprite: "🐕", hp: 140, atk: 38, def: 9, specialName: "Uivo Uivar" },
                { level: 3, name: "WereGarurumon", sprite: "🥊", hp: 210, atk: 55, def: 14, specialName: "Garra de Lobo" },
                { level: 4, name: "MetalGarurumon", sprite: "🤖", hp: 290, atk: 78, def: 22, specialName: "Míssil Cocytus" }
            ]
        },
        {
            id: "biyomon",
            name: "Biyomon",
            sprite: "🦅",
            evos: [
                { level: 1, name: "Biyomon", sprite: "🦅", hp: 90, atk: 25, def: 3, specialName: "Espiral Mágica" },
                { level: 2, name: "Birdramon", sprite: "🔥", hp: 130, atk: 40, def: 8, specialName: "Meteoro de Fogo" },
                { level: 3, name: "Garudamon", sprite: "🦉", hp: 200, atk: 58, def: 13, specialName: "Asa Sônica" },
                { level: 4, name: "Phoenixmon", sprite: "✨", hp: 280, atk: 80, def: 20, specialName: "Explosão Starlight" }
            ]
        }
    ],

    // Capítulos da 1ª Temporada e seus Chefes
    chapters: [
        {
            id: 1,
            title: "Ilha File",
            tag: "Capítulo 1",
            desc: "Você chegou à Ilha File. O primeiro grande obstáculo corrompido pelas Engrenagens Negras é o sádico mensageiro das trevas.",
            enemy: { name: "Devimon", sprite: "😈", hp: 120, maxHp: 120, atk: 18, def: 4 }
        },
        {
            id: 2,
            title: "Continente Server",
            tag: "Capítulo 2",
            desc: "Cruzando o oceano, o Continente Server apresenta ameaças implacáveis: o popstar tirano.",
            enemy: { name: "Etemon", sprite: "🐵", hp: 200, maxHp: 200, atk: 28, def: 8 }
        },
        {
            id: 3,
            title: "Noite em Server",
            tag: "Capítulo 3",
            desc: "A verdadeira face do terror surge sob o comando do lorde vampiro.",
            enemy: { name: "Myotismon", sprite: "🦇", hp: 280, maxHp: 280, atk: 38, def: 12 }
        },
        {
            id: 4,
            title: "Mundo Digital - Mestres das Trevas",
            tag: "Capítulo 4",
            desc: "Os Mestres das Trevas reescreveram o Mundo Digital. Enfrente o governante das profundezas.",
            enemy: { name: "MetalSeadramon", sprite: "🐉", hp: 380, maxHp: 380, atk: 48, def: 18 }
        },
        {
            id: 5,
            title: "A Fortaleza Mecânica",
            tag: "Capítulo 5",
            desc: "A cidade mecânica do exército de máquinas implacáveis.",
            enemy: { name: "Machinedramon", sprite: "🤖", hp: 480, maxHp: 480, atk: 58, def: 22 }
        },
        {
            id: 6,
            title: "O Mágico das Trevas",
            tag: "Capítulo 6",
            desc: "O labirinto do palhaço sombrio que desafia a coragem dos escolhidos.",
            enemy: { name: "Piedmon", sprite: "🃏", hp: 580, maxHp: 580, atk: 68, def: 28 }
        },
        {
            id: 7,
            title: "Capítulo Final: O Caos",
            tag: "Fim do Jogo",
            desc: "A entidade primordial do sofrimento de todos os Digimon se manifestou.",
            enemy: { name: "Apocalymon", sprite: "🌌", hp: 750, maxHp: 750, atk: 85, def: 35 }
        }
    ]
};
