(() => {
  console.log("Content script loaded");
  // Detect when the page refreshes and reset button states
  window.addEventListener("load", () => {
    chrome.runtime.sendMessage({ type: "PAGE_RELOADED" });
  });

  chrome.runtime.onMessage.addListener(function (request) {
    if (request.type === "CUSTOM_TEXT") {
      const payload = request.payload;
      if (!payload || typeof payload.text !== "string") return;
      const text = payload.text.trim();
      if (!text.length) return;
      const textArr = text.toUpperCase().split("").map(String);
      const isScrolling = Boolean(payload.isScrolling);
      const speed =
        typeof payload.speed === "number" && payload.speed > 0
          ? payload.speed
          : 200;

      if (isScrolling) {
        startMarquee(textArr, speed);
      } else {
        createAdvancedGrid(textArr);
      }
      loadModifications();
    }
  });

  createBasicGrid();
  loadModifications();

  let marqueeInterval;

  function startMarquee(text, speed = 200) {
    if (marqueeInterval) clearInterval(marqueeInterval);
    if (!text || text.length === 0) return;

    const mappedLetters = text.map((letter, index) => {
      if (index === text.length - 1) {
        return getLetter(letter);
      } else if (index === 0) {
        return addZeroColumn(getLetter(letter), true, true);
      }
      return addZeroColumn(getLetter(letter), true);
    });

    const baseMatrix = transformNestedToMatrix(mappedLetters);
    if (!baseMatrix.length || !baseMatrix[0] || !baseMatrix[0].length) return;
    const ROWS = baseMatrix.length;
    const COLS = baseMatrix[0].length;
    const VIEWPORT_COLS = getTotalGridCols();
    if (VIEWPORT_COLS <= 0) return;

    let offset = 0;

    marqueeInterval = setInterval(() => {
      const slicedMatrix = createMatrixByNum(ROWS, VIEWPORT_COLS);

      for (let row = 0; row < ROWS; row++) {
        for (let col = 0; col < VIEWPORT_COLS; col++) {
          const srcCol = (offset + col) % COLS;
          slicedMatrix[row][col] = baseMatrix[row][srcCol];
        }
      }

      updateCalendar(slicedMatrix);
      offset = (offset + 1) % COLS;
    }, speed);
  }

  function updateCalendar(matrix) {
    const calendarDays = document.querySelectorAll(
      "tbody .ContributionCalendar-day",
    );
    if (!calendarDays.length) return;

    calendarDays.forEach((calendarDay) => {
      const [row, col] = calendarDay.id.split("-").slice(-2).map(Number);
      const rawValue = matrix[row]?.[col] ?? 0;
      const level = getRandomInt(rawValue, 3);

      const tooltipId = calendarDay.getAttribute("aria-labelledby");

      try {
        setTooltip(tooltipId, level);
      } catch (err) {
        console.warn("Tooltip error:", err);
      }

      calendarDay.setAttribute("data-level", level);
    });
  }

  function createAdvancedGrid(text) {
    if (!text || text.length === 0) return;
    const mappedLetters = text.map((letter, index) => {
      if (index === text.length - 1) {
        return getLetter(letter);
      }
      return addZeroColumn(getLetter(letter), true);
    });

    let lettersMatrix = transformNestedToMatrix(mappedLetters);
    if (!lettersMatrix.length || !lettersMatrix[0] || !lettersMatrix[0].length)
      return;

    const totalGridCols = getTotalGridCols();
    const textWidth = lettersMatrix[0].length;
    const offset = Math.floor((totalGridCols - textWidth) / 2);
    const endPadding = totalGridCols - (textWidth + offset);

    const emptyCol = Array(lettersMatrix.length).fill(0);

    lettersMatrix = lettersMatrix[0].map((_, colIndex) =>
      lettersMatrix.map((row) => row[colIndex]),
    );

    const leftPadding = Array.from({ length: offset }, () => emptyCol);

    const rightPadding = Array.from({ length: endPadding }, () => emptyCol);

    lettersMatrix = [...leftPadding, ...lettersMatrix, ...rightPadding];

    lettersMatrix = lettersMatrix[0].map((_, colIndex) =>
      lettersMatrix.map((row) => row[colIndex]),
    );

    const calendarDays = document.querySelectorAll(
      "tbody .ContributionCalendar-day",
    );

    if (calendarDays.length > 0) {
      calendarDays.forEach((calendarDay) => {
        const getDayCoordinates = calendarDay.id.split("-").slice(-2);
        const row = +getDayCoordinates[0];
        const col = +getDayCoordinates[1];
        const randomNum = getRandomInt(lettersMatrix[row][col], 3);

        const tooltipId = calendarDay.getAttribute("aria-labelledby");
        setTooltip(tooltipId, randomNum);

        calendarDay.setAttribute("data-level", randomNum);
      });
    }
  }
  function createBasicGrid() {
    const calendarDays = document.querySelectorAll(
      "tbody .ContributionCalendar-day",
    );

    if (calendarDays.length > 0) {
      calendarDays.forEach((calendarDay) => {
        const randomNum = getRandomInt(5);
        const tooltipId = calendarDay.getAttribute("aria-labelledby");
        setTooltip(tooltipId, randomNum);

        calendarDay.setAttribute("data-level", randomNum);
      });
    }
  }
  function createRepositoriesCounters() {
    const repositoriesCounters = document.querySelectorAll(".Counter");
    if (repositoriesCounters.length > 0) {
      repositoriesCounters.forEach((counter) => {
        counter.textContent = getRandomInt(180, 60);
      });
    }
  }
  function createPopularRepositories() {
    const popularRepositories = document.querySelector(
      ".js-pinned-items-reorder-container",
    );

    if (popularRepositories) {
      const blankContainer = popularRepositories.querySelector(
        ".blankslate-container",
      );

      if (blankContainer) {
        blankContainer.innerHTML = "";
        popularRepositories.append(
          createDomElement(
            '<ol class="d-flex flex-wrap list-style-none gutter-condensed mb-4"></ol>',
          ),
        );
      }
      const popularRepositoriesList = popularRepositories.querySelector("ol");
      let popularReposLength = popularRepositoriesList.children.length;

      if (popularReposLength < 6) {
        for (let repo = 0; repo < 6 - popularReposLength; repo++) {
          const language = getRandomLanguage();
          popularRepositoriesList.append(
            createDomElement(
              getSingleRepository({
                name: getRandomRepoName(),
                description: getRandomDescription(),
                language: language,
                languageColor: languageMap()[language],
                forks: `${getRandomInt(1, 4)}.${getRandomInt(9)}k`,
                stars: `${getRandomInt(1, 4)}.${getRandomInt(9)}k`,
              }),
            ),
          );
        }
      }
    }
  }
  function createProfileFollowers() {
    const profileFollowers = document.querySelector(
      ".js-profile-editable-area a.Link--secondary span",
    );
    if (profileFollowers) {
      profileFollowers.innerText = `${getRandomInt(4, 1)}.${getRandomInt(9)}k`;
    }
  }
  function createProfileContainer() {
    const profileContainer = document.querySelector(
      ".js-profile-editable-replace",
    );

    if (!profileContainer) return;

    const userInfoSection = profileContainer.querySelector(
      ".js-profile-editable-area",
    );
    if (!userInfoSection) return;

    const blockOrReportBtn = profileContainer.querySelector(
      "button[id^='dialog-show-dialog'].Button",
    );
    if (!blockOrReportBtn) return;

    const userInfoSectionParent = userInfoSection.parentNode;
    const userInfoSectionIndex = Array.from(profileContainer.children).indexOf(
      userInfoSectionParent,
    );

    const preservedTail = document.createDocumentFragment();

    for (let i = 0; i <= userInfoSectionIndex; i++) {
      const child = profileContainer.children[i];
      if (child) preservedTail.appendChild(child.cloneNode(true));
    }

    const highlightsEl = createDomElement(getHighlightsHtml());
    const achievementsEl = createDomElement(getAchievementHTML());

    preservedTail.appendChild(achievementsEl);
    preservedTail.appendChild(highlightsEl);
    preservedTail.appendChild(blockOrReportBtn);

    profileContainer.innerHTML = "";
    profileContainer.appendChild(preservedTail);
  }
  function createContributionPerYear() {
    const contributionsPerYear = document.querySelector(
      ".js-yearly-contributions h2",
    );
    if (contributionsPerYear) {
      contributionsPerYear.innerText = `${getRandomInt(
        1300,
        30,
      )} contributions in the last year`;
    }
  }
  function createContibuitonActivityList() {
    const contributionsActivityList = document.querySelector(
      "ul.filter-list.small",
    );
    if (contributionsActivityList) {
      const yearsActivity = contributionsActivityList.children.length;
      const currentYear = new Date().getFullYear();
      const yearDiff = currentYear - yearsActivity;

      const randomYear = getRandomInt(10, 3);

      if (yearDiff > currentYear - randomYear) {
        for (let i = 0; i < randomYear; i++) {
          contributionsActivityList.append(
            createDomElement(getYearElement(yearDiff - i)),
          );
        }
      }
    }
  }
  function createContributionListing() {
    const contributionActivityListing = document.querySelector(
      ".contribution-activity-listing",
    );
    if (contributionActivityListing) {
      contributionActivityListing.innerHTML = "";
    }
    contributionActivityListing?.append(
      createDomElement(
        getActivityListing({
          currentMonth: new Date().toLocaleDateString("default", {
            month: "long",
          }),
          currentYear: new Date().getFullYear(),
          numContributions: getRandomInt(240),
          currentMonthShort: new Date().toLocaleDateString("default", {
            month: "short",
          }),
          dayOfTheMonth: new Date().getDate(),
        }),
      ),
    );
  }
  function loadModifications() {
    createRepositoriesCounters();
    createPopularRepositories();
    createProfileFollowers();
    createProfileContainer();
    createContributionPerYear();
    createContibuitonActivityList();
    createContributionListing();
  }
  function getTotalGridCols() {
    const calendarDays = document.querySelectorAll(
      "tbody .ContributionCalendar-day",
    );
    if (!calendarDays.length) return 0;
    const maxCol = Math.max(
      ...Array.from(calendarDays).map((day) => {
        const parts = day.id ? day.id.split("-") : [];
        return parseInt(parts[parts.length - 1], 10) || 0;
      }),
    );
    return Number.isFinite(maxCol) && maxCol >= 0 ? maxCol + 1 : 0;
  }
})();

function createDomElement(html) {
  const dom = new DOMParser().parseFromString(html, "text/html");
  return dom.body.firstElementChild;
}

function getRandomInt(max, min = 0) {
  if (min >= max) return getRandomInt(2);
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min) + min);
}

function getAchievementHTML() {
  const achievements = [
    `<a href="#" class="position-relative"
    ><img
      src="${getImageUrl("badges/pull-shark-default.png")}"
      data-hovercard-type="achievement"
      width="64"
      alt="Achievement: Pull Shark"
      data-view-component="true"
      class="achievement-badge-sidebar"
    /><span
      data-view-component="true"
      class="Label achievement-tier-label achievement-tier-label--gold text-small text-bold color-shadow-medium px-2 py-0 mb-1 position-absolute right-0 bottom-0"
      >x${getRandomInt(4, 1)}</span
    ></a
  >`,
    `<a href="#" class="position-relative"
  ><img
    src="${getImageUrl("badges/yolo-default.png")}"
    data-hovercard-type="achievement"
    width="64"
    alt="Achievement: YOLO"
    data-view-component="true"
    class="achievement-badge-sidebar" /></a
>`,
    `<a href="#" class="position-relative"
><img
  src="${getImageUrl("badges/quickdraw-default.png")}"
  data-hovercard-type="achievement"
  width="64"
  alt="Achievement: Quickdraw"
  data-view-component="true"
  class="achievement-badge-sidebar" /></a
>`,
    `<a href="#" class="position-relative"
><img
  src="${getImageUrl("badges/starstruck-default.png")}"
  data-hovercard-type="achievement"
  width="64"
  alt="Achievement: Starstruck"
  data-view-component="true"
  class="achievement-badge-sidebar"
/><span
  data-view-component="true"
  class="Label achievement-tier-label achievement-tier-label--bronze text-small text-bold color-shadow-medium px-2 py-0 mb-1 position-absolute right-0 bottom-0"
  >x${getRandomInt(4, 1)}</span
></a
>`,
    `<a href="#" class="position-relative"
><img
  src="${getImageUrl("badges/pair-extraordinaire-default.png")}"
  data-hovercard-type="achievement"
  width="64"
  alt="Achievement: Pair Extraordinaire"
  data-view-component="true"
  class="achievement-badge-sidebar"
/><span
  data-view-component="true"
  class="Label achievement-tier-label achievement-tier-label--silver text-small text-bold color-shadow-medium px-2 py-0 mb-1 position-absolute right-0 bottom-0"
  >x${getRandomInt(4, 1)}</span
></a
>`,
    `<a href="#" class="position-relative"
><img
  src="${getImageUrl("badges/public-sponsor-default.png")}"
  data-hovercard-type="achievement"
  width="64"
  alt="Achievement: Public Sponsor"
  data-view-component="true"
  class="achievement-badge-sidebar" /></a
>`,
    `<a href="#" class="position-relative"
><img
  src="${getImageUrl("badges/mars-2020-contributor-default.png")}"
  data-hovercard-type="achievement"
  width="64"
  alt="Achievement: Mars 2020 Contributor"
  data-view-component="true"
  class="achievement-badge-sidebar" /></a
>`,
    `<a href="#" class="position-relative"
><img
  src="${getImageUrl("badges/arctic-code-vault-contributor-default.png")}"
  data-hovercard-type="achievement"
  width="64"
  alt="Achievement: Arctic Code Vault Contributor"
  data-view-component="true"
  class="achievement-badge-sidebar"
/></a>`,
  ];

  return `
  <div class="border-top color-border-muted pt-3 mt-3 d-none d-md-block">
  <h2 class="h4 mb-2">
    <a href="#" class="Link--primary mb-2">Achievements</a>
  </h2>
  <div class="d-flex flex-wrap">
  ${achievements.slice(0, getRandomInt(achievements.length, 1)).join("\n")}
  </div>
</div>
  `;
}

function getSingleRepository({
  name,
  description,
  language,
  languageColor,
  stars,
  forks,
}) {
  return `
  <li class="mb-3 d-flex flex-content-stretch col-12 col-md-6 col-lg-6">
  <div class="Box pinned-item-list-item d-flex p-3 width-full public source">
    <div class="pinned-item-list-item-content">
      <div class="d-flex width-full flex-items-center">
        <span data-view-component="true" class="position-relative"
          ><a
            href="#"
            data-view-component="true"
            class="min-width-0 Link text-bold flex-auto"
          >
            <span class="repo"> ${name} </span> </a
          ><tool-tip
            popover="manual"
            data-direction="s"
            data-type="description"
            data-view-component="true"
            class="position-absolute sr-only"
            role="tooltip"
            style="
              --tool-tip-position-top: 248.75px;
              --tool-tip-position-left: 423.328125px;
            "
            >${name}</tool-tip
          ></span
        >
        <span class="flex-auto text-right">
          <span></span
          ><span class="Label Label--secondary v-align-middle">Public</span>
        </span>
      </div>

      <p class="pinned-item-desc color-fg-muted text-small d-block mt-2 mb-3">
        ${description}
      </p>

      <p class="mb-0 f6 color-fg-muted">
        <span class="d-inline-block mr-3">
          <span
            class="repo-language-color"
            style="background-color: ${languageColor}"
          ></span>
          <span itemprop="programmingLanguage">${language}</span>
        </span>

        <a
          href="#"
          class="pinned-item-meta Link--muted"
        >
          <svg
            aria-label="stars"
            role="img"
            height="16"
            viewBox="0 0 16 16"
            version="1.1"
            width="16"
            data-view-component="true"
            class="octicon octicon-star"
          >
            <path
              d="M8 .25a.75.75 0 0 1 .673.418l1.882 3.815 4.21.612a.75.75 0 0 1 .416 1.279l-3.046 2.97.719 4.192a.751.751 0 0 1-1.088.791L8 12.347l-3.766 1.98a.75.75 0 0 1-1.088-.79l.72-4.194L.818 6.374a.75.75 0 0 1 .416-1.28l4.21-.611L7.327.668A.75.75 0 0 1 8 .25Zm0 2.445L6.615 5.5a.75.75 0 0 1-.564.41l-3.097.45 2.24 2.184a.75.75 0 0 1 .216.664l-.528 3.084 2.769-1.456a.75.75 0 0 1 .698 0l2.77 1.456-.53-3.084a.75.75 0 0 1 .216-.664l2.24-2.183-3.096-.45a.75.75 0 0 1-.564-.41L8 2.694Z"
            ></path>
          </svg>
          ${stars}
        </a>
        <a
          href="#"
          class="pinned-item-meta Link--muted"
        >
          <svg
            aria-label="forks"
            role="img"
            height="16"
            viewBox="0 0 16 16"
            version="1.1"
            width="16"
            data-view-component="true"
            class="octicon octicon-repo-forked"
          >
            <path
              d="M5 5.372v.878c0 .414.336.75.75.75h4.5a.75.75 0 0 0 .75-.75v-.878a2.25 2.25 0 1 1 1.5 0v.878a2.25 2.25 0 0 1-2.25 2.25h-1.5v2.128a2.251 2.251 0 1 1-1.5 0V8.5h-1.5A2.25 2.25 0 0 1 3.5 6.25v-.878a2.25 2.25 0 1 1 1.5 0ZM5 3.25a.75.75 0 1 0-1.5 0 .75.75 0 0 0 1.5 0Zm6.75.75a.75.75 0 1 0 0-1.5.75.75 0 0 0 0 1.5Zm-3 8.75a.75.75 0 1 0-1.5 0 .75.75 0 0 0 1.5 0Z"
            ></path>
          </svg>
          ${forks}
        </a>
      </p>
    </div>
  </div>
</li>
  `;
}

function getRandomRepoName() {
  const names = [
    "apple",
    "microsoft",
    "google",
    "amazon",
    "meta",
    "tesla",
    "samsung",
    "netfilx",
    "adobe",
    "sap",
    "uber",
    "airbnb",
    "paypal",
    "spotify",
  ];
  const serviceNames = [
    "server",
    "app",
    "system",
    "interview",
    "test",
    "roadmap",
    "apis",
    "algorithms",
    "old",
    "ai",
    "ml",
  ];

  return `${names[getRandomInt(names.length)]}-${
    serviceNames[getRandomInt(serviceNames.length)]
  }`;
}

function getRandomDescription() {
  const description = [
    "A set of utility scripts for common development tasks.",
    "An interactive web application for data visualization trends.",
    "A lightweight framework for modern and elegant websites.",
    "Machine learning algorithms implemented for education.",
    "A collaborative project management tool for streamlined workflows.",
    "Comprehensive code snippets for enhanced productivity.",
    "Open-source app for tracking goals.",
    "Minimalistic template with customizable functionality.",
    "Collection of design patterns for scalable software.",
    "Plugin for extending development tools.",
  ];
  return description[getRandomInt(description.length)];
}

function getRandomLanguage() {
  const languages = [
    "HTML",
    "JavaScript",
    "TypeScript",
    "CSS",
    "Python",
    "Go",
    "PHP",
    "C++",
    "Java",
  ];

  return languages[getRandomInt(languages.length)];
}

function languageMap() {
  return {
    HTML: "#e34c26",
    JavaScript: "#f1e05a",
    TypeScript: "#3178c6",
    CSS: "#563d7c",
    Python: "#3572A5",
    Go: "#00ADD8",
    PHP: "#4F5D95",
    "C++": "#f34b7d",
    Java: "#b07219",
  };
}

function getYearElement(year) {
  return `
  <li>
  <a
    id="year-link-${year}"
    class="js-year-link filter-item px-3 mb-2 py-2"
    aria-label="Contribution activity in ${year}"
    data-turbo="false"
    href="#"
    >${year}</a
  >
</li>

  `;
}

function getActivityListing({
  currentMonth,
  currentYear,
  numContributions,
  currentMonthShort,
  dayOfTheMonth,
}) {
  return `
  <div class="width-full pb-4">
  <h3 class="h6 pr-2 py-1 border-bottom mb-3" style="height: 14px">
    <span class="color-bg-default pl-2 pr-3" data-sr-feedback="" tabindex="0"
      >${currentMonth}
      <span class="color-fg-muted">${currentYear}</span></span
    >
  </h3>

  <div data-view-component="true" class="TimelineItem">
    <div data-view-component="true" class="TimelineItem-badge">
      <svg
        aria-hidden="true"
        height="16"
        viewBox="0 0 16 16"
        version="1.1"
        width="16"
        data-view-component="true"
        class="octicon octicon-lock"
      >
        <path
          d="M4 4a4 4 0 0 1 8 0v2h.25c.966 0 1.75.784 1.75 1.75v5.5A1.75 1.75 0 0 1 12.25 15h-8.5A1.75 1.75 0 0 1 2 13.25v-5.5C2 6.784 2.784 6 3.75 6H4Zm8.25 3.5h-8.5a.25.25 0 0 0-.25.25v5.5c0 .138.112.25.25.25h8.5a.25.25 0 0 0 .25-.25v-5.5a.25.25 0 0 0-.25-.25ZM10.5 6V4a2.5 2.5 0 1 0-5 0v2Z"
        ></path>
      </svg>
    </div>
    <div data-view-component="true" class="TimelineItem-body">
      <span class="f4 lh-condensed m-0 color-fg-muted">
        ${numContributions} contributions in private repositories
      </span>
      <span class="float-right f6 color-fg-muted pt-1">
        ${currentMonthShort} ${dayOfTheMonth}
      </span>
    </div>
  </div>
</div>

  `;
}

function getHighlightsHtml() {
  return `
  <div class="border-top color-border-muted pt-3 mt-3 d-none d-md-block"><h2 class="h4 mb-2">Highlights</h2><ul class="list-style-none"><li class="mt-2">
    <svg aria-hidden="true" height="16" viewBox="0 0 16 16" version="1.1" width="16" data-view-component="true" class="octicon octicon-star color-fg-muted">
    <path d="M8 .25a.75.75 0 0 1 .673.418l1.882 3.815 4.21.612a.75.75 0 0 1 .416 1.279l-3.046 2.97.719 4.192a.751.751 0 0 1-1.088.791L8 12.347l-3.766 1.98a.75.75 0 0 1-1.088-.79l.72-4.194L.818 6.374a.75.75 0 0 1 .416-1.28l4.21-.611L7.327.668A.75.75 0 0 1 8 .25Zm0 2.445L6.615 5.5a.75.75 0 0 1-.564.41l-3.097.45 2.24 2.184a.75.75 0 0 1 .216.664l-.528 3.084 2.769-1.456a.75.75 0 0 1 .698 0l2.77 1.456-.53-3.084a.75.75 0 0 1 .216-.664l2.24-2.183-3.096-.45a.75.75 0 0 1-.564-.41L8 2.694Z"></path>
</svg>
<span title="Label: Pro" data-view-component="true" class="Label Label--purple text-uppercase">
  Pro
</span>
</li>
</ul></div>
  `;
}

function getImageUrl(url) {
  return chrome.runtime.getURL(url);
}
function getContributionsNum(num) {
  const contributionMap = {
    0: { min: 0, max: 0 },
    1: { min: 1, max: 2 },
    2: { min: 3, max: 5 },
    3: { min: 6, max: 9 },
    4: { min: 10, max: 100 },
  };
  const range = contributionMap[Number(num)];
  if (
    !range ||
    typeof range.min !== "number" ||
    typeof range.max !== "number"
  ) {
    return 0;
  }
  return getRandomInt(range.max, range.min);
}
function setTooltip(tooltipId, randomNum) {
  if (!tooltipId) return;
  const tooltip = document.getElementById(tooltipId);
  if (!tooltip) return;
  let tooltipContributionNumToText = getContributionsNum(randomNum);
  if (tooltipContributionNumToText === 0) {
    tooltipContributionNumToText = "No contribution";
  } else if (tooltipContributionNumToText === 1) {
    tooltipContributionNumToText = "1 contribution";
  } else {
    tooltipContributionNumToText = `${tooltipContributionNumToText} contributions`;
  }
  const toolTipTextArr = (tooltip.innerText || "").split(" on ");
  const datePart =
    toolTipTextArr.length > 0 ? toolTipTextArr[toolTipTextArr.length - 1] : "";
  tooltip.innerText = datePart
    ? `${tooltipContributionNumToText} on ${datePart}`
    : tooltipContributionNumToText;
}

function createMatrixByNum(rows, cols, num = 0) {
  return Array.from({ length: rows }, () =>
    Array.from({ length: cols }, () => num),
  );
}
function cloneMatrix(matrix) {
  if (!matrix || !matrix.length) return [];
  return matrix.map((row) => (Array.isArray(row) ? [...row] : []));
}

function addZeroColumn(matrix, push = true, unshift = false) {
  const m = cloneMatrix(matrix);
  if (m.length !== 7) {
    return createMatrixByNum(7, 5);
  }
  for (let i = 0; i < m.length; i++) {
    if (push) m[i].push(0);
    if (unshift) m[i].unshift(0, 0, 0);
  }
  return m;
}
function transformNestedToMatrix(mappedLetters) {
  if (!mappedLetters || !mappedLetters.length || !mappedLetters[0]) {
    return createMatrixByNum(7, 0);
  }
  const lettersTotalLenght = mappedLetters.reduce((acc, currArr) => {
    if (currArr && currArr.length > 0) {
      return acc + (currArr[0]?.length ?? 0);
    }
    return acc;
  }, 0);
  const ROWS = mappedLetters[0].length;
  const COLS = lettersTotalLenght;
  if (COLS <= 0) return createMatrixByNum(ROWS, 0);

  let matrix = createMatrixByNum(ROWS, COLS);
  let colStart = 0;

  for (let group of mappedLetters) {
    if (!group || !group.length) continue;
    for (let row = 0; row < ROWS; row++) {
      if (group[row]) {
        const values = group[row];
        for (let i = 0; i < values.length; i++) {
          if (colStart + i < COLS) {
            matrix[row][colStart + i] = values[i];
          }
        }
      }
    }
    const maxLen = Math.max(0, ...group.map((row) => (row ? row.length : 0)));
    colStart += maxLen;
    if (colStart >= COLS) break;
  }

  return matrix;
}

function getLetter(string) {
  const safeChar =
    typeof string === "string" && string.length > 0 ? string[0] : " ";
  const DEF = createMatrixByNum(7, 5, getRandomInt(5));
  const allLetters = {
    A: [
      [0, 0, 5, 0, 0],
      [0, 5, 0, 5, 0],
      [5, 0, 0, 0, 5],
      [5, 0, 0, 0, 5],
      [5, 5, 5, 5, 5],
      [5, 0, 0, 0, 5],
      [5, 0, 0, 0, 5],
    ],
    B: [
      [5, 5, 5, 5, 0],
      [0, 5, 0, 0, 5],
      [0, 5, 0, 0, 5],
      [0, 5, 5, 5, 0],
      [0, 5, 0, 0, 5],
      [0, 5, 0, 0, 5],
      [5, 5, 5, 5, 0],
    ],
    C: [
      [0, 5, 5, 5, 0],
      [5, 0, 0, 0, 5],
      [5, 0, 0, 0, 0],
      [5, 0, 0, 0, 0],
      [5, 0, 0, 0, 0],
      [5, 0, 0, 0, 5],
      [0, 5, 5, 5, 0],
    ],
    D: [
      [5, 5, 5, 5, 0],
      [0, 5, 0, 0, 5],
      [0, 5, 0, 0, 5],
      [0, 5, 0, 0, 5],
      [0, 5, 0, 0, 5],
      [0, 5, 0, 0, 5],
      [5, 5, 5, 5, 0],
    ],
    E: [
      [5, 5, 5, 5, 5],
      [5, 0, 0, 0, 0],
      [5, 0, 0, 0, 0],
      [5, 5, 5, 5, 0],
      [5, 0, 0, 0, 0],
      [5, 0, 0, 0, 0],
      [5, 5, 5, 5, 5],
    ],
    F: [
      [5, 5, 5, 5, 5],
      [5, 0, 0, 0, 0],
      [5, 0, 0, 0, 0],
      [5, 5, 5, 5, 0],
      [5, 0, 0, 0, 0],
      [5, 0, 0, 0, 0],
      [5, 0, 0, 0, 0],
    ],
    G: [
      [0, 5, 5, 5, 0],
      [5, 0, 0, 0, 5],
      [5, 0, 0, 0, 0],
      [5, 0, 0, 0, 0],
      [5, 0, 0, 5, 5],
      [5, 0, 0, 0, 5],
      [0, 5, 5, 5, 0],
    ],
    H: [
      [5, 0, 0, 0, 5],
      [5, 0, 0, 0, 5],
      [5, 0, 0, 0, 5],
      [5, 5, 5, 5, 5],
      [5, 0, 0, 0, 5],
      [5, 0, 0, 0, 5],
      [5, 0, 0, 0, 5],
    ],
    I: [
      [5, 5, 5],
      [0, 5, 0],
      [0, 5, 0],
      [0, 5, 0],
      [0, 5, 0],
      [0, 5, 0],
      [5, 5, 5],
    ],
    J: [
      [0, 0, 5, 5, 5],
      [0, 0, 0, 5, 0],
      [0, 0, 0, 5, 0],
      [0, 0, 0, 5, 0],
      [0, 0, 0, 5, 0],
      [5, 0, 0, 5, 0],
      [0, 5, 5, 0, 0],
    ],
    K: [
      [5, 0, 0, 0, 5],
      [5, 0, 0, 5, 0],
      [5, 0, 5, 0, 0],
      [5, 5, 0, 0, 0],
      [5, 0, 5, 0, 0],
      [5, 0, 0, 5, 0],
      [5, 0, 0, 0, 5],
    ],
    L: [
      [5, 0, 0, 0, 0],
      [5, 0, 0, 0, 0],
      [5, 0, 0, 0, 0],
      [5, 0, 0, 0, 0],
      [5, 0, 0, 0, 0],
      [5, 0, 0, 0, 0],
      [5, 5, 5, 5, 5],
    ],
    M: [
      [5, 0, 0, 0, 5],
      [5, 0, 0, 0, 5],
      [5, 5, 0, 5, 5],
      [5, 0, 5, 0, 5],
      [5, 0, 0, 0, 5],
      [5, 0, 0, 0, 5],
      [5, 0, 0, 0, 5],
    ],
    N: [
      [5, 0, 0, 0, 5],
      [5, 0, 0, 0, 5],
      [5, 5, 0, 0, 5],
      [5, 0, 5, 0, 5],
      [5, 0, 0, 5, 5],
      [5, 0, 0, 0, 5],
      [5, 0, 0, 0, 5],
    ],
    O: [
      [0, 5, 5, 5, 0],
      [5, 0, 0, 0, 5],
      [5, 0, 0, 0, 5],
      [5, 0, 0, 0, 5],
      [5, 0, 0, 0, 5],
      [5, 0, 0, 0, 5],
      [0, 5, 5, 5, 0],
    ],
    P: [
      [5, 5, 5, 5, 0],
      [5, 0, 0, 0, 5],
      [5, 0, 0, 0, 5],
      [5, 5, 5, 5, 0],
      [5, 0, 0, 0, 0],
      [5, 0, 0, 0, 0],
      [5, 0, 0, 0, 0],
    ],
    Q: [
      [0, 5, 5, 5, 0],
      [5, 0, 0, 0, 5],
      [5, 0, 0, 0, 5],
      [5, 0, 0, 0, 5],
      [5, 5, 0, 0, 5],
      [5, 0, 5, 0, 5],
      [0, 5, 5, 5, 0],
    ],
    R: [
      [5, 5, 5, 5, 0],
      [5, 0, 0, 0, 5],
      [5, 0, 0, 0, 5],
      [5, 5, 5, 5, 0],
      [5, 0, 5, 0, 0],
      [5, 0, 0, 5, 0],
      [5, 0, 0, 0, 5],
    ],
    S: [
      [0, 5, 5, 5, 0],
      [5, 0, 0, 0, 5],
      [5, 0, 0, 0, 0],
      [0, 5, 5, 5, 0],
      [0, 0, 0, 0, 5],
      [5, 0, 0, 0, 5],
      [0, 5, 5, 5, 0],
    ],
    T: [
      [5, 5, 5, 5, 5],
      [0, 0, 5, 0, 0],
      [0, 0, 5, 0, 0],
      [0, 0, 5, 0, 0],
      [0, 0, 5, 0, 0],
      [0, 0, 5, 0, 0],
      [0, 0, 5, 0, 0],
    ],
    U: [
      [5, 0, 0, 0, 5],
      [5, 0, 0, 0, 5],
      [5, 0, 0, 0, 5],
      [5, 0, 0, 0, 5],
      [5, 0, 0, 0, 5],
      [5, 0, 0, 0, 5],
      [0, 5, 5, 5, 0],
    ],
    V: [
      [5, 0, 0, 0, 5],
      [5, 0, 0, 0, 5],
      [5, 0, 0, 0, 5],
      [0, 5, 0, 5, 0],
      [0, 5, 0, 5, 0],
      [0, 5, 0, 5, 0],
      [0, 0, 5, 0, 0],
    ],
    W: [
      [5, 0, 0, 0, 5],
      [5, 0, 0, 0, 5],
      [5, 0, 0, 0, 5],
      [5, 0, 5, 0, 5],
      [5, 0, 5, 0, 5],
      [5, 5, 0, 5, 5],
      [5, 0, 0, 0, 5],
    ],
    X: [
      [5, 0, 0, 0, 5],
      [5, 0, 0, 0, 5],
      [0, 5, 0, 5, 0],
      [0, 0, 5, 0, 0],
      [0, 5, 0, 5, 0],
      [5, 0, 0, 0, 5],
      [5, 0, 0, 0, 5],
    ],
    Y: [
      [5, 0, 0, 0, 5],
      [5, 0, 0, 0, 5],
      [0, 5, 0, 5, 0],
      [0, 0, 5, 0, 0],
      [0, 0, 5, 0, 0],
      [0, 0, 5, 0, 0],
      [0, 0, 5, 0, 0],
    ],
    Z: [
      [5, 5, 5, 5, 5],
      [0, 0, 0, 0, 5],
      [0, 0, 0, 5, 0],
      [0, 0, 5, 0, 0],
      [0, 5, 0, 0, 0],
      [5, 0, 0, 0, 0],
      [5, 5, 5, 5, 5],
    ],
    0: [
      [0, 0, 5, 0, 0],
      [0, 5, 0, 5, 0],
      [5, 0, 0, 0, 5],
      [5, 0, 0, 0, 5],
      [5, 0, 0, 0, 5],
      [0, 5, 0, 5, 0],
      [0, 0, 5, 0, 0],
    ],
    1: [
      [0, 0, 5, 0, 0],
      [0, 5, 5, 0, 0],
      [5, 0, 5, 0, 0],
      [0, 0, 5, 0, 0],
      [0, 0, 5, 0, 0],
      [0, 0, 5, 0, 0],
      [5, 5, 5, 5, 5],
    ],
    2: [
      [0, 5, 5, 5, 0],
      [5, 0, 0, 0, 5],
      [0, 0, 0, 0, 5],
      [0, 0, 5, 5, 0],
      [0, 5, 0, 0, 0],
      [5, 0, 0, 0, 0],
      [5, 5, 5, 5, 5],
    ],
    3: [
      [5, 5, 5, 5, 5],
      [0, 0, 0, 0, 5],
      [0, 0, 0, 5, 0],
      [0, 0, 5, 5, 0],
      [0, 0, 0, 0, 5],
      [5, 0, 0, 0, 5],
      [0, 5, 5, 5, 0],
    ],
    4: [
      [0, 0, 0, 5, 0],
      [0, 0, 5, 5, 0],
      [0, 5, 0, 5, 0],
      [5, 0, 0, 5, 0],
      [5, 5, 5, 5, 5],
      [0, 0, 0, 5, 0],
      [0, 0, 0, 5, 0],
    ],
    5: [
      [5, 5, 5, 5, 5],
      [5, 0, 0, 0, 0],
      [5, 0, 5, 5, 0],
      [5, 5, 0, 0, 5],
      [0, 0, 0, 0, 5],
      [5, 0, 0, 0, 5],
      [0, 5, 5, 5, 0],
    ],
    6: [
      [0, 0, 5, 5, 0],
      [0, 5, 0, 0, 0],
      [5, 0, 0, 0, 0],
      [5, 0, 5, 5, 0],
      [5, 5, 0, 0, 5],
      [5, 0, 0, 0, 5],
      [0, 5, 5, 5, 0],
    ],
    7: [
      [5, 5, 5, 5, 5],
      [0, 0, 0, 0, 5],
      [0, 0, 0, 5, 0],
      [0, 0, 0, 5, 0],
      [0, 0, 5, 0, 0],
      [0, 5, 0, 0, 0],
      [0, 5, 0, 0, 0],
    ],
    8: [
      [0, 5, 5, 5, 0],
      [5, 0, 0, 0, 5],
      [5, 0, 0, 0, 5],
      [0, 5, 5, 5, 0],
      [5, 0, 0, 0, 5],
      [5, 0, 0, 0, 5],
      [0, 5, 5, 5, 0],
    ],
    9: [
      [0, 5, 5, 5, 0],
      [5, 0, 0, 0, 5],
      [5, 0, 0, 5, 5],
      [0, 5, 5, 0, 5],
      [0, 0, 0, 0, 5],
      [0, 0, 0, 5, 0],
      [0, 5, 5, 0, 0],
    ],
    "!": [[5], [5], [5], [5], [5], [0], [5]],
    "?": [
      [0, 5, 5, 5, 0],
      [5, 0, 0, 0, 5],
      [0, 0, 0, 5, 0],
      [0, 0, 5, 0, 0],
      [0, 0, 5, 0, 0],
      [0, 0, 0, 0, 0],
      [0, 0, 5, 0, 0],
    ],
    ".": [
      [0, 0, 0],
      [0, 0, 0],
      [0, 0, 0],
      [0, 0, 0],
      [0, 5, 0],
      [5, 5, 5],
      [0, 5, 0],
    ],
    ",": [
      [0, 0, 0],
      [0, 0, 0],
      [0, 0, 0],
      [0, 0, 0],
      [0, 5, 5],
      [0, 5, 0],
      [5, 0, 0],
    ],
    " ": [[0], [0], [0], [0], [0], [0], [0]],
    ":": [
      [0, 5, 0],
      [5, 5, 5],
      [0, 5, 0],
      [0, 0, 0],
      [0, 5, 0],
      [5, 5, 5],
      [0, 5, 0],
    ],
    ";": [
      [0, 5, 0],
      [5, 5, 5],
      [0, 5, 0],
      [0, 0, 0],
      [0, 5, 5],
      [0, 5, 0],
      [5, 0, 0],
    ],
    $: [
      [0, 0, 5, 0, 0],
      [0, 5, 5, 5, 0],
      [5, 0, 5, 0, 0],
      [0, 5, 5, 5, 0],
      [0, 0, 5, 0, 5],
      [0, 5, 5, 5, 0],
      [0, 0, 5, 0, 0],
    ],
    "#": [
      [0, 5, 0, 5, 0],
      [0, 5, 0, 5, 0],
      [5, 5, 5, 5, 5],
      [0, 5, 0, 5, 0],
      [5, 5, 5, 5, 5],
      [0, 5, 0, 5, 0],
      [0, 5, 0, 5, 0],
    ],
    "@": [
      [0, 5, 5, 5, 0],
      [5, 0, 0, 0, 5],
      [5, 0, 0, 5, 5],
      [5, 0, 5, 0, 5],
      [5, 0, 5, 5, 0],
      [5, 0, 0, 0, 0],
      [0, 5, 5, 5, 0],
    ],
    "+": [
      [0, 0, 0, 0, 0],
      [0, 0, 5, 0, 0],
      [0, 0, 5, 0, 0],
      [5, 5, 5, 5, 5],
      [0, 0, 5, 0, 0],
      [0, 0, 5, 0, 0],
      [0, 0, 0, 0, 0],
    ],
    "-": [
      [0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0],
      [5, 5, 5, 5, 5],
      [0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0],
    ],
    "=": [
      [0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0],
      [5, 5, 5, 5, 5],
      [0, 0, 0, 0, 0],
      [5, 5, 5, 5, 5],
      [0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0],
    ],
    "&": [
      [0, 5, 0, 0, 0],
      [5, 0, 5, 0, 0],
      [5, 0, 5, 0, 0],
      [0, 5, 0, 0, 0],
      [5, 0, 5, 0, 5],
      [5, 0, 0, 5, 0],
      [0, 5, 5, 0, 5],
    ],
    "%": [
      [0, 5, 0, 0, 5],
      [5, 0, 5, 0, 5],
      [0, 5, 0, 5, 0],
      [0, 0, 5, 0, 0],
      [0, 5, 0, 5, 0],
      [5, 0, 5, 0, 5],
      [5, 0, 0, 5, 0],
    ],
    "~": [
      [0, 5, 0, 0, 5],
      [5, 0, 5, 0, 5],
      [5, 0, 0, 5, 0],
      [0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0],
    ],
    "*": [
      [0, 0, 0, 0, 0],
      [5, 0, 0, 0, 5],
      [0, 5, 0, 5, 0],
      [5, 5, 5, 5, 5],
      [0, 5, 0, 5, 0],
      [5, 0, 0, 0, 5],
      [0, 0, 0, 0, 0],
    ],
    "(": [
      [0, 0, 5],
      [0, 5, 0],
      [5, 0, 0],
      [5, 0, 0],
      [5, 0, 0],
      [0, 5, 0],
      [0, 0, 5],
    ],
    "'": [[5], [5], [5], [0], [0], [0], [0]],
    "`": [
      [5, 0],
      [0, 5],
      [0, 0],
      [0, 0],
      [0, 0],
      [0, 0],
      [0, 0],
    ],
    ")": [
      [5, 0, 0],
      [0, 5, 0],
      [0, 0, 5],
      [0, 0, 5],
      [0, 0, 5],
      [0, 5, 0],
      [5, 0, 0],
    ],
    '"': [
      [5, 0, 5],
      [5, 0, 5],
      [5, 0, 5],
      [0, 0, 0],
      [0, 0, 0],
      [0, 0, 0],
      [0, 0, 0],
    ],
    _: [
      [0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0],
      [5, 5, 5, 5, 5],
    ],
    "±": [
      [0, 5, 5, 0, 5, 5, 0],
      [5, 0, 0, 5, 0, 0, 5],
      [5, 0, 0, 0, 0, 0, 5],
      [5, 0, 0, 0, 0, 0, 5],
      [0, 5, 0, 0, 0, 5, 0],
      [0, 0, 5, 0, 5, 0, 0],
      [0, 0, 0, 5, 0, 0, 0],
    ],
  };
  const matrix = allLetters[safeChar] ?? DEF;
  return cloneMatrix(matrix);
}
