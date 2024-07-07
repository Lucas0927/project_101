import { db } from './firebase-config.js';
import { collection, onSnapshot, doc, deleteDoc, getDoc, getDocs } from "https://www.gstatic.com/firebasejs/10.12.3/firebase-firestore.js";

document.addEventListener('DOMContentLoaded', async () => {
    const urlParams = new URLSearchParams(window.location.search);
    const roomCode = urlParams.get('roomCode');
    const userId = urlParams.get('userId');

    if (roomCode) {
        document.getElementById('roomCode').textContent = roomCode;

        const playersList = document.getElementById('players-list');
        playersList.innerHTML = ''; // Clear the list before appending

        const playersCollection = collection(db, 'rooms', roomCode, 'players');
        const startButton = document.getElementById('startButton');

        // Listen for real-time updates in the players collection
        onSnapshot(playersCollection, (snapshot) => {
            playersList.innerHTML = ''; // Clear the list before appending
            let isHost = false;
            snapshot.forEach(playerDoc => {
                const player = playerDoc.data();
                const playerDiv = document.createElement('div');
                playerDiv.classList.add('player');
                playerDiv.textContent = player.username || 'Unknown Player';
                playersList.appendChild(playerDiv);

                // Check if the current user is the host
                if (playerDoc.id === userId && player.username=== 'HOST') {
                    isHost = true;
                }
            });

            // Enable or disable the start button based on the host status
            if (isHost) {
                startButton.disabled = false;
            } else {
                startButton.disabled = true;
            }
        });

        // Attach event listener to the game name link
        document.getElementById('gameNameLink').addEventListener('click', async (event) => {
            event.preventDefault(); // Prevent the default link behavior
            await handleLeaveRoom(roomCode, userId);
            window.location.href = event.target.href; // Redirect to the index page
        });

        startButton.addEventListener('click', (event) => {
            if (!startButton.disabled) {
                window.location.href = './game.html';
            }
        });
    }
});

async function handleLeaveRoom(roomCode, userId) {
    const playerRef = doc(db, 'rooms', roomCode, 'players', userId);
    const playerDoc = await getDoc(playerRef);

    if (playerDoc.exists()) {
        const playerData = playerDoc.data();

        if (playerData.username === 'HOST') {
            // Delete all players in the room
            const playersCollection = collection(db, 'rooms', roomCode, 'players');
            const playersSnapshot = await getDocs(playersCollection);

            for (const player of playersSnapshot.docs) {
                await deleteDoc(player.ref);
            }

            // Delete the room document
            const roomRef = doc(db, 'rooms', roomCode);
            const roomDoc = await getDoc(roomRef);
            if (roomDoc.exists()) {
                await deleteDoc(roomRef);
            }
        } else {
            // Delete only the specific player
            await deleteDoc(playerRef);
        }
    }
}
