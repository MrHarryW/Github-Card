document.getElementById("theme-toggle").addEventListener("click", () => {
  document.body.classList.toggle("light");
});

async function downloadImagePNG() {
  const node = document.getElementById("result");

  domtoimage.toPng(node)
    .then((dataUrl) => {
      const link = document.createElement("a");
      link.download = "github-stats.png";
      link.href = dataUrl;
      link.click();
    })
    .catch((error) => {
      console.error("Error downloading image:", error);
    });
}


async function getGitHubStats() {
  const username = document.getElementById("username").value.trim();
  const result = document.getElementById("result");
  const spinner = document.getElementById("spinner");

  result.innerHTML = "";
  spinner.classList.remove("hidden"); // Show spinner

  if (!username) {
    spinner.classList.add("hidden"); // Hide spinner
    result.innerHTML = "Please enter a username.";
    return;
  }

  try {
    const userRes = await fetch(`https://api.github.com/users/${username}`);
    if (!userRes.ok) throw new Error("User not found");
    const user = await userRes.json();
    
    const reposRes = await fetch(`https://api.github.com/users/${username}/repos?per_page=100`);
    const repos = await reposRes.json();

    let stars = 0;
    const langMap = {};

    repos.forEach(repo => {
      stars += repo.stargazers_count;
      const lang = repo.language;
      if (lang) langMap[lang] = (langMap[lang] || 0) + 1;
    });

    const topLangs = Object.entries(langMap)
      .sort((a, b) => b[1] - a[1])
      .map(([lang]) => lang)
      .slice(0, 3);

    spinner.classList.add("hidden"); // Hide spinner after success
    result.innerHTML = `
      <img src="${user.avatar_url}" style="border-radius: 50%; height: 50px; width: 50px;" alt="${username}'s avatar" class="avatar" />
      <h2>@<a href="https://github.com/${username}" target="_blank">${username}</a></h2>
      <p><strong>Bio:</strong> ${user.bio || "N/A"}</p>
      <p><strong>Total Public Repos:</strong> ${repos.length}</p>
      <p><strong>Total Stars:</strong> ${stars}</p>
      <p><strong>Top Languages:</strong> ${topLangs.join(", ") || "N/A"}</p>
      <p><strong>Followers:</strong> ${user.followers}</p>
      <p><strong>Following:</strong> ${user.following}</p>
      <p><strong>Public Gists:</strong> ${user.public_gists}</p>
      <p><strong>Created At:</strong> ${new Date(user.created_at).toLocaleDateString()}</p>
      <p><strong>Last Updated:</strong> ${new Date(user.updated_at).toLocaleDateString()}</p>
      <p><strong>Location:</strong> ${user.location || "N/A"}</p>
      <p><strong>Company:</strong> ${user.company || "N/A"}</p>
      <p><strong>Website:</strong> ${user.blog ? `<a href="${user.blog}" target="_blank">${user.blog}</a>` : "N/A"}</p>
      <p><strong>Twitter:</strong> ${user.twitter_username ? `<a href="https://twitter.com/${user.twitter_username}" target="_blank">@${user.twitter_username}</a>` : "N/A"}</p>
      </br>
      </br>
      <button id="download-image" onclick="downloadImagePNG()">Download Card as Image</button>
`;
  } catch (err) {
    spinner.classList.add("hidden"); // Hide spinner on error
    result.innerHTML = `Error: ${err.message}`;
  }
}


