export interface ImportStatement {
  type: "class" | "function" | "constant";
  name: string;
  alias?: string;
  originalText: string;
  position: {
    start: number;
    end: number;
  };
}
