document.addEventListener('DOMContentLoaded', async () => {
  const API_URL = 'https://cabnm-backend.onrender.com';  // 🔁 Replace with your Render URL

  // Get article ID from URL
  const id = window.location.pathname.split('/').pop();

  try {
    const res = await fetch(`${API_URL}/api/articles`);
    const articles = await res.json();

    const article = articles.find(a => a._id === id);

    if (!article) {
      alert('Article not found.');
      window.location.href = '/dashboard';
      return;
    }

    document.getElementById('title').value = article.title;
    document.getElementById('content').value = article.content;

    document.getElementById('editForm').addEventListener('submit', async (e) => {
      e.preventDefault();

      const title = document.getElementById('title').value;
      const content = document.getElementById('content').value;

      const updateRes = await fetch(`${API_URL}/api/articles/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, content })
      });

      if (updateRes.ok) {
        alert('Article updated successfully!');
        window.location.href = '/dashboard';
      } else {
        alert('Failed to update article.');
      }
    });

  } catch (err) {
    console.error('Error loading article:', err);
    alert('An error occurred. Redirecting to dashboard.');
    window.location.href = '/dashboard';
  }
});
