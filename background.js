async function bonusCollect() {
  chrome.tabs.create({ url: 'https://loliland.ru/ru/cabinet/bonus', active: false }, (tab) => {
    setTimeout(() => {
      chrome.scripting.executeScript({
        target: { tabId: tab.id },
        func: () => {
          const btn = document.querySelector('.button-p.button-p_size_medium.button-p_width_auto');
          if (btn) btn.click();
        }
      }).then(() => {
        chrome.tabs.remove(tab.id);

        console.log('Complete!')
      });
    }, 3000);
  });
}

async function runDailyTask() {
  await chrome.storage.local.set({ lastRunTimestamp: Date.now() });

  console.log("Opening...");
  await bonusCollect();

  chrome.alarms.create("dailyTask", {
    delayInMinutes: 24 * 60
  });
}

chrome.runtime.onStartup.addListener(() => {
  chrome.storage.local.get("lastRunTimestamp", ({ lastRunTimestamp }) => {
    const now = Date.now();
    const elapsedMinutes = (now - (lastRunTimestamp || 0)) / 1000 / 60;

    if (elapsedMinutes >= 24 * 60) {
      runDailyTask();
    } else {
      chrome.alarms.create("dailyTask", {
        delayInMinutes: (24 * 60) - elapsedMinutes
      });
    }
  });
});

chrome.runtime.onInstalled.addListener(() => {
  chrome.storage.local.get("lastRunTimestamp", ({ lastRunTimestamp }) => {
    const now = Date.now();
    const elapsedMinutes = (now - (lastRunTimestamp || 0)) / 1000 / 60;

    if (elapsedMinutes >= 24 * 60) {
      runDailyTask();
    } else {
      chrome.alarms.create("dailyTask", {
        delayInMinutes: (24 * 60) - elapsedMinutes
      });
    }
  });
});

chrome.alarms.onAlarm.addListener((alarm) => {
  if (alarm.name === "dailyTask") {
    runDailyTask();
  }
});