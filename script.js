// Ultra-Minimalistisches Bundesliga Tabelle mit API-Integration

document.addEventListener('DOMContentLoaded', function() {
    console.log('Bundesliga Tabelle wird geladen...');
    
    // API-Konfiguration
    const API_TOKEN = '160d68490fbb4f528465c7bd4a303b85';
    const API_BASE_URL = 'https://api.football-data.org/v4';
    
    // Proxy-URLs für CORS-Umgehung
    const PROXY_URLS = [
        'https://api.allorigins.win/raw?url=',
        'https://corsproxy.io/?',
        'https://thingproxy.freeboard.io/fetch/'
    ];
    
    // Bundesliga-Saison-ID (2023/24)
    const BUNDESLIGA_ID = 'BL1';
    
    // DOM-Elemente
    const teamList = document.getElementById('teamList');
    const lastUpdateElement = document.getElementById('lastUpdate');
    const showDifferencesButton = document.getElementById('showDifferences');
    
    let differencesVisible = false;
    let currentTeams = [];
    
    // Funktion zum Laden der Bundesliga-Daten mit mehreren Proxy-Versuchen
    async function loadBundesligaData() {
        console.log('Versuche Bundesliga-Daten zu laden...');
        
        for (let i = 0; i < PROXY_URLS.length; i++) {
            try {
                const proxyUrl = PROXY_URLS[i];
                const apiUrl = `${API_BASE_URL}/competitions/${BUNDESLIGA_ID}/standings`;
                const fullUrl = `${proxyUrl}${encodeURIComponent(apiUrl)}`;
                
                console.log(`Versuche Proxy ${i + 1}: ${proxyUrl}`);
                
                const response = await fetch(fullUrl, {
                    headers: {
                        'X-Auth-Token': API_TOKEN
                    }
                });
                
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                
                const data = await response.json();
                console.log('API-Daten erfolgreich geladen:', data);
                
                // Liste mit API-Daten füllen
                populateList(data.standings[0].table);
                
                // Letzte Aktualisierung anzeigen
                updateLastUpdate();
                
                // Erfolgsmeldung
                showSuccessMessage('Proxy API');
                return;
                
            } catch (error) {
                console.error(`Proxy ${i + 1} fehlgeschlagen:`, error);
                if (i === PROXY_URLS.length - 1) {
                    console.log('Alle Proxies fehlgeschlagen, verwende Demo-Daten');
                    loadDemoData();
                }
            }
        }
    }
    
    // Funktion zum Füllen der Liste
    function populateList(teams) {
        teamList.innerHTML = '';
        currentTeams = teams; // Speichere Teams für Fußball-Visualisierung
        
        teams.forEach((team, index) => {
            const teamItem = document.createElement('div');
            teamItem.className = 'team-item';
            
            // Torverhältnis berechnen
            const goalDifference = team.goalsFor - team.goalsAgainst;
            const goalDiffString = goalDifference >= 0 ? `+${goalDifference}` : `${goalDifference}`;
            
            teamItem.innerHTML = `
                <span class="team-position">${team.position}.</span>
                <span class="team-name">${team.team.name}</span>
                <span class="team-points">${team.points}</span>
                <span class="team-goals">${goalDiffString}</span>
            `;
            
            teamList.appendChild(teamItem);
        });
        
        console.log(`${teams.length} Teams in Liste geladen`);
        
        // Button-Event-Handler hinzufügen
        setupDifferenceButton();
    }
    
    // Funktion zum Anzeigen von Fehlern
    function showError(message) {
        teamList.innerHTML = `
            <div class="loading" style="color: #cc0000;">
                FEHLER: ${message}
            </div>
        `;
    }
    
    // Funktion zum Anzeigen der CORS-Warnung
    function showCorsWarning() {
        const footer = document.querySelector('footer');
        const warningDiv = document.createElement('div');
        warningDiv.style.cssText = `
            background-color: #FFF8DC;
            border: 2px solid #FFD700;
            padding: 10px;
            margin: 10px 0;
            font-size: 12px;
            color: #B8860B;
            text-align: center;
        `;
        warningDiv.innerHTML = `
            <strong>CORS-WARNUNG:</strong> API-Daten können nicht direkt geladen werden.<br>
            Demo-Daten werden angezeigt. Für Live-Daten einen lokalen Server verwenden.
        `;
        footer.parentNode.insertBefore(warningDiv, footer);
    }
    
    // Funktion zum Anzeigen der Erfolgsmeldung
    function showSuccessMessage(method = 'API') {
        const footer = document.querySelector('footer');
        const successDiv = document.createElement('div');
        successDiv.style.cssText = `
            background-color: #F0FFF0;
            border: 2px solid #32CD32;
            padding: 10px;
            margin: 10px 0;
            font-size: 12px;
            color: #006400;
            text-align: center;
        `;
        successDiv.innerHTML = `
            <strong>✓ ERFOLG:</strong> Live-Bundesliga-Daten erfolgreich geladen!<br>
            <small>Methode: ${method}</small>
        `;
        footer.parentNode.insertBefore(successDiv, footer);
    }
    
    // Funktion zum Aktualisieren der letzten Update-Zeit
    function updateLastUpdate() {
        const now = new Date();
        const timeString = now.toLocaleTimeString('de-DE', {
            hour: '2-digit',
            minute: '2-digit'
        });
        lastUpdateElement.textContent = timeString;
    }
    
    // Demo-Daten für den Fall, dass keine API verfügbar ist
    function loadDemoData() {
        console.log('Lade Demo-Daten...');
        
        // Demo-Daten in API-Struktur mit größeren Punktabständen
        const demoTeams = [
            { position: 1, team: { name: 'Bayer 04 Leverkusen' }, playedGames: 12, points: 34, goalsFor: 25, goalsAgainst: 8 },
            { position: 2, team: { name: 'FC Bayern München' }, playedGames: 12, points: 28, goalsFor: 28, goalsAgainst: 12 }, // 6 points diff
            { position: 3, team: { name: 'VfB Stuttgart' }, playedGames: 12, points: 25, goalsFor: 22, goalsAgainst: 15 }, // 3 points diff
            { position: 4, team: { name: 'Borussia Dortmund' }, playedGames: 12, points: 20, goalsFor: 20, goalsAgainst: 18 }, // 5 points diff
            { position: 5, team: { name: 'RB Leipzig' }, playedGames: 12, points: 15, goalsFor: 19, goalsAgainst: 16 }, // 5 points diff
            { position: 6, team: { name: 'Eintracht Frankfurt' }, playedGames: 12, points: 12, goalsFor: 18, goalsAgainst: 17 }, // 3 points diff
            { position: 7, team: { name: 'SC Freiburg' }, playedGames: 12, points: 10, goalsFor: 16, goalsAgainst: 19 }, // 2 points diff
            { position: 8, team: { name: 'TSG Hoffenheim' }, playedGames: 12, points: 8, goalsFor: 15, goalsAgainst: 20 }, // 2 points diff
            { position: 9, team: { name: '1. FC Union Berlin' }, playedGames: 12, points: 6, goalsFor: 14, goalsAgainst: 21 }, // 2 points diff
            { position: 10, team: { name: 'Borussia Mönchengladbach' }, playedGames: 12, points: 4, goalsFor: 13, goalsAgainst: 22 },
            { position: 11, team: { name: 'VfL Wolfsburg' }, playedGames: 12, points: 2, goalsFor: 12, goalsAgainst: 23 },
            { position: 12, team: { name: 'SV Werder Bremen' }, playedGames: 12, points: 1, goalsFor: 11, goalsAgainst: 24 },
            { position: 13, team: { name: '1. FC Köln' }, playedGames: 12, points: 0, goalsFor: 10, goalsAgainst: 25 },
            { position: 14, team: { name: 'FC Augsburg' }, playedGames: 12, points: 0, goalsFor: 9, goalsAgainst: 26 },
            { position: 15, team: { name: 'VfL Bochum' }, playedGames: 12, points: 0, goalsFor: 8, goalsAgainst: 27 },
            { position: 16, team: { name: '1. FSV Mainz 05' }, playedGames: 12, points: 0, goalsFor: 7, goalsAgainst: 28 },
            { position: 17, team: { name: 'SV Darmstadt 98' }, playedGames: 12, points: 0, goalsFor: 6, goalsAgainst: 29 },
            { position: 18, team: { name: '1. FC Heidenheim' }, playedGames: 12, points: 0, goalsFor: 5, goalsAgainst: 30 }
        ];
        
        // Verwende die gleiche populateList-Funktion wie die API
        populateList(demoTeams);
        
        updateLastUpdate();
        console.log('Demo-Daten geladen');
    }
    
    // ===== FUSSBALL-VISUALISIERUNG =====
    
    // Button-Event-Handler einrichten
    function setupDifferenceButton() {
        if (showDifferencesButton) {
            showDifferencesButton.onclick = function(e) {
                e.preventDefault();
                e.stopPropagation();
                
                if (!differencesVisible) {
                    showDifferences();
                    showDifferencesButton.textContent = 'PUNKTABSTÄNDE AUSBLENDEN';
                    showDifferencesButton.classList.add('active');
                } else {
                    hideDifferences();
                    showDifferencesButton.textContent = 'PUNKTABSTÄNDE ANZEIGEN';
                    showDifferencesButton.classList.remove('active');
                }
            };
        }
    }
    
    // Fußbälle anzeigen
    function showDifferences() {
        console.log('showDifferences aufgerufen');
        console.log('currentTeams.length:', currentTeams.length);
        
        if (currentTeams.length === 0) {
            console.error('KEINE TEAMS GEFUNDEN! currentTeams ist leer!');
            return;
        }
        
        // Entferne bestehende Fußball-Elemente
        hideDifferences();
        
        console.log('Zeige Punktabstände für Teams:', currentTeams.length);
        
        // Sammle alle Fußball-Elemente, die eingefügt werden sollen
        const footballItemsToInsert = [];
        
        // Berechne Punktabstände zwischen benachbarten Teams
        for (let i = 0; i < currentTeams.length - 1; i++) {
            const currentTeam = currentTeams[i];
            const nextTeam = currentTeams[i + 1];
            const pointDifference = currentTeam.points - nextTeam.points;
            
            console.log(`Team ${i+1} (${currentTeam.team.name}): ${currentTeam.points} Punkte`);
            console.log(`Team ${i+2} (${nextTeam.team.name}): ${nextTeam.points} Punkte`);
            console.log(`Punktabstand: ${pointDifference}`);
            
            if (pointDifference > 0) {
                const footballItem = document.createElement('div');
                footballItem.className = 'football-item horizontal';
                
                // Erstelle Fußbälle
                let footballs = '';
                for (let j = 0; j < pointDifference && j < 20; j++) { // Max 20 Bälle
                    footballs += '⚽ ';
                }
                
                footballItem.textContent = footballs.trim();
                
                footballItemsToInsert.push({
                    item: footballItem,
                    insertAfterIndex: i
                });
            }
        }
        
        // Füge Fußball-Elemente in umgekehrter Reihenfolge ein
        for (let i = footballItemsToInsert.length - 1; i >= 0; i--) {
            const { item, insertAfterIndex } = footballItemsToInsert[i];
            const teamItems = teamList.querySelectorAll('.team-item');
            const targetItem = teamItems[insertAfterIndex];
            
            if (targetItem) {
                targetItem.insertAdjacentElement('afterend', item);
            }
        }
        
        differencesVisible = true;
        console.log(`${footballItemsToInsert.length} Fußball-Elemente eingefügt`);
    }
    
    // Fußbälle ausblenden
    function hideDifferences() {
        const footballItems = teamList.querySelectorAll('.football-item');
        footballItems.forEach(item => item.remove());
        differencesVisible = false;
        console.log('Fußball-Elemente entfernt');
    }
    
    // ===== INITIALISIERUNG =====
    
    // LIVE-MODUS: Lade echte Bundesliga-Daten
    console.log('LIVE-MODUS: Lade Bundesliga-Daten von der API...');
    
    setTimeout(() => {
        console.log('Versuche API-Daten zu laden...');
        loadBundesligaData();
    }, 1000);
    
    // Auto-Refresh alle 5 Minuten (nur wenn API funktioniert)
    setInterval(() => {
        loadBundesligaData();
    }, 300000); // 5 Minuten
    
    // FALLBACK: Demo-Daten als Backup
    // loadDemoData();
});