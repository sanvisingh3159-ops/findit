const STORAGE_KEY = "finditItems";

// Get all saved items (returns an empty list if nothing saved yet)
function getItems() {
  return JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
}

// Save one new item at the start of the list. Returns true if saved, false if storage is full
function saveItem(item) {
  try {
    const items = getItems();
    items.unshift(item);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    return true;
  } catch (error) {
    return false;
  }
}

// Make a unique id for a new item
function generateId() {
  return "item_" + Date.now();
}

// Turn an uploaded image file into a small compressed text string (base64) that localStorage can hold
function imageToBase64(file, callback) {
  const reader = new FileReader();
  reader.onload = function (e) {
    const img = new Image();
    img.onload = function () {
      const scale = Math.min(1, 600 / img.width);
      const canvas = document.createElement("canvas");
      canvas.width = img.width * scale;
      canvas.height = img.height * scale;
      canvas.getContext("2d").drawImage(img, 0, 0, canvas.width, canvas.height);
      callback(canvas.toDataURL("image/jpeg", 0.7));
    };
    img.src = e.target.result;
  };
  reader.readAsDataURL(file);
}