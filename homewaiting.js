import { db } from './firebase-config.js';
import { collection, doc, deleteDoc, getDoc } from "https://www.gstatic.com/firebasejs/10.12.3/firebase-firestore.js";

// Function to remove a room
async function removeRoom(roomCode) {
    const roomRef = doc(collection(db, 'rooms'), roomCode);
    const roomDoc = await getDoc(roomRef);

    if (roomDoc.exists()) {
        await deleteDoc(roomRef);
    }
}

document.addEventListener('DOMContentLoaded', async () => {
    const urlParams = new URLSearchParams(window.location.search);
    const roomCode = urlParams.get('roomCode');

    if (roomCode) {
        document.getElementById('roomCode').textContent = roomCode;

        // Attach event listener to the game name link
        document.getElementById('gameNameLink').addEventListener('click', async (event) => {
            event.preventDefault(); // Prevent the default link behavior
            await removeRoom(roomCode);
            window.location.href = event.target.href; // Redirect to the index page
        });

        // Simulate adding the room creator as a player
        const playersList = document.getElementById('players-list');
        const playerDiv = document.createElement('div');
        playerDiv.classList.add('player');
        playerDiv.textContent = 'Player 1'; // Replace with actual player name if available
        playersList.appendChild(playerDiv);

        // Show the start button
        document.querySelector('.start-button').classList.remove('hidden');
    }
});
