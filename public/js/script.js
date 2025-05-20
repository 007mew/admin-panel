window.addEventListener('DOMContentLoaded', () => {
  const API_URL = 'https://your-backend-url.onrender.com';  // 🔁 Replace with your Render URL

  fetch(`${API_URL}/api/articles`)
    .then(res => res.json())
    .then(data => {
      const container = document.getElementById('articles');
      container.innerHTML = data.map(article => `
        <div>
          <h2>${article.title}</h2>
          <p>${article.content}</p>
          <a href="/edit/${article._id}">Edit</a>
          <button onclick="deleteArticle('${article._id}')">Delete</button>
        </div>
      `).join('');
    });
});

function deleteArticle(id) {
  const API_URL = 'https://your-backend-url.onrender.com';  // 🔁 Replace with your Render URL
  fetch(`${API_URL}/api/articles/${id}`, { method: 'DELETE' })
    .then(() => location.reload());
}
