document.addEventListener("DOMContentLoaded", async () => {
  const makeMeGreatBtn = document.getElementById("make-me-great");
  const addCustomTextBtn = document.getElementById("add-custom-text");
  const customTextInput = document.getElementById("custom-text-input");
  const confirmTextBtn = document.getElementById("confirm-text");
  const cancelTextBtn = document.getElementById("cancel-text");
  const errorMessage = document.getElementById("error-message");
  const resetButton = document.getElementById("reset-button");
  const scrollingCheckbox = document.getElementById("scrolling-mode");
  const speedSlider = document.getElementById("scroll-speed");
  const scrollingLabel = document.getElementById("scrolling-label");
  const speedLabel = document.getElementById("speed-label");

  // Initially hide input, confirm button, and error message
  customTextInput.style.display = "none";
  confirmTextBtn.style.display = "none";
  errorMessage.style.display = "none";
  cancelTextBtn.style.display = "none";
  speedLabel.style.display = "none";
  scrollingLabel.style.display = "none";

  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

  if (!tab || !tab.id) {
    makeMeGreatBtn.disabled = true;
    addCustomTextBtn.disabled = true;
    makeMeGreatBtn.title = addCustomTextBtn.title = "Open a GitHub tab first";
  } else {
    chrome.storage.session.get(["buttonsDisabled"], (result) => {
      const buttonsDisabled = result.buttonsDisabled || false;
      makeMeGreatBtn.disabled = buttonsDisabled;
      addCustomTextBtn.disabled = buttonsDisabled;
    });
  }

  // Listen for reset message from background.js
  chrome.runtime.onMessage.addListener((message) => {
    if (message.type === "RESET_BUTTONS") {
      makeMeGreatBtn.disabled = false;
      addCustomTextBtn.disabled = false;
    }
  });

  // "Make Me Great" button
  makeMeGreatBtn.addEventListener("click", async () => {
    if (!tab?.id || !tab?.url?.startsWith("https://github.com/")) return;
    try {
      await chrome.scripting.executeScript({
        target: { tabId: tab.id },
        files: ["scripts/content.js"],
      });
    } catch (e) {
      console.error("Extension failed to run on this tab:", e);
      return;
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
    scrollingLabel.style.display = isVisible ? "none" : "flex";
    speedLabel.style.display = isVisible ? "none" : "block";
    customTextInput.focus();
    errorMessage.style.display = "none";
    scrollingCheckbox.checked = !isVisible;
  }

  // "Confirm" button
  const confirmText = async () => {
    const text = customTextInput.value.trim();
    const isScrolling = scrollingCheckbox.checked;
    const rawSpeed = parseInt(speedSlider.value, 10);
    const speed = 500 - rawSpeed;

    if (text.length > 0 && text.length <= 280) {
      if (!tab?.id || !tab?.url?.startsWith("https://github.com/")) {
        errorMessage.innerText = "Open a GitHub profile tab first.";
        errorMessage.style.display = "block";
        errorMessage.style.color = "red";
        return;
      }
      errorMessage.style.display = "none";

      try {
        await chrome.scripting.executeScript({
          target: { tabId: tab.id },
          files: ["scripts/content.js"],
        });
        chrome.tabs.sendMessage(tab.id, {
          type: "CUSTOM_TEXT",
          payload: { text, isScrolling, speed },
        });
      } catch (e) {
        errorMessage.innerText = "Reload the GitHub page and try again.";
        errorMessage.style.display = "block";
        errorMessage.style.color = "red";
        return;
      }

      makeMeGreatBtn.disabled = true;
      addCustomTextBtn.disabled = true;
      chrome.storage.session.set({ buttonsDisabled: true });
      checkVisibility();
      customTextInput.value = "";
      chrome.action.setIcon({ path: "../images/icon-48.png" });
    } else {
      errorMessage.innerText = "Text must be between 1 and 280 characters!";
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
    if (tab?.id) {
      try {
        await chrome.scripting.executeScript({
          target: { tabId: tab.id },
          func: () => window.location.reload(),
        });
      } catch (_) {}
    }
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
