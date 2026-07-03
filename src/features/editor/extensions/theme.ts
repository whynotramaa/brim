import { EditorView } from "@codemirror/view";
import { HighlightStyle, syntaxHighlighting } from "@codemirror/language";
import { tags as t } from "@lezer/highlight";
import type { Extension } from "@codemirror/state";

/**
 * Ayu Dark theme for CodeMirror, rendered in Geist Mono.
 * Palette from the official Ayu (dark) scheme.
 */
const ayu = {
  bg: "#0B0E14",
  fgDefault: "#BFBDB6",
  line: "#131721",
  selection: "#409FFF33",
  cursor: "#E6B450",
  gutterFg: "#6C7380",
  gutterActiveFg: "#E6B450",
  panel: "#0D1017",
  tooltipBg: "#0F131A",
  border: "#1B222D",

  comment: "#646B73",
  keyword: "#FF8F40",
  string: "#AAD94C",
  regexp: "#95E6CB",
  constant: "#D2A6FF",
  func: "#FFB454",
  type: "#59C2FF",
  property: "#59C2FF",
  tag: "#39BAE6",
  operator: "#F29668",
  meta: "#E6B673",
  invalid: "#D95757",
};

const editorTheme = EditorView.theme(
  {
    "&": {
      color: ayu.fgDefault,
      backgroundColor: ayu.bg,
      height: "100%",
      outline: "none !important",
    },
    ".cm-content": {
      fontFamily: "var(--font-geist-mono), monospace",
      fontSize: "14px",
      caretColor: ayu.cursor,
    },
    ".cm-cursor, .cm-dropCursor": { borderLeftColor: ayu.cursor },
    "&.cm-focused .cm-selectionBackground, .cm-selectionBackground, .cm-content ::selection":
      { backgroundColor: ayu.selection },
    ".cm-activeLine": { backgroundColor: ayu.line },
    ".cm-gutters": {
      backgroundColor: ayu.bg,
      color: ayu.gutterFg,
      border: "none",
    },
    ".cm-activeLineGutter": {
      backgroundColor: ayu.line,
      color: ayu.gutterActiveFg,
    },
    ".cm-foldPlaceholder": {
      backgroundColor: "transparent",
      border: "none",
      color: ayu.comment,
    },
    ".cm-scroller": {
      fontFamily: "var(--font-geist-mono), monospace",
      scrollbarWidth: "thin",
      scrollbarColor: "#3f3f46 transparent",
    },
    ".cm-panels": { backgroundColor: ayu.panel, color: ayu.fgDefault },
    ".cm-searchMatch": {
      backgroundColor: ayu.selection,
      outline: `1px solid ${ayu.border}`,
    },
    ".cm-searchMatch.cm-searchMatch-selected": {
      backgroundColor: "#409FFF55",
    },
    ".cm-tooltip": {
      backgroundColor: ayu.tooltipBg,
      border: `1px solid ${ayu.border}`,
      color: ayu.fgDefault,
    },
    ".cm-tooltip-autocomplete ul li[aria-selected]": {
      backgroundColor: ayu.line,
      color: ayu.fgDefault,
    },
  },
  { dark: true }
);

const ayuHighlight = HighlightStyle.define([
  { tag: t.comment, color: ayu.comment, fontStyle: "italic" },
  {
    tag: [t.keyword, t.moduleKeyword, t.operatorKeyword, t.controlKeyword],
    color: ayu.keyword,
  },
  { tag: [t.string, t.special(t.string), t.docString], color: ayu.string },
  { tag: [t.regexp, t.escape], color: ayu.regexp },
  {
    tag: [t.number, t.bool, t.null, t.atom, t.constant(t.variableName)],
    color: ayu.constant,
  },
  {
    tag: [t.function(t.variableName), t.function(t.propertyName), t.labelName],
    color: ayu.func,
  },
  { tag: [t.typeName, t.className, t.namespace], color: ayu.type },
  { tag: [t.propertyName, t.attributeName], color: ayu.property },
  { tag: [t.tagName, t.angleBracket], color: ayu.tag },
  { tag: [t.operator, t.derefOperator, t.arithmeticOperator], color: ayu.operator },
  {
    tag: [t.variableName, t.definition(t.variableName), t.punctuation, t.separator],
    color: ayu.fgDefault,
  },
  { tag: [t.meta, t.annotation], color: ayu.meta },
  { tag: t.heading, color: ayu.func, fontWeight: "bold" },
  { tag: [t.link, t.url], color: ayu.tag, textDecoration: "underline" },
  { tag: t.emphasis, fontStyle: "italic" },
  { tag: t.strong, fontWeight: "bold" },
  { tag: t.strikethrough, textDecoration: "line-through" },
  { tag: t.invalid, color: ayu.invalid },
]);

export const ayuDark: Extension = [
  editorTheme,
  syntaxHighlighting(ayuHighlight),
];
