(function () {
  const scriptTag = document.currentScript;
  if (!scriptTag) return;
  const lang = scriptTag.getAttribute("data-lang") || "ja";
  const origin = scriptTag.src.replace(/\/widget\.js.*/, "");

  const container = document.createElement("div");
  container.id = "voynezusus-widget";
  container.style.position = "fixed";
  container.style.bottom = "16px";
  container.style.right = "16px";
  container.style.zIndex = "9999";

  const button = document.createElement("button");
  button.textContent = lang === "ja" ? "施設AIチャット" : "Ask Facility";
  button.style.background = "#1f8ea8";
  button.style.color = "#fff";
  button.style.padding = "12px 16px";
  button.style.borderRadius = "999px";
  button.style.border = "none";
  button.style.boxShadow = "0 10px 25px rgba(0,0,0,0.15)";

  const iframe = document.createElement("iframe");
  iframe.src = `${origin}/${lang}/chat?mode=widget`;
  iframe.style.width = "320px";
  iframe.style.height = "480px";
  iframe.style.border = "none";
  iframe.style.borderRadius = "16px";
  iframe.style.boxShadow = "0 10px 30px rgba(0,0,0,0.25)";
  iframe.style.marginTop = "12px";
  iframe.hidden = true;

  button.addEventListener("click", () => {
    iframe.hidden = !iframe.hidden;
  });

  container.appendChild(button);
  container.appendChild(iframe);
  document.body.appendChild(container);
})();
