document.getElementById('username').addEventListener('input', function() {
    const username = this.value;
    const useButton = document.getElementById('useButton');
    if (username.length >= 1 && username.length <= 20) {
        useButton.disabled = false;
    } else {
        useButton.disabled = true;
    }
});
