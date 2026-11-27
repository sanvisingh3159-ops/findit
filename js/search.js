// ===== SEARCH AND FILTER (Member 3) =====

// These two variables remember which filter buttons are currently selected
let currentStatus = "All";
let currentCategory = "All";

// Get the elements from the page
const searchInput = document.getElementById("search-input");
const clearBtn = document.getElementById("clear-btn");
const statusButtons = document.querySelectorAll(".status-btn");
const categoryButtons = document.querySelectorAll(".category-btn");
const resultCount = document.getElementById("result-count");


// Main function: takes all items, keeps only the ones that match
// the search text, the status filter and the category filter, then shows them
function applyFilters() {
  const allItems = getItems();
  const searchText = searchInput.value.toLowerCase().trim();

  const filteredItems = allItems.filter(function (item) {
    // 1. Does the search text appear in the name, description or location?
    const matchesSearch =
      item.name.toLowerCase().includes(searchText) ||
      item.description.toLowerCase().includes(searchText) ||
      item.location.toLowerCase().includes(searchText);

    // 2. Does the status match? (All means no filtering)
    const matchesStatus = currentStatus === "All" || item.status === currentStatus;

    // 3. Does the category match? (All means no filtering)
    const matchesCategory = currentCategory === "All" || item.category === currentCategory;

    // Keep the item only if all three are true
    return matchesSearch && matchesStatus && matchesCategory;
  });

  // Show the matching items using Member 2's function
  displayItems(filteredItems);

  // Update the "Showing X items" text
  if (filteredItems.length === 0) {
    resultCount.textContent = "No items found. Try a different search or filter.";
  } else if (filteredItems.length === 1) {
    resultCount.textContent = "Showing 1 item";
  } else {
    resultCount.textContent = "Showing " + filteredItems.length + " items";
  }
}


// Move the "active" look to the button that was clicked (within its own group)
function setActiveButton(buttons, clickedButton) {
  buttons.forEach(function (button) {
    button.classList.remove("active");
  });
  clickedButton.classList.add("active");
}


// ----- EVENTS: what happens when the user does something -----

// Typing in the search bar updates the results instantly
searchInput.addEventListener("input", applyFilters);

// Clicking a status button (All, Lost, Found, Claimed)
statusButtons.forEach(function (button) {
  button.addEventListener("click", function () {
    currentStatus = button.dataset.status;
    setActiveButton(statusButtons, button);
    applyFilters();
  });
});

// Clicking a category button (All, Electronics, Books, ...)
categoryButtons.forEach(function (button) {
  button.addEventListener("click", function () {
    currentCategory = button.dataset.category;
    setActiveButton(categoryButtons, button);
    applyFilters();
  });
});

// Clear button: reset everything back to the start
clearBtn.addEventListener("click", function () {
  searchInput.value = "";
  currentStatus = "All";
  currentCategory = "All";
  setActiveButton(statusButtons, statusButtons[0]);
  setActiveButton(categoryButtons, categoryButtons[0]);
  applyFilters();
});

// Show everything when the page first opens
applyFilters();



// ===== ITEM DETAILS POPUP (Member 3) =====

// Get the popup parts from the page
const modal = document.getElementById("details-modal");
const modalClose = document.getElementById("modal-close");
const itemsContainer = document.getElementById("items-container");

// Remembers which item is open (we need this in Step 4)
let selectedItemId = null;


// Open the popup and fill it with the details of one item
function openDetails(itemId) {
  // Find the item with this id in the saved list
  const item = getItems().find(function (i) {
    return i.id === itemId;
  });

  // If it was not found, do nothing
  if (!item) {
    return;
  }

  selectedItemId = itemId;

  // Show the photo, or a placeholder if there is no photo
  const imageBox = document.getElementById("modal-image-box");
  if (item.image) {
    imageBox.innerHTML = '<img src="' + item.image + '" alt="Item photo">';
  } else {
    imageBox.innerHTML = '<div class="modal-no-image">📦</div>';
  }

  // Fill in the text details
  document.getElementById("modal-name").textContent = item.name;
  document.getElementById("modal-category").textContent = item.category;
  document.getElementById("modal-date").textContent = item.date;
  document.getElementById("modal-location").textContent = item.location;
  document.getElementById("modal-description").textContent = item.description;

  // Label says "Date Lost" or "Date Found" depending on the item type
  document.getElementById("modal-date-label").textContent =
    item.type === "lost" ? "Date Lost:" : "Date Found:";

  // Coloured status badge (Lost / Found / Claimed)
  const statusBadge = document.getElementById("modal-status");
  statusBadge.textContent = item.status;
  statusBadge.className = "status-badge badge-" + item.status.toLowerCase();

   // Reset the contact box every time the popup opens
  const contactBox = document.getElementById("contact-box");
  contactBox.classList.remove("show");
  contactBox.textContent = "";

  // If the item is already claimed, hide the buttons and show a message
  const actions = document.getElementById("modal-actions");
  const claimedMessage = document.getElementById("claimed-message");
  if (item.status === "Claimed") {
    actions.style.display = "none";
    claimedMessage.classList.add("show");
  } else {
    actions.style.display = "flex";
    claimedMessage.classList.remove("show");
  } // Show the popup
  modal.classList.add("show");
}


// Close the popup
function closeDetails() {
  modal.classList.remove("show");
  selectedItemId = null;
}


// ----- EVENTS -----

// Click on any "View Details" button inside the item list.
// We listen on the container, so it also works for cards added later.
itemsContainer.addEventListener("click", function (event) {
  const button = event.target.closest("button[data-id]");
  if (button) {
    openDetails(button.dataset.id);
  }
});

// Click the X button
modalClose.addEventListener("click", closeDetails);

// Click on the dark area outside the white box
modal.addEventListener("click", function (event) {
  if (event.target === modal) {
    closeDetails();
  }
});

// Press the Escape key
document.addEventListener("keydown", function (event) {
  if (event.key === "Escape") {
    closeDetails();
  }
});
// ===== CONTACT OWNER AND CLAIM ITEM (Member 3) =====

const contactBtn = document.getElementById("contact-btn");
const claimBtn = document.getElementById("claim-btn");


// Change the status of one item and save the list again
function updateItemStatus(itemId, newStatus) {
  const items = getItems();

  // Go through every item and change only the one with the matching id
  const updatedItems = items.map(function (item) {
    if (item.id === itemId) {
      item.status = newStatus;
    }
    return item;
  });

  // Save the whole updated list back to localStorage
  localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedItems));
}


// Contact Owner: show the contact details of the open item
contactBtn.addEventListener("click", function () {
  const item = getItems().find(function (i) {
    return i.id === selectedItemId;
  });

  if (!item) {
    return;
  }

  const contactBox = document.getElementById("contact-box");
  contactBox.textContent = "📞 Contact: " + item.contact;
  contactBox.classList.add("show");
});


// Claim Item: ask for confirmation, then mark the item as Claimed
claimBtn.addEventListener("click", function () {
  const sure = confirm("Are you sure you want to mark this item as Claimed?");

  if (sure) {
    updateItemStatus(selectedItemId, "Claimed");
    closeDetails();
    applyFilters();   // redraw the cards so the new status shows
  }
});