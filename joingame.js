document.getElementById('roomCode').addEventListener('input', function() {
    const code = this.value;
    const joinButton = document.getElementById('joinButton');
    if (code.length === 6) {
        joinButton.disabled = false;
    } else {
        joinButton.disabled = true;
    }
});

document.getElementById('joinButton').addEventListener('click', function() {
    const roomCode = document.getElementById('roomCode').value;
    const userId = Math.random().toString(36).substring(2, 10).toUpperCase();
    window.location.href = `./enterusername.html?roomCode=${roomCode}&userId=${userId}`;
});
