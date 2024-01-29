(() => {
  const calendarDays = document.querySelectorAll(
    "tbody .ContributionCalendar-day"
  );
  if (calendarDays.length > 0) {
    calendarDays.forEach((calendarDay) =>
      calendarDay.setAttribute("data-level", getRandomInt(4))
    );
  }

  const repositoriesCounters = document.querySelectorAll(".Counter");
  if (repositoriesCounters.length > 0) {
    repositoriesCounters.forEach((counter) => {
      counter.textContent = getRandomInt(60, 180);
    });
  }

  const popularRepositoriesList = document.querySelector(
    ".js-pinned-items-reorder-container ol"
  );
  if (popularRepositoriesList) {
    const popularReposLength = popularRepositoriesList.children.length;

    if (popularRepositoriesList.children.length < 6) {
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
            })
          )
        );
      }
    }
  }

  const profileFollowers = document.querySelector(
    ".js-profile-editable-area a.Link--secondary span"
  );
  if (profileFollowers) {
    profileFollowers.innerText = `${getRandomInt(1, 4)}.${getRandomInt(9)}k`;
  }

  const profileAchievementsDetails = document.querySelector(
    ".js-profile-editable-replace"
  );
  if (profileAchievementsDetails) {
    const lastChild = profileAchievementsDetails.childNodes.length - 2;
    const achievementsEl = createDomElement(getAchievementHTML());
    const highlightsEl = createDomElement(getHighlightsHtml());
    profileAchievementsDetails.insertBefore(
      highlightsEl,
      profileAchievementsDetails.childNodes[lastChild]
    );
    profileAchievementsDetails.insertBefore(
      achievementsEl,
      profileAchievementsDetails.childNodes[lastChild]
    );
  }

  const contributionsPerYear = document.querySelector(
    ".js-yearly-contributions h2"
  );
  if (contributionsPerYear) {
    contributionsPerYear.innerText = `${getRandomInt(
      1300,
      30
    )} contributions in the last year`;
  }

  const contributionsActivityList = document.querySelector(
    "ul.filter-list.small"
  );
  if (contributionsActivityList) {
    const yearsActivity = contributionsActivityList.children.length;
    const currentYear = new Date().getFullYear();
    const yearDiff = currentYear - yearsActivity;

    const randomYear = getRandomInt(10, 3);

    if (yearDiff > currentYear - randomYear) {
      for (let i = 0; i < randomYear; i++) {
        contributionsActivityList.append(
          createDomElement(getYearElement(yearDiff - i))
        );
      }
    }
  }

  const contributionActivityListing = document.querySelector(
    ".contribution-activity-listing"
  );
  if (contributionActivityListing) {
    contributionActivityListing.innerHTML = "";
    contributionActivityListing.append(
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
        })
      )
    );
  }
})();

function createDomElement(html) {
  const dom = new DOMParser().parseFromString(html, "text/html");
  return dom.body.firstElementChild;
}

function getRandomInt(max, min = 0) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min) + min);
}

function getAchievementHTML() {
  const achievements = [
    `<a href="#" class="position-relative"
    ><img
      src="https://github.githubassets.com/images/modules/profile/achievements/pull-shark-default.png"
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
    src="https://github.githubassets.com/images/modules/profile/achievements/yolo-default.png"
    data-hovercard-type="achievement"
    width="64"
    alt="Achievement: YOLO"
    data-view-component="true"
    class="achievement-badge-sidebar" /></a
>`,
    `<a href="#" class="position-relative"
><img
  src="https://github.githubassets.com/images/modules/profile/achievements/quickdraw-default.png"
  data-hovercard-type="achievement"
  width="64"
  alt="Achievement: Quickdraw"
  data-view-component="true"
  class="achievement-badge-sidebar" /></a
>`,
    `<a href="#" class="position-relative"
><img
  src="https://github.githubassets.com/images/modules/profile/achievements/starstruck-default.png"
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
  src="https://github.githubassets.com/images/modules/profile/achievements/pair-extraordinaire-default.png"
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
  src="https://github.githubassets.com/images/modules/profile/achievements/public-sponsor-default.png"
  data-hovercard-type="achievement"
  width="64"
  alt="Achievement: Public Sponsor"
  data-view-component="true"
  class="achievement-badge-sidebar" /></a
>`,
    `<a href="#" class="position-relative"
><img
  src="https://github.githubassets.com/images/modules/profile/achievements/mars-2020-contributor-default.png"
  data-hovercard-type="achievement"
  width="64"
  alt="Achievement: Mars 2020 Contributor"
  data-view-component="true"
  class="achievement-badge-sidebar" /></a
>`,
    `<a href="#" class="position-relative"
><img
  src="https://github.githubassets.com/images/modules/profile/achievements/arctic-code-vault-contributor-default.png"
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
  <div class="mt-2">
    <span
      title="Feature Release Label: Beta"
      aria-label="Feature Release Label: Beta"
      data-view-component="true"
      class="Label Label--success Label--inline text-normal px-2 mr-1"
      >Beta</span
    ><a class="text-small" href="/orgs/community/discussions/categories/profile"
      >Send feedback</a
    >
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
            id="82285884"
            href="#"
            data-view-component="true"
            class="min-width-0 Link text-bold flex-auto"
            aria-describedby="tooltip-e5056631-fc6c-4e41-b6a8-2a6032d5646c"
          >
            <span class="repo"> ${name} </span> </a
          ><tool-tip
            id="tooltip-e5056631-fc6c-4e41-b6a8-2a6032d5646c"
            for="82285884"
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
  const description = ["apple"];
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
