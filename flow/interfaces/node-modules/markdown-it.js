// @flow

/* eslint-disable no-use-before-define */

export type MarkdownItHighlight = (code: string, lang: string) => string

export interface MarkdownItOptions {
  html?: boolean;
  xhtmlOut?: boolean;
  breaks?: boolean;
  langPrefix?: string;
  linkify?: boolean;
  typographer?: boolean;
  quotes?: string;
  highlight?: MarkdownItHighlight;
}

export interface MarkdownItLinkifyIt {
  tlds(lang: string, linkified: boolean): void;
}

export interface MarkdownItToken {
  attrGet: (name: string) => string | null;
  attrIndex: (name: string) => number;
  attrJoin: (name: string, value: string) => void;
  attrPush: (attrData: string[]) => void;
  attrSet: (name: string, value: string) => void;
  attrs: string[][];
  block: boolean;
  children: MarkdownItToken[];
  content: string;
  hidden: boolean;
  info: string;
  level: number;
  map: number[];
  markup: string;
  meta: any;
  nesting: number;
  tag: string;
  type: string;
}

export type MarkdownItTokenRender = (
  tokens: MarkdownItToken[],
  index: number,
  options: any,
  env: any,
  self: MarkdownItRenderer
) => void

export interface MarkdownItRenderer {
  rules: {
    [name: string]: MarkdownItTokenRender
  };
  render(tokens: MarkdownItToken[], options: any, env: any): string;
  renderAttrs(token: MarkdownItToken): string;
  renderInline(tokens: MarkdownItToken[], options: any, env: any): string;
  renderToken(tokens: MarkdownItToken[], idx: number, options: any): string;
}

declare interface MarkdownItRule {
  (state: any): void;
}

declare interface MarkdownItRuler {
  after(
    afterName: string,
    ruleName: string,
    rule: MarkdownItRule,
    options?: any
  ): void;
  at(name: string, rule: MarkdownItRule, options?: any): void;
  before(
    beforeName: string,
    ruleName: string,
    rule: MarkdownItRule,
    options?: any
  ): void;
  disable(rules: string | string[], ignoreInvalid?: boolean): string[];
  enable(rules: string | string[], ignoreInvalid?: boolean): string[];
  enableOnly(rule: string, ignoreInvalid?: boolean): void;
  getRules(chain: string): MarkdownItRule[];
  push(ruleName: string, rule: MarkdownItRule, options?: any): void;
}

declare interface MarkdownItParserBlock {
  parse(
    src: string,
    md: MarkdownIt,
    env: any,
    outTokens: MarkdownItToken[]
  ): void;
  ruler: MarkdownItRuler;
}

declare interface MarkdownItCore {
  process(state: any): void;
  ruler: MarkdownItRuler;
}

declare interface MarkdownItParserInline {
  parse(
    src: string,
    md: MarkdownIt,
    env: any,
    outTokens: MarkdownItToken[]
  ): void;
  ruler: MarkdownItRuler;
  ruler2: MarkdownItRuler;
}

export interface MarkdownIt {
  render(md: string, env?: any): string;
  renderInline(md: string, env?: any): string;
  parse(src: string, env: any): MarkdownItToken[];
  parseInline(src: string, env: any): MarkdownItToken[];
  use(plugin: MarkdownItPlugin, ...params: any[]): MarkdownIt;
  utils: {
    assign(obj: any): any,
    isString(obj: any): boolean,
    has(object: any, key: string): boolean,
    unescapeMd(str: string): string,
    unescapeAll(str: string): string,
    isValidEntityCode(str: any): boolean,
    fromCodePoint(str: string): string,
    escapeHtml(str: string): string,
    arrayReplaceAt(src: any[], pos: number, newElements: any[]): any[],
    isSpace(str: any): boolean,
    isWhiteSpace(str: any): boolean,
    isMdAsciiPunct(str: any): boolean,
    isPunctChar(str: any): boolean,
    escapeRE(str: string): string,
    normalizeReference(str: string): string
  };
  disable(rules: string[] | string, ignoreInvalid?: boolean): MarkdownIt;
  enable(rules: string[] | string, ignoreInvalid?: boolean): MarkdownIt;
  set(options: MarkdownItOptions): MarkdownIt;
  normalizeLink(url: string): string;
  normalizeLinkText(url: string): string;
  validateLink(url: string): boolean;
  block: MarkdownItParserBlock;
  core: MarkdownItCore;
  helpers: any;
  inline: MarkdownItParserInline;
  linkify: MarkdownItLinkifyIt;
  renderer: MarkdownItRenderer;
  options: MarkdownItOptions;
}

export type MarkdownItPlugin = (md: MarkdownIt, ...params: any[]) => void

declare module 'markdown-it' {
  declare interface MarkdownItExports {
    new(): MarkdownIt;
    new(
      presetName: 'commonmark' | 'zero' | 'default',
      options?: MarkdownItOptions
    ): MarkdownIt;
    new(options: MarkdownItOptions): MarkdownIt;
    (): MarkdownIt;
    (
      presetName: 'commonmark' | 'zero' | 'default',
      options?: MarkdownItOptions
    ): MarkdownIt;
    (options: MarkdownItOptions): MarkdownIt;
  }
  declare var exports: MarkdownItExports
}
