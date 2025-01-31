// frontend/script.js
document.addEventListener('DOMContentLoaded', () => {
    const usernameDisplay = document.getElementById('username-display');
    const threadListDiv = document.getElementById('thread-list');
    const createThreadButton = document.getElementById('create-thread-button');
    const threadTitleInput = document.getElementById('thread-title');
    const threadContentInput = document.getElementById('thread-content');
    const threadCaptchaInput = document.getElementById('thread-captcha');
    const threadsSection = document.getElementById('threads-section');
    const threadViewSection = document.getElementById('thread-view');
    const viewThreadTitleElement = document.getElementById('view-thread-title');
    const backToThreadsButtonTop = document.getElementById('back-to-threads-top'); // New top back button
    const backToThreadsButtonBottom = document.getElementById('back-to-threads');
    const viewThreadContentElement = document.getElementById('view-thread-content');
    const commentListDiv = document.getElementById('comment-list');
    const createCommentButton = document.getElementById('create-comment-button');
    const commentContentInput = document.getElementById('comment-content');
    const commentCaptchaInput = document.getElementById('comment-captcha');
    const backToThreadsButton = document.getElementById('back-to-threads');
    const threadImageInput = document.getElementById('thread-image');
    const threadVideoInput = document.getElementById('thread-video');
    const viewThreadImage = document.getElementById('view-thread-image');
    const viewThreadVideo = document.getElementById('view-thread-video');

    let currentUsername = '';
    let currentThreadId = null;
    let uploadedImageData = null; // Store data URL for uploaded image
    let uploadedVideoData = null; // Store data URL for uploaded video

    // Function to fetch and display username
    const fetchUsername = async () => {
        const response = await fetch('./backend/api/username');
        const data = await response.json();
        currentUsername = data.username;
        usernameDisplay.textContent = `Your Anonymous Username: ${currentUsername}`;
    };

    viewThreadTitleElement.addEventListener('click', () => {
        threadsSection.style.display = 'block';
        threadViewSection.style.display = 'none';
        currentThreadId = null;
    });

    backToThreadsButtonTop.addEventListener('click', () => {
        threadsSection.style.display = 'block';
        threadViewSection.style.display = 'none';
        currentThreadId = null;
    });

    backToThreadsButtonBottom.addEventListener('click', () => {
        threadsSection.style.display = 'block';
        threadViewSection.style.display = 'none';
        currentThreadId = null;
    });

    // Function to fetch and display threads
    const fetchThreads = async () => {
        const response = await fetch('./backend/api/threads');
        const threads = await response.json();
        threadListDiv.innerHTML = ''; // Clear existing threads
        threads.forEach(thread => {
            const threadItem = document.createElement('div');
            threadItem.classList.add('thread-item');
            threadItem.textContent = `${thread.title} (by ${thread.username})`;
            threadItem.addEventListener('click', () => displayThreadView(thread.id, thread.title, thread.content, thread.imageData, thread.videoData));
            threadListDiv.appendChild(threadItem);
        });
    };

    // Function to display thread view
    const displayThreadView = async (threadId, title, content, imageData, videoData) => {
        currentThreadId = threadId;
        viewThreadTitleElement.textContent = title;
        // Use marked.parse() to render Markdown content
        viewThreadContentElement.innerHTML = marked.parse(content); // Render markdown here!
        threadsSection.style.display = 'none';
        threadViewSection.style.display = 'block';

        // Display image if available
        if (imageData) {
            viewThreadImage.src = imageData;
            viewThreadImage.style.display = 'block';
        } else {
            viewThreadImage.style.display = 'none';
        }

        // Display video if available
        if (videoData) {
            viewThreadVideo.src = videoData;
            viewThreadVideo.style.display = 'block';
        } else {
            viewThreadVideo.style.display = 'none';
        }

        await fetchComments(threadId); // Load comments for the thread
    };

    const fetchComments = async (threadId) => {
        const response = await fetch(`./backend/api/threads/${threadId}/comments`);
        const comments = await response.json();
        commentListDiv.innerHTML = ''; // Clear existing comments
        comments.forEach(comment => {
            const commentItem = document.createElement('div');
            commentItem.classList.add('comment-item');
            // Use marked.parse() to render Markdown content in comments too
            commentItem.innerHTML = `<p><strong>${comment.username}:</strong> ${marked.parse(comment.content)}</p>`; // Render markdown here!
            commentListDiv.appendChild(commentItem);
        });
    };

    const readUploadedFileAsDataURL = (file) => {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => resolve(reader.result);
            reader.onerror = () => reject(reader.error);
            reader.readAsDataURL(file);
        });
    };

    threadImageInput.addEventListener('change', async (event) => {
        const file = event.target.files[0];
        if (file) {
            try {
                uploadedImageData = await readUploadedFileAsDataURL(file);
            } catch (error) {
                console.error("Error reading image file:", error);
                alert("Error reading image file. Please try again.");
            }
        } else {
            uploadedImageData = null;
        }
    });

    threadVideoInput.addEventListener('change', async (event) => {
        const file = event.target.files[0];
        if (file) {
            try {
                uploadedVideoData = await readUploadedFileAsDataURL(file);
            } catch (error) {
                console.error("Error reading video file:", error);
                alert("Error reading video file. Please try again.");
            }
        } else {
            uploadedVideoData = null;
        }
    });

    // Event listener for creating a thread
    createThreadButton.addEventListener('click', async () => {
        const title = threadTitleInput.value;
        const content = threadContentInput.value;
        const captcha = threadCaptchaInput.value;

        if (!title || !content || !captcha) {
            alert('Please fill in all fields and answer the captcha.');
            return;
        }

        const response = await fetch('./backend/api/threads', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                username: currentUsername,
                title,
                content,
                captcha,
                imageData: uploadedImageData, // Send data URL
                videoData: uploadedVideoData  // Send data URL
            })
        });

        if (response.ok) {
            alert('Thread created successfully!');
            threadTitleInput.value = '';
            threadContentInput.value = '';
            threadCaptchaInput.value = '';
            threadImageInput.value = ''; // Clear file input
            threadVideoInput.value = ''; // Clear file input
            uploadedImageData = null; // Reset data URL
            uploadedVideoData = null; // Reset data URL
            fetchThreads(); // Refresh thread list
            threadsSection.style.display = 'block';
            threadViewSection.style.display = 'none';
        } else {
            const errorData = await response.json();
            alert(`Error creating thread: ${errorData.error || 'Unknown error'}`);
        }
    });

    // Event listener for creating a comment
    createCommentButton.addEventListener('click', async () => {
        const content = commentContentInput.value;
        const captcha = commentCaptchaInput.value;

        if (!content || !captcha) {
            alert('Please fill in comment and captcha.');
            return;
        }

        const response = await fetch(`./backend/api/threads/${currentThreadId}/comments`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ threadId: currentThreadId, username: currentUsername, content, captcha })
        });

        if (response.ok) {
            alert('Comment posted successfully!');
            commentContentInput.value = '';
            commentCaptchaInput.value = '';
            fetchComments(currentThreadId); // Refresh comments
        } else {
            const errorData = await response.json();
            alert(`Error creating comment: ${errorData.error || 'Unknown error'}`);
        }
    });

    // Event listener for back to threads button
    backToThreadsButton.addEventListener('click', () => {
        threadsSection.style.display = 'block';
        threadViewSection.style.display = 'none';
        currentThreadId = null;
    });

    // Initial fetch on page load
    fetchUsername();
    fetchThreads();
});
