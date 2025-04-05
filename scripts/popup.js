document.addEventListener("DOMContentLoaded", async () => {
  const makeMeGreatBtn = document.getElementById("make-me-great");
  const addCustomTextBtn = document.getElementById("add-custom-text");
  const customTextInput = document.getElementById("custom-text-input");
  const confirmTextBtn = document.getElementById("confirm-text");
  const cancelTextBtn = document.getElementById("cancel-text");
  const errorMessage = document.getElementById("error-message");
  const resetButton = document.getElementById("reset-button");

  // Initially hide input, confirm button, and error message
  customTextInput.style.display = "none";
  confirmTextBtn.style.display = "none";
  errorMessage.style.display = "none";
  cancelTextBtn.style.display = "none";

  // Retrieve stored state (but check if the page is still active)
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

  chrome.storage.session.get(["buttonsDisabled"], (result) => {
    const buttonsDisabled = result.buttonsDisabled || false;
    makeMeGreatBtn.disabled = buttonsDisabled;
    addCustomTextBtn.disabled = buttonsDisabled;
  });

  // Listen for reset message from background.js
  chrome.runtime.onMessage.addListener((message) => {
    if (message.type === "RESET_BUTTONS") {
      makeMeGreatBtn.disabled = false;
      addCustomTextBtn.disabled = false;
    }
  });

  // "Make Me Great" button
  makeMeGreatBtn.addEventListener("click", async () => {
    if (tab.url.startsWith("https://github.com/")) {
      await chrome.scripting.executeScript({
        target: { tabId: tab.id },
        files: ["scripts/content.js"],
      });
    }
    makeMeGreatBtn.disabled = true;
    addCustomTextBtn.disabled = true;
    chrome.storage.session.set({ buttonsDisabled: true });

    chrome.action.setIcon({ path: "../images/icon-48.png" });
  });

  // "Add Custom Text" button
  addCustomTextBtn.addEventListener("click", () => {
    checkVisibility();
  });

  cancelTextBtn.addEventListener("click", () => {
    checkVisibility();
  });

  function checkVisibility() {
    const isVisible = customTextInput.style.display === "block";
    customTextInput.style.display = isVisible ? "none" : "block";
    confirmTextBtn.style.display = isVisible ? "none" : "block";
    makeMeGreatBtn.style.display = !isVisible ? "none" : "block";
    addCustomTextBtn.style.display = !isVisible ? "none" : "block";
    cancelTextBtn.style.display = isVisible ? "none" : "block";
    resetButton.style.display = !isVisible ? "none" : "block";
    customTextInput.focus();
    errorMessage.style.display = "none";
  }

  // "Confirm" button
  const confirmText = async () => {
    const text = customTextInput.value.trim();
    if (text.length > 0 && text.length <= 11) {
      errorMessage.style.display = "none";

      // Ensure content.js is injected before sending the message
      await chrome.scripting.executeScript({
        target: { tabId: tab.id },
        files: ["scripts/content.js"],
      });

      // Send the message AFTER injection
      chrome.tabs.sendMessage(tab.id, { type: "CUSTOM_TEXT", payload: text });

      makeMeGreatBtn.disabled = true;
      addCustomTextBtn.disabled = true;
      chrome.storage.session.set({ buttonsDisabled: true });

      checkVisibility();
      customTextInput.value = "";

      chrome.action.setIcon({ path: "../images/icon-48.png" });
    } else {
      errorMessage.innerText = "Text must be between 1 and 10 characters!";
      errorMessage.style.display = "block";
      errorMessage.style.color = "red";
    }
  };

  confirmTextBtn.addEventListener("click", confirmText);
  customTextInput.addEventListener("keydown", (event) => {
    if (event.key === "Enter") confirmText();
  });

  // "Back To Normal" button
  resetButton.addEventListener("click", async () => {
    makeMeGreatBtn.disabled = false;
    addCustomTextBtn.disabled = false;

    chrome.storage.session.clear();
    await chrome.scripting.executeScript({
      target: { tabId: tab.id },
      func: () => window.location.reload(),
    });

    chrome.action.setIcon({ path: "../images/icon-48-n.png" });
  });

  // Listen for a message from content.js to reset storage when the page refreshes
  chrome.runtime.onMessage.addListener((message) => {
    if (message.type === "RESET_BUTTONS") {
      makeMeGreatBtn.disabled = false;
      addCustomTextBtn.disabled = false;
    }
  });
});
