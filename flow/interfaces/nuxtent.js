// @flow

/* eslint-disable no-use-before-define */

export type NuxtentDB = {
  destroy: () => Promise<void>,
  put: (
    sub: string | Array<string>,
    key: string,
    value: any
  ) => Promise<Object>,
  get: (sub: string | Array<string>, key: string) => Promise<Object>,
  getPartial: (sub: string | Array<string>, key: string) => Promise<void>,
  getList: (
    sub: string | Array<string>,
    config: LevelStreamConfig,
    filter?: string,
    filterValue: string
  ) => Promise<Array<any>>
}

export type NuxtentContentFile = {
  name: string,
  fullpath: string
}

export type NuxtentTransformResult = {
  data: Object,
  partial: Object
}

type NuxtentDirConfig = {
  content: string,
  contentWebpack: string,
  components: string,
  build: string
}

export type NuxtentSingleContentEntry = {
  page: null | string,
  permalink: string,
  isPost: boolean,
  anchorLevel: number,
  data: Object,
  generate: Array<string>
}

export type NuxtentContentConfig = {
  [dirName: string]: NuxtentSingleContentEntry
}

type NuxtentParsersConfig = {
  md: {|
    ...MarkdownItOptions,
    use: Array<MarkdownItPlugin>
  |}
}

export type NuxtentPlugin = {
  name: string,
  // transformer
  supportedFileTypes?: Array<string>,
  transform?: ({
    config: NuxtentConfig,
    file: NuxtentContentFile,
    contents: Buffer
  }) => Promise<NuxtentTransformResult> | NuxtentTransformResult,
  // collector
  collect?: (
    db: NuxtentDB,
    fileName: string,
    parsed: NuxtentTransformResult
  ) => Promise<Array<mixed>>
}

export type NuxtentPlugins = Array<NuxtentPlugin>

export type NuxtentConfig = {
  dirs: NuxtentDirConfig,
  componentTemplatesExtensions: Array<string>,
  isDev: boolean,
  content: NuxtentContentConfig,
  plugins: NuxtentPlugins,
  parsersConfig: NuxtentParsersConfig
}

export type NuxtentApiConfig = {
  baseURL: string,
  browserBaseURL: string,
  port: number,
  serverPrefix: string,
  browserPrefix: string
}

export interface NuxtentConfigManager {
  _config: NuxtentConfig;
  _api: NuxtentApiConfig;
  _staticApi: NuxtentApiConfig;
}

export interface NuxtentConfigFile {
  _fileName: string;
  _config: Object;
  readFile(): void;
}
