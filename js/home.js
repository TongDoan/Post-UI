import postApi from "./api/postApi";
import { getULPagenation, setTextcontent, truncateText } from "./utils";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import debounce from "lodash.debounce";
dayjs.extend(relativeTime);

function createElm(post) {
  if (!post) return;

  const postTemplate = document.getElementById("postItemTemplate");
  if (!postTemplate) return;

  const liElm = postTemplate.content.firstElementChild.cloneNode(true);
  if (!liElm) return;

  setTextcontent(liElm, '[data-id="title"]', post.title);
  setTextcontent(
    liElm,
    '[data-id="description"]',
    truncateText(post.description, 100)
  );
  setTextcontent(liElm, '[data-id="author"]', post.author);
  setTextcontent(
    liElm,
    '[data-id="timeSpan"]',
    `- ${dayjs(post.updatedAt).fromNow()}`
  );

  // const titleElm = liElm.querySelector('[data-id="title"]');
  // if (titleElm) titleElm.textContent = post.title;

  // const descriptioneElm = liElm.querySelector('[data-id="description"]');
  // if (descriptioneElm) descriptioneElm.textContent = post.description;

  // const authoreElm = liElm.querySelector('[data-id="author"]');
  // if (authoreElm) authoreElm.textContent = post.author;

  const thumbnaileElm = liElm.querySelector('[data-id="thumbnail"]');
  if (thumbnaileElm) {
    thumbnaileElm.src = post.imageUrl;
    thumbnaileElm.addEventListener("error", () => {
      thumbnaileElm.src = "https://via.placeholder.com/1368x400?text=thumbnail";
    });
  }

  return liElm;
}

function render(postlist) {
  // console.log({ postlist });
  if (!Array.isArray(postlist)) return;

  const ulElm = document.getElementById("postsList");
  if (!ulElm) return;
  ulElm.textContent = "";
  postlist.forEach((post) => {
    const liElm = createElm(post);
    ulElm.appendChild(liElm);
  });
}
function renderPagenation(pagination) {
  const ulPagenation = getULPagenation();
  if (!ulPagenation) return;

  const { _page, _limit, _totalRows } = pagination;
  const totalPages = Math.ceil(_totalRows / _limit);

  ulPagenation.dataset.page = _page;
  ulPagenation.dataset.totalPages = totalPages;

  if (_page <= 1) ulPagenation.firstElementChild?.classList.add("disabled");
  else ulPagenation.firstElementChild?.classList.remove("disabled");

  if (_page >= totalPages)
    ulPagenation.lastElementChild?.classList.add("disabled");
  else ulPagenation.lastElementChild?.classList.remove("disabled");
}
async function handleChange(filterName, filterValue) {
  try {
    const url = new URL(window.location);
    url.searchParams.set(filterName, filterValue);
    history.pushState({}, "", url);

    if (filterName === "title_like") url.searchParams.set("_page", 1);
    const { data, pagination } = await postApi.getAll(url.searchParams);
    render(data);
    renderPagenation(pagination);
  } catch (error) {
    console.log("HandleChange Failed", error);
  }
}
function handlePrev(e) {
  e.preventDefault();
  const urlPagenation = getULPagenation();
  if (!urlPagenation) return;
  const page = urlPagenation.dataset.page;

  if (page <= 1) return;
  handleChange("_page", page - 1);
}
function handleNext(e) {
  e.preventDefault();
  const urlPagenation = getULPagenation();
  if (!urlPagenation) return;
  const page = Number.parseInt(urlPagenation.dataset.page) || 1;
  const totalpage = urlPagenation.dataset.totalPages;
  if (page >= totalpage) return;
  handleChange("_page", page + 1);
}
function initPagination() {
  const uLp = getULPagenation();
  if (!uLp) return;

  const preLink = uLp.firstElementChild?.firstElementChild;
  if (preLink) {
    preLink.addEventListener("click", handlePrev);
  }

  const nextLink = uLp.lastElementChild?.lastElementChild;
  if (nextLink) {
    nextLink.addEventListener("click", handleNext);
  }
}

function innitSearch() {
  const searchIp = document.getElementById("searchInput");
  if (!searchIp) return;

  const queryParams = new URLSearchParams(window.location.search);
  if (queryParams.get("title_like")) {
    searchIp.value = queryParams.get("title_like");
  }
  const debounceSearch = debounce(
    (e) => handleChange("title_like", e.target.value),
    500
  );
  searchIp.addEventListener("input", debounceSearch);
}
(async () => {
  try {
    const url = new URL(window.location);
    if (!url.searchParams.get("_page")) url.searchParams.set("_page", 1);
    if (!url.searchParams.get("_limit")) url.searchParams.set("_limit", 6);

    history.pushState({}, "", url);
    const queryParams = url.searchParams;
    initPagination();
    innitSearch();
    // const queryParams = {
    //   _page: 1,
    //   _limit: 6,
    // };
    // const queryParams = new URLSearchParams(window.location.search);
    const { data, pagination } = await postApi.getAll(queryParams);
    render(data);
    renderPagenation(pagination);
  } catch (error) {
    console.log("Failed", error);
  }
})();
