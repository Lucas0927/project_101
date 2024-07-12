import { db } from './firebase-config.js';
import { collection, doc, setDoc, addDoc } from "https://www.gstatic.com/firebasejs/10.12.3/firebase-firestore.js";

function generateRoomCode(length) {
    const characters = 'ABCDEFGHJKLMNPQRSTUVWXYZ123456789'; // Excluding 'O' and '0'
    let roomCode = '';
    for (let i = 0; i < length; i++) {
        roomCode += characters.charAt(Math.floor(Math.random() * characters.length));
    }
    return roomCode;
}

async function createRoom() {
    const roomCode = generateRoomCode(6); // Generate a 6-character room code
    const roomRef = doc(collection(db, 'rooms'), roomCode);

    await setDoc(roomRef, {
        roomCode: roomCode,
        IsStarted: false,
        topic: 'Animals',
    });

    const playerRef = await addDoc(collection(db, 'rooms', roomCode, 'players'), {
        username: 'HOST'
    });
    const userId = playerRef.id; // Use Firestore auto-ID

    return { roomCode, userId };
}

document.getElementById('createGameButton').addEventListener('click', async () => {
    const { roomCode, userId } = await createRoom();
    window.location.href = `./homewaiting.html?roomCode=${roomCode}&userId=${userId}`;
});
