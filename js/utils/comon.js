export function setTextcontent(p, e, t) {
  if (!p) return;

  const elm = p.querySelector(e);
  if (elm) elm.textContent = t;
}

export function truncateText(t, maxlength) {
  if (t.length <= maxlength) return t;

  return `${t.slice(0, maxlength - 1)}…`;
}

export function getULPagenation() {
  return document.getElementById("postsPagination");
}
