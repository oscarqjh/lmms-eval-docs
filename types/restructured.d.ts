declare module "restructured" {
  export interface ParseResult {
    toHTML(): string;
  }

  export function parse(rstContent: string): ParseResult;

  const restructured: {
    parse: typeof parse;
  };

  export default restructured;
}
