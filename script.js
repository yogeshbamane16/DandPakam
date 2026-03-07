let input = document.getElementById("input");
let btn = document.getElementById("submit");

btn.addEventListener("click", async (e) => {
    e.preventDefault();

    const message = input.value.trim();
    const name = localStorage.getItem('complainerName') || 'Unknown User';

    if (!message) {
        alert("Please enter a message!");
        return;
    }

    try {
        const response = await fetch('/api/submit-message', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ name: name, message: message })
        });

        const data = await response.json();

        if (data.success) {
            console.log('Message stored with ID:', data.id);
            window.location.href = "Confirmation.html";
        } else {
            alert('Error: ' + (data.error || 'Failed to submit'));
        }
    } catch (error) {
        console.error('Error submitting message:', error);
        alert('Error submitting message. Make sure server is running!');
    }
});