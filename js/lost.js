// ===== Report Lost Item: validation and saving (Member 1) =====

// ----- Get the form and all its fields from the page -----
const lostForm = document.getElementById("lost-form");
const nameInput = document.getElementById("item-name");
const categoryInput = document.getElementById("category");
const descriptionInput = document.getElementById("description");
const dateInput = document.getElementById("date");
const locationInput = document.getElementById("location");
const contactInput = document.getElementById("contact");
const imageInput = document.getElementById("image");
const imagePreview = document.getElementById("image-preview");
const formMessage = document.getElementById("form-message");
const submitBtn = lostForm.querySelector(".submit-btn");


// ----- Today's date as text, like "2026-11-27" -----
function getTodayString() {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, "0");
  const day = String(today.getDate()).padStart(2, "0");
  return year + "-" + month + "-" + day;
}

// The date picker will not let the user pick a future day
dateInput.max = getTodayString();


// ----- Show or clear an error under a field -----
function showError(input, errorId, message) {
  document.getElementById(errorId).textContent = message;
  input.classList.add("invalid");
}

function clearError(input, errorId) {
  document.getElementById(errorId).textContent = "";
  input.classList.remove("invalid");
}


// ----- Show a green (success) or red (error) message above the form -----
function showMessage(text, type) {
  formMessage.textContent = text;
  formMessage.className = "form-message " + type;
  formMessage.scrollIntoView({ behavior: "smooth" });
}


// ----- Check every field. Returns true only if all fields are correct -----
function validateForm() {
  let isValid = true;

  // 1. Item name: required, at least 3 characters
  const name = nameInput.value.trim();
  if (name === "") {
    showError(nameInput, "name-error", "Please enter the item name.");
    isValid = false;
  } else if (name.length < 3) {
    showError(nameInput, "name-error", "Item name must be at least 3 characters.");
    isValid = false;
  } else {
    clearError(nameInput, "name-error");
  }

  // 2. Category: one must be selected
  if (categoryInput.value === "") {
    showError(categoryInput, "category-error", "Please select a category.");
    isValid = false;
  } else {
    clearError(categoryInput, "category-error");
  }

  // 3. Description: required, at least 10 characters
  const description = descriptionInput.value.trim();
  if (description === "") {
    showError(descriptionInput, "description-error", "Please describe the item.");
    isValid = false;
  } else if (description.length < 10) {
    showError(descriptionInput, "description-error", "Description must be at least 10 characters.");
    isValid = false;
  } else {
    clearError(descriptionInput, "description-error");
  }

  // 4. Date: required and not in the future
  if (dateInput.value === "") {
    showError(dateInput, "date-error", "Please select the date.");
    isValid = false;
  } else if (dateInput.value > getTodayString()) {
    showError(dateInput, "date-error", "Date cannot be in the future.");
    isValid = false;
  } else {
    clearError(dateInput, "date-error");
  }

  // 5. Location: required
  if (locationInput.value.trim() === "") {
    showError(locationInput, "location-error", "Please enter the location.");
    isValid = false;
  } else {
    clearError(locationInput, "location-error");
  }

  // 6. Contact: must be a valid email OR a 10-digit phone number
  const contact = contactInput.value.trim();
  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const phonePattern = /^[0-9]{10}$/;
  const phoneOnly = contact.replace(/[\s-]/g, "");   // remove spaces and dashes

  if (contact === "") {
    showError(contactInput, "contact-error", "Please enter your email or phone number.");
    isValid = false;
  } else if (!emailPattern.test(contact) && !phonePattern.test(phoneOnly)) {
    showError(contactInput, "contact-error", "Enter a valid email or a 10-digit phone number.");
    isValid = false;
  } else {
    clearError(contactInput, "contact-error");
  }

  // 7. Image: optional, but if chosen it must be an image under 2 MB
  const file = imageInput.files[0];
  if (file && !file.type.startsWith("image/")) {
    showError(imageInput, "image-error", "Please choose an image file.");
    isValid = false;
  } else if (file && file.size > 2 * 1024 * 1024) {
    showError(imageInput, "image-error", "Image must be smaller than 2 MB.");
    isValid = false;
  } else {
    clearError(imageInput, "image-error");
  }

  return isValid;
}


// ----- Build the item and save it in localStorage -----
function saveLostItem(imageData) {
  const item = {
    id: generateId(),
    type: "lost",
    name: nameInput.value.trim(),
    category: categoryInput.value,
    description: descriptionInput.value.trim(),
    date: dateInput.value,
    location: locationInput.value.trim(),
    contact: contactInput.value.trim(),
    image: imageData,
    status: "Lost",
    createdAt: Date.now()
  };

  // saveItem() comes from storage.js. It returns false if storage is full
  const saved = saveItem(item);

  if (saved) {
    showMessage("✅ Lost item reported successfully! Taking you to the items page...", "success");
    lostForm.reset();
    imagePreview.style.display = "none";
    imagePreview.removeAttribute("src");
    submitBtn.disabled = true;

    // Go to the Browse page after 2 seconds
    setTimeout(function () {
      window.location.href = "browse.html";
    }, 2000);
  } else {
    showMessage("Storage is full. Please try a smaller image.", "error");
  }
}


// ----- EVENTS -----

// When the form is submitted
lostForm.addEventListener("submit", function (event) {
  // Stop the page from reloading
  event.preventDefault();

  // Stop here if any field is wrong
  if (!validateForm()) {
    return;
  }

  // Convert the image to text first (if there is one), then save
  const file = imageInput.files[0];
  if (file) {
    imageToBase64(file, function (imageData) {
      saveLostItem(imageData);
    });
  } else {
    saveLostItem("");
  }
});

// Show a preview when an image is chosen
imageInput.addEventListener("change", function () {
  const file = imageInput.files[0];
  if (file && file.type.startsWith("image/")) {
    imagePreview.src = URL.createObjectURL(file);
    imagePreview.style.display = "block";
  } else {
    imagePreview.style.display = "none";
    imagePreview.removeAttribute("src");
  }
});

// Remove a field's red error as soon as the user starts fixing it
const fieldPairs = [
  [nameInput, "name-error"],
  [categoryInput, "category-error"],
  [descriptionInput, "description-error"],
  [dateInput, "date-error"],
  [locationInput, "location-error"],
  [contactInput, "contact-error"],
  [imageInput, "image-error"]
];

fieldPairs.forEach(function (pair) {
  pair[0].addEventListener("input", function () {
    clearError(pair[0], pair[1]);
  });
  pair[0].addEventListener("change", function () {
    clearError(pair[0], pair[1]);
  });
});