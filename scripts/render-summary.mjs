import fs from "node:fs";
import path from "node:path";

const args = process.argv.slice(2);
const valueAfter = (name) => {
  const index = args.indexOf(name);
  return index >= 0 ? args[index + 1] : undefined;
};

const forbiddenKeys = new Set([
  "name", "realname", "fullname", "clientname", "phone", "email", "address",
  "transcript", "rawtranscript", "medicalhistory", "diagnosis"
]);

function fail(message) {
  throw new Error(message);
}

function assertNoForbiddenKeys(value, trail = "root") {
  if (Array.isArray(value)) {
    value.forEach((item, index) => assertNoForbiddenKeys(item, `${trail}[${index}]`));
    return;
  }
  if (!value || typeof value !== "object") return;
  for (const [key, child] of Object.entries(value)) {
    const normalized = key.toLowerCase().replace(/[^a-z]/g, "");
    if (forbiddenKeys.has(normalized)) fail(`Forbidden field "${key}" at ${trail}`);
    assertNoForbiddenKeys(child, `${trail}.${key}`);
  }
}

function requireText(value, field, max = 500) {
  if (typeof value !== "string" || !value.trim()) fail(`${field} must be non-empty text`);
  if (value.length > max) fail(`${field} exceeds ${max} characters`);
  return value.trim();
}

function validate(data, source) {
  assertNoForbiddenKeys(data);
  const shareId = requireText(data.shareId, "shareId", 64);
  if (!/^[a-z0-9][a-z0-9-]{14,62}[a-z0-9]$/.test(shareId)) {
    fail("shareId must be 16-64 lowercase letters, numbers, or hyphens");
  }
  const cards = data.cards;
  if (!Array.isArray(cards) || cards.length < 1 || cards.length > 12) {
    fail("cards must contain 1-12 items");
  }
  const resources = data.resources ?? [];
  if (!Array.isArray(resources) || resources.length > 6) {
    fail("resources must contain 0-6 items");
  }
  return {
    shareId,
    label: requireText(data.label ?? "BODYWORK ADVICE", "label", 60),
    title: requireText(data.title, "title", 120),
    lead: requireText(data.lead, "lead", 400),
    note: requireText(data.note, "note", 600),
    footer: requireText(data.footer, "footer", 500),
    resources: resources.map((resource, index) => {
      const href = requireText(resource.href, `resources[${index}].href`, 400);
      let url;
      try {
        url = new URL(href);
      } catch {
        fail(`resources[${index}].href must be a valid URL`);
      }
      if (url.protocol !== "https:") fail(`resources[${index}].href must use https`);
      return {
        label: requireText(resource.label, `resources[${index}].label`, 100),
        href: url.href
      };
    }),
    cards: cards.map((card, index) => {
      const points = card.points;
      if (!Array.isArray(points) || points.length < 1 || points.length > 6) {
        fail(`cards[${index}].points must contain 1-6 items`);
      }
      const flow = card.flow ?? [];
      if (!Array.isArray(flow) || flow.length > 6) fail(`cards[${index}].flow must contain 0-6 items`);
      const color = requireText(card.color ?? "#c98a3d", `cards[${index}].color`, 20);
      if (!/^#[0-9a-fA-F]{6}$/.test(color)) fail(`cards[${index}].color must be a hex color`);
      return {
        id: index + 1,
        mark: requireText(card.mark ?? String(index + 1).padStart(2, "0"), `cards[${index}].mark`, 8),
        tag: requireText(card.tag, `cards[${index}].tag`, 24),
        color,
        title: requireText(card.title, `cards[${index}].title`, 100),
        summary: requireText(card.summary, `cards[${index}].summary`, 400),
        flow: flow.map((item, flowIndex) => requireText(item, `cards[${index}].flow[${flowIndex}]`, 40)),
        points: points.map((item, pointIndex) => requireText(item, `cards[${index}].points[${pointIndex}]`, 240)),
        tip: requireText(card.tip, `cards[${index}].tip`, 400)
      };
    }),
    source
  };
}

function safeJson(value) {
  return JSON.stringify(value).replaceAll("<", "\\u003c").replaceAll(">", "\\u003e").replaceAll("&", "\\u0026");
}

function html(data) {
  return `<!doctype html>
<html lang="ja">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<meta name="robots" content="noindex,nofollow">
<meta name="theme-color" content="#f7f4ee">
<title>${data.title.replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;")}</title>
<style>
:root{--paper:#f7f4ee;--panel:#fffdf8;--ink:#2e2a25;--muted:#766d63;--line:#ded5c9}*{box-sizing:border-box}body{margin:0;min-height:100vh;color:var(--ink);background:radial-gradient(circle at 8% 0%,rgba(201,138,61,.15),transparent 28rem),var(--paper);font-family:-apple-system,BlinkMacSystemFont,"Hiragino Sans","Yu Gothic","Noto Sans JP",sans-serif;line-height:1.75}button{font:inherit}.page{width:min(100%,820px);margin:0 auto;padding:28px 15px 48px}.hero{text-align:center;margin-bottom:20px}.label{display:inline-block;padding:6px 16px;margin-bottom:12px;border:1px solid var(--line);border-radius:999px;background:var(--panel);font-size:.72rem;font-weight:850;letter-spacing:.12em}h1{margin:0 0 10px;font-family:"Yu Mincho","Hiragino Mincho ProN",serif;font-size:clamp(1.7rem,6vw,2.7rem);line-height:1.35}.lead{max-width:650px;margin:0 auto;color:var(--muted);font-size:.9rem}.note,.footer{margin:18px 0;padding:15px 16px;background:rgba(255,253,248,.9);border:1px solid var(--line);border-radius:16px}.note p,.footer p{margin:0;color:#5e574f;font-size:.84rem}.cards{display:grid;gap:13px}.card{--color:#c98a3d;display:block;width:100%;padding:0;text-align:left;color:inherit;background:var(--panel);border:1px solid var(--line);border-radius:19px;box-shadow:0 8px 22px rgba(65,49,32,.06);overflow:hidden;cursor:pointer}.card-head{display:grid;grid-template-columns:48px 1fr 24px;gap:11px;align-items:center;padding:14px}.mark{display:grid;width:46px;height:46px;place-items:center;border-radius:14px;color:var(--color);background:color-mix(in srgb,var(--color) 14%,white);font-weight:900}.tag{display:inline-block;margin-bottom:3px;color:var(--color);font-size:.66rem;font-weight:900;letter-spacing:.08em}.card h2{margin:0;font-size:1rem;line-height:1.45}.arrow{color:var(--color);text-align:center;transition:transform .18s}.card[aria-expanded="true"] .arrow{transform:rotate(180deg)}.card-body{display:none;padding:0 16px 17px 73px}.card[aria-expanded="true"] .card-body{display:block}.summary{margin:0 0 13px;color:var(--muted);font-size:.86rem}.flow{display:flex;flex-wrap:wrap;align-items:center;gap:6px;margin-bottom:14px}.chip{padding:5px 8px;border:1px solid color-mix(in srgb,var(--color) 35%,var(--line));border-radius:999px;background:#fff;font-size:.72rem;font-weight:800}.flow-arrow{color:var(--color);font-weight:900}.points{display:grid;gap:9px}.point{display:grid;grid-template-columns:24px 1fr;gap:9px}.num{display:grid;width:24px;height:24px;place-items:center;border-radius:50%;color:var(--color);background:color-mix(in srgb,var(--color) 14%,white);font-size:.72rem;font-weight:900}.point p{margin:0;font-size:.87rem}.tip{margin-top:14px;padding:12px 13px;border-left:4px solid var(--color);border-radius:12px;background:color-mix(in srgb,var(--color) 8%,white)}.tip strong{display:block;color:var(--color);font-size:.76rem}.tip p{margin:3px 0 0;font-size:.82rem}.footer strong{color:#4f463d}@media(max-width:540px){.card-body{padding:0 14px 16px}.card-head{grid-template-columns:43px 1fr 22px}.mark{width:41px;height:41px}}@media(prefers-reduced-motion:reduce){.arrow{transition:none}}
.resources{margin:18px 0;padding:16px;background:rgba(255,253,248,.94);border:1px solid var(--line);border-radius:16px}.resources h2{margin:0 0 10px;font-size:.92rem}.resource-links{display:flex;flex-wrap:wrap;gap:9px}.resource-link{display:inline-flex;align-items:center;padding:9px 13px;border-radius:999px;background:#c98a3d;color:#fff;font-size:.8rem;font-weight:850;text-decoration:none}.resource-link::after{margin-left:7px;content:"↗"}@media(max-width:540px){.resource-links{display:grid}.resource-link{justify-content:space-between}}
</style>
</head>
<body>
<main class="page">
  <header class="hero"><div class="label" id="label"></div><h1 id="title"></h1><p class="lead" id="lead"></p></header>
  <section class="note"><p id="note"></p></section>
  <section class="cards" id="cards" aria-label="アドバイスサマリー"></section>
  <section class="resources" id="resources" hidden><h2>体操図鑑で動きを確認</h2><div class="resource-links" id="resourceLinks"></div></section>
  <footer class="footer"><p><strong id="footer"></strong></p></footer>
</main>
<script>
const data=${safeJson(data)};
document.getElementById("label").textContent=data.label;
document.getElementById("title").textContent=data.title;
document.getElementById("lead").textContent=data.lead;
document.getElementById("note").textContent=data.note;
document.getElementById("footer").textContent=data.footer;
const cards=document.getElementById("cards");
const el=(tag,className,text)=>{const node=document.createElement(tag);if(className)node.className=className;if(text!==undefined)node.textContent=text;return node};
if(data.resources.length){
  const resources=document.getElementById("resources");
  const resourceLinks=document.getElementById("resourceLinks");
  data.resources.forEach(resource=>{
    const link=el("a","resource-link",resource.label);
    link.href=resource.href;
    link.target="_blank";
    link.rel="noopener noreferrer";
    resourceLinks.append(link);
  });
  resources.hidden=false;
}
data.cards.forEach((card,index)=>{
  const button=el("button","card");
  button.type="button";
  button.style.setProperty("--color",card.color);
  button.setAttribute("aria-expanded",String(index===0));
  const head=el("span","card-head");
  head.append(el("span","mark",card.mark));
  const heading=el("span");
  heading.append(el("span","tag",card.tag),el("h2","",card.title));
  head.append(heading,el("span","arrow","▼"));
  const body=el("span","card-body");
  body.append(el("p","summary",card.summary));
  if(card.flow.length){
    const flow=el("span","flow");
    card.flow.forEach((item,flowIndex)=>{
      if(flowIndex)flow.append(el("span","flow-arrow","→"));
      flow.append(el("span","chip",item));
    });
    body.append(flow);
  }
  const points=el("span","points");
  card.points.forEach((item,pointIndex)=>{
    const point=el("span","point");
    point.append(el("span","num",String(pointIndex+1)),el("p","",item));
    points.append(point);
  });
  const tip=el("span","tip");
  tip.append(el("strong","","扱い方"),el("p","",card.tip));
  body.append(points,tip);
  button.append(head,body);
  button.addEventListener("click",()=>button.setAttribute("aria-expanded",String(button.getAttribute("aria-expanded")!=="true")));
  cards.append(button);
});
</script>
</body>
</html>`;
}

function renderFile(inputPath, outputDir) {
  const raw = fs.readFileSync(inputPath, "utf8");
  const data = validate(JSON.parse(raw), inputPath);
  const targetDir = outputDir ?? path.join("public", "s", data.shareId);
  fs.mkdirSync(targetDir, { recursive: true });
  fs.writeFileSync(path.join(targetDir, "index.html"), html(data), "utf8");
  console.log(`${inputPath} -> ${targetDir}/index.html`);
}

if (args.includes("--all")) {
  const inbox = "summary-inbox";
  const files = fs.existsSync(inbox)
    ? fs.readdirSync(inbox).filter((name) => name.endsWith(".json")).sort()
    : [];
  if (!files.length) console.log("No summary JSON files found; existing public site will be deployed unchanged.");
  for (const file of files) renderFile(path.join(inbox, file));
} else {
  const input = valueAfter("--input");
  const output = valueAfter("--output");
  if (!input) fail("Use --all or --input <json> [--output <dir>]");
  renderFile(input, output);
}
