let allGames = [];

async function fetchDodgersSchedule() {
    const currentYear = new Date().getFullYear();
    const url = `https://statsapi.mlb.com/api/v1/schedule?sportId=1&teamId=119&startDate=${currentYear}-01-01&endDate=${currentYear}-12-31&gameType=S,R,P&hydrate=game(promotions),linescore`;

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
        console.error("Error fetching schedule:", error);
    }
}

function renderGames(gamesToDisplay) {
    const list = document.getElementById('game-list');
    list.innerHTML = '';

    const gameTypes = { 'S': 'Spring', 'R': 'Regular', 'P': 'Postseason' };

    gamesToDisplay.forEach(game => {
        const gameDateObj = new Date(game.gameDate);
        const gameDate = gameDateObj.toLocaleDateString([], { month: 'short', day: 'numeric' });
        const gameTime = gameDateObj.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit', hour12: true });

        const isHome = game.teams.home.team.id === 119;
        const opponent = isHome ? game.teams.away.team.name : game.teams.home.team.name;
        
        const locationLabel = isHome 
            ? `<span style="color: #005A9C;">vs</span>` 
            : `<span style="color: #666;">@</span>`;

        // Score Logic
        let scoreDisplay = "TBD";
        if (game.status.abstractGameState !== "Preview") {
            const homeScore = game.teams.home.score ?? 0;
            const awayScore = game.teams.away.score ?? 0;
            scoreDisplay = `<span style="color:${isHome?'#005A9C':'#EF3E42'}">${homeScore}</span> - <span style="color:${!isHome?'#005A9C':'#EF3E42'}">${awayScore}</span>`;
        }

        // Promotions Logic
        let promoDisplay = "None";
        const promotions = game.promotions || game.teams.home.promotions || game.teams.away.promotions;
        if (promotions && promotions.length > 0) {
            promoDisplay = promotions.map(p => p.name || p.title).join(", ");
        }

        const li = document.createElement('li');
        li.className = "DodgerListItem list-group-item"; 
        li.innerHTML = `
            <span class="col-date">${gameDate}</span>
            <span class="col-game">${locationLabel} ${opponent}</span>
            <span class="col-score">${scoreDisplay}</span>
            <span class="col-time">${gameTime}</span>
            <span class="col-promo text-truncate" title="${promoDisplay}">🎁 ${promoDisplay}</span>
        `;
        list.appendChild(li);
    });
}

// Filter Logic
document.getElementById('month-filter').addEventListener('change', (e) => {
    const month = e.target.value;
    if (month === 'all') {
        renderGames(allGames);
    } else {
        const filtered = allGames.filter(game => new Date(game.gameDate).getMonth() == month);
        renderGames(filtered);
    }
});

// Init
fetchDodgersSchedule();
(function displayCurrentDate() {
    const dateElement = document.getElementById('current-date');
    if (dateElement) {
        dateElement.textContent = new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    }
})();
