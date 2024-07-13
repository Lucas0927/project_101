import { db } from './firebase-config.js';
import { doc, updateDoc } from "https://www.gstatic.com/firebasejs/10.12.3/firebase-firestore.js";

document.getElementById('username').addEventListener('input', function() {
    const username = this.value;
    const useButton = document.getElementById('useButton');
    if (username.length >= 1 && username.length <= 20) {
        useButton.disabled = false;
    } else {
        useButton.disabled = true;
    }
});

document.getElementById('useButton').addEventListener('click', async function() {
    const urlParams = new URLSearchParams(window.location.search);
    const roomCode = urlParams.get('roomCode');
    const userId = urlParams.get('userId');
    const username = document.getElementById('username').value;

    const playerRef = doc(db, 'rooms', roomCode, 'players', userId);
    await updateDoc(playerRef, { username: username });

    window.location.href = `./homewaiting.html?roomCode=${roomCode}&userId=${userId}&username=${username}`;
});

document.getElementById('backButton').addEventListener('click', () => {
    window.location.href = './index.html';
});
