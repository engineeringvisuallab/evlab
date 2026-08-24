export type TokenType =
  | 'NUMBER'
  | 'STRING'
  | 'BOOLEAN'
  | 'CELL_REF'
  | 'RANGE_REF'
  | 'FUNCTION'
  | 'OPERATOR'
  | 'LPAREN'
  | 'RPAREN'
  | 'COMMA'
  | 'EOF';

export interface Token {
  type: TokenType;
  value: string;
  position: number;
}

export class FormulaTokenizer {
  private input: string = '';
  private pos: number = 0;

  public tokenize(formula: string): Token[] {
    this.input = formula.startsWith('=') ? formula.substring(1) : formula;
    this.pos = 0;
    const tokens: Token[] = [];

    while (this.pos < this.input.length) {
      this.skipWhitespace();
      if (this.pos >= this.input.length) break;

      const char = this.input[this.pos];

      // String literal "..."
      if (char === '"') {
        tokens.push(this.readString());
        continue;
      }

      // Numbers
      if (this.isDigit(char) || (char === '.' && this.isDigit(this.peekNext()))) {
        tokens.push(this.readNumber());
        continue;
      }

      // Parentheses
      if (char === '(') {
        tokens.push({ type: 'LPAREN', value: '(', position: this.pos++ });
        continue;
      }
      if (char === ')') {
        tokens.push({ type: 'RPAREN', value: ')', position: this.pos++ });
        continue;
      }

      // Comma
      if (char === ',') {
        tokens.push({ type: 'COMMA', value: ',', position: this.pos++ });
        continue;
      }

      // Multi-char operators: <=, >=, <>, =
      const twoChars = this.input.substring(this.pos, this.pos + 2);
      if (['<=', '>=', '<>'].includes(twoChars)) {
        tokens.push({ type: 'OPERATOR', value: twoChars, position: this.pos });
        this.pos += 2;
        continue;
      }

      // Single-char operators: +, -, *, /, %, ^, =, >, <
      if (['+', '-', '*', '/', '%', '^', '=', '>', '<'].includes(char)) {
        tokens.push({ type: 'OPERATOR', value: char, position: this.pos++ });
        continue;
      }

      // Range or Cell reference with sheet e.g. Sheet1!A1:B10 or 'Water Demand'!$A$1
      // Or identifier (Function name or Boolean or Cell reference)
      const identToken = this.readIdentifierOrRef();
      if (identToken) {
        tokens.push(identToken);
        continue;
      }

      // Unrecognized character
      this.pos++;
    }

    tokens.push({ type: 'EOF', value: '', position: this.pos });
    return tokens;
  }

  private skipWhitespace(): void {
    while (this.pos < this.input.length && /\s/.test(this.input[this.pos])) {
      this.pos++;
    }
  }

  private isDigit(char: string): boolean {
    return char >= '0' && char <= '9';
  }

  private peekNext(): string {
    return this.input[this.pos + 1] || '';
  }

  private readString(): Token {
    const start = this.pos;
    this.pos++; // skip opening quote
    let str = '';

    while (this.pos < this.input.length) {
      if (this.input[this.pos] === '"') {
        if (this.input[this.pos + 1] === '"') {
          // Escaped quote
          str += '"';
          this.pos += 2;
        } else {
          this.pos++; // skip closing quote
          break;
        }
      } else {
        str += this.input[this.pos++];
      }
    }

    return { type: 'STRING', value: str, position: start };
  }

  private readNumber(): Token {
    const start = this.pos;
    while (this.pos < this.input.length && (this.isDigit(this.input[this.pos]) || this.input[this.pos] === '.')) {
      this.pos++;
    }
    const val = this.input.substring(start, this.pos);
    return { type: 'NUMBER', value: val, position: start };
  }

  private readIdentifierOrRef(): Token | null {
    const start = this.pos;

    // Check for quoted sheet name e.g. 'Sheet Name'!A1:B10
    let sheetPart = '';
    if (this.input[this.pos] === "'") {
      this.pos++; // skip opening quote
      let endQuote = false;
      while (this.pos < this.input.length) {
        if (this.input[this.pos] === "'") {
          if (this.input[this.pos + 1] === "'") {
            sheetPart += "'";
            this.pos += 2;
          } else {
            this.pos++; // skip closing quote
            endQuote = true;
            break;
          }
        } else {
          sheetPart += this.input[this.pos++];
        }
      }
      if (endQuote && this.input[this.pos] === '!') {
        this.pos++; // skip !
        sheetPart = `'${sheetPart.replace(/'/g, "''")}'!`;
      } else {
        // Syntax error or fallback
      }
    }

    // Read remaining word / reference
    const wordStart = this.pos;
    while (
      this.pos < this.input.length &&
      /[A-Za-z0-9_$.!:]/.test(this.input[this.pos])
    ) {
      this.pos++;
    }

    const fullWord = sheetPart + this.input.substring(wordStart, this.pos);

    if (fullWord.length === 0) return null;

    // Check if followed by '(' -> Function
    this.skipWhitespace();
    if (this.input[this.pos] === '(' && !fullWord.includes('!') && !fullWord.includes(':')) {
      return { type: 'FUNCTION', value: fullWord.toUpperCase(), position: start };
    }

    // Check booleans
    const upper = fullWord.toUpperCase();
    if (upper === 'TRUE' || upper === 'FALSE') {
      return { type: 'BOOLEAN', value: upper, position: start };
    }

    // Check if range ref e.g. A1:B10 or Sheet1!A1:B10
    if (fullWord.includes(':')) {
      return { type: 'RANGE_REF', value: fullWord, position: start };
    }

    // Check if cell ref e.g. A1 or $A$1 or Sheet1!A1
    if (/^(?:(?:'[^']+'|[A-Za-z0-9_]+)!)?\$?[A-Za-z]+\$?[0-9]+$/.test(fullWord)) {
      return { type: 'CELL_REF', value: fullWord, position: start };
    }

    // Fallback identifier / function name
    return { type: 'FUNCTION', value: fullWord.toUpperCase(), position: start };
  }
}
