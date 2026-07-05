const { createClient } = window.supabase;

const SUPABASE_URL = "https://hzjrmruoxvthhkmsgdik.supabase.co";
const SUPABASE_PUBLISHABLE_KEY =
  "sb_publishable_bCmnAdCRkpMGhIhC6YyHRg_olf4-bV5";


const WIKIPEDIA_API_URL = "https://ja.wikipedia.org/w/api.php";
const WIKI_CACHE_KEY = "fishMemoWikipediaCacheV1";
const WIKI_CACHE_MAX_AGE_MS = 7 * 24 * 60 * 60 * 1000;
const WIKI_INPUT_DELAY_MS = 700;

const OSM_TILE_URL = "https://tile.openstreetmap.org/{z}/{x}/{y}.png";
const NOMINATIM_SEARCH_URL =
  "https://nominatim.openstreetmap.org/search";

const DEFAULT_MAP_CENTER = [34.6937, 135.5023];
const NOMINATIM_MIN_INTERVAL_MS = 1100;
const GEOCODE_CACHE_KEY = "fishMemoGeocodeCacheV1";
const GEOCODE_CACHE_MAX_AGE_MS = 30 * 24 * 60 * 60 * 1000;

/*
 * 潮回りは、海上保安庁が紹介する旧暦日ベースの一般的な区分を使います。
 * 月齢は平均朔望月と既知の新月基準日から算出し、その日の正午時点で判定します。
 * 地域によって呼び分けが異なる場合があるため、UI上は「目安」として扱います。
 */
const SYNODIC_MONTH_DAYS = 29.530588853;
const REFERENCE_NEW_MOON_JD = 2451550.25972;

const supabaseClient = createClient(
  SUPABASE_URL,
  SUPABASE_PUBLISHABLE_KEY
);

/* Login */
const loginPanel = document.getElementById("loginPanel");
const mainApp = document.getElementById("mainApp");
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
const previewImage = document.getElementById("previewImage");
const saveButton = document.getElementById("saveButton");
const addMessage = document.getElementById("addMessage");

/* Detail modal */
const detailModal = document.getElementById("detailModal");
const closeDetailButton = document.getElementById("closeDetailButton");
const detailPhotoButton = document.getElementById("detailPhotoButton");
const detailPhoto = document.getElementById("detailPhoto");
const detailNoPhoto = document.getElementById("detailNoPhoto");
const detailFishName = document.getElementById("detailFishName");
const detailLocation = document.getElementById("detailLocation");
const detailDate = document.getElementById("detailDate");
const detailTideBadge = document.getElementById("detailTideBadge");
const detailFishInfoToggleButton = document.getElementById(
  "detailFishInfoToggleButton"
);
const detailFishInfoPanel = document.getElementById(
  "detailFishInfoPanel"
);
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

let selectedImageBlob = null;
let previewObjectUrl = "";
let imageProcessing = false;

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
  detailFishInfoLoadedFor = "";

  detailFishInfoToggleButton.textContent = "魚種情報を見る";
  detailFishInfoToggleButton.setAttribute("aria-expanded", "false");

  detailFishInfoPanel.classList.add("hidden");
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

  const currentKey = normalizeFishInfoKey(
    currentDetailRecord.fish_name
  );

  if (detailFishInfoLoadedFor !== currentKey) {
    await loadDetailFishInfo(currentDetailRecord);
  }
}

function setLoginMode() {
  currentUser = null;
  allRecords = [];
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
  userEmail.textContent = user.email || "";
  loginPanel.classList.add("hidden");
  mainApp.classList.remove("hidden");
  clearMessage(loginMessage);
  passwordInput.value = "";
  setActiveTab("list");
  await loadRecords();
}

async function initializeApp() {
  setMessage(loginMessage, "確認中です…", "info");

  try {
    const {
      data: { session },
      error
    } = await supabaseClient.auth.getSession();

    if (error) {
      throw error;
    }

    if (session?.user) {
      await setAppMode(session.user);
    } else {
      setLoginMode();
      clearMessage(loginMessage);
    }
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
  const email = emailInput.value.trim();
  const password = passwordInput.value;

  if (!email || !password) {
    setMessage(
      loginMessage,
      "メールアドレスとパスワードを入力してください。",
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
    locationInput.value.trim() ||
    selectedImageBlob;

  if (!force && hasInput) {
    const confirmed = confirm("入力中の内容を閉じますか？");

    if (!confirmed) {
      return;
    }
  }

  resetAddForm();
  hideModal(addModal);
}

function revokePreviewUrl() {
  if (previewObjectUrl) {
    URL.revokeObjectURL(previewObjectUrl);
    previewObjectUrl = "";
  }
}

function clearLocationSelection() {
  selectedLocation = null;
  locationResolvedFor = "";

  if (locationMarker) {
    locationMarker.remove();
    locationMarker = null;
  }

  locationMapSection.classList.add("hidden");
}

function resetAddForm() {
  fishInput.value = "";
  caughtAtInput.value = "";
  locationInput.value = "";
  photoInput.value = "";

  selectedImageBlob = null;
  imageProcessing = false;

  revokePreviewUrl();
  clearLocationSelection();

  previewImage.removeAttribute("src");
  preview.style.display = "none";

  clearMessage(locationMessage);
  clearMessage(addMessage);
  saveButton.disabled = false;
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
  const file = photoInput.files?.[0];

  selectedImageBlob = null;
  revokePreviewUrl();
  previewImage.removeAttribute("src");
  preview.style.display = "none";
  clearMessage(addMessage);

  if (!file) {
    return;
  }

  imageProcessing = true;
  saveButton.disabled = true;
  setMessage(addMessage, "写真を処理中です…", "info");

  try {
    selectedImageBlob = await resizeImageToJpeg(file);
    previewObjectUrl = URL.createObjectURL(selectedImageBlob);
    previewImage.src = previewObjectUrl;
    preview.style.display = "block";
    setMessage(addMessage, "写真を追加できます。", "success");
  } catch (error) {
    console.error(error);
    photoInput.value = "";
    selectedImageBlob = null;
    setMessage(
      addMessage,
      error?.message || "写真を読み込めませんでした。",
      "error"
    );
  } finally {
    imageProcessing = false;
    saveButton.disabled = false;
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
  const fishName = fishInput.value.trim();
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

  if (!fishName) {
    setMessage(addMessage, "魚種を入力してください。", "error");
    fishInput.focus();
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

  if (imageProcessing) {
    setMessage(
      addMessage,
      "写真の処理が終わるまでお待ちください。",
      "info"
    );
    return;
  }

  saveButton.disabled = true;
  setMessage(addMessage, "保存中です…", "info");

  let imagePath = null;

  try {
    if (selectedImageBlob) {
      imagePath = `${currentUser.id}/${makeStorageFileName()}`;

      const { error: uploadError } = await supabaseClient.storage
        .from("fish-photos")
        .upload(imagePath, selectedImageBlob, {
          contentType: "image/jpeg",
          upsert: false
        });

      if (uploadError) {
        throw uploadError;
      }
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
        user_id: currentUser.id
      });

    if (insertError) {
      if (imagePath) {
        await supabaseClient.storage
          .from("fish-photos")
          .remove([imagePath]);
      }

      throw insertError;
    }

    resetAddForm();
    hideModal(addModal);
    setActiveTab("list");
    await loadRecords(false);
    setMessage(appMessage, "保存しました。", "success");
  } catch (error) {
    console.error(error);
    setMessage(
      addMessage,
      `保存できませんでした：${error?.message || "不明なエラー"}`,
      "error"
    );
  } finally {
    saveButton.disabled = false;
  }
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
        "id, fish_name, caught_at, location_name, latitude, longitude, image_path, created_at"
      )
      .order("created_at", { ascending: false });

    if (error) {
      throw error;
    }

    allRecords = await Promise.all(
      (records || []).map(async (record) => {
        if (!record.image_path) {
          return {
            ...record,
            signedUrl: null,
            photoLoadError: false
          };
        }

        const { data, error: signedUrlError } =
          await supabaseClient.storage
            .from("fish-photos")
            .createSignedUrl(
              record.image_path,
              60 * 60 * 24
            );

        return {
          ...record,
          signedUrl: signedUrlError
            ? null
            : data?.signedUrl || null,
          photoLoadError: Boolean(signedUrlError)
        };
      })
    );

    renderFilteredRecords();
    renderCatchMap(allRecords);

    if (showLoading) {
      clearMessage(appMessage);
    }
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

  if (record.signedUrl) {
    const image = document.createElement("img");
    image.className = "fish-card-photo";
    image.src = record.signedUrl;
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
      : "写真なし";
    photoArea.appendChild(placeholder);
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

  if (record.signedUrl) {
    const image = document.createElement("img");
    image.className = "map-info-photo";
    image.src = record.signedUrl;
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
  } else {
    detailDate.textContent = "日付不明";
    detailTideBadge.textContent = "";
    detailTideBadge.classList.add("hidden");
  }

  if (record.signedUrl) {
    detailPhoto.src = record.signedUrl;
    detailPhoto.alt = record.fish_name;
    detailPhotoButton.classList.remove("hidden");
    detailNoPhoto.classList.add("hidden");
    detailDownloadButton.classList.remove("hidden");
  } else {
    detailPhoto.removeAttribute("src");
    detailPhotoButton.classList.add("hidden");
    detailNoPhoto.classList.remove("hidden");
    detailDownloadButton.classList.add("hidden");
  }

  showModal(detailModal);
  renderDetailMap(record);
}

function closeDetailModal() {
  currentDetailRecord = null;
  resetDetailFishInfo();
  detailPhoto.removeAttribute("src");
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

    let photoDeleteFailed = false;

    if (record.image_path) {
      const { error: deletePhotoError } =
        await supabaseClient.storage
          .from("fish-photos")
          .remove([record.image_path]);

      photoDeleteFailed = Boolean(deletePhotoError);

      if (deletePhotoError) {
        console.error(deletePhotoError);
      }
    }

    closeDetailModal();
    await loadRecords(false);

    if (photoDeleteFailed) {
      setMessage(
        appMessage,
        "記録は削除しましたが、写真ファイルの削除に失敗しました。",
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

function openImageModal(record) {
  if (!record?.signedUrl || !record?.image_path) {
    return;
  }

  modalImage.src = record.signedUrl;
  imageModalPath = record.image_path;
  imageModalFishName = record.fish_name;
  showModal(imageModal);
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
detailPhotoButton.addEventListener("click", () => {
  openImageModal(currentDetailRecord);
});
detailDownloadButton.addEventListener("click", () => {
  if (currentDetailRecord) {
    downloadImage(
      currentDetailRecord.image_path,
      currentDetailRecord.fish_name,
      detailDownloadButton
    );
  }
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

initializeApp();
