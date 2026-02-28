chrome.runtime.onInstalled.addListener(() => {
  chrome.action.setBadgeText({
    text: "BETA",
  });
});

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (!message || !message.type) return;

  if (message.type === "PAGE_RELOADED") {
    chrome.storage.session.clear(() => {
      console.log("Session storage cleared.");
      chrome.storage.session.set({ buttonsDisabled: false });
      chrome.runtime.sendMessage({ type: "RESET_BUTTONS" }).catch((err) => {
        if (err.message.includes("Could not establish connection")) {
          // Popup is not open — it's safe to ignore
          console.warn("Popup not open. Skipping RESET_BUTTONS message.");
        } else {
          console.error(err);
        }
      });
    });
  }
});
