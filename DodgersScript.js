
// Global array to store all game data so it can be accessed by filters later
let allGames = [];


// Main function to fetch the Dodgers schedule from the MLB API

async function fetchDodgersSchedule() {
    
    // Determine the current year and set the date range for the full season
    const currentYear = new Date().getFullYear();
    const startDate = `${currentYear}-01-01`;
    const endDate = `${currentYear}-12-31`;
    
    // MLB API URL: fetches games for team 119 (Dodgers), includes Spring (S), Regular (R), and Postseason (P)
    // "hydrate" adds extra details like promotions and live scores to the response
    const url = `https://statsapi.mlb.com/api/v1/schedule?sportId=1&teamId=119&startDate=${startDate}&endDate=${endDate}&gameType=S,R,P&hydrate=game(promotions),linescore`;

    try {
        const response = await fetch(url); // Send the network request
        const data = await response.json(); // Parse the response as JSON
        
        allGames = []; // Reset the global array before filling it
        if (data.dates) {
            // The API returns data grouped by date; we flatten it into a single list of games
            data.dates.forEach(date => {
                date.games.forEach(game => allGames.push(game));
            });
        }

        // Run the sub-functions to update the UI with the fresh data
        calculateAndDisplayRecord(allGames);    // Update W-L record
        const featured = getNextGame(allGames); // Find the closest upcoming game
        renderFeaturedGame(featured);           // Show that game in the header
        renderGames(allGames);                  // Show the full list below
        
    } catch (error) {
        // Basic error handling for network issues
        console.error("Error fetching schedule:", error);
    }
}


 // Logic to find the "Next Game" to display as the featured highlight
 
function getNextGame(games) {
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Normalize time to midnight for accurate day comparison

    // Find the first game in the array where the date is today or in the future
    const next = games.find(game => new Date(game.gameDate) >= today);
    
    // If no future games found (end of season), return the very last game played
    return next || games[games.length - 1]; 
}


 // Updates an element with a formatted version of today's date
 
function displayCurrentDate() {
    const dateElement = document.getElementById('current-date');
    if (dateElement) {
        const options = { month: 'short', day: 'numeric', year: 'numeric' };
        const today = new Date().toLocaleDateString('en-US', options);
        dateElement.textContent = today;
    }
}


 //Populates the large "Featured Game" section (usually at the top)
function renderFeaturedGame(game) {
    // If there is no Game Then dont update the current game in the header (mainly for when the season ends, and to let the game that occured that day remain until midnight)
    if (!game) return;

    //Convert Game Date into correct format
    const gameDateObj = new Date(game.gameDate);
    
    // Check if Dodgers (ID 119) are the home team 
    const isHome = game.teams.home.team.id === 119;

    // Determine the opponent name
    const opponent = isHome ? game.teams.away.team.name : game.teams.home.team.name;
    
    // Fill in the basic text fields for the featured game
    document.getElementById('curr-date').textContent = gameDateObj.toLocaleDateString([], { month: 'short', day: 'numeric' });
    document.getElementById('curr-game').innerHTML = `<strong>${isHome ? 'Home vs' : 'Away @'}</strong> ${opponent}`;
    document.getElementById('curr-time').textContent = gameDateObj.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });

    let scoreDisplay = "--"; 
    
    // Logic to handle live/finished games vs. upcoming games
    const state = game.status.abstractGameState;
    if (state === "Live" || state === "Final") {
        const homeScore = game.teams.home.score ?? 0;
        const awayScore = game.teams.away.score ?? 0;
        
        // Apply color coding (Dodger Blue vs generic Red for opponents)
        const homeSpan = `<span style="color: ${isHome ? '#005A9C' : '#EF3E42'};">${homeScore}</span>`;
        const awaySpan = `<span style="color: ${!isHome ? '#005A9C' : '#EF3E42'};">${awayScore}</span>`;
        
        scoreDisplay = `${homeSpan} - ${awaySpan}`;
    } else {
        scoreDisplay = "TBD"; // Game hasn't started
    }

    document.getElementById('curr-score').innerHTML = scoreDisplay;

    // Check for promotional giveaways (Bobbleheads, hats, etc.)
    const promotions = game.promotions || (game.teams.home.promotions) || [];
    document.getElementById('curr-promo').textContent = promotions.length > 0 ? promotions[0].name : "None";
}


//Builds the full scrollable list of games
function renderGames(gamesToDisplay) {
    const list = document.getElementById('game-list');
    list.innerHTML = ''; // Clear existing list items

    const gameTypes = { 'S': 'Spring', 'R': 'Regular', 'P': 'Postseason' };

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
        let resultLabel = ""; 

        let scoreDisplay = "TBD";
        // If the game is NOT in 'Preview' (meaning it's live or finished)
        if (game.status.abstractGameState !== "Preview") {
            const homeScore = game.teams.home.score ?? 0;
            const awayScore = game.teams.away.score ?? 0;

            const dodgersScore = isHome ? homeScore : awayScore;
            const opponentScore = isHome ? awayScore : homeScore;

            // Determine if the result was a Win or Loss for the Dodgers
            if (game.status.abstractGameState === "Final") {
                if (dodgersScore > opponentScore) {
                    resultLabel = `<span style="font-weight: bold; color: #000000;">W</span>`;
                } else if (dodgersScore < opponentScore) {
                    resultLabel = `<span style="font-weight: bold; color: #000000;">L</span>`;
                }
            }

        //Give the home team score a color (blue for dodgers red for away team)  This can be change to any color depending on the team, for example if the home team was Athletics then make home team color green)
            const homeSpan = `<span style="color: ${isHome ? '#005A9C' : '#EF3E42'};">${homeScore}</span>`;
            const awaySpan = `<span style="color: ${!isHome ? '#005A9C' : '#EF3E42'};">${awayScore}</span>`;
            
        // Format the score so the higher number usually appears first (common in sports apps)
            if(homeScore > awayScore){
                scoreDisplay = ` ${resultLabel} &nbsp; ${homeSpan} - ${awaySpan} `;
            } else {
                scoreDisplay = ` ${resultLabel} &nbsp; ${awaySpan} - ${homeSpan} `;
            }
        }

        // Handle list of promotions (some games have multiple)
        let promoDisplay = `<span>None</span>`;
        const promotions = game.promotions || (game.teams.home.promotions) || (game.teams.away.promotions);
        if (promotions && promotions.length > 0) {
            promoDisplay = promotions.map(p => `${p.name || p.title}`).join(", ");
        }

        // Create the list item element and inject the HTML structure
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


 //Listens for changes on a dropdown menu to filter the schedule by month
 
document.getElementById('month-filter').addEventListener('change', function(e) {
    const selectedMonth = e.target.value;

    if (selectedMonth === "all") {
        renderGames(allGames);
    } else {
        // filter creates a new array containing only games where the month matches the selection
        const filteredGames = allGames.filter(game => {
            const gameDate = new Date(game.gameDate);
            return gameDate.getMonth() === parseInt(selectedMonth);
        });
        renderGames(filteredGames);
    }
});


//Iterates through all games to calculate the total season record
function calculateAndDisplayRecord(games) {
    let wins = 0;
    let losses = 0;
    const dodgersId = 119;

    games.forEach(game => {
        // Only count games that are officially finished
        if (game.status.abstractGameState === "Final" && game.gameType == "R") {
            const homeScore = game.teams.home.score;
            const awayScore = game.teams.away.score;
            const isHome = game.teams.home.team.id === dodgersId;

            // Logic to attribute the win/loss to the Dodgers correctly
            if (isHome) {
                if (homeScore > awayScore) wins++;
                else if (homeScore < awayScore) losses++;
            } else {
                if (awayScore > homeScore) wins++;
                else if (awayScore < homeScore) losses++;
            }
        }
    });

    // Update the record element in the UI
    const recordElement = document.getElementById('dodgers-record');
    if (recordElement) {
        recordElement.innerHTML = `&nbsp;&nbsp; W - ${wins} &nbsp;&nbsp; L - ${losses}`;
    }
}

// --- Execution ---
document.addEventListener('DOMContentLoaded', () => {
    // 1. Initialize the Date display
    displayCurrentDate();

    // 2. Start the API fetch
    fetchDodgersSchedule();

    // 3. Move the Month Filter listener here so it waits for the HTML to exist
    const monthFilter = document.getElementById('month-filter');
    
    if (monthFilter) {
        monthFilter.addEventListener('change', function(e) {
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
    }
});
