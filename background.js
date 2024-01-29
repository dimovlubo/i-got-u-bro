
chrome.runtime.onInstalled.addListener(() => {
  chrome.action.setBadgeText({
    text: 'BETA'
  });
});

const gitHubURL = 'https://github.com/';

let isSwitchedOn = true;

chrome.action.onClicked.addListener(async (tab) => {
  if (tab.url.startsWith(gitHubURL)) {

    if (isSwitchedOn) {
      isSwitchedOn = false;

      await chrome.scripting.executeScript({
        files: ['scripts/content.js'],
        target: { tabId: tab.id },
      });

      await chrome.action.setIcon({
        tabId: tab.id,
        path: 'images/icon-48.png'
      })
      
    } else {
      isSwitchedOn = true;

      await chrome.action.setIcon({
        tabId: tab.id,
        path: 'images/icon-48-n.png'
      })

      await chrome.scripting.executeScript({
        target: { tabId: tab.id },
        func: reloadWindow
      })
    }
  }
});
function reloadWindow() {
  window.location.reload();
}