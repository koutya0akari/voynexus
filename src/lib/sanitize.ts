import xss from "xss";

function normalizeImageTags(markup: string) {
  return markup.replace(/<img\b([^>]*)>/gi, (match, rawAttributes) => {
    let attrs = rawAttributes;
    let selfClosing = false;

    if (/\/\s*$/.test(attrs)) {
      selfClosing = true;
      attrs = attrs.replace(/\/\s*$/u, "");
    }

    attrs = attrs.replace(/\s+$/u, "");
    if (!attrs.startsWith(" ")) {
      attrs = ` ${attrs}`;
    }

    const ensureAttr = (name: string, value: string) => {
      const pattern = new RegExp(`\\b${name}\\s*=`, "i");
      if (pattern.test(attrs)) {
        attrs = attrs.replace(
          new RegExp(`\\b${name}\\s*=\\s*"([^\"]*)"`, "i"),
          (_match: string, current: string) => {
            if (name === "class") {
              const existing = current.split(/\s+/u).filter(Boolean);
              if (!existing.includes(value)) {
                existing.push(value);
              }
              return `${name}="${existing.join(" ")}"`;
            }
            return `${name}="${value}"`;
          }
        );
      } else {
        attrs = `${attrs} ${name}="${value}"`;
      }
    };

    const normalizeSchemeRelative = (value: string) =>
      value.replace(
        /(^|\s)(\/\/[^\s,]+)/giu,
        (_segment: string, prefix: string, url: string) => `${prefix}https:${url}`
      );

    attrs = attrs.replace(
      /\bsrc\s*=\s*(['"])(\/\/[^'"\s>]+)\1/iu,
      (_match: string, quote: string, resource: string) => ` src=${quote}https:${resource}${quote}`
    );

    attrs = attrs.replace(
      /\bsrcset\s*=\s*(['"])([^'"]*)\1/iu,
      (_match: string, quote: string, value: string) => {
        const normalized = normalizeSchemeRelative(value);
        return ` srcset=${quote}${normalized}${quote}`;
      }
    );

    ensureAttr("class", "voynexus-rich-img");
    ensureAttr("loading", "lazy");
    ensureAttr("decoding", "async");

    const hasWidth = /\bwidth\s*=/i.test(attrs);
    const hasSizes = /\bsizes\s*=/i.test(attrs);
    if (!hasSizes) {
      const sizesValue = hasWidth ? "100vw" : "(max-width: 768px) 96vw, 640px";
      ensureAttr("sizes", sizesValue);
    }

    const closing = selfClosing ? " />" : ">";
    return `<img${attrs}${closing}`;
  });
}

export function sanitizeRichText(html: string) {
  const cleaned = xss(html, {
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
      img: ["src", "alt", "width", "height", "loading", "srcset", "sizes", "decoding"],
      figure: ["class"],
      figcaption: [],
      code: [],
      pre: [],
    },
    stripIgnoreTag: true,
  });

  return normalizeImageTags(cleaned);
}
