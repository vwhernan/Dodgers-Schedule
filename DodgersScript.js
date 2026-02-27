let allGames = [];

async function fetchDodgersSchedule() {
    const currentYear = new Date().getFullYear();
    const startDate = `${currentYear}-01-01`;
    const endDate = `${currentYear}-12-31`;
    
    const url = `https://statsapi.mlb.com/api/v1/schedule?sportId=1&teamId=119&startDate=${startDate}&endDate=${endDate}&gameType=S,R,P&hydrate=game(promotions),linescore`;

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

function displayCurrentDate() {
    const dateElement = document.getElementById('current-date');
    if (dateElement) {
        const options = { month: 'short', day: 'numeric', year: 'numeric' };
        const today = new Date().toLocaleDateString('en-US', options);
        dateElement.textContent = today;
    }
}

function renderGames(gamesToDisplay) {
    const list = document.getElementById('game-list');
    list.innerHTML = '';

    const gameTypes = { 'S': 'Spring', 'R': 'Regular', 'P': 'Postseason' };

    // Add a check for empty results
    if (gamesToDisplay.length === 0) {
        list.innerHTML = '<li class="list-group-item text-center">No games found for this month.</li>';
        return;
    }

    gamesToDisplay.forEach(game => {
        const gameDateObj = new Date(game.gameDate);
        const gameDate = gameDateObj.toLocaleDateString([], { month: 'short', day: 'numeric' });
        const gameTime = gameDateObj.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit', hour12: true });

        const isHome = game.teams.home.team.id === 119;
        const opponent = isHome ? game.teams.away.team.name : game.teams.home.team.name;
        const typeLabel = gameTypes[game.gameType] || game.gameType;

        const locationLabel = isHome ? `<span style="color: #2b82c0;">Home</span> vs` : `Away @`;

        let scoreDisplay = "TBD";
        if (game.status.abstractGameState !== "Preview") {
            const homeScore = game.teams.home.score ?? 0;
            const awayScore = game.teams.away.score ?? 0;
            const homeSpan = `<span style="color: ${isHome ? '#005A9C' : '#EF3E42'};">${homeScore}</span>`;
            const awaySpan = `<span style="color: ${!isHome ? '#005A9C' : '#EF3E42'};">${awayScore}</span>`;
            scoreDisplay = `${homeSpan} - ${awaySpan}`;
        }

        let promoDisplay = `<span>None</span>`;
        const promotions = game.promotions || (game.teams.home.promotions) || (game.teams.away.promotions);
        if (promotions && promotions.length > 0) {
            promoDisplay = promotions.map(p => `${p.name || p.title}`).join(", ");
        }

        const li = document.createElement('li');
        li.className = "DodgerListItem list-group-item schedule-grid"; 
        li.innerHTML = `
            <span class="col-date" style="font-weight: bold;">${gameDate}</span>
            <span class="col-game" style="font-weight: bold;">${locationLabel} ${opponent} <small style="font-weight: normal; color: #888;"><br>(${typeLabel})</small></span>
            <span class="col-score" style="font-weight: bold;">${scoreDisplay}</span>
            <span class="col-time">${gameTime}</span>
            <span class="col-promo" style="font-size: 0.8em; color:#005A9C;">&#9918; ${promoDisplay}</span>
        `;
        list.appendChild(li);
    });
}


document.getElementById('month-filter').addEventListener('change', function(e) {
    const selectedMonth = e.target.value;

    if (selectedMonth === "all") {
        renderGames(allGames);
    } else {
        const filteredGames = allGames.filter(game => {
            const gameDate = new Date(game.gameDate);
            return gameDate.getMonth() === parseInt(selectedMonth);
        });
        renderGames(filteredGames);
    }
});

// Initialize
fetchDodgersSchedule();
displayCurrentDate();
