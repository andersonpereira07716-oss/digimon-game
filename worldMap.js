// Definição dos mapas e rotas inspirados no Digimon World 3
const gameWorld = {
    currentRegion: "Asuka Server",
    currentLocation: "Central Park",
    locations: {
        "Central Park": {
            name: "Central Park (Cidade Inicial)",
            description: "Uma zona pacífica onde os Tamers iniciam a sua jornada.",
            connections: ["South Sector Outskirts", "Digimon Cemetery"],
            hasWildBattles: false,
            safeZone: true
        },
        "South Sector Outskirts": {
            name: "Arredores do Sector Sul",
            description: "Planícies verdes onde habitam Digimons de nível Rookie selvagens.",
            connections: ["Central Park", "Ether Jungle"],
            hasWildBattles: true,
            wildMonsters: ["Agumon", "Gabumon", "Patamon"],
            encounterRate: 0.4
        },
        "Ether Jungle": {
            name: "Selva Ether",
            description: "Uma floresta densa e misteriosa com árvores gigantescas.",
            connections: ["South Sector Outskirts", "Server Terminal"],
            hasWildBattles: true,
            wildMonsters: ["Palmon", "Kunemon", "Tentomon"],
            encounterRate: 0.6
        },
        "Digimon Cemetery": {
            name: "Cemitério de Digimons",
            description: "Uma zona sombria com ruínas antigas e dados corrompidos.",
            connections: ["Central Park"],
            hasWildBattles: true,
            wildMonsters: ["Bakemon", "DemiDevimon"],
            encounterRate: 0.5
        },
        "Server Terminal": {
            name: "Terminal do Servidor",
            description: "Ponto de ligação digital para viajar entre regiões e curar o teu parceiro.",
            connections: ["Ether Jungle"],
            hasWildBattles: false,
            safeZone: true
        }
    },

    // Função para viajar entre locais
    travelTo(destinationName) {
        const currentLocationData = this.locations[this.currentLocation];
        
        if (currentLocationData.connections.includes(destinationName)) {
            this.currentLocation = destinationName;
            const newLocation = this.locations[destinationName];
            console.log(`Viajaste para: ${newLocation.name}`);
            console.log(newLocation.description);
            
            // Verificar se há encontros selvagens ao entrar na área
            if (newLocation.hasWildBattles && Math.random() < newLocation.encounterRate) {
                this.triggerWildBattle(newLocation.wildMonsters);
            }
            return true;
        } else {
            console.log("Não podes ir diretamente para esse local a partir daqui!");
            return false;
        }
    },

    // Gatilho de batalha ao explorar
    triggerWildBattle(monstersList) {
        const randomMonster = monstersList[Math.floor(Math.random() * monstersList.length)];
        console.log(`⚠️ Um Digimon selvagem apareceu: ${randomMonster}! A preparar combate...`);
        // Aqui podes ligar a tua função existente de combate por turnos do jogo
    }
};

// Exemplo de como usarias no jogo:
// gameWorld.travelTo("South Sector Outskirts");
