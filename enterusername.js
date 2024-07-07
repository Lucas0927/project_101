document.getElementById('username').addEventListener('input', function() {
    const username = this.value;
    const useButton = document.getElementById('useButton');
    if (username.length >= 1 && username.length <= 20) {
        useButton.disabled = false;
    } else {
        useButton.disabled = true;
    }
});

document.getElementById('useButton').addEventListener('click', function() {
    const urlParams = new URLSearchParams(window.location.search);
    const roomCode = urlParams.get('roomCode');
    const userId = urlParams.get('userId');
    const username = document.getElementById('username').value;
    window.location.href = `./homewaiting.html?roomCode=${roomCode}&userId=${userId}&username=${username}`;
});
