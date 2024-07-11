document.getElementById('addTopicForm').addEventListener('submit', async (event) => {
    event.preventDefault();
    const topicName = document.getElementById('topicName').value.trim();
    const topicWords = document.getElementById('topicWords').value.split(',').map(word => word.trim());

    if (!topicName || topicWords.length === 0) {
        alert('Please enter a valid topic name and at least one word.');
        return;
    }

    try {
        // Here you can add the logic to update the Firestore with the new topic data
        console.log('New Topic:', { topicName, topicWords });
        alert('Topic added successfully.');
    } catch (error) {
        console.error('Error adding topic:', error);
        alert('Error adding topic.');
    }
});
