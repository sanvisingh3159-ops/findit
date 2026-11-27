// ===== Item listings: show items as cards (Member 2) =====

// The box on the page where all the cards will be placed
const listContainer = document.getElementById("items-container");


// Make user-typed text safe before putting it into HTML
// (so text like <b> shows as text and cannot change the page)
function escapeHtml(text) {
  const div = document.createElement("div");
  div.textContent = text;
  return div.innerHTML;
}


// Turn "2026-11-24" into "24 Nov 2026"
function formatDate(dateString) {
  const date = new Date(dateString);
  if (isNaN(date)) {
    return dateString;
  }
  return date.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
}


// Cut long text short and add "..." at the end
function shortText(text, maxLength) {
  if (text.length <= maxLength) {
    return text;
  }
  return text.substring(0, maxLength) + "...";
}


// Build the HTML for ONE item card
function createCard(item) {
  // "Lost" becomes "lost", used for the badge colour class
  const statusClass = item.status.toLowerCase();

  // Show the photo, or a box with an emoji if there is no photo
  let imageHtml;
  if (item.image) {
    imageHtml = '<img src="' + item.image + '" alt="Item photo">';
  } else {
    imageHtml = '<div class="card-no-image">📦</div>';
  }

  // The date label depends on the item type
  const dateLabel = item.type === "lost" ? "Lost on " : "Found on ";

  return `
    <div class="item-card">
      <div class="card-image">${imageHtml}</div>

      <div class="card-body">
        <span class="item-badge ${statusClass}">${escapeHtml(item.status)}</span>
        <h3>${escapeHtml(item.name)}</h3>
        <span class="category-tag">${escapeHtml(item.category)}</span>
        <p class="card-description">${escapeHtml(shortText(item.description, 80))}</p>
        <p class="card-meta">📍 ${escapeHtml(item.location)}</p>
        <p class="card-meta">📅 ${dateLabel}${formatDate(item.date)}</p>

        <div class="card-footer">
          <button type="button" class="btn btn-primary view-details-btn" data-id="${item.id}">View Details</button>
        </div>
      </div>
    </div>`;
}


// Show a list of items as cards. It works with ANY list,
// so the search and filter code (Member 3) can use it too.
function displayItems(itemsArray) {
  listContainer.innerHTML = "";

  // No items to show
  if (itemsArray.length === 0) {
    if (getItems().length === 0) {
      // Nothing has been reported at all yet
      listContainer.innerHTML = `
        <div class="empty-state">
          <p class="empty-icon">📭</p>
          <h3>No items reported yet</h3>
          <p>Be the first to help a fellow student.</p>
          <div class="empty-buttons">
            <a href="report-lost.html" class="btn btn-lost">Report Lost Item</a>
            <a href="report-found.html" class="btn btn-found">Report Found Item</a>
          </div>
        </div>`;
    } else {
      // Items exist, but none match the current search or filter
      listContainer.innerHTML = `
        <div class="empty-state">
          <p class="empty-icon">🔍</p>
          <h3>No matching items</h3>
          <p>Try a different search or filter.</p>
        </div>`;
    }
    return;
  }

  // Build one card for every item and show them all at once
  let allCards = "";
  itemsArray.forEach(function (item) {
    allCards += createCard(item);
  });
  listContainer.innerHTML = allCards;
}


// When the page opens, show every saved item
displayItems(getItems());
