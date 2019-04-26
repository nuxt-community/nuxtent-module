declare module 'micro-route' {
  import { IncomingMessage, ServerResponse } from 'http'
  import { ParsedUrlQuery } from 'querystring'
  import { RequestHandler } from 'micro'
  interface UrlPatternOptions {
    escapeChar?: string
    segmentNameStartChar?: string
    segmentValueCharset?: string
    segmentNameCharset?: string
    optionalSegmentStartChar?: string
    optionalSegmentEndChar?: string
    wildcardChar?: string
  }

  type routeResult = {
    params: any
    query: ParsedUrlQuery
    pattern: string
    methods: string
  } | null

  type routeCheck = (req: IncomingMessage) => routeResult

  type actions = {
    route: routeCheck
    handler: RequestHandler
  }[]

  function serverCallback(req: IncomingMessage, res: ServerResponse): any
  interface serverCallback {
    dispatch: (...args: any[]) => any
    otherwise: (...args: any[]) => any
  }

  export function dispatch(
    actions?: actions,
    pattern?: string,
    methods?: string,
    handler?: RequestHandler,
    patternOpts?: UrlPatternOptions
  ): serverCallback

  export function match(
    req: IncomingMessage,
    pattern?: string,
    methods?: string,
    parseQuery?: string,
    patternOpts?: UrlPatternOptions
  ): routeResult

  export default function route(
    pattern?: string,
    methods?: string,
    parseQuery?: string,
    patternOpts?: UrlPatternOptions
  ): routeCheck
}
