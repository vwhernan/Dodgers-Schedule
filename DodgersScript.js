let allGames = []; // Global variable to store fetched games

async function fetchDodgersSchedule() {
    const now = new Date();
    const today = "2026-01-01"; 
    const yearEnd = "2026-12-31";
    const url = `https://statsapi.mlb.com/api/v1/schedule?sportId=1&teamId=119&startDate=${today}&endDate=${yearEnd}`;
    
    const headerElement = document.getElementById('current-date');
    if (headerElement) headerElement.innerText = now.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

    try {
        const response = await fetch(url);
        const data = await response.json();
        
        allGames = [];
        if (data.dates) {
            data.dates.forEach(date => {
                date.games.forEach(game => allGames.push(game));
            });
        }
        renderGames(allGames); 
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

        // 1. Create the specific blue label for 'Home'
        const locationLabel = isHome 
            ? `<span style="color: #2b82c0;">Home</span> vs` 
            : `Away @`;

        // 2. Re-added the missing score logic
        let scoreDisplay = "TBD";
        if (game.status.abstractGameState !== "Preview") {
            const homeScore = game.teams.home.score ?? 0;
            const awayScore = game.teams.away.score ?? 0;

            const homeSpan = `<span style="color: ${isHome ? '#005A9C' : '#EF3E42'};">${homeScore}</span>`;
            const awaySpan = `<span style="color: ${!isHome ? '#005A9C' : '#EF3E42'};">${awayScore}</span>`;
            
            scoreDisplay = `${homeSpan} - ${awaySpan}`;
        }

        // 3. Render the HTML
        const li = document.createElement('li');
        li.className = "DodgerListItem list-group-item d-flex justify-content-between align-items-center";
        li.innerHTML = `
            <span style="flex: 1; font-weight: bold;">${gameDate}</span>
            <span style="flex: 2; text-align: left; font-weight: bold;">${locationLabel} ${opponent}</span>
            <span style="flex: 1; text-align: center; font-weight: bold;">${scoreDisplay}</span>
            <span style="flex: 1; text-align: center; font-size: 0.85em;">${gameTime}</span>
        `;
        list.appendChild(li);
    });
}

// Event Listener for Filtering
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
