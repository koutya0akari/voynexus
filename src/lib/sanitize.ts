import xss from "xss";

export function sanitizeRichText(html: string) {
  return xss(html, {
    whiteList: {
      a: ["href", "title", "rel", "target"],
      p: ["class"],
      br: [],
      ul: [],
      ol: [],
      li: [],
      strong: [],
      em: [],
      h2: [],
      h3: [],
      h4: [],
      blockquote: [],
      img: ["src", "alt", "width", "height", "loading"],
      figure: ["class"],
      figcaption: [],
      code: [],
      pre: [],
    },
    stripIgnoreTag: true,
  });
}
