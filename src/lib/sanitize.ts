import xss from "xss";

export function sanitizeRichText(html: string) {
  return xss(html, {
    whiteList: {
      a: ["href", "title", "rel", "target"],
      p: ["class"],
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
      code: [],
      pre: []
    },
    stripIgnoreTag: true
  });
}
