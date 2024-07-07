import { db } from './firebase-config.js';
import { collection, addDoc } from "https://www.gstatic.com/firebasejs/10.12.3/firebase-firestore.js";

document.getElementById('roomCode').addEventListener('input', function() {
    const code = this.value;
    const joinButton = document.getElementById('joinButton');
    if (code.length === 6) {
        joinButton.disabled = false;
    } else {
        joinButton.disabled = true;
    }
});

document.getElementById('joinButton').addEventListener('click', async function() {
    const roomCode = document.getElementById('roomCode').value;
    const playerRef = await addDoc(collection(db, 'rooms', roomCode, 'players'), {
        username: 'none' // Username will be added on the next page
    });
    const userId = playerRef.id; // Use Firestore auto-ID

    window.location.href = `./enterusername.html?roomCode=${roomCode}&userId=${userId}`;
});
