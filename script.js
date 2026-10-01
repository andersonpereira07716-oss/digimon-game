// ==========================================
// 1. ESTADO DO JOGADOR E PARCEIRO DIGIMON
// ==========================================
const playerGame = {
    tamerName: "Tamer",
    bits: 500, // Moeda do jogo
    inventory: {
        potions: 3,
        meat: 2
    },
    digimon: {
        name: "Agumon",
        stage: "Rookie", // Rookie -> Champion -> Ultimate -> Mega
        level: 5,
        hp: 100,
        maxHp: 100,
        atk: 25,
        exp: 0,
        nextLevelExp: 100,
        element: "Fogo"
    }
};

// ==========================================
// 2. SISTEMA DE MAPA ESTILO DIGIMON WORLD 3
// ==========================================
const gameWorld = {
    currentRegion: "Asuka Server",
    currentLocation: "Central Park",
    locations: {
        "Central Park": {
            name: "Central Park (Cidade Inicial)",
            description: "Uma zona pacífica com o Terminal de Servidor e lojas.",
            connections: ["South Sector Outskirts", "Digimon Cemetery"],
            hasWildBattles: false,
            safeZone: true
        },
        "South Sector Outskirts": {
            name: "Arredores do Sector Sul",
            description: "Planícies verdes com Digimons selvagens à solta.",
            connections: ["Central Park", "Ether Jungle"],
            hasWildBattles: true,
            wildMonsters: [
                { name: "Goburimon", hp: 60, atk: 18, expReward: 40 },
                { name: "Kunemon", hp: 50, atk: 15, expReward: 35 }
            ],
            encounterRate: 0.5
        },
        "Ether Jungle": {
            name: "Selva Ether",
            description: "Floresta densa habitada por Digimons de tipo planta e inseto.",
            connections: ["South Sector Outskirts"],
            hasWildBattles: true,
            wildMonsters: [
                { name: "Palmon", hp: 80, atk: 20, expReward: 55 },
                { name: "Tentomon", hp: 85, atk: 22, expReward: 60 }
            ],
            encounterRate: 0.7
        },
        "Digimon Cemetery": {
            name: "Cemitério de Digimons",
            description: "Ruínas antigas cobertas de dados corrompidos.",
            connections: ["Central Park"],
            hasWildBattles: true,
            wildMonsters: [
                { name: "Bakemon", hp: 110, atk: 28, expReward: 80 }
            ],
            encounterRate: 0.6
        }
    },

    // Viajar para uma nova localização
    travelTo(destinationName) {
        const currentLoc = this.locations[this.currentLocation];
        
        if (currentLoc.connections.includes(destinationName)) {
            this.currentLocation = destinationName;
            const newLoc = this.locations[destinationName];
            
            console.log(`🗺️ Viajaste para: ${newLoc.name}`);
            console.log(`📖 ${newLoc.description}`);
            
            // Verificar encontros aleatórios de batalha
            if (newLoc.hasWildBattles && Math.random() < newLoc.encounterRate) {
                const wild = newLoc.wildMonsters[Math.floor(Math.random() * newLoc.wildMonsters.length)];
                startWildBattle(wild);
            }
            return true;
        } else {
            console.log("❌ Caminho bloqueado ou inacessível a partir daqui!");
            return false;
        }
    }
};

// ==========================================
// 3. SISTEMA DE DIGIEVOLUÇÃO
// ==========================================
function checkDigivolution() {
    const d = playerGame.digimon;

    // Linha evolutiva base para Rookie -> Champion (nível 10)
    if (d.stage === "Rookie" && d.level >= 10) {
        d.stage = "Champion";
        d.name = d.name === "Agumon" ? "Greymon" : "GeoGreymon";
        d.maxHp += 150;
        d.hp = d.maxHp; // Cura total ao evoluir
        d.atk += 30;
        console.log(`✨ INCRÍVEL! O teu Digimon digievoluiu para a fase Champion: ${d.name}!`);
        return true;
    }
    
    // Champion -> Ultimate (nível 25)
    if (d.stage === "Champion" && d.level >= 25) {
        d.stage = "Ultimate";
        d.name = d.name === "Greymon" ? "MetalGreymon" : "RizeGreymon";
        d.maxHp += 300;
        d.hp = d.maxHp;
        d.atk += 60;
        console.log(`🔥 DIGIEVOLUÇÃO ULTIMATE! O teu parceiro tornou-se um poderoso ${d.name}!`);
        return true;
    }
    
    return false;
}

// Função para adicionar EXP e gerir subidas de nível
function gainExp(amount) {
    const d = playerGame.digimon;
    d.exp += amount;
    console.gainedExp ? null : console.log(`⭐ Ganhaste ${amount} de EXP.`);

    if (d.exp >= d.nextLevelExp) {
        d.exp -= d.nextLevelExp;
        d.level++;
        d.nextLevelExp = Math.floor(d.nextLevelExp * 1.5);
        d.maxHp += 20;
        d.hp = d.maxHp;
        d.atk += 5;
        console.log(`🎉 PARABÉNS! O teu Digimon subiu para o Nível ${d.level}!`);
        
        // Tentar digievoluir após subir de nível
        checkDigivolution();
    }
}

// ==========================================
// 4. SISTEMA DE BATALHA E ITENS
// ==========================================
function startWildBattle(wildMonster) {
    console.log(`⚠️ Batalha iniciada contra ${wildMonster.name} selvagem!`);
    
    // Exemplo simplificado de resolução de turno em texto/lógica
    let playerDigi = playerGame.digimon;
    
    while (playerDigi.hp > 0 && wildMonster.hp > 0) {
        // Ataque do Jogador
        wildMonster.hp -= playerDigi.atk;
        console.log(`⚔️ Causaste ${playerDigi.atk} de dano ao ${wildMonster.name}. (HP restante dele: ${Math.max(0, wildMonster.hp)})`);
        
        if (wildMonster.hp <= 0) break;
        
        // Ataque do Inimigo
        playerDigi.hp -= wildMonster.atk;
        console.log(`💥 O ${wildMonster.name} atacou-te e causou ${wildMonster.atk} de dano. (Teu HP: ${Math.max(0, playerDigi.hp)})`);
    }

    if (playerDigi.hp > 0) {
        console.log(`🏆 Vitória! Derrotaste o ${wildMonster.name}.`);
        gainExp(wildMonster.expReward);
        playerGame.bits += 50; // Recompensa em Bits
    } else {
        console.log(`💀 O teu Digimon foi derrotado... Recuaste para o Central Park para recuperar.`);
        playerDigi.hp = playerDigi.maxHp / 2; // Recupera metade da vida
        gameWorld.currentLocation = "Central Park";
    }
}

// Usar item do inventário
function useItem(itemName) {
    if (itemName === 'potions' && playerGame.inventory.potions > 0) {
        playerGame.inventory.potions--;
        playerGame.digimon.hp = Math.min(playerGame.digimon.maxHp, playerGame.digimon.hp + 50);
        console.log(`🧪 Usaste uma Poção. HP atual do Digimon: ${playerGame.digimon.hp}/${playerGame.digimon.maxHp}`);
    } else {
        console.log("❌ Não tens esse item ou o inventário está vazio!");
    }
}
