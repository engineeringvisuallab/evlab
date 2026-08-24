import { FormulaTokenizer, Token } from './FormulaTokenizer';
import { ASTNode } from './FormulaAST';
import { SpreadsheetError } from '../errors/SpreadsheetError';

export class FormulaParser {
  private tokenizer: FormulaTokenizer = new FormulaTokenizer();
  private tokens: Token[] = [];
  private current: number = 0;

  public parse(formula: string): ASTNode {
    this.tokens = this.tokenizer.tokenize(formula);
    this.current = 0;

    if (this.tokens.length === 0 || this.tokens[0].type === 'EOF') {
      return { type: 'STRING', value: '' };
    }

    const ast = this.parseExpression();

    if (this.peek().type !== 'EOF') {
      throw new SpreadsheetError('VALUE', 'Unexpected token at end of formula');
    }

    return ast;
  }

  /**
   * Extracts cell and range references from a formula string.
   */
  public extractReferences(formula: string): { cells: string[]; ranges: string[] } {
    const cells: string[] = [];
    const ranges: string[] = [];

    try {
      const tokens = this.tokenizer.tokenize(formula);
      for (const token of tokens) {
        if (token.type === 'CELL_REF') {
          cells.push(token.value.toUpperCase());
        } else if (token.type === 'RANGE_REF') {
          ranges.push(token.value.toUpperCase());
        }
      }
    } catch {
      // Ignore tokenization errors for extractReferences
    }

    return { cells, ranges };
  }

  // Expression grammar parsing (Operator precedence)

  // Level 1: Comparisons (=, <>, >, <, >=, <=)
  private parseExpression(): ASTNode {
    let left = this.parseAdditive();

    while (this.matchOperator('=', '<>', '>', '<', '>=', '<=')) {
      const op = this.previous().value as any;
      const right = this.parseAdditive();
      left = {
        type: 'BINARY_OP',
        op,
        left,
        right,
      };
    }

    return left;
  }

  // Level 2: Additive (+, -)
  private parseAdditive(): ASTNode {
    let left = this.parseMultiplicative();

    while (this.matchOperator('+', '-')) {
      const op = this.previous().value as any;
      const right = this.parseMultiplicative();
      left = {
        type: 'BINARY_OP',
        op,
        left,
        right,
      };
    }

    return left;
  }

  // Level 3: Multiplicative (*, /, %)
  private parseMultiplicative(): ASTNode {
    let left = this.parsePower();

    while (this.matchOperator('*', '/', '%')) {
      const op = this.previous().value as any;
      const right = this.parsePower();
      left = {
        type: 'BINARY_OP',
        op,
        left,
        right,
      };
    }

    return left;
  }

  // Level 4: Exponentiation (^)
  private parsePower(): ASTNode {
    let left = this.parseUnary();

    while (this.matchOperator('^')) {
      const op = this.previous().value as any;
      const right = this.parseUnary();
      left = {
        type: 'BINARY_OP',
        op,
        left,
        right,
      };
    }

    return left;
  }

  // Level 5: Unary (+, -)
  private parseUnary(): ASTNode {
    if (this.matchOperator('+', '-')) {
      const op = this.previous().value as any;
      const operand = this.parseUnary();
      return {
        type: 'UNARY_OP',
        op,
        operand,
      };
    }

    return this.parsePrimary();
  }

  // Level 6: Primary literals, references, function calls, parenthesized expressions
  private parsePrimary(): ASTNode {
    const token = this.peek();

    if (token.type === 'NUMBER') {
      this.advance();
      return { type: 'NUMBER', value: parseFloat(token.value) };
    }

    if (token.type === 'STRING') {
      this.advance();
      return { type: 'STRING', value: token.value };
    }

    if (token.type === 'BOOLEAN') {
      this.advance();
      return { type: 'BOOLEAN', value: token.value.toUpperCase() === 'TRUE' };
    }

    if (token.type === 'CELL_REF') {
      this.advance();
      return { type: 'CELL_REF', raw: token.value };
    }

    if (token.type === 'RANGE_REF') {
      this.advance();
      return { type: 'RANGE_REF', raw: token.value };
    }

    if (token.type === 'FUNCTION') {
      this.advance();
      const fnName = token.value.toUpperCase();
      this.consume('LPAREN', `Expected '(' after function name ${fnName}`);

      const args: ASTNode[] = [];
      if (this.peek().type !== 'RPAREN') {
        do {
          args.push(this.parseExpression());
        } while (this.matchToken('COMMA'));
      }

      this.consume('RPAREN', `Expected ')' after function arguments for ${fnName}`);

      return {
        type: 'FUNCTION',
        name: fnName,
        args,
      };
    }

    if (token.type === 'LPAREN') {
      this.advance();
      const expr = this.parseExpression();
      this.consume('RPAREN', "Expected ')' after expression");
      return expr;
    }

    throw new SpreadsheetError('VALUE', `Unexpected token ${token.value || token.type}`);
  }

  // Helper methods
  private peek(): Token {
    return this.tokens[this.current] || { type: 'EOF', value: '', position: 0 };
  }

  private previous(): Token {
    return this.tokens[this.current - 1];
  }

  private advance(): Token {
    if (this.current < this.tokens.length) {
      this.current++;
    }
    return this.previous();
  }

  private matchOperator(...ops: string[]): boolean {
    const token = this.peek();
    if (token.type === 'OPERATOR' && ops.includes(token.value)) {
      this.advance();
      return true;
    }
    return false;
  }

  private matchToken(type: string): boolean {
    if (this.peek().type === type) {
      this.advance();
      return true;
    }
    return false;
  }

  private consume(type: string, errorMessage: string): Token {
    if (this.peek().type === type) {
      return this.advance();
    }
    throw new SpreadsheetError('VALUE', errorMessage);
  }
}
