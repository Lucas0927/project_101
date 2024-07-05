const highScoresList = document.getElementById("highScoresList");
const highScores = JSON.parse(localStorage.getItem("highScores")) || [];

highScoresList.innerHTML = highScores
  .map(score => {
    return `<li class="high-score">${score.name} - ${score.score}</li>`;
  })
  .join("");

  document.getElementById('create-room-form').addEventListener('submit', function(event) {
    event.preventDefault();
    const roomName = document.getElementById('room-name').value;
    
    // For demonstration purposes, we assume the room is created successfully
    document.getElementById('create-room-form').classList.add('hidden');
    document.getElementById('waiting-room').classList.remove('hidden');

    // Simulate adding players to the room
    const playersList = document.getElementById('players-list');
    const playerNames = ['Player 1', 'Player 2', 'Player 3', 'Player 4'];

    playerNames.forEach(playerName => {
        const playerDiv = document.createElement('div');
        playerDiv.classList.add('player');
        playerDiv.textContent = playerName;
        playersList.appendChild(playerDiv);
    });

    // Show the start button when players are added
    document.querySelector('.start-button').classList.remove('hidden');
});