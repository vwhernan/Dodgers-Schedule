let allGames = []; // Global variable to store fetched games

async function fetchDodgersSchedule() {
    const now = new Date();
    const today = "2026-01-01";//now.toISOString().split('T')[0];
    const yearEnd = "2026-12-31";
    const url = `https://statsapi.mlb.com/api/v1/schedule?sportId=1&teamId=119&startDate=${today}&endDate=${yearEnd}`;
    
    // Update Header Date
    const headerElement = document.getElementById('current-date');
    if (headerElement) headerElement.innerText = now.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

    try {
        const response = await fetch(url);
        const data = await response.json();
        
        // Flatten the API data into a single array of game objects
        allGames = [];
        if (data.dates) {
            data.dates.forEach(date => {
                date.games.forEach(game => allGames.push(game));
            });
        }

        renderGames(allGames); // Initial render
    } catch (error) {
        console.error("Error:", error);
    }
}

function renderGames(gamesToDisplay) {
    const list = document.getElementById('game-list');
    list.innerHTML = '';

    if (gamesToDisplay.length === 0) {
        list.innerHTML = '<li class="DodgerListItem">No games found for this month.</li>';
        return;
    }

    gamesToDisplay.forEach(game => {
        const gameDateObj = new Date(game.gameDate);
        const gameDate = gameDateObj.toLocaleDateString([], { month: 'short', day: 'numeric' });
        const gameTime = gameDateObj.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit', hour12: true });

        const isHome = game.teams.home.team.id === 119;
        const opponent = isHome ? game.teams.away.team.name : game.teams.home.team.name;
        
        const homeScore = game.teams.home.score !== undefined ? game.teams.home.score : "";
        const awayScore = game.teams.away.score !== undefined ? game.teams.away.score : "";
        let scoreDisplay = game.status.abstractGameState !== "Preview" ? 
            (isHome ? `${homeScore} - ${awayScore}` : `${awayScore} - ${homeScore}`) : "TBD";

        const li = document.createElement('li');
        li.className = "DodgerListItem list-group-item d-flex justify-content-between align-items-center";
        li.innerHTML = `
            <span style="flex: 1; font-weight: bold;">${gameDate}</span>
            <span style="flex: 2; text-align: left;">${isHome ? 'vs' : '@'} ${opponent}</span>
            <span style="flex: 1; text-align: center; color: #005A9C; font-weight: bold;">D: ${scoreDisplay} :O </span>
            <span style="flex: 1; text-align: center; font-size: 0.85em;">${gameTime}</span>
        `;
        list.appendChild(li);
    });
}

// Listen for dropdown changes
document.getElementById('month-filter').addEventListener('change', (e) => {
    const selectedMonth = e.target.value;
    
    if (selectedMonth === "all") {
        renderGames(allGames);
    } else {
        const filtered = allGames.filter(game => {
            const gameMonth = new Date(game.gameDate).getMonth();
            return gameMonth.toString() === selectedMonth;
        });
        renderGames(filtered);
    }
});


fetchDodgersSchedule();



