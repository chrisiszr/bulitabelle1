// Simplified Bundesliga Table with Netlify Functions

document.addEventListener('DOMContentLoaded', function() {
    // DOM Elements
    const teamList = document.getElementById('teamList');
    const lastUpdateElement = document.getElementById('lastUpdate');
    const showDifferencesButton = document.getElementById('showDifferences');
    const refreshButton = document.getElementById('refreshData');
    
    let differencesVisible = false;
    let currentTeams = [];
    
    // Load Bundesliga data from Netlify function
    async function loadBundesligaData() {
        try {
            teamList.innerHTML = '<div class="loading">LADE DATEN...</div>';
            
            const response = await fetch('/api/bundesliga');
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const data = await response.json();
            populateList(data.standings[0].table);
            updateLastUpdate();
            
        } catch (error) {
            console.error('Error loading data:', error);
            loadDemoData();
        }
    }
    
    // Populate team list
    function populateList(teams) {
        teamList.innerHTML = '';
        currentTeams = teams;
        
        teams.forEach((team) => {
            const teamItem = document.createElement('div');
            teamItem.className = 'team-item';
            
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
        
        setupDifferenceButton();
    }
    
    // Update last update time
    function updateLastUpdate() {
        const now = new Date();
        const timeString = now.toLocaleTimeString('de-DE', {
            hour: '2-digit',
            minute: '2-digit'
        });
        lastUpdateElement.textContent = timeString;
    }
    
    // Demo data (simplified to 6 teams)
    function loadDemoData() {
        const demoTeams = [
            { position: 1, team: { name: 'Bayer 04 Leverkusen' }, points: 34, goalsFor: 25, goalsAgainst: 8 },
            { position: 2, team: { name: 'FC Bayern München' }, points: 28, goalsFor: 28, goalsAgainst: 12 },
            { position: 3, team: { name: 'VfB Stuttgart' }, points: 25, goalsFor: 22, goalsAgainst: 15 },
            { position: 4, team: { name: 'Borussia Dortmund' }, points: 20, goalsFor: 20, goalsAgainst: 18 },
            { position: 5, team: { name: 'RB Leipzig' }, points: 15, goalsFor: 19, goalsAgainst: 16 },
            { position: 6, team: { name: 'Eintracht Frankfurt' }, points: 12, goalsFor: 18, goalsAgainst: 17 }
        ];
        
        populateList(demoTeams);
        updateLastUpdate();
    }
    
    // Setup difference button
    function setupDifferenceButton() {
        if (showDifferencesButton) {
            showDifferencesButton.onclick = function() {
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
    
    // Show point differences with footballs
    function showDifferences() {
        if (currentTeams.length === 0) return;
        
        hideDifferences();
        
        const teamItems = teamList.querySelectorAll('.team-item');
        
        for (let i = 0; i < currentTeams.length - 1; i++) {
            const currentTeam = currentTeams[i];
            const nextTeam = currentTeams[i + 1];
            const pointDifference = currentTeam.points - nextTeam.points;
            
            if (pointDifference > 0) {
                const footballItem = document.createElement('div');
                footballItem.className = 'football-item';
                
                let footballs = '';
                for (let j = 0; j < pointDifference && j < 10; j++) {
                    footballs += '⚽ ';
                }
                
                footballItem.textContent = footballs.trim();
                teamItems[i].insertAdjacentElement('afterend', footballItem);
            }
        }
        
        differencesVisible = true;
    }
    
    // Hide point differences
    function hideDifferences() {
        const footballItems = teamList.querySelectorAll('.football-item');
        footballItems.forEach(item => item.remove());
        differencesVisible = false;
    }
    
    // Setup refresh button
    if (refreshButton) {
        refreshButton.onclick = function() {
            loadBundesligaData();
        };
    }
    
    // Initial load
    loadBundesligaData();
});