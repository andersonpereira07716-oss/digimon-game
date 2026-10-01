const GAME_DATA = {
    partners: [
        {
            id: "agumon", name: "Agumon", sprite: "🦖", element: "fire",
            evos: [
                { level: 1, name: "Agumon", sprite: "🦖", hp: 100, atk: 22, def: 5, specialName: "Bafo de Pimenta" },
                { level: 2, name: "Greymon", sprite: "🦕", hp: 150, atk: 35, def: 10, specialName: "Chama Nova" },
                { level: 3, name: "MetalGreymon", sprite: "🦾", hp: 220, atk: 52, def: 16, specialName: "Giga Blaster" },
                { level: 4, name: "WarGreymon", sprite: "🛡️", hp: 300, atk: 75, def: 25, specialName: "Força de Gaia" }
            ]
        },
        {
            id: "gabumon", name: "Gabumon", sprite: "🐺", element: "ice",
            evos: [
                { level: 1, name: "Gabumon", sprite: "🐺", hp: 95, atk: 24, def: 4, specialName: "Fogo Azul" },
                { level: 2, name: "Garurumon", sprite: "🐕", hp: 140, atk: 38, def: 9, specialName: "Uivo Uivar" },
                { level: 3, name: "WereGarurumon", sprite: "🥊", hp: 210, atk: 55, def: 14, specialName: "Garra de Lobo" },
                { level: 4, name: "MetalGarurumon", sprite: "🤖", hp: 290, atk: 78, def: 22, specialName: "Míssil Cocytus" }
            ]
        },
        {
            id: "biyomon", name: "Biyomon", sprite: "🦅", element: "wind",
            evos: [
                { level: 1, name: "Biyomon", sprite: "🦅", hp: 90, atk: 25, def: 3, specialName: "Espiral Mágica" },
                { level: 2, name: "Birdramon", sprite: "🔥", hp: 130, atk: 40, def: 8, specialName: "Meteoro de Fogo" },
                { level: 3, name: "Garudamon", sprite: "🦉", hp: 200, atk: 58, def: 13, specialName: "Asa Sônica" },
                { level: 4, name: "Phoenixmon", sprite: "✨", hp: 280, atk: 80, def: 20, specialName: "Explosão Starlight" }
            ]
        }
    ],
    chapters: [
        { id: 1, title: "Ilha File", tag: "Capítulo 1", desc: "Devimon corrompe a ilha.", weather: "Calor Extremo", enemy: { name: "Devimon", sprite: "😈", element: "dark", hp: 120, maxHp: 120, atk: 18, def: 4, expReward: 50, goldReward: 40 } },
        { id: 2, title: "Continente Server", tag: "Capítulo 2", desc: "O popstar tirano.", weather: "Tempestade de Dados", enemy: { name: "Etemon", sprite: "🐵", element: "dark", hp: 200, maxHp: 200, atk: 28, def: 8, expReward: 90, goldReward: 75 } },
        { id: 3, title: "Noite em Server", tag: "Capítulo 3", desc: "O lorde vampiro.", weather: "Neblina Sombria", enemy: { name: "Myotismon", sprite: "🦇", element: "dark", hp: 280, maxHp: 280, atk: 38, def: 12, expReward: 140, goldReward: 110 } },
        { id: 4, title: "Mestres das Trevas", tag: "Capítulo 4", desc: "Governante das profundezas.", weather: "Mar Profundo", enemy: { name: "MetalSeadramon", sprite: "🐉", element: "dark", hp: 380, maxHp: 380, atk: 48, def: 18, expReward: 200, goldReward: 160 } },
        { id: 5, title: "Fortaleza Mecânica", tag: "Capítulo 5", desc: "Exército de máquinas.", weather: "Campo Eletromagnético", enemy: { name: "Machinedramon", sprite: "🤖", element: "dark", hp: 480, maxHp: 480, atk: 58, def: 22, expReward: 280, goldReward: 220 } },
        { id: 6, title: "Mágico das Trevas", tag: "Capítulo 6", desc: "Palhaço sombrio.", weather: "Ilusão Digital", enemy: { name: "Piedmon", sprite: "🃏", element: "dark", hp: 580, maxHp: 580, atk: 68, def: 28, expReward: 380, goldReward: 300 } },
        { id: 7, title: "Capítulo Final: O Caos", tag: "Fim do Jogo", desc: "A entidade primordial.", weather: "Apocalipse Digital", enemy: { name: "Apocalymon", sprite: "🌌", element: "dark", hp: 750, maxHp: 750, atk: 85, def: 35, expReward: 550, goldReward: 450 } }
    ],
    equipmentList: [
        { id: 'ring_fire', name: 'Anel de Fogo', type: 'atk', val: 8, cost: 70, desc: '+8 de Ataque' },
        { id: 'vest_steel', name: 'Colete de Aço', type: 'def', val: 5, cost: 60, desc: '+5 de Defesa' },
        { id: 'amulet_luck', name: 'Amuleto da Sorte', type: 'gold', val: 15, cost: 90, desc: '+15 Bits por vitória' }
    ],
    questsDef: [
        { id: 'q1', name: 'Guerreiro Ativo', desc: 'Vence 2 combates.', target: 2, rewardGold: 50 },
        { id: 'q2', name: 'Estudioso do Dojo', desc: 'Completa 1 treino no Dojo.', target: 1, rewardGold: 40 }
    ]
};
