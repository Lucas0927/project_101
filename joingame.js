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
    window.location.href = './enterusername.html';
});
