import { db } from './firebase-config.js';
import { collection, getDocs, query, doc, deleteDoc, getDoc } from "https://www.gstatic.com/firebasejs/10.12.3/firebase-firestore.js";

document.addEventListener('DOMContentLoaded', async () => {
    const urlParams = new URLSearchParams(window.location.search);
    const roomCode = urlParams.get('roomCode');

    if (roomCode) {
        document.getElementById('roomCode').textContent = roomCode;

        const playersList = document.getElementById('players-list');
        playersList.innerHTML = ''; // Clear the list before appending

        const playersQuery = query(collection(db, 'rooms', roomCode, 'players'));
        const playersSnapshot = await getDocs(playersQuery);

        playersSnapshot.forEach(playerDoc => {
            const player = playerDoc.data();
            const playerDiv = document.createElement('div');
            playerDiv.classList.add('player');
            playerDiv.textContent = player.username || 'Unknown Player';
            playersList.appendChild(playerDiv);
        });

        // Show the start button
        document.querySelector('.start-button').classList.remove('hidden');

        // Attach event listener to the game name link
        document.getElementById('gameNameLink').addEventListener('click', async (event) => {
            event.preventDefault(); // Prevent the default link behavior
            await removeRoom(roomCode);
            window.location.href = event.target.href; // Redirect to the index page
        });
    }
});

async function removeRoom(roomCode) {
    const roomRef = doc(collection(db, 'rooms'), roomCode);
    const roomDoc = await getDoc(roomRef);

    if (roomDoc.exists()) {
        await deleteDoc(roomRef);
    }
}
