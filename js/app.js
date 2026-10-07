const queryInput = document.getElementById("queryInput");
const dropdownList = document.getElementById("dropdownList");
const clearBtn = document.getElementById("clearBtn");
const resultsArea = document.getElementById("resultsArea");

let debounceTimer = null;

function escapeAttr(str) {
  return str.replace(/'/g, "\\'").replace(/"/g, '&quot;');
}

// 1. Live Debounced Search (Zero Glitch)
queryInput.addEventListener("input", function() {
  const text = this.value.trim();
  clearBtn.style.display = text ? "block" : "none";

  if (!text) {
    dropdownList.style.display = "none";
    resultsArea.innerHTML = "";
    return;
  }

  // Dropdown Autocomplete
  const matches = movieDataset
    .filter(item => item.title.toLowerCase().includes(text.toLowerCase()))
    .slice(0, 5);

  if (matches.length > 0) {
    dropdownList.innerHTML = matches.map(item => `
      <div class="dropdown-item" onmousedown="selectMovie('${escapeAttr(item.title)}')">
        <span><b>${item.title}</b></span>
        <span class="dropdown-genres">${item.genres.slice(0, 2).join(", ")}</span>
      </div>
    `).join("");
    dropdownList.style.display = "block";
  } else {
    dropdownList.style.display = "none";
  }

  // Smooth real-time calculation
  clearTimeout(debounceTimer);
  debounceTimer = setTimeout(() => {
    executeAlgorithm();
  }, 180);
});

function selectMovie(title) {
  queryInput.value = title;
  dropdownList.style.display = "none";
  clearBtn.style.display = "block";
  executeAlgorithm();
}

function clearSearch() {
  queryInput.value = "";
  dropdownList.style.display = "none";
  clearBtn.style.display = "none";
  resultsArea.innerHTML = "";
  queryInput.focus();
}

clearBtn.addEventListener("click", clearSearch);

document.addEventListener("click", function(e) {
  if (!e.target.closest(".search-container")) {
    dropdownList.style.display = "none";
  }
});

// 2. Cosine Similarity Vector Calculation
function calculateCosineSimilarity(setA, setB) {
  const vocabulary = Array.from(new Set([...setA, ...setB]));
  const vectorA = vocabulary.map(term => setA.includes(term) ? 1 : 0);
  const vectorB = vocabulary.map(term => setB.includes(term) ? 1 : 0);

  let dotProduct = 0;
  for (let i = 0; i < vocabulary.length; i++) {
    dotProduct += vectorA[i] * vectorB[i];
  }

  const magnitudeA = Math.sqrt(setA.length);
  const magnitudeB = Math.sqrt(setB.length);

  if (magnitudeA === 0 || magnitudeB === 0) return 0;
  return dotProduct / (magnitudeA * magnitudeB);
}

// 3. Execution & Rendering
function executeAlgorithm() {
  const query = queryInput.value.trim().toLowerCase();

  if (!query) {
    resultsArea.innerHTML = "";
    return;
  }

  const directHits = movieDataset.filter(m => m.title.toLowerCase().includes(query));

  if (directHits.length === 0) {
    resultsArea.innerHTML = `<p style="color:#94a3b8; font-size:14px; text-align:center; padding:20px;">No exact title match. Try typing another film name.</p>`;
    return;
  }

  let aggregatedFeatures = new Set();
  directHits.forEach(m => m.genres.forEach(g => aggregatedFeatures.add(g)));
  const queryFeatureVector = Array.from(aggregatedFeatures);

  const directTitles = new Set(directHits.map(m => m.title.toLowerCase()));
  let candidates = [];

  movieDataset.forEach(item => {
    if (!directTitles.has(item.title.toLowerCase())) {
      const score = calculateCosineSimilarity(queryFeatureVector, item.genres);
      if (score > 0) {
        candidates.push({
          title: item.title,
          genres: item.genres,
          score: Math.round(score * 100)
        });
      }
    }
  });

  candidates.sort((a, b) => b.score - a.score);

  let html = `<div class="group-label">Matching Titles (${directHits.length})</div>`;
  directHits.forEach(item => {
    html += `
      <div class="item-card" onclick="selectMovie('${escapeAttr(item.title)}')">
        <div>
          <div class="item-title">${item.title}</div>
          <div class="item-tags">
            ${item.genres.map(g => `<span class="genre-chip">${g}</span>`).join("")}
          </div>
        </div>
        <div class="score-container">
          <span class="score direct">Match</span>
          <span class="metric">Database</span>
        </div>
      </div>
    `;
  });

  if (candidates.length > 0) {
    html += `<div class="group-label">Similar Recommendations</div>`;
    candidates.slice(0, 6).forEach(item => {
      html += `
        <div class="item-card" onclick="selectMovie('${escapeAttr(item.title)}')">
          <div>
            <div class="item-title">${item.title}</div>
            <div class="item-tags">
              ${item.genres.map(g => `<span class="genre-chip">${g}</span>`).join("")}
            </div>
          </div>
          <div class="score-container">
            <span class="score">${item.score}%</span>
            <div class="match-bar-bg">
              <div class="match-bar-fill" style="width: ${item.score}%"></div>
            </div>
            <span class="metric">Cosine Match</span>
          </div>
        </div>
      `;
    });
  }

  resultsArea.innerHTML = html;
}

queryInput.addEventListener("keydown", function(e) {
  if (e.key === "Enter") {
    dropdownList.style.display = "none";
    executeAlgorithm();
  }
});