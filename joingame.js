import { db } from './firebase-config.js';
import { collection, addDoc, doc, getDoc } from "https://www.gstatic.com/firebasejs/10.12.3/firebase-firestore.js";

document.getElementById('roomCode').addEventListener('input', function() {
    const code = this.value.toUpperCase();
    this.value = code; // Set the input value to uppercase
    const joinButton = document.getElementById('joinButton');
    if (code.length === 6) {
        joinButton.disabled = false;
    } else {
        joinButton.disabled = true;
    }
});

document.getElementById('joinButton').addEventListener('click', async function() {
    const roomCode = document.getElementById('roomCode').value.toUpperCase();

    // Check if the room exists
    const roomRef = doc(db, 'rooms', roomCode);
    const roomDoc = await getDoc(roomRef);

    if (!roomDoc.exists()) {
        // Show a message that says the room does not exist
        alert("The room does not exist. Try different code.");
        return;
    }

    const playerRef = await addDoc(collection(db, 'rooms', roomCode, 'players'), {
        username: 'Joining...' // Username will be added on the next page
    });
    const userId = playerRef.id; // Use Firestore auto-ID

    window.location.href = `./enterusername.html?roomCode=${roomCode}&userId=${userId}`;
});
