console.log("fish-memo auto session refresh v19");
console.log("fish-memo HEIC support v15");
console.log("fish-memo bouz v11");
console.log("fish-memo bouz v10");
console.log("fish-memo bouz v9");
console.log("fish-memo bouz v8");
console.log("fish-memo bouz cleaned v7");
console.log("fish-memo unknown-edit-bouz v6");
const { createClient } = window.supabase;

const SUPABASE_URL = "https://hzjrmruoxvthhkmsgdik.supabase.co";
const SUPABASE_PUBLISHABLE_KEY =
  "sb_publishable_bCmnAdCRkpMGhIhC6YyHRg_olf4-bV5";


const WIKIPEDIA_API_URL = "https://ja.wikipedia.org/w/api.php";
const WIKI_CACHE_KEY = "fishMemoWikipediaCacheV1";
const BOUZ_CACHE_KEY = "fishMemoBouzCacheV4";
const BOUZ_FUNCTION_NAME = "bouz-info";
const WIKI_CACHE_MAX_AGE_MS = 7 * 24 * 60 * 60 * 1000;
const WIKI_INPUT_DELAY_MS = 700;

const OSM_TILE_URL = "https://tile.openstreetmap.org/{z}/{x}/{y}.png";
const NOMINATIM_SEARCH_URL =
  "https://nominatim.openstreetmap.org/search";

const DEFAULT_MAP_CENTER = [34.6937, 135.5023];
const NOMINATIM_MIN_INTERVAL_MS = 1100;
const GEOCODE_CACHE_KEY = "fishMemoGeocodeCacheV1";
const GEOCODE_CACHE_MAX_AGE_MS = 30 * 24 * 60 * 60 * 1000;

const MARINE_API_URL = "https://marine-api.open-meteo.com/v1/marine";
const TIDE_TIMES_CACHE_KEY = "fishMemoTideTimesCacheV1";
const TIDE_TIMES_CACHE_MAX_AGE_MS = 30 * 24 * 60 * 60 * 1000;

/*
 * 潮回りは、海上保安庁が紹介する旧暦日ベースの一般的な区分を使います。
 * 月齢は平均朔望月と既知の新月基準日から算出し、その日の正午時点で判定します。
 * 地域によって呼び分けが異なる場合があるため、UI上は「目安」として扱います。
 */
const SYNODIC_MONTH_DAYS = 29.530588853;
const REFERENCE_NEW_MOON_JD = 2451550.25972;

const REMEMBERED_EMAIL_KEY = "fishMemoRememberedEmail";

const supabaseClient = createClient(
  SUPABASE_URL,
  SUPABASE_PUBLISHABLE_KEY,
  {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: false,
      storage: window.localStorage
    }
  }
);

/* Login */
const loginPanel = document.getElementById("loginPanel");
const mainApp = document.getElementById("mainApp");
const savedAccountBox = document.getElementById("savedAccountBox");
const savedAccountEmail = document.getElementById("savedAccountEmail");
const changeAccountButton = document.getElementById("changeAccountButton");
const emailLoginBox = document.getElementById("emailLoginBox");
const emailInput = document.getElementById("emailInput");
const passwordInput = document.getElementById("passwordInput");
const loginButton = document.getElementById("loginButton");
const loginMessage = document.getElementById("loginMessage");
const userEmail = document.getElementById("userEmail");
const logoutButton = document.getElementById("logoutButton");

/* Main UI */
const openAddButton = document.getElementById("openAddButton");
const listTabButton = document.getElementById("listTabButton");
const mapTabButton = document.getElementById("mapTabButton");
const listView = document.getElementById("listView");
const mapView = document.getElementById("mapView");
const searchInput = document.getElementById("searchInput");
const recordCount = document.getElementById("recordCount");
const refreshButton = document.getElementById("refreshButton");
const appMessage = document.getElementById("appMessage");
const fishGrid = document.getElementById("fishGrid");
const emptyMessage = document.getElementById("emptyMessage");
const noSearchResult = document.getElementById("noSearchResult");
const catchMapMessage = document.getElementById("catchMapMessage");
const catchMapElement = document.getElementById("catchMap");

/* Add modal */
const addModal = document.getElementById("addModal");
const closeAddButton = document.getElementById("closeAddButton");
const fishInput = document.getElementById("fishInput");
const caughtAtInput = document.getElementById("caughtAtInput");
const locationInput = document.getElementById("locationInput");
const locationCheckButton = document.getElementById(
  "locationCheckButton"
);
const locationMessage = document.getElementById("locationMessage");
const locationMapSection = document.getElementById(
  "locationMapSection"
);
const locationMapElement = document.getElementById("locationMap");
const photoInput = document.getElementById("photoInput");
const preview = document.getElementById("preview");
const previewImage1 = document.getElementById("previewImage1");
const previewImage2 = document.getElementById("previewImage2");
const videoInput = document.getElementById("videoInput");
const videoPreviewWrap = document.getElementById("videoPreviewWrap");
const videoPreview = document.getElementById("videoPreview");
const videoPreviewMeta = document.getElementById("videoPreviewMeta");
const saveButton = document.getElementById("saveButton");
const addMessage = document.getElementById("addMessage");

/* Detail modal */
const detailModal = document.getElementById("detailModal");
const closeDetailButton = document.getElementById("closeDetailButton");
const detailPhotoButton = document.getElementById("detailPhotoButton");
const detailPhoto = document.getElementById("detailPhoto");
const detailPhotoButton2 = document.getElementById("detailPhotoButton2");
const detailPhoto2 = document.getElementById("detailPhoto2");
const detailVideoWrap = document.getElementById("detailVideoWrap");
const detailVideo = document.getElementById("detailVideo");
const detailVideoMeta = document.getElementById("detailVideoMeta");
const detailNoPhoto = document.getElementById("detailNoPhoto");
const detailFishName = document.getElementById("detailFishName");
const detailEditNameButton = document.getElementById("detailEditNameButton");
const detailLocation = document.getElementById("detailLocation");
const detailDate = document.getElementById("detailDate");
const detailTideBadge = document.getElementById("detailTideBadge");
const detailTideTimes = document.getElementById("detailTideTimes");
const detailFishInfoToggleButton = document.getElementById(
  "detailFishInfoToggleButton"
);
const detailFishInfoPanel = document.getElementById(
  "detailFishInfoPanel"
);
const wikiInfoTabButton = document.getElementById("wikiInfoTabButton");
const bouzInfoTabButton = document.getElementById("bouzInfoTabButton");
const wikiInfoPanel = document.getElementById("wikiInfoPanel");
const bouzInfoPanel = document.getElementById("bouzInfoPanel");
const detailFishInfoTitle = document.getElementById(
  "detailFishInfoTitle"
);
const detailFishInfoSourceLink = document.getElementById(
  "detailFishInfoSourceLink"
);
const detailFishInfoLoading = document.getElementById(
  "detailFishInfoLoading"
);
const detailFishInfoContent = document.getElementById(
  "detailFishInfoContent"
);
const detailFishInfoImage = document.getElementById(
  "detailFishInfoImage"
);
const detailFishInfoSummary = document.getElementById(
  "detailFishInfoSummary"
);
const detailFishInfoTaste = document.getElementById(
  "detailFishInfoTaste"
);
const detailFishInfoError = document.getElementById(
  "detailFishInfoError"
);

const bouzInfoTitle = document.getElementById("bouzInfoTitle");
const bouzInfoSourceLink = document.getElementById("bouzInfoSourceLink");
const bouzInfoLoading = document.getElementById("bouzInfoLoading");
const bouzInfoContent = document.getElementById("bouzInfoContent");
const bouzInfoBadges = document.getElementById("bouzInfoBadges");
const bouzInfoTaste = document.getElementById("bouzInfoTaste");
const bouzInfoNutrition = document.getElementById("bouzInfoNutrition");
const bouzInfoRisk = document.getElementById("bouzInfoRisk");
const bouzInfoMeta = document.getElementById("bouzInfoMeta");
const bouzInfoError = document.getElementById("bouzInfoError");

const detailMapElement = document.getElementById("detailMap");
const detailDownloadButton = document.getElementById(
  "detailDownloadButton"
);
const detailDeleteButton = document.getElementById(
  "detailDeleteButton"
);

/* Image modal */
const imageModal = document.getElementById("imageModal");
const modalImage = document.getElementById("modalImage");
const closeImageButton = document.getElementById("closeImageButton");
const imageDownloadButton = document.getElementById(
  "imageDownloadButton"
);

let currentUser = null;
let allRecords = [];
let currentTab = "list";
let currentDetailRecord = null;

let detailFishInfoRequestId = 0;
let detailFishInfoLoadedFor = "";
let bouzInfoRequestId = 0;
let bouzInfoLoadedFor = "";
let currentFishInfoSource = "wiki";

let selectedImageBlobs = [];
let previewObjectUrls = [];
let imageProcessing = false;

let selectedVideoFile = null;
let selectedVideoDurationSeconds = null;
let videoPreviewObjectUrl = "";
let videoProcessing = false;

let imageModalPath = "";
let imageModalFishName = "";

let locationMap = null;
let locationMarker = null;
let selectedLocation = null;
let locationResolvedFor = "";

let catchMap = null;
let catchMapMarkers = [];
let detailMap = null;
let detailMapMarker = null;

let lastNominatimRequestAt = 0;

function setMessage(element, text, type = "info") {
  element.textContent = text;
  element.className = `message ${type}`;
}

function clearMessage(element) {
  element.textContent = "";
  element.className = "message";
}

function showModal(element) {
  element.style.display = "block";
  element.setAttribute("aria-hidden", "false");
  document.body.style.overflow = "hidden";
}

function hideModal(element) {
  element.style.display = "none";
  element.setAttribute("aria-hidden", "true");

  if (
    addModal.style.display !== "block" &&
    detailModal.style.display !== "block" &&
    imageModal.style.display !== "block"
  ) {
    document.body.style.overflow = "";
  }
}


function readWikipediaCache() {
  try {
    const raw = localStorage.getItem(WIKI_CACHE_KEY);

    if (!raw) {
      return {};
    }

    const parsed = JSON.parse(raw);

    return parsed && typeof parsed === "object"
      ? parsed
      : {};
  } catch (error) {
    console.warn("Wikipediaキャッシュを読めませんでした。", error);
    return {};
  }
}

function writeWikipediaCache(cache) {
  try {
    localStorage.setItem(
      WIKI_CACHE_KEY,
      JSON.stringify(cache)
    );
  } catch (error) {
    console.warn("Wikipediaキャッシュを保存できませんでした。", error);
  }
}

function normalizeFishInfoKey(value) {
  return String(value || "")
    .normalize("NFKC")
    .trim()
    .toLowerCase();
}

function getCachedWikipediaInfo(fishName) {
  const key = normalizeFishInfoKey(fishName);
  const cache = readWikipediaCache();
  const item = cache[key];

  if (!item) {
    return null;
  }

  if (
    !Number.isFinite(item.savedAt) ||
    Date.now() - item.savedAt > WIKI_CACHE_MAX_AGE_MS
  ) {
    delete cache[key];
    writeWikipediaCache(cache);
    return null;
  }

  return item.data || null;
}

function cacheWikipediaInfo(fishName, data) {
  const key = normalizeFishInfoKey(fishName);
  const cache = readWikipediaCache();

  cache[key] = {
    savedAt: Date.now(),
    data
  };

  writeWikipediaCache(cache);
}

async function wikipediaApiRequest(paramsObject) {
  const params = new URLSearchParams({
    action: "query",
    format: "json",
    formatversion: "2",
    origin: "*",
    ...paramsObject
  });

  const response = await fetch(
    `${WIKIPEDIA_API_URL}?${params.toString()}`
  );

  if (!response.ok) {
    throw new Error(
      `Wikipedia APIからエラーが返されました（${response.status}）`
    );
  }

  return response.json();
}

async function fetchWikipediaPageByTitle(title) {
  const data = await wikipediaApiRequest({
    redirects: "1",
    prop: "extracts|pageimages|pageprops",
    exlimit: "1",
    explaintext: "1",
    exsectionformat: "plain",
    piprop: "thumbnail|original",
    pithumbsize: "800",
    titles: title
  });

  return data?.query?.pages?.[0] || null;
}

async function searchWikipediaFishPage(fishName) {
  const data = await wikipediaApiRequest({
    list: "search",
    srsearch: `${fishName} 魚`,
    srnamespace: "0",
    srlimit: "5"
  });

  const results = data?.query?.search || [];

  return (
    results.find((item) => {
      return !String(item.title).includes("曖昧さ回避");
    }) || null
  );
}

function isUsableWikipediaPage(page) {
  return Boolean(
    page &&
    !page.missing &&
    !page.pageprops?.disambiguation &&
    typeof page.extract === "string" &&
    page.extract.trim().length >= 60
  );
}

function splitJapaneseSentences(text) {
  return String(text || "")
    .replace(/\r/g, "")
    .replace(/\n+/g, " ")
    .replace(/\s+/g, " ")
    .split(/(?<=。)/)
    .map((sentence) => sentence.trim())
    .filter(Boolean);
}

function shortenSentences(sentences, maxSentences, maxChars) {
  const selected = [];
  let total = 0;

  for (const sentence of sentences) {
    if (selected.length >= maxSentences) {
      break;
    }

    if (total + sentence.length > maxChars && selected.length > 0) {
      break;
    }

    selected.push(sentence);
    total += sentence.length;
  }

  return selected.join("");
}

function buildFishFeatureText(extract) {
  const sentences = splitJapaneseSentences(extract);

  return (
    shortenSentences(sentences, 3, 420) ||
    "特徴を取得できませんでした。"
  );
}

function buildFishTasteText(extract) {
  const tastePattern =
    /味|美味|食用|刺身|寿司|鮨|塩焼|焼き魚|煮付|煮魚|干物|フライ|揚げ|料理|旬|脂|青魚|なめろう|酢締|酢〆|生食/;

  const sentences = splitJapaneseSentences(extract);
  const matched = sentences.filter((sentence) => {
    return tastePattern.test(sentence);
  });

  if (matched.length === 0) {
    return "Wikipedia本文から、味・食用に関する明確な記述は見つかりませんでした。";
  }

  return shortenSentences(matched, 4, 520);
}

function buildWikipediaUrl(title) {
  return `https://ja.wikipedia.org/wiki/${encodeURIComponent(
    String(title).replace(/ /g, "_")
  )}`;
}

async function fetchFishWikipediaInfo(fishName) {
  const cached = getCachedWikipediaInfo(fishName);

  if (cached) {
    return cached;
  }

  let page = await fetchWikipediaPageByTitle(fishName);

  if (!isUsableWikipediaPage(page)) {
    const searchResult = await searchWikipediaFishPage(fishName);

    if (!searchResult) {
      throw new Error("該当する魚種の記事が見つかりませんでした。");
    }

    page = await fetchWikipediaPageByTitle(searchResult.title);
  }

  if (!isUsableWikipediaPage(page)) {
    throw new Error("魚種として使える記事情報を取得できませんでした。");
  }

  const info = {
    title: page.title,
    sourceUrl: buildWikipediaUrl(page.title),
    imageUrl:
      page.thumbnail?.source ||
      page.original?.source ||
      "",
    summary: buildFishFeatureText(page.extract),
    taste: buildFishTasteText(page.extract)
  };

  cacheWikipediaInfo(fishName, info);

  return info;
}


function resetDetailFishInfo() {
  detailFishInfoRequestId += 1;
  bouzInfoRequestId += 1;
  detailFishInfoLoadedFor = "";
  bouzInfoLoadedFor = "";
  currentFishInfoSource = "wiki";

  detailFishInfoToggleButton.textContent = "魚種情報を見る";
  detailFishInfoToggleButton.setAttribute("aria-expanded", "false");

  detailFishInfoPanel.classList.add("hidden");
  showFishInfoSource("wiki");

  detailFishInfoLoading.classList.add("hidden");
  detailFishInfoContent.classList.add("hidden");
  detailFishInfoError.classList.add("hidden");

  detailFishInfoTitle.textContent = "";
  detailFishInfoSummary.textContent = "";
  detailFishInfoTaste.textContent = "";
  detailFishInfoError.textContent = "";

  detailFishInfoImage.classList.add("hidden");
  detailFishInfoImage.removeAttribute("src");
  detailFishInfoImage.alt = "";

  detailFishInfoSourceLink.href = "#";

  resetBouzInfo();
}

function resetBouzInfo() {
  bouzInfoLoading.classList.add("hidden");
  bouzInfoContent.classList.add("hidden");
  bouzInfoError.classList.add("hidden");

  bouzInfoTitle.textContent = "";
  bouzInfoSourceLink.href = "#";
  bouzInfoBadges.innerHTML = "";
  bouzInfoTaste.textContent = "";
  bouzInfoNutrition.textContent = "";
  bouzInfoRisk.textContent = "";
  bouzInfoMeta.innerHTML = "";
  bouzInfoError.textContent = "";
}

function showFishInfoSource(source) {
  currentFishInfoSource = source;

  const showBouz = source === "bouz";

  wikiInfoPanel.classList.toggle("hidden", showBouz);
  bouzInfoPanel.classList.toggle("hidden", !showBouz);

  wikiInfoTabButton.classList.toggle("active", !showBouz);
  bouzInfoTabButton.classList.toggle("active", showBouz);
}

function readBouzCache() {
  try {
    const raw = localStorage.getItem(BOUZ_CACHE_KEY);

    if (!raw) {
      return {};
    }

    const parsed = JSON.parse(raw);

    return parsed && typeof parsed === "object"
      ? parsed
      : {};
  } catch (error) {
    console.warn("市場魚貝類図鑑キャッシュを読めませんでした。", error);
    return {};
  }
}

function writeBouzCache(cache) {
  try {
    localStorage.setItem(BOUZ_CACHE_KEY, JSON.stringify(cache));
  } catch (error) {
    console.warn("市場魚貝類図鑑キャッシュを保存できませんでした。", error);
  }
}

function getCachedBouzInfo(fishName) {
  const key = normalizeFishInfoKey(fishName);
  const cache = readBouzCache();
  const item = cache[key];

  if (!item) {
    return null;
  }

  if (
    !Number.isFinite(item.savedAt) ||
    Date.now() - item.savedAt > WIKI_CACHE_MAX_AGE_MS
  ) {
    delete cache[key];
    writeBouzCache(cache);
    return null;
  }

  return item.data || null;
}

function cacheBouzInfo(fishName, data) {
  const key = normalizeFishInfoKey(fishName);
  const cache = readBouzCache();

  cache[key] = {
    savedAt: Date.now(),
    data
  };

  writeBouzCache(cache);
}

async function fetchBouzInfo(fishName) {
  const cached = getCachedBouzInfo(fishName);

  if (cached) {
    return cached;
  }

  const { data: sessionData, error: sessionError } =
    await supabaseClient.auth.getSession();

  if (sessionError || !sessionData?.session?.access_token) {
    throw sessionError || new Error("ログイン情報を取得できませんでした。");
  }

  const response = await fetch(
    `${SUPABASE_URL}/functions/v1/${BOUZ_FUNCTION_NAME}?name=${encodeURIComponent(fishName)}`,
    {
      method: "GET",
      headers: {
        Authorization: `Bearer ${sessionData.session.access_token}`
      }
    }
  );

  const data = await response.json().catch(() => null);

  if (!response.ok) {
    throw new Error(
      data?.error ||
        data?.message ||
        `市場魚貝類図鑑情報を取得できませんでした（${response.status}）`
    );
  }

  cacheBouzInfo(fishName, data);

  return data;
}

function setBouzText(element, value, fallback = "情報が見つかりませんでした。") {
  element.textContent = value && String(value).trim()
    ? String(value).trim()
    : fallback;
}

function renderBouzBadges(info) {
  // 珍魚度・物知り度・食べ物としての重要度は表示しない。
  bouzInfoBadges.innerHTML = "";
}

function addBouzMetaRow(label, value) {
  if (!value) return;
  const text = String(value).trim();
  if (!text || text.includes("から探す") || text.includes("サイト内検索")) return;

  const row = document.createElement("div");
  row.className = "bouz-info-meta-row";
  row.textContent = `${label}：${text}`;
  bouzInfoMeta.appendChild(row);
}

function renderBouzInfo(info) {
  bouzInfoLoading.classList.add("hidden");
  bouzInfoError.classList.add("hidden");
  bouzInfoContent.classList.remove("hidden");

  bouzInfoTitle.textContent = info.title || currentDetailRecord?.fish_name || "";
  bouzInfoSourceLink.href = info.sourceUrl || "#";

  renderBouzBadges(info);

  const tasteParts = [
    info.tasteRating || "",
    info.tasteSummary || ""
  ].filter(Boolean);

  setBouzText(bouzInfoTaste, tasteParts.join("\n"));
  setBouzText(bouzInfoNutrition, info.nutrition);
  setBouzText(bouzInfoRisk, info.risk, "特記なし、または情報が見つかりませんでした。");

  bouzInfoMeta.innerHTML = "";
  addBouzMetaRow("分類", info.classification);
  addBouzMetaRow("外国名", Array.isArray(info.foreignNames) ? info.foreignNames.join(" / ") : info.foreignNames);
  addBouzMetaRow("学名", info.scientificName);
}

async function loadBouzInfo(record) {
  if (!record) {
    return;
  }

  const fishName = record.fish_name;
  const requestId = ++bouzInfoRequestId;

  bouzInfoTitle.textContent = fishName;
  bouzInfoLoading.classList.remove("hidden");
  bouzInfoContent.classList.add("hidden");
  bouzInfoError.classList.add("hidden");

  try {
    const info = await fetchBouzInfo(fishName);

    if (
      requestId !== bouzInfoRequestId ||
      currentDetailRecord?.id !== record.id
    ) {
      return;
    }

    bouzInfoLoadedFor = normalizeFishInfoKey(fishName);
    renderBouzInfo(info);
  } catch (error) {
    console.error(error);

    if (
      requestId !== bouzInfoRequestId ||
      currentDetailRecord?.id !== record.id
    ) {
      return;
    }

    bouzInfoLoading.classList.add("hidden");
    bouzInfoContent.classList.add("hidden");
    bouzInfoError.classList.remove("hidden");
    bouzInfoError.textContent =
      error?.message || "市場魚貝類図鑑情報を取得できませんでした。";
  }
}

function renderDetailFishInfo(info) {
  detailFishInfoLoading.classList.add("hidden");
  detailFishInfoError.classList.add("hidden");
  detailFishInfoContent.classList.remove("hidden");

  detailFishInfoTitle.textContent = info.title;
  detailFishInfoSourceLink.href = info.sourceUrl;
  detailFishInfoSummary.textContent = info.summary;
  detailFishInfoTaste.textContent = info.taste;

  if (info.imageUrl) {
    detailFishInfoImage.src = info.imageUrl;
    detailFishInfoImage.alt = `${info.title}のWikipedia画像`;
    detailFishInfoImage.classList.remove("hidden");
  } else {
    detailFishInfoImage.classList.add("hidden");
    detailFishInfoImage.removeAttribute("src");
    detailFishInfoImage.alt = "";
  }
}

async function loadDetailFishInfo(record) {
  if (!record) {
    return;
  }

  const fishName = record.fish_name;
  const requestId = ++detailFishInfoRequestId;

  detailFishInfoTitle.textContent = fishName;
  detailFishInfoLoading.classList.remove("hidden");
  detailFishInfoContent.classList.add("hidden");
  detailFishInfoError.classList.add("hidden");

  try {
    const info = await fetchFishWikipediaInfo(fishName);

    if (
      requestId !== detailFishInfoRequestId ||
      currentDetailRecord?.id !== record.id
    ) {
      return;
    }

    detailFishInfoLoadedFor = normalizeFishInfoKey(fishName);
    renderDetailFishInfo(info);
  } catch (error) {
    console.error(error);

    if (
      requestId !== detailFishInfoRequestId ||
      currentDetailRecord?.id !== record.id
    ) {
      return;
    }

    detailFishInfoLoading.classList.add("hidden");
    detailFishInfoContent.classList.add("hidden");
    detailFishInfoError.classList.remove("hidden");
    detailFishInfoError.textContent =
      error?.message || "魚種情報を取得できませんでした。";
  }
}

async function toggleDetailFishInfo() {
  if (!currentDetailRecord) {
    return;
  }

  const isOpen =
    !detailFishInfoPanel.classList.contains("hidden");

  if (isOpen) {
    detailFishInfoPanel.classList.add("hidden");
    detailFishInfoToggleButton.textContent = "魚種情報を見る";
    detailFishInfoToggleButton.setAttribute("aria-expanded", "false");
    return;
  }

  detailFishInfoPanel.classList.remove("hidden");
  detailFishInfoToggleButton.textContent = "魚種情報を閉じる";
  detailFishInfoToggleButton.setAttribute("aria-expanded", "true");
  showFishInfoSource(currentFishInfoSource || "wiki");

  await loadCurrentFishInfoSource();
}

async function loadCurrentFishInfoSource() {
  if (!currentDetailRecord) {
    return;
  }

  const currentKey = normalizeFishInfoKey(currentDetailRecord.fish_name);

  if (currentFishInfoSource === "bouz") {
    if (bouzInfoLoadedFor !== currentKey) {
      await loadBouzInfo(currentDetailRecord);
    }

    return;
  }

  if (detailFishInfoLoadedFor !== currentKey) {
    await loadDetailFishInfo(currentDetailRecord);
  }
}

async function switchFishInfoSource(source) {
  if (!currentDetailRecord) {
    return;
  }

  showFishInfoSource(source);

  if (!detailFishInfoPanel.classList.contains("hidden")) {
    await loadCurrentFishInfoSource();
  }
}

async function editCurrentFishName() {
  if (!currentDetailRecord) {
    return;
  }

  const currentName = currentDetailRecord.fish_name === "不明魚"
    ? ""
    : currentDetailRecord.fish_name;

  const nextName = prompt(
    "魚種名を入力してください。空欄にすると「不明魚」にします。",
    currentName
  );

  if (nextName === null) {
    return;
  }

  const fishName = nextName.trim() || "不明魚";

  detailEditNameButton.disabled = true;

  try {
    const { error } = await supabaseClient
      .from("fish_records")
      .update({ fish_name: fishName })
      .eq("id", currentDetailRecord.id);

    if (error) {
      throw error;
    }

    currentDetailRecord.fish_name = fishName;
    detailFishName.textContent = fishName;
    resetDetailFishInfo();

    await loadRecords(false);

    const updated = allRecords.find((record) => record.id === currentDetailRecord.id);

    if (updated) {
      currentDetailRecord = updated;
      detailFishName.textContent = updated.fish_name;
      detailPhoto.alt = updated.fish_name;
    }

    setMessage(appMessage, "魚種名を更新しました。", "success");
  } catch (error) {
    console.error(error);
    alert(`魚種名を更新できませんでした：${error?.message || "不明なエラー"}`);
  } finally {
    detailEditNameButton.disabled = false;
  }
}

function getRememberedEmail() {
  return localStorage.getItem(REMEMBERED_EMAIL_KEY) || "";
}

function setRememberedEmail(email) {
  localStorage.setItem(REMEMBERED_EMAIL_KEY, email);
}

function clearRememberedEmail() {
  localStorage.removeItem(REMEMBERED_EMAIL_KEY);
}

function updateLoginFormMode() {
  const rememberedEmail = getRememberedEmail();

  if (rememberedEmail) {
    savedAccountEmail.textContent = rememberedEmail;
    savedAccountBox.classList.remove("hidden");
    emailLoginBox.classList.add("hidden");
    emailInput.value = rememberedEmail;
    loginButton.textContent = "パスワードでログイン";
  } else {
    savedAccountEmail.textContent = "";
    savedAccountBox.classList.add("hidden");
    emailLoginBox.classList.remove("hidden");
    emailInput.value = "";
    loginButton.textContent = "ログイン";
  }

  passwordInput.value = "";
}

function switchLoginAccount() {
  clearRememberedEmail();
  updateLoginFormMode();
  emailInput.focus();
}

function setLoginMode() {
  currentUser = null;
  allRecords = [];
  updateLoginFormMode();
  mainApp.classList.add("hidden");
  loginPanel.classList.remove("hidden");
  userEmail.textContent = "";
  fishGrid.innerHTML = "";
  closeAddModal(true);
  closeDetailModal();
  closeImageModal();
  clearCatchMap();
  clearMessage(appMessage);
}

async function setAppMode(user) {
  currentUser = user;

  if (user.email) {
    setRememberedEmail(user.email);
  }

  userEmail.textContent = user.email || "";
  loginPanel.classList.add("hidden");
  mainApp.classList.remove("hidden");
  clearMessage(loginMessage);
  passwordInput.value = "";
  setActiveTab("list");
  await loadRecords();
}

function isSessionAccessTokenStillUsable(session) {
  const expiresAtSeconds = Number(session?.expires_at || 0);

  if (!expiresAtSeconds) {
    return false;
  }

  /*
   * 30秒の余裕を持たせます。
   * 期限直前のaccess tokenは使わず、再ログイン画面へ戻します。
   */
  return expiresAtSeconds * 1000 > Date.now() + 30_000;
}

async function initializeApp() {
  /*
   * loginPanel / mainApp はHTML側で最初は両方 hidden。
   * 保存済みセッションの確認と更新が終わるまで、
   * ログイン画面を一瞬見せないようにします。
   */
  try {
    const {
      data: { session: storedSession },
      error: sessionError
    } = await supabaseClient.auth.getSession();

    if (sessionError) {
      throw sessionError;
    }

    if (!storedSession?.user) {
      setLoginMode();
      clearMessage(loginMessage);
      return;
    }

    let activeSession = storedSession;

    /*
     * アプリを開くたびに保存済みRefresh Tokenで
     * セッションを裏側で更新します。
     * パスワードは保存・再送信しません。
     */
    if (storedSession.refresh_token) {
      try {
        const {
          data: refreshData,
          error: refreshError
        } = await supabaseClient.auth.refreshSession({
          refresh_token: storedSession.refresh_token
        });

        if (refreshError) {
          throw refreshError;
        }

        if (refreshData?.session?.user) {
          activeSession = refreshData.session;
        }
      } catch (refreshError) {
        console.warn(
          "起動時のセッション更新に失敗しました。",
          refreshError
        );

        /*
         * 一時的な通信エラー等でRefreshだけ失敗しても、
         * 保存済みaccess tokenがまだ有効ならアプリを開きます。
         */
        if (!isSessionAccessTokenStillUsable(storedSession)) {
          setLoginMode();
          setMessage(
            loginMessage,
            "ログイン情報の有効期限が切れました。パスワードを入力してください。",
            "info"
          );
          return;
        }
      }
    }

    if (activeSession?.user) {
      await setAppMode(activeSession.user);
      return;
    }

    setLoginMode();
    clearMessage(loginMessage);
  } catch (error) {
    console.error(error);
    setLoginMode();
    setMessage(
      loginMessage,
      "接続を確認できませんでした。通信状態を確認してください。",
      "error"
    );
  }
}

async function login() {
  const rememberedEmail = getRememberedEmail();
  const email = rememberedEmail || emailInput.value.trim();
  const password = passwordInput.value;

  if (!email || !password) {
    setMessage(
      loginMessage,
      rememberedEmail
        ? "パスワードを入力してください。"
        : "メールアドレスとパスワードを入力してください。",
      "error"
    );
    return;
  }

  loginButton.disabled = true;
  setMessage(loginMessage, "ログイン中です…", "info");

  try {
    const { data, error } =
      await supabaseClient.auth.signInWithPassword({
        email,
        password
      });

    if (error) {
      throw error;
    }

    setRememberedEmail(email);
    await setAppMode(data.user);
  } catch (error) {
    console.error(error);
    setMessage(
      loginMessage,
      "ログインできません。メールアドレスまたはパスワードを確認してください。",
      "error"
    );
  } finally {
    loginButton.disabled = false;
  }
}

async function logout() {
  logoutButton.disabled = true;

  try {
    const { error } = await supabaseClient.auth.signOut();

    if (error) {
      throw error;
    }

    resetAddForm();
    setLoginMode();
  } catch (error) {
    console.error(error);
    setMessage(
      appMessage,
      "ログアウトできませんでした。もう一度試してください。",
      "error"
    );
  } finally {
    logoutButton.disabled = false;
  }
}

function setActiveTab(tab) {
  currentTab = tab;
  const isList = tab === "list";

  listTabButton.classList.toggle("active", isList);
  mapTabButton.classList.toggle("active", !isList);
  listView.classList.toggle("hidden", !isList);
  mapView.classList.toggle("hidden", isList);

  if (!isList) {
    renderCatchMap(allRecords);

    requestAnimationFrame(() => {
      if (catchMap) {
        catchMap.invalidateSize();
      }
    });
  }
}

function openAddModal() {
  clearMessage(addMessage);
  clearMessage(locationMessage);

  showModal(addModal);

  requestAnimationFrame(() => {
    fishInput.focus();

    if (locationMap && !locationMapSection.classList.contains("hidden")) {
      locationMap.invalidateSize();
    }
  });
}

function closeAddModal(force = false) {
  const hasInput =
    fishInput.value.trim() ||
    caughtAtInput.value ||
    locationInput.value.trim() ||
    selectedImageBlobs.length > 0 ||
    Boolean(selectedVideoFile);

  if (!force && hasInput) {
    const confirmed = confirm("入力中の内容を閉じますか？");

    if (!confirmed) {
      return;
    }
  }

  resetAddForm();
  hideModal(addModal);
}

function revokePreviewUrls() {
  for (const url of previewObjectUrls) {
    URL.revokeObjectURL(url);
  }

  previewObjectUrls = [];
}

function revokeVideoPreviewUrl() {
  if (videoPreviewObjectUrl) {
    URL.revokeObjectURL(videoPreviewObjectUrl);
    videoPreviewObjectUrl = "";
  }
}

function clearPhotoPreviews() {
  revokePreviewUrls();

  previewImage1.removeAttribute("src");
  previewImage2.removeAttribute("src");
  preview.style.display = "none";
}

function clearVideoPreview() {
  revokeVideoPreviewUrl();

  videoPreview.pause();
  videoPreview.removeAttribute("src");
  videoPreview.load();
  videoPreviewMeta.textContent = "";
  videoPreviewWrap.classList.add("hidden");
}

function resetAddForm() {
  fishInput.value = "";
  caughtAtInput.value = "";
  locationInput.value = "";
  photoInput.value = "";
  videoInput.value = "";

  selectedImageBlobs = [];
  imageProcessing = false;

  selectedVideoFile = null;
  selectedVideoDurationSeconds = null;
  videoProcessing = false;

  clearPhotoPreviews();
  clearVideoPreview();
  clearLocationSelection();

  clearMessage(locationMessage);
  clearMessage(addMessage);
  saveButton.disabled = false;
}

function looksLikeHeicFile(file) {
  const fileName = String(file?.name || "").toLowerCase();
  const mimeType = String(file?.type || "").toLowerCase();

  return (
    fileName.endsWith(".heic") ||
    fileName.endsWith(".heif") ||
    fileName.endsWith(".hif") ||
    mimeType === "image/heic" ||
    mimeType === "image/heif" ||
    mimeType === "image/heic-sequence" ||
    mimeType === "image/heif-sequence"
  );
}

function getHeicToApi() {
  const namespace = window.HeicTo;

  const convert =
    typeof namespace === "function"
      ? namespace
      : typeof namespace?.heicTo === "function"
        ? namespace.heicTo.bind(namespace)
        : typeof namespace?.default === "function"
          ? namespace.default
          : typeof namespace?.default?.heicTo === "function"
            ? namespace.default.heicTo.bind(namespace.default)
            : null;

  const isHeic =
    typeof namespace?.isHeic === "function"
      ? namespace.isHeic.bind(namespace)
      : typeof namespace?.default?.isHeic === "function"
        ? namespace.default.isHeic.bind(namespace.default)
        : null;

  return {
    convert,
    isHeic
  };
}

function normalizeConvertedBlob(result) {
  const value = Array.isArray(result)
    ? result[0]
    : result;

  if (value instanceof Blob) {
    return value;
  }

  if (value?.blob instanceof Blob) {
    return value.blob;
  }

  return null;
}

async function convertWithHeicTo(file) {
  const api = getHeicToApi();

  if (typeof api.convert !== "function") {
    throw new Error(
      "heic-toの変換関数を確認できませんでした。"
    );
  }

  const result = await api.convert({
    blob: file,
    type: "image/jpeg",
    quality: 0.92
  });

  const blob = normalizeConvertedBlob(result);

  if (!blob) {
    throw new Error(
      "heic-toからJPEG画像が返されませんでした。"
    );
  }

  return blob;
}

async function convertWithHeic2Any(file) {
  if (typeof window.heic2any !== "function") {
    throw new Error(
      "heic2anyの変換関数を確認できませんでした。"
    );
  }

  const result = await window.heic2any({
    blob: file,
    toType: "image/jpeg",
    quality: 0.92,
    multiple: false
  });

  const blob = normalizeConvertedBlob(result);

  if (!blob) {
    throw new Error(
      "heic2anyからJPEG画像が返されませんでした。"
    );
  }

  return blob;
}

async function convertHeicToJpegIfNeeded(file) {
  if (!file) {
    throw new Error(
      "画像ファイルが選択されていません。"
    );
  }

  const api = getHeicToApi();
  let isHeic = looksLikeHeicFile(file);

  if (typeof api.isHeic === "function") {
    try {
      isHeic = await api.isHeic(file);
    } catch (error) {
      console.warn(
        "HEICの内容判定に失敗したため、ファイル名で判定します。",
        error
      );
    }
  }

  if (!isHeic) {
    return file;
  }

  setMessage(
    addMessage,
    "HEIC写真をJPEGへ変換中です。端末によっては30秒ほどかかります…",
    "info"
  );

  const errors = [];

  try {
    const jpeg = await convertWithHeicTo(file);

    console.log(
      "HEIC変換成功: heic-to",
      {
        sourceName: file.name,
        sourceType: file.type,
        sourceBytes: file.size,
        outputType: jpeg.type,
        outputBytes: jpeg.size
      }
    );

    return jpeg;
  } catch (error) {
    console.warn(
      "heic-toで変換できなかったため、heic2anyを試します。",
      error
    );
    errors.push(
      `heic-to: ${error?.message || "変換失敗"}`
    );
  }

  setMessage(
    addMessage,
    "別のHEIC変換方式で再試行しています…",
    "info"
  );

  try {
    const jpeg = await convertWithHeic2Any(file);

    console.log(
      "HEIC変換成功: heic2any",
      {
        sourceName: file.name,
        sourceType: file.type,
        sourceBytes: file.size,
        outputType: jpeg.type,
        outputBytes: jpeg.size
      }
    );

    return jpeg;
  } catch (error) {
    console.error(
      "heic2anyでも変換できませんでした。",
      error
    );
    errors.push(
      `heic2any: ${error?.message || "変換失敗"}`
    );
  }

  throw new Error(
    [
      "このHEIC写真をJPEGへ変換できませんでした。",
      ...errors
    ].join(" / ")
  );
}

function resizeImageToJpeg(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onerror = () => {
      reject(new Error("画像ファイルを読み込めませんでした。"));
    };

    reader.onload = () => {
      const img = new Image();

      img.onerror = () => {
        reject(new Error("この画像形式を読み込めませんでした。"));
      };

      img.onload = () => {
        try {
          const maxDimension = 1600;
          let width = img.naturalWidth;
          let height = img.naturalHeight;

          if (!width || !height) {
            reject(new Error("画像サイズを取得できませんでした。"));
            return;
          }

          const scale = Math.min(
            1,
            maxDimension / Math.max(width, height)
          );

          width = Math.round(width * scale);
          height = Math.round(height * scale);

          const canvas = document.createElement("canvas");
          canvas.width = width;
          canvas.height = height;

          const ctx = canvas.getContext("2d");

          if (!ctx) {
            reject(new Error("画像を処理できませんでした。"));
            return;
          }

          ctx.drawImage(img, 0, 0, width, height);

          canvas.toBlob(
            (blob) => {
              if (!blob) {
                reject(new Error("画像をJPEGに変換できませんでした。"));
                return;
              }

              resolve(blob);
            },
            "image/jpeg",
            0.82
          );
        } catch (error) {
          reject(error);
        }
      };

      img.src = reader.result;
    };

    reader.readAsDataURL(file);
  });
}

async function handlePhotoChange() {
  const files = Array.from(photoInput.files || []);

  selectedImageBlobs = [];
  clearPhotoPreviews();
  clearMessage(addMessage);

  if (files.length === 0) {
    return;
  }

  if (files.length > 2) {
    photoInput.value = "";
    setMessage(
      addMessage,
      "写真は2枚まで選択できます。",
      "error"
    );
    return;
  }

  imageProcessing = true;
  saveButton.disabled = true;
  setMessage(
    addMessage,
    files.length === 2
      ? "写真2枚を処理中です…"
      : "写真を処理中です…",
    "info"
  );

  try {
    for (const file of files) {
      const browserReadableImage =
        await convertHeicToJpegIfNeeded(file);

      const jpegBlob =
        await resizeImageToJpeg(browserReadableImage);

      selectedImageBlobs.push(jpegBlob);
    }

    const previewImages = [
      previewImage1,
      previewImage2
    ];

    selectedImageBlobs.forEach((blob, index) => {
      const url = URL.createObjectURL(blob);
      previewObjectUrls.push(url);
      previewImages[index].src = url;
    });

    preview.style.display = "grid";

    setMessage(
      addMessage,
      `写真${selectedImageBlobs.length}枚を追加できます。`,
      "success"
    );
  } catch (error) {
    console.error(error);

    photoInput.value = "";
    selectedImageBlobs = [];
    clearPhotoPreviews();

    setMessage(
      addMessage,
      error?.message || "写真を読み込めませんでした。",
      "error"
    );
  } finally {
    imageProcessing = false;
    saveButton.disabled = videoProcessing;
  }
}

function getFileExtension(fileName) {
  const match = String(fileName || "")
    .toLowerCase()
    .match(/\.([a-z0-9]+)$/);

  return match ? match[1] : "";
}

function getVideoContentType(file) {
  const extension = getFileExtension(file?.name);

  if (file?.type) {
    return file.type;
  }

  if (extension === "mov") {
    return "video/quicktime";
  }

  if (extension === "webm") {
    return "video/webm";
  }

  return "video/mp4";
}

function isAllowedVideoFile(file) {
  const extension = getFileExtension(file?.name);
  const mimeType = String(file?.type || "").toLowerCase();

  return (
    ["mp4", "mov", "webm"].includes(extension) ||
    ["video/mp4", "video/quicktime", "video/webm"].includes(mimeType)
  );
}

function formatDuration(seconds) {
  if (!Number.isFinite(seconds)) {
    return "";
  }

  const rounded = Math.max(0, Math.round(seconds));
  const minutes = Math.floor(rounded / 60);
  const remainSeconds = rounded % 60;

  return `${minutes}:${String(remainSeconds).padStart(2, "0")}`;
}

function readVideoDurationWithElement(file) {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const video = document.createElement("video");
    let finished = false;

    const cleanup = () => {
      URL.revokeObjectURL(url);
      video.removeAttribute("src");
      video.load();
    };

    const finish = (callback) => {
      if (finished) {
        return;
      }

      finished = true;
      clearTimeout(timeoutId);
      callback();
      cleanup();
    };

    const timeoutId = setTimeout(() => {
      finish(() => {
        reject(
          new Error("動画の再生時間をブラウザから取得できませんでした。")
        );
      });
    }, 12000);

    video.preload = "metadata";
    video.muted = true;

    video.addEventListener(
      "loadedmetadata",
      () => {
        const duration = Number(video.duration);

        finish(() => {
          if (Number.isFinite(duration) && duration > 0) {
            resolve(duration);
          } else {
            reject(
              new Error("動画の再生時間を確認できませんでした。")
            );
          }
        });
      },
      { once: true }
    );

    video.addEventListener(
      "error",
      () => {
        finish(() => {
          reject(
            new Error("このブラウザでは動画メタデータを直接読めませんでした。")
          );
        });
      },
      { once: true }
    );

    video.src = url;
  });
}

async function readIsoBmffDuration(file) {
  /*
   * MP4 / MOV の moov > mvhd を軽量に解析します。
   * mdat本体は読み込まず、各トップレベルboxのヘッダーだけを見て
   * moovまでスキップするので、大きい動画でも全体をメモリに載せません。
   */
  let offset = 0;

  while (offset + 8 <= file.size) {
    const headerBuffer =
      await file.slice(offset, Math.min(offset + 16, file.size)).arrayBuffer();

    if (headerBuffer.byteLength < 8) {
      break;
    }

    const header = new DataView(headerBuffer);
    let boxSize = header.getUint32(0, false);
    const boxType = String.fromCharCode(
      header.getUint8(4),
      header.getUint8(5),
      header.getUint8(6),
      header.getUint8(7)
    );

    let headerSize = 8;

    if (boxSize === 1) {
      if (headerBuffer.byteLength < 16) {
        break;
      }

      boxSize = Number(header.getBigUint64(8, false));
      headerSize = 16;
    } else if (boxSize === 0) {
      boxSize = file.size - offset;
    }

    if (!Number.isFinite(boxSize) || boxSize < headerSize) {
      break;
    }

    if (boxType === "moov") {
      const moovBuffer =
        await file.slice(offset, offset + boxSize).arrayBuffer();

      const duration =
        parseMvhdDurationFromMoov(moovBuffer, headerSize);

      if (Number.isFinite(duration) && duration > 0) {
        return duration;
      }

      break;
    }

    offset += boxSize;
  }

  throw new Error("MP4/MOVの再生時間情報を確認できませんでした。");
}

function parseMvhdDurationFromMoov(buffer, moovHeaderSize = 8) {
  const view = new DataView(buffer);
  let offset = moovHeaderSize;

  while (offset + 8 <= buffer.byteLength) {
    let boxSize = view.getUint32(offset, false);
    const boxType = String.fromCharCode(
      view.getUint8(offset + 4),
      view.getUint8(offset + 5),
      view.getUint8(offset + 6),
      view.getUint8(offset + 7)
    );

    let headerSize = 8;

    if (boxSize === 1) {
      if (offset + 16 > buffer.byteLength) {
        return null;
      }

      boxSize = Number(
        view.getBigUint64(offset + 8, false)
      );
      headerSize = 16;
    } else if (boxSize === 0) {
      boxSize = buffer.byteLength - offset;
    }

    if (
      !Number.isFinite(boxSize) ||
      boxSize < headerSize ||
      offset + boxSize > buffer.byteLength
    ) {
      return null;
    }

    if (boxType === "mvhd") {
      const payload = offset + headerSize;

      if (payload + 20 > buffer.byteLength) {
        return null;
      }

      const version = view.getUint8(payload);

      if (version === 1) {
        if (payload + 32 > buffer.byteLength) {
          return null;
        }

        const timescale =
          view.getUint32(payload + 20, false);
        const duration =
          Number(view.getBigUint64(payload + 24, false));

        return timescale > 0
          ? duration / timescale
          : null;
      }

      const timescale =
        view.getUint32(payload + 12, false);
      const duration =
        view.getUint32(payload + 16, false);

      return timescale > 0
        ? duration / timescale
        : null;
    }

    offset += boxSize;
  }

  return null;
}

async function getVideoDuration(file) {
  try {
    return await readVideoDurationWithElement(file);
  } catch (elementError) {
    const extension = getFileExtension(file?.name);

    if (extension === "mp4" || extension === "mov") {
      console.warn(
        "video要素で時間を取得できなかったため、MP4/MOVコンテナを直接解析します。",
        elementError
      );

      return readIsoBmffDuration(file);
    }

    throw elementError;
  }
}

async function handleVideoChange() {
  const file = videoInput.files?.[0] || null;

  selectedVideoFile = null;
  selectedVideoDurationSeconds = null;
  clearVideoPreview();
  clearMessage(addMessage);

  if (!file) {
    return;
  }

  if (!isAllowedVideoFile(file)) {
    videoInput.value = "";
    setMessage(
      addMessage,
      "動画は .mp4、.mov、.webm のいずれかを選んでください。",
      "error"
    );
    return;
  }

  videoProcessing = true;
  saveButton.disabled = true;
  setMessage(
    addMessage,
    "動画の長さを確認しています…",
    "info"
  );

  try {
    const duration = await getVideoDuration(file);

    if (!Number.isFinite(duration) || duration <= 0) {
      throw new Error("動画の再生時間を確認できませんでした。");
    }

    if (duration > 180.5) {
      throw new Error(
        `動画は3分以内にしてください。選択した動画は約${formatDuration(duration)}です。`
      );
    }

    selectedVideoFile = file;
    selectedVideoDurationSeconds = duration;

    videoPreviewObjectUrl = URL.createObjectURL(file);
    videoPreview.src = videoPreviewObjectUrl;
    videoPreviewMeta.textContent =
      `${file.name} ・ ${formatDuration(duration)}`;
    videoPreviewWrap.classList.remove("hidden");

    setMessage(
      addMessage,
      `動画を追加できます（${formatDuration(duration)}）。`,
      "success"
    );
  } catch (error) {
    console.error(error);

    videoInput.value = "";
    selectedVideoFile = null;
    selectedVideoDurationSeconds = null;
    clearVideoPreview();

    setMessage(
      addMessage,
      error?.message || "動画を読み込めませんでした。",
      "error"
    );
  } finally {
    videoProcessing = false;
    saveButton.disabled = imageProcessing;
  }
}

function makeStorageFileName() {
  if (globalThis.crypto?.randomUUID) {
    return `${crypto.randomUUID()}.jpg`;
  }

  return `${Date.now()}-${Math.random()
    .toString(36)
    .slice(2, 12)}.jpg`;
}

function makeVideoStorageFileName(file) {
  const extension = getFileExtension(file?.name);

  const safeExtension = ["mp4", "mov", "webm"].includes(extension)
    ? extension
    : "mp4";

  if (globalThis.crypto?.randomUUID) {
    return `${crypto.randomUUID()}.${safeExtension}`;
  }

  return `${Date.now()}-${Math.random()
    .toString(36)
    .slice(2, 12)}.${safeExtension}`;
}

function makeRecordId() {
  return Date.now() * 1000 + Math.floor(Math.random() * 1000);
}

function ensureLeafletAvailable() {
  if (!window.L) {
    throw new Error("地図ライブラリを読み込めませんでした。");
  }
}

function ensureHttpEnvironment() {
  if (window.location.protocol === "file:") {
    throw new Error(
      "地図検索はindex.htmlの直接起動では使えません。start-local.batから開いてください。"
    );
  }
}

function addOpenStreetMapTiles(map) {
  L.tileLayer(OSM_TILE_URL, {
    maxZoom: 19,
    attribution:
      '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
  }).addTo(map);
}

function ensureLocationMap(center) {
  ensureLeafletAvailable();

  if (!locationMap) {
    locationMap = L.map(locationMapElement, {
      center,
      zoom: 16
    });

    addOpenStreetMapTiles(locationMap);

    locationMap.on("click", (event) => {
      setLocationPin(event.latlng);
      setMessage(
        locationMessage,
        "地図をタップした位置にピンを移動しました。",
        "success"
      );
    });
  }

  return locationMap;
}

function setLocationPin(position) {
  selectedLocation = {
    lat: Number(position.lat),
    lng: Number(position.lng)
  };

  if (!locationMarker) {
    locationMarker = L.marker(
      [selectedLocation.lat, selectedLocation.lng],
      {
        draggable: true,
        title: "釣った場所"
      }
    ).addTo(locationMap);

    locationMarker.on("dragend", () => {
      const positionAfterDrag = locationMarker.getLatLng();

      selectedLocation = {
        lat: positionAfterDrag.lat,
        lng: positionAfterDrag.lng
      };

      setMessage(
        locationMessage,
        "ピンを移動しました。この位置で保存できます。",
        "success"
      );
    });
  } else {
    locationMarker
      .setLatLng([selectedLocation.lat, selectedLocation.lng])
      .addTo(locationMap);
  }

  locationMap.panTo([
    selectedLocation.lat,
    selectedLocation.lng
  ]);
}

function clearLocationSelection() {
  selectedLocation = null;
  locationResolvedFor = "";

  if (locationMarker && locationMap) {
    locationMap.removeLayer(locationMarker);
  }

  locationMarker = null;
  locationMapSection.classList.add("hidden");
}

function normalizeGeocodeQuery(value) {
  return value.trim().replace(/\s+/g, " ").toLowerCase();
}

function readGeocodeCache() {
  try {
    const stored = localStorage.getItem(GEOCODE_CACHE_KEY);

    if (!stored) {
      return {};
    }

    const parsed = JSON.parse(stored);

    if (!parsed || typeof parsed !== "object") {
      return {};
    }

    return parsed;
  } catch (error) {
    console.warn("位置検索キャッシュを読めませんでした。", error);
    return {};
  }
}

function writeGeocodeCache(cache) {
  try {
    localStorage.setItem(
      GEOCODE_CACHE_KEY,
      JSON.stringify(cache)
    );
  } catch (error) {
    console.warn("位置検索キャッシュを保存できませんでした。", error);
  }
}

function getCachedGeocode(query) {
  const key = normalizeGeocodeQuery(query);
  const cache = readGeocodeCache();
  const item = cache[key];

  if (!item) {
    return null;
  }

  if (
    !Number.isFinite(item.savedAt) ||
    Date.now() - item.savedAt > GEOCODE_CACHE_MAX_AGE_MS
  ) {
    delete cache[key];
    writeGeocodeCache(cache);
    return null;
  }

  return item.result || null;
}

function cacheGeocode(query, result) {
  const key = normalizeGeocodeQuery(query);
  const cache = readGeocodeCache();

  cache[key] = {
    savedAt: Date.now(),
    result
  };

  writeGeocodeCache(cache);
}

async function waitForNominatimRateLimit() {
  const elapsed = Date.now() - lastNominatimRequestAt;
  const waitMs = NOMINATIM_MIN_INTERVAL_MS - elapsed;

  if (waitMs > 0) {
    await new Promise((resolve) => {
      setTimeout(resolve, waitMs);
    });
  }

  lastNominatimRequestAt = Date.now();
}

async function searchLocationWithNominatim(query) {
  const cached = getCachedGeocode(query);

  if (cached) {
    return cached;
  }

  await waitForNominatimRateLimit();

  const params = new URLSearchParams({
    q: query,
    format: "jsonv2",
    limit: "1",
    countrycodes: "jp",
    "accept-language": "ja"
  });

  const response = await fetch(
    `${NOMINATIM_SEARCH_URL}?${params.toString()}`
  );

  if (!response.ok) {
    throw new Error(
      `場所検索サービスからエラーが返されました（${response.status}）`
    );
  }

  const results = await response.json();
  const result = results?.[0];

  if (!result) {
    throw new Error("場所が見つかりませんでした。");
  }

  const lat = Number(result.lat);
  const lng = Number(result.lon);

  if (!Number.isFinite(lat) || !Number.isFinite(lng)) {
    throw new Error("位置情報を取得できませんでした。");
  }

  const boundingBox = Array.isArray(result.boundingbox)
    ? result.boundingbox.map(Number)
    : null;

  const normalized = {
    lat,
    lng,
    displayName: result.display_name || query,
    boundingBox:
      boundingBox?.length === 4 &&
      boundingBox.every(Number.isFinite)
        ? boundingBox
        : null
  };

  cacheGeocode(query, normalized);

  return normalized;
}

async function checkLocationOnMap() {
  const locationName = locationInput.value.trim();

  if (!locationName) {
    setMessage(locationMessage, "場所を入力してください。", "error");
    locationInput.focus();
    return;
  }

  locationCheckButton.disabled = true;
  setMessage(locationMessage, "場所を検索中です…", "info");

  try {
    ensureHttpEnvironment();
    ensureLeafletAvailable();

    const result = await searchLocationWithNominatim(locationName);

    locationMapSection.classList.remove("hidden");
    ensureLocationMap([result.lat, result.lng]);

    requestAnimationFrame(() => {
      locationMap.invalidateSize();

      if (result.boundingBox) {
        const [south, north, west, east] = result.boundingBox;

        locationMap.fitBounds([
          [south, west],
          [north, east]
        ]);
      } else {
        locationMap.setView([result.lat, result.lng], 16);
      }

      setLocationPin({
        lat: result.lat,
        lng: result.lng
      });
    });

    locationResolvedFor = locationName;

    setMessage(
      locationMessage,
      "自動でピンを立てました。違っていればピンを移動するか、地図をタップしてください。",
      "success"
    );
  } catch (error) {
    console.error(error);
    clearLocationSelection();
    setMessage(
      locationMessage,
      `場所を確認できませんでした：${
        error?.message || "不明なエラー"
      }`,
      "error"
    );
  } finally {
    locationCheckButton.disabled = false;
  }
}

async function saveFish() {
  const fishName = fishInput.value.trim() || "不明魚";
  const locationName = locationInput.value.trim();
  const caughtAtValue = caughtAtInput.value;
  const caughtAt = caughtAtValue
    ? new Date(caughtAtValue)
    : null;

  if (!currentUser) {
    setMessage(
      addMessage,
      "ログイン状態を確認できません。ログインし直してください。",
      "error"
    );
    return;
  }

  if (caughtAt && Number.isNaN(caughtAt.getTime())) {
    setMessage(addMessage, "釣った日時を確認してください。", "error");
    caughtAtInput.focus();
    return;
  }

  if (
    locationName &&
    (!selectedLocation || locationResolvedFor !== locationName)
  ) {
    setMessage(
      addMessage,
      "場所を入力した場合は「場所を地図で確認」を押して、ピンの位置を確認してください。",
      "error"
    );
    locationInput.focus();
    return;
  }

  if (imageProcessing || videoProcessing) {
    setMessage(
      addMessage,
      "写真・動画の処理が終わるまでお待ちください。",
      "info"
    );
    return;
  }

  if (selectedImageBlobs.length > 2) {
    setMessage(
      addMessage,
      "写真は2枚まで保存できます。",
      "error"
    );
    return;
  }

  if (
    selectedVideoFile &&
    (
      !Number.isFinite(selectedVideoDurationSeconds) ||
      selectedVideoDurationSeconds > 180.5
    )
  ) {
    setMessage(
      addMessage,
      "動画は3分以内のものを選んでください。",
      "error"
    );
    return;
  }

  saveButton.disabled = true;
  setMessage(
    addMessage,
    selectedVideoFile
      ? "写真・動画をアップロード中です。動画は少し時間がかかる場合があります…"
      : "保存中です…",
    "info"
  );

  const uploadedPaths = [];
  let imagePath = null;
  let imagePath2 = null;
  let videoPath = null;

  try {
    if (selectedImageBlobs[0]) {
      imagePath =
        `${currentUser.id}/${makeStorageFileName()}`;

      const { error } = await supabaseClient.storage
        .from("fish-photos")
        .upload(imagePath, selectedImageBlobs[0], {
          contentType: "image/jpeg",
          upsert: false
        });

      if (error) {
        throw error;
      }

      uploadedPaths.push(imagePath);
    }

    if (selectedImageBlobs[1]) {
      imagePath2 =
        `${currentUser.id}/${makeStorageFileName()}`;

      const { error } = await supabaseClient.storage
        .from("fish-photos")
        .upload(imagePath2, selectedImageBlobs[1], {
          contentType: "image/jpeg",
          upsert: false
        });

      if (error) {
        throw error;
      }

      uploadedPaths.push(imagePath2);
    }

    if (selectedVideoFile) {
      videoPath =
        `${currentUser.id}/videos/${makeVideoStorageFileName(
          selectedVideoFile
        )}`;

      const { error } = await supabaseClient.storage
        .from("fish-photos")
        .upload(videoPath, selectedVideoFile, {
          contentType: getVideoContentType(selectedVideoFile),
          upsert: false
        });

      if (error) {
        throw error;
      }

      uploadedPaths.push(videoPath);
    }

    const { error: insertError } = await supabaseClient
      .from("fish_records")
      .insert({
        id: makeRecordId(),
        fish_name: fishName,
        caught_at: caughtAt ? caughtAt.toISOString() : null,
        location_name: locationName || null,
        latitude: selectedLocation?.lat ?? null,
        longitude: selectedLocation?.lng ?? null,
        image_path: imagePath,
        image_path_2: imagePath2,
        video_path: videoPath,
        video_mime_type: selectedVideoFile
          ? getVideoContentType(selectedVideoFile)
          : null,
        video_duration_seconds:
          selectedVideoDurationSeconds !== null
            ? Math.round(selectedVideoDurationSeconds)
            : null,
        user_id: currentUser.id
      });

    if (insertError) {
      throw insertError;
    }

    resetAddForm();
    hideModal(addModal);
    setActiveTab("list");
    await loadRecords(false);

    setMessage(
      appMessage,
      fishName === "不明魚"
        ? "不明魚として保存しました。あとで詳細画面から魚種名を編集できます。"
        : "保存しました。",
      "success"
    );
  } catch (error) {
    console.error(error);

    if (uploadedPaths.length > 0) {
      const { error: cleanupError } =
        await supabaseClient.storage
          .from("fish-photos")
          .remove(uploadedPaths);

      if (cleanupError) {
        console.error(
          "アップロード済みメディアの後片付けに失敗しました。",
          cleanupError
        );
      }
    }

    setMessage(
      addMessage,
      `保存できませんでした：${error?.message || "不明なエラー"}`,
      "error"
    );
  } finally {
    saveButton.disabled = imageProcessing || videoProcessing;
  }
}

async function createSignedUrlForMedia(path) {
  if (!path) {
    return {
      url: null,
      error: false
    };
  }

  const { data, error } =
    await supabaseClient.storage
      .from("fish-photos")
      .createSignedUrl(
        path,
        60 * 60 * 24
      );

  return {
    url: error ? null : data?.signedUrl || null,
    error: Boolean(error)
  };
}

async function loadRecords(showLoading = true) {
  if (!currentUser) {
    return;
  }

  refreshButton.disabled = true;

  if (showLoading) {
    setMessage(appMessage, "記録を読み込み中です…", "info");
  }

  try {
    const { data: records, error } = await supabaseClient
      .from("fish_records")
      .select(
        "id, fish_name, caught_at, location_name, latitude, longitude, image_path, image_path_2, video_path, video_mime_type, video_duration_seconds, created_at"
      )
      .order("created_at", { ascending: false });

    if (error) {
      throw error;
    }

    allRecords = await Promise.all(
      (records || []).map(async (record) => {
        const [
          firstPhoto,
          secondPhoto,
          video
        ] = await Promise.all([
          createSignedUrlForMedia(record.image_path),
          createSignedUrlForMedia(record.image_path_2),
          createSignedUrlForMedia(record.video_path)
        ]);

        return {
          ...record,
          signedUrl: firstPhoto.url,
          signedUrl2: secondPhoto.url,
          videoSignedUrl: video.url,
          photoLoadError:
            firstPhoto.error || secondPhoto.error,
          videoLoadError: video.error
        };
      })
    );

    renderFilteredRecords();
    renderCatchMap(allRecords);

    if (showLoading) {
      clearMessage(appMessage);
    }

    enrichRecordsWithTideTimes(allRecords);
  } catch (error) {
    console.error(error);
    setMessage(
      appMessage,
      `記録を読み込めませんでした：${
        error?.message || "不明なエラー"
      }`,
      "error"
    );
  } finally {
    refreshButton.disabled = false;
  }
}

function normalizeSearchText(value) {
  return String(value || "")
    .normalize("NFKC")
    .toLowerCase()
    .trim();
}

function getFilteredRecords() {
  const query = normalizeSearchText(searchInput.value);

  if (!query) {
    return allRecords;
  }

  return allRecords.filter((record) => {
    const fishName = normalizeSearchText(record.fish_name);
    const locationName = normalizeSearchText(record.location_name);

    return fishName.includes(query) || locationName.includes(query);
  });
}

function renderFilteredRecords() {
  const records = getFilteredRecords();

  fishGrid.innerHTML = "";
  emptyMessage.classList.add("hidden");
  noSearchResult.classList.add("hidden");
  recordCount.textContent = `${records.length}件`;

  if (allRecords.length === 0) {
    emptyMessage.classList.remove("hidden");
    return;
  }

  if (records.length === 0) {
    noSearchResult.classList.remove("hidden");
    return;
  }

  for (const record of records) {
    fishGrid.appendChild(createFishCard(record));
  }
}

function createFishCard(record) {
  const card = document.createElement("article");
  card.className = "fish-card";
  card.tabIndex = 0;
  card.setAttribute("role", "button");
  card.setAttribute(
    "aria-label",
    `${record.fish_name}の詳細を開く`
  );

  const photoArea = document.createElement("div");
  photoArea.className = "fish-card-photo-area";

  const cardPhotoUrl =
    record.signedUrl || record.signedUrl2;

  if (cardPhotoUrl) {
    const image = document.createElement("img");
    image.className = "fish-card-photo";
    image.src = cardPhotoUrl;
    image.alt = record.fish_name;
    image.loading = "lazy";
    photoArea.appendChild(image);
  } else {
    const placeholder = document.createElement("div");
    placeholder.className = record.photoLoadError
      ? "fish-card-photo-error"
      : "fish-card-no-photo";

    placeholder.textContent = record.photoLoadError
      ? "写真を読み込めません"
      : record.video_path
        ? "🎥 動画あり"
        : "写真なし";

    photoArea.appendChild(placeholder);
  }

  const photoCount =
    Number(Boolean(record.image_path)) +
    Number(Boolean(record.image_path_2));

  const mediaLabels = [];

  if (photoCount > 0) {
    mediaLabels.push(`写真${photoCount}`);
  }

  if (record.video_path) {
    mediaLabels.push("動画");
  }

  if (mediaLabels.length > 0) {
    const mediaBadge = document.createElement("span");
    mediaBadge.className = "fish-card-media-badge";
    mediaBadge.textContent = mediaLabels.join("＋");
    photoArea.appendChild(mediaBadge);
  }

  const body = document.createElement("div");
  body.className = "fish-card-body";

  const name = document.createElement("div");
  name.className = "fish-card-name";
  name.textContent = record.fish_name;

  const location = document.createElement("div");
  location.className = "fish-card-location";
  location.textContent = record.location_name
    ? `📍 ${record.location_name}`
    : "場所なし";

  const recordDate = getRecordDateValue(record);

  const dateRow = document.createElement("div");
  dateRow.className = "fish-card-date-row";

  const date = document.createElement("div");
  date.className = "fish-card-date";
  date.textContent = recordDate
    ? formatShortDate(recordDate)
    : "日付不明";

  dateRow.appendChild(date);

  if (recordDate) {
    const tide = document.createElement("span");
    tide.className = "fish-card-tide";
    tide.textContent = getTideCycleName(recordDate);
    tide.title = "月の満ち欠けを基準にした一般的な潮回りの目安";
    dateRow.appendChild(tide);

    if (record.tideTimes) {
      const tideTimes = document.createElement("span");
      tideTimes.className = "fish-card-tide-times";
      tideTimes.textContent = formatCompactTideTimes(record.tideTimes);
      tideTimes.title =
        "ピン位置付近の海面高度モデルから推定した満潮・干潮時刻";
      dateRow.appendChild(tideTimes);
    }
  }

  body.appendChild(name);
  body.appendChild(location);
  body.appendChild(dateRow);

  card.appendChild(photoArea);
  card.appendChild(body);

  card.addEventListener("click", () => openRecordDetail(record));

  card.addEventListener("keydown", (event) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      openRecordDetail(record);
    }
  });

  return card;
}

function renderCatchMap(records) {
  clearCatchMapMarkers();

  const mappedRecords = records.filter((record) => {
    return (
      Number.isFinite(Number(record.latitude)) &&
      Number.isFinite(Number(record.longitude))
    );
  });

  if (mappedRecords.length === 0) {
    catchMapElement.classList.add("hidden");
    catchMapMessage.textContent =
      "場所を登録した釣果が地図に表示されます。";
    return;
  }

  try {
    ensureHttpEnvironment();
    ensureLeafletAvailable();

    catchMapElement.classList.remove("hidden");

    if (!catchMap) {
      catchMap = L.map(catchMapElement, {
        center: DEFAULT_MAP_CENTER,
        zoom: 10
      });

      addOpenStreetMapTiles(catchMap);
    }

    requestAnimationFrame(() => {
      catchMap.invalidateSize();

      const bounds = [];

      for (const record of mappedRecords) {
        const position = [
          Number(record.latitude),
          Number(record.longitude)
        ];

        const marker = L.marker(position).addTo(catchMap);
        marker.bindPopup(createMapInfoContent(record));

        catchMapMarkers.push(marker);
        bounds.push(position);
      }

      if (bounds.length === 1) {
        catchMap.setView(bounds[0], 15);
      } else {
        catchMap.fitBounds(bounds, {
          padding: [24, 24]
        });
      }
    });

    catchMapMessage.textContent =
      "ピンを押すと釣果を確認できます。";
  } catch (error) {
    console.error(error);
    catchMapElement.classList.add("hidden");
    catchMapMessage.textContent =
      `釣果マップを表示できません：${
        error?.message || "不明なエラー"
      }`;
  }
}

function createMapInfoContent(record) {
  const container = document.createElement("div");
  container.className = "map-info";

  const mapPhotoUrl =
    record.signedUrl || record.signedUrl2;

  if (mapPhotoUrl) {
    const image = document.createElement("img");
    image.className = "map-info-photo";
    image.src = mapPhotoUrl;
    image.alt = record.fish_name;
    container.appendChild(image);
  }

  const name = document.createElement("div");
  name.className = "map-info-name";
  name.textContent = record.fish_name;
  container.appendChild(name);

  if (record.location_name) {
    const location = document.createElement("div");
    location.className = "map-info-location";
    location.textContent = `📍 ${record.location_name}`;
    container.appendChild(location);
  }

  const recordDate = getRecordDateValue(record);

  const date = document.createElement("div");
  date.className = "map-info-date";
  date.textContent = recordDate
    ? formatDate(recordDate)
    : "日付不明";
  container.appendChild(date);

  if (recordDate) {
    const tide = document.createElement("div");
    tide.className = "map-info-tide";
    tide.textContent = getTideCycleName(recordDate);
    tide.title = "月の満ち欠けを基準にした一般的な潮回りの目安";
    container.appendChild(tide);

    if (record.tideTimes) {
      const tideTimes = document.createElement("div");
      tideTimes.className = "map-info-tide-times";
      tideTimes.textContent = formatFullTideTimes(record.tideTimes);
      tideTimes.title =
        "ピン位置付近の海面高度モデルから推定した満潮・干潮時刻";
      container.appendChild(tideTimes);
    }
  }

  const detailButton = document.createElement("button");
  detailButton.className = "map-info-button";
  detailButton.type = "button";
  detailButton.textContent = "詳細を見る";
  detailButton.addEventListener("click", () => {
    catchMap.closePopup();
    openRecordDetail(record);
  });
  container.appendChild(detailButton);

  return container;
}

function clearCatchMapMarkers() {
  for (const marker of catchMapMarkers) {
    marker.remove();
  }

  catchMapMarkers = [];
}

function clearCatchMap() {
  clearCatchMapMarkers();
  catchMapElement.classList.add("hidden");
  catchMapMessage.textContent =
    "場所を登録した釣果が地図に表示されます。";
}

function openRecordDetail(record) {
  currentDetailRecord = record;
  resetDetailFishInfo();

  detailFishName.textContent = record.fish_name;
  detailLocation.textContent = record.location_name
    ? `📍 ${record.location_name}`
    : "場所なし";

  const recordDate = getRecordDateValue(record);

  if (recordDate) {
    detailDate.textContent = formatDate(recordDate);
    detailTideBadge.textContent = getTideCycleName(recordDate);
    detailTideBadge.classList.remove("hidden");

    if (record.tideTimes) {
      detailTideTimes.textContent =
        formatFullTideTimes(record.tideTimes);
      detailTideTimes.classList.remove("hidden");
    } else {
      detailTideTimes.textContent = "";
      detailTideTimes.classList.add("hidden");
    }
  } else {
    detailDate.textContent = "日付不明";
    detailTideBadge.textContent = "";
    detailTideBadge.classList.add("hidden");
    detailTideTimes.textContent = "";
    detailTideTimes.classList.add("hidden");
  }

  if (record.signedUrl) {
    detailPhoto.src = record.signedUrl;
    detailPhoto.alt = `${record.fish_name}の写真1`;
    detailPhotoButton.classList.remove("hidden");
  } else {
    detailPhoto.removeAttribute("src");
    detailPhotoButton.classList.add("hidden");
  }

  if (record.signedUrl2) {
    detailPhoto2.src = record.signedUrl2;
    detailPhoto2.alt = `${record.fish_name}の写真2`;
    detailPhotoButton2.classList.remove("hidden");
  } else {
    detailPhoto2.removeAttribute("src");
    detailPhotoButton2.classList.add("hidden");
  }

  if (record.videoSignedUrl) {
    detailVideo.src = record.videoSignedUrl;
    detailVideoMeta.textContent =
      Number.isFinite(Number(record.video_duration_seconds))
        ? `動画 ${formatDuration(
            Number(record.video_duration_seconds)
          )}`
        : "動画";

    detailVideoWrap.classList.remove("hidden");
  } else {
    detailVideo.pause();
    detailVideo.removeAttribute("src");
    detailVideo.load();
    detailVideoMeta.textContent = "";
    detailVideoWrap.classList.add("hidden");
  }

  const hasAnyMedia = Boolean(
    record.signedUrl ||
    record.signedUrl2 ||
    record.videoSignedUrl
  );

  detailNoPhoto.classList.toggle(
    "hidden",
    hasAnyMedia
  );

  showModal(detailModal);
  renderDetailMap(record);
}

function closeDetailModal() {
  currentDetailRecord = null;
  resetDetailFishInfo();

  detailPhoto.removeAttribute("src");
  detailPhoto2.removeAttribute("src");

  detailVideo.pause();
  detailVideo.removeAttribute("src");
  detailVideo.load();
  detailVideoMeta.textContent = "";

  hideModal(detailModal);
}

function renderDetailMap(record) {
  const lat = Number(record.latitude);
  const lng = Number(record.longitude);

  if (!Number.isFinite(lat) || !Number.isFinite(lng)) {
    detailMapElement.classList.add("hidden");
    return;
  }

  try {
    ensureHttpEnvironment();
    ensureLeafletAvailable();

    detailMapElement.classList.remove("hidden");

    if (!detailMap) {
      detailMap = L.map(detailMapElement, {
        center: [lat, lng],
        zoom: 16,
        zoomControl: true
      });

      addOpenStreetMapTiles(detailMap);
    }

    if (detailMapMarker) {
      detailMapMarker.remove();
    }

    detailMapMarker = L.marker([lat, lng]).addTo(detailMap);

    requestAnimationFrame(() => {
      detailMap.invalidateSize();
      detailMap.setView([lat, lng], 16);
    });
  } catch (error) {
    console.error(error);
    detailMapElement.classList.add("hidden");
  }
}

async function deleteCurrentDetailRecord() {
  if (!currentDetailRecord) {
    return;
  }

  const record = currentDetailRecord;
  const confirmed = confirm(
    `「${record.fish_name}」の記録を削除しますか？`
  );

  if (!confirmed) {
    return;
  }

  detailDeleteButton.disabled = true;

  try {
    const { error: deleteRecordError } =
      await supabaseClient
        .from("fish_records")
        .delete()
        .eq("id", record.id);

    if (deleteRecordError) {
      throw deleteRecordError;
    }

    const mediaPaths = [
      record.image_path,
      record.image_path_2,
      record.video_path
    ].filter(Boolean);

    let mediaDeleteFailed = false;

    if (mediaPaths.length > 0) {
      const { error: deleteMediaError } =
        await supabaseClient.storage
          .from("fish-photos")
          .remove(mediaPaths);

      mediaDeleteFailed = Boolean(deleteMediaError);

      if (deleteMediaError) {
        console.error(deleteMediaError);
      }
    }

    closeDetailModal();
    await loadRecords(false);

    if (mediaDeleteFailed) {
      setMessage(
        appMessage,
        "記録は削除しましたが、写真・動画ファイルの削除に失敗しました。",
        "error"
      );
    } else {
      setMessage(appMessage, "削除しました。", "success");
    }
  } catch (error) {
    console.error(error);
    alert(
      `削除できませんでした：${error?.message || "不明なエラー"}`
    );
  } finally {
    detailDeleteButton.disabled = false;
  }
}

function openImageModalByMedia(
  signedUrl,
  imagePath,
  fishName
) {
  if (!signedUrl || !imagePath) {
    return;
  }

  modalImage.src = signedUrl;
  imageModalPath = imagePath;
  imageModalFishName = fishName || "魚";
  showModal(imageModal);
}

function openImageModal(record) {
  if (!record) {
    return;
  }

  openImageModalByMedia(
    record.signedUrl,
    record.image_path,
    record.fish_name
  );
}

function closeImageModal() {
  modalImage.removeAttribute("src");
  imageModalPath = "";
  imageModalFishName = "";
  imageDownloadButton.disabled = false;
  imageDownloadButton.textContent = "ダウンロード";
  hideModal(imageModal);
}

function makeFileName(fishName) {
  const safeName = fishName
    .replace(/[\\/:*?"<>|]/g, "_")
    .trim();

  return `${safeName || "魚"}.jpg`;
}

async function downloadImage(imagePath, fishName, button) {
  if (!imagePath) {
    return;
  }

  button.disabled = true;
  const originalText = button.textContent;
  button.textContent = "準備中…";

  try {
    const { data: blob, error } =
      await supabaseClient.storage
        .from("fish-photos")
        .download(imagePath);

    if (error) {
      throw error;
    }

    const objectUrl = URL.createObjectURL(blob);
    const link = document.createElement("a");

    link.href = objectUrl;
    link.download = makeFileName(fishName);
    link.style.display = "none";

    document.body.appendChild(link);
    link.click();
    link.remove();

    setTimeout(() => {
      URL.revokeObjectURL(objectUrl);
    }, 1000);
  } catch (error) {
    console.error(error);
    alert(
      `写真をダウンロードできませんでした：${
        error?.message || "不明なエラー"
      }`
    );
  } finally {
    button.disabled = false;
    button.textContent = originalText;
  }
}

function readTideTimesCache() {
  try {
    const raw = localStorage.getItem(TIDE_TIMES_CACHE_KEY);

    if (!raw) {
      return {};
    }

    const parsed = JSON.parse(raw);

    return parsed && typeof parsed === "object"
      ? parsed
      : {};
  } catch (error) {
    console.warn("潮汐時刻キャッシュを読めませんでした。", error);
    return {};
  }
}

function writeTideTimesCache(cache) {
  try {
    localStorage.setItem(
      TIDE_TIMES_CACHE_KEY,
      JSON.stringify(cache)
    );
  } catch (error) {
    console.warn("潮汐時刻キャッシュを保存できませんでした。", error);
  }
}

function getRecordLocalDateKey(value) {
  if (!value) {
    return null;
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return null;
  }

  const pad = (number) => String(number).padStart(2, "0");

  return [
    date.getFullYear(),
    "-",
    pad(date.getMonth() + 1),
    "-",
    pad(date.getDate())
  ].join("");
}

function makeTideTimesCacheKey(latitude, longitude, dateKey) {
  /*
   * Open-Meteoの潮汐・海流モデルは約8 km格子なので、
   * キャッシュキーは小数第2位までにまとめます。
   */
  return [
    Number(latitude).toFixed(2),
    Number(longitude).toFixed(2),
    dateKey
  ].join("|");
}

function getCachedTideTimes(latitude, longitude, dateKey) {
  const key = makeTideTimesCacheKey(
    latitude,
    longitude,
    dateKey
  );
  const cache = readTideTimesCache();
  const item = cache[key];

  if (!item) {
    return null;
  }

  if (
    !Number.isFinite(item.savedAt) ||
    Date.now() - item.savedAt > TIDE_TIMES_CACHE_MAX_AGE_MS
  ) {
    delete cache[key];
    writeTideTimesCache(cache);
    return null;
  }

  return item.data || null;
}

function cacheTideTimes(latitude, longitude, dateKey, data) {
  const key = makeTideTimesCacheKey(
    latitude,
    longitude,
    dateKey
  );
  const cache = readTideTimesCache();

  cache[key] = {
    savedAt: Date.now(),
    data
  };

  writeTideTimesCache(cache);
}

function parseLocalApiTime(value) {
  const match = String(value || "").match(
    /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})$/
  );

  if (!match) {
    return null;
  }

  return {
    year: Number(match[1]),
    month: Number(match[2]),
    day: Number(match[3]),
    hour: Number(match[4]),
    minute: Number(match[5])
  };
}

function formatApiMinutes(baseTime, offsetHours = 0) {
  const parsed = parseLocalApiTime(baseTime);

  if (!parsed) {
    return "";
  }

  const totalMinutes =
    parsed.hour * 60 +
    parsed.minute +
    Math.round(offsetHours * 60);

  const normalized =
    ((totalMinutes % 1440) + 1440) % 1440;

  const hour = Math.floor(normalized / 60);
  const minute = normalized % 60;

  return `${String(hour).padStart(2, "0")}:${String(
    minute
  ).padStart(2, "0")}`;
}

function estimateExtremumOffset(previous, current, next) {
  const denominator =
    previous - 2 * current + next;

  if (
    !Number.isFinite(denominator) ||
    Math.abs(denominator) < 1e-9
  ) {
    return 0;
  }

  const offset =
    0.5 * (previous - next) / denominator;

  return Math.max(-0.5, Math.min(0.5, offset));
}

function extractHighLowTideTimes(times, heights) {
  const highs = [];
  const lows = [];

  for (let index = 1; index < heights.length - 1; index += 1) {
    const previous = Number(heights[index - 1]);
    const current = Number(heights[index]);
    const next = Number(heights[index + 1]);

    if (
      !Number.isFinite(previous) ||
      !Number.isFinite(current) ||
      !Number.isFinite(next)
    ) {
      continue;
    }

    if (current > previous && current >= next) {
      highs.push({
        time: formatApiMinutes(
          times[index],
          estimateExtremumOffset(previous, current, next)
        ),
        height: current
      });
    }

    if (current < previous && current <= next) {
      lows.push({
        time: formatApiMinutes(
          times[index],
          estimateExtremumOffset(previous, current, next)
        ),
        height: current
      });
    }
  }

  return {
    highs: highs.slice(0, 2),
    lows: lows.slice(0, 2)
  };
}

async function fetchTideTimes(latitude, longitude, dateKey) {
  const cached = getCachedTideTimes(
    latitude,
    longitude,
    dateKey
  );

  if (cached) {
    return cached;
  }

  const params = new URLSearchParams({
    latitude: String(latitude),
    longitude: String(longitude),
    hourly: "sea_level_height_msl",
    timezone: "auto",
    cell_selection: "sea",
    start_date: dateKey,
    end_date: dateKey
  });

  const response = await fetch(
    `${MARINE_API_URL}?${params.toString()}`
  );

  if (!response.ok) {
    throw new Error(
      `潮汐情報サービスからエラーが返されました（${response.status}）`
    );
  }

  const data = await response.json();
  const times = data?.hourly?.time;
  const heights = data?.hourly?.sea_level_height_msl;

  if (
    !Array.isArray(times) ||
    !Array.isArray(heights) ||
    times.length < 3 ||
    times.length !== heights.length
  ) {
    throw new Error("潮汐時刻を計算できるデータがありません。");
  }

  const result = extractHighLowTideTimes(times, heights);

  if (
    result.highs.length === 0 &&
    result.lows.length === 0
  ) {
    throw new Error("満潮・干潮の時刻を推定できませんでした。");
  }

  cacheTideTimes(
    latitude,
    longitude,
    dateKey,
    result
  );

  return result;
}

async function enrichRecordWithTideTimes(record) {
  const latitude = Number(record.latitude);
  const longitude = Number(record.longitude);
  const recordDate = getRecordDateValue(record);
  const dateKey = getRecordLocalDateKey(recordDate);

  if (
    !Number.isFinite(latitude) ||
    !Number.isFinite(longitude) ||
    !dateKey
  ) {
    return false;
  }

  try {
    const tideTimes = await fetchTideTimes(
      latitude,
      longitude,
      dateKey
    );

    record.tideTimes = tideTimes;
    return true;
  } catch (error) {
    console.warn(
      `潮汐時刻を取得できませんでした: ${record.fish_name}`,
      error
    );
    return false;
  }
}

async function enrichRecordsWithTideTimes(records) {
  const targets = records.filter((record) => {
    return (
      !record.tideTimes &&
      getRecordDateValue(record) &&
      Number.isFinite(Number(record.latitude)) &&
      Number.isFinite(Number(record.longitude))
    );
  });

  if (targets.length === 0) {
    return;
  }

  const results = await Promise.all(
    targets.map((record) =>
      enrichRecordWithTideTimes(record)
    )
  );

  if (!results.some(Boolean)) {
    return;
  }

  renderFilteredRecords();
  renderCatchMap(allRecords);

  if (currentDetailRecord) {
    const refreshedRecord = allRecords.find(
      (record) => record.id === currentDetailRecord.id
    );

    if (refreshedRecord) {
      openRecordDetail(refreshedRecord);
    }
  }
}

function getTideTimeListText(items) {
  if (!Array.isArray(items) || items.length === 0) {
    return "－";
  }

  return items
    .map((item) => item.time)
    .filter(Boolean)
    .join("/");
}

function formatCompactTideTimes(tideTimes) {
  return `満 ${getTideTimeListText(
    tideTimes.highs
  )}　干 ${getTideTimeListText(tideTimes.lows)}`;
}

function formatFullTideTimes(tideTimes) {
  return `満潮 ${getTideTimeListText(
    tideTimes.highs
  )}　干潮 ${getTideTimeListText(tideTimes.lows)}`;
}

function getRecordDateValue(record) {
  return record?.caught_at || null;
}

function formatDateTimeLocalValue(date) {
  const pad = (value) => String(value).padStart(2, "0");

  return [
    date.getFullYear(),
    "-",
    pad(date.getMonth() + 1),
    "-",
    pad(date.getDate()),
    "T",
    pad(date.getHours()),
    ":",
    pad(date.getMinutes())
  ].join("");
}

function getJulianDate(date) {
  return date.getTime() / 86400000 + 2440587.5;
}

function getMoonAgeForCalendarDate(value) {
  const sourceDate = new Date(value);

  if (Number.isNaN(sourceDate.getTime())) {
    return null;
  }

  /*
   * 「その日」の潮回りとして1日1種類に固定するため、
   * ブラウザのローカル日付の正午を基準にします。
   */
  const referenceDate = new Date(
    sourceDate.getFullYear(),
    sourceDate.getMonth(),
    sourceDate.getDate(),
    12,
    0,
    0,
    0
  );

  const julianDate = getJulianDate(referenceDate);
  let age =
    (julianDate - REFERENCE_NEW_MOON_JD) %
    SYNODIC_MONTH_DAYS;

  if (age < 0) {
    age += SYNODIC_MONTH_DAYS;
  }

  return age;
}

function getTideCycleName(value) {
  const moonAge = getMoonAgeForCalendarDate(value);

  if (moonAge === null) {
    return "潮不明";
  }

  /*
   * 月齢を最も近い整数日に丸め、旧暦日相当の1〜30日に変換します。
   * 海上保安庁が紹介する一般的な区分:
   * 大潮: 1〜2, 14〜17, 29〜30
   * 中潮: 3〜6, 12〜13, 18〜21, 27〜28
   * 小潮: 7〜9, 22〜24
   * 長潮: 10, 25
   * 若潮: 11, 26
   */
  const lunarDay = (Math.round(moonAge) % 30) + 1;

  if (
    lunarDay <= 2 ||
    (lunarDay >= 14 && lunarDay <= 17) ||
    lunarDay >= 29
  ) {
    return "大潮";
  }

  if (
    (lunarDay >= 3 && lunarDay <= 6) ||
    (lunarDay >= 12 && lunarDay <= 13) ||
    (lunarDay >= 18 && lunarDay <= 21) ||
    (lunarDay >= 27 && lunarDay <= 28)
  ) {
    return "中潮";
  }

  if (
    (lunarDay >= 7 && lunarDay <= 9) ||
    (lunarDay >= 22 && lunarDay <= 24)
  ) {
    return "小潮";
  }

  if (lunarDay === 10 || lunarDay === 25) {
    return "長潮";
  }

  if (lunarDay === 11 || lunarDay === 26) {
    return "若潮";
  }

  return "潮不明";
}

function formatDate(value) {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "";
  }

  return date.toLocaleString("ja-JP");
}

function formatShortDate(value) {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "";
  }

  return new Intl.DateTimeFormat("ja-JP", {
    month: "numeric",
    day: "numeric"
  }).format(date);
}

/* Events */
loginButton.addEventListener("click", login);
changeAccountButton.addEventListener("click", switchLoginAccount);
logoutButton.addEventListener("click", logout);

openAddButton.addEventListener("click", openAddModal);
closeAddButton.addEventListener("click", () => closeAddModal());

listTabButton.addEventListener("click", () => setActiveTab("list"));
mapTabButton.addEventListener("click", () => setActiveTab("map"));

searchInput.addEventListener("input", renderFilteredRecords);
refreshButton.addEventListener("click", () => loadRecords());

locationCheckButton.addEventListener(
  "click",
  checkLocationOnMap
);
saveButton.addEventListener("click", saveFish);
photoInput.addEventListener("change", handlePhotoChange);
videoInput.addEventListener("change", handleVideoChange);

locationInput.addEventListener("input", () => {
  const currentLocationName = locationInput.value.trim();

  if (
    locationResolvedFor &&
    currentLocationName !== locationResolvedFor
  ) {
    clearLocationSelection();

    if (currentLocationName) {
      setMessage(
        locationMessage,
        "場所名を変更したので、もう一度地図で確認してください。",
        "info"
      );
    } else {
      clearMessage(locationMessage);
    }
  }
});

closeDetailButton.addEventListener("click", closeDetailModal);
detailFishInfoToggleButton.addEventListener(
  "click",
  toggleDetailFishInfo
);
wikiInfoTabButton.addEventListener("click", () => {
  switchFishInfoSource("wiki");
});
bouzInfoTabButton.addEventListener("click", () => {
  switchFishInfoSource("bouz");
});
detailEditNameButton.addEventListener("click", editCurrentFishName);
detailPhotoButton.addEventListener("click", () => {
  openImageModal(currentDetailRecord);
});

detailPhotoButton2.addEventListener("click", () => {
  if (!currentDetailRecord) {
    return;
  }

  openImageModalByMedia(
    currentDetailRecord.signedUrl2,
    currentDetailRecord.image_path_2,
    currentDetailRecord.fish_name
  );
});

detailDeleteButton.addEventListener(
  "click",
  deleteCurrentDetailRecord
);

closeImageButton.addEventListener("click", closeImageModal);
imageDownloadButton.addEventListener("click", () => {
  downloadImage(
    imageModalPath,
    imageModalFishName,
    imageDownloadButton
  );
});

emailInput.addEventListener("keydown", (event) => {
  if (event.key === "Enter") {
    passwordInput.focus();
  }
});

passwordInput.addEventListener("keydown", (event) => {
  if (event.key === "Enter") {
    login();
  }
});

fishInput.addEventListener("keydown", (event) => {
  if (event.key === "Enter") {
    locationInput.focus();
  }
});

locationInput.addEventListener("keydown", (event) => {
  if (event.key === "Enter") {
    checkLocationOnMap();
  }
});

addModal.addEventListener("click", (event) => {
  if (event.target === addModal) {
    closeAddModal();
  }
});

detailModal.addEventListener("click", (event) => {
  if (event.target === detailModal) {
    closeDetailModal();
  }
});

imageModal.addEventListener("click", (event) => {
  if (event.target === imageModal) {
    closeImageModal();
  }
});

document.addEventListener("keydown", (event) => {
  if (event.key !== "Escape") {
    return;
  }

  if (imageModal.style.display === "block") {
    closeImageModal();
  } else if (detailModal.style.display === "block") {
    closeDetailModal();
  } else if (addModal.style.display === "block") {
    closeAddModal();
  }
});

window.addEventListener("focus", () => {
  if (
    currentUser &&
    !mainApp.classList.contains("hidden")
  ) {
    loadRecords(false);
  }
});

supabaseClient.auth.onAuthStateChange((event, session) => {
  if (event === "TOKEN_REFRESHED" && session?.user) {
    currentUser = session.user;
    userEmail.textContent = session.user.email || "";
    return;
  }

  if (event === "SIGNED_OUT") {
    currentUser = null;

    /*
     * logout()からのSIGNED_OUTでも呼ばれます。
     * UI更新は次のタスクに逃がし、Auth callback内で
     * Supabase処理を連鎖させないようにします。
     */
    setTimeout(() => {
      if (!loginPanel.classList.contains("hidden")) {
        return;
      }

      setLoginMode();
    }, 0);
  }
});

initializeApp();
