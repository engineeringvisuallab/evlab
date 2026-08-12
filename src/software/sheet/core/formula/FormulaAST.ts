export type ASTNodeType =
  | 'NUMBER'
  | 'STRING'
  | 'BOOLEAN'
  | 'CELL_REF'
  | 'RANGE_REF'
  | 'FUNCTION'
  | 'BINARY_OP'
  | 'UNARY_OP';

export interface BaseASTNode {
  type: ASTNodeType;
}

export interface NumberNode extends BaseASTNode {
  type: 'NUMBER';
  value: number;
}

export interface StringNode extends BaseASTNode {
  type: 'STRING';
  value: string;
}

export interface BooleanNode extends BaseASTNode {
  type: 'BOOLEAN';
  value: boolean;
}

export interface CellRefNode extends BaseASTNode {
  type: 'CELL_REF';
  raw: string; // e.g. "A1", "$A$1", "Sheet2!B5"
}

export interface RangeRefNode extends BaseASTNode {
  type: 'RANGE_REF';
  raw: string; // e.g. "A1:A10", "Sheet2!B5:D20"
}

export interface FunctionCallNode extends BaseASTNode {
  type: 'FUNCTION';
  name: string; // e.g. "SUM", "AVERAGE"
  args: ASTNode[];
}

export interface BinaryOpNode extends BaseASTNode {
  type: 'BINARY_OP';
  op: '+' | '-' | '*' | '/' | '%' | '^' | '=' | '<>' | '>' | '<' | '>=' | '<=';
  left: ASTNode;
  right: ASTNode;
}

export interface UnaryOpNode extends BaseASTNode {
  type: 'UNARY_OP';
  op: '+' | '-';
  operand: ASTNode;
}

export type ASTNode =
  | NumberNode
  | StringNode
  | BooleanNode
  | CellRefNode
  | RangeRefNode
  | FunctionCallNode
  | BinaryOpNode
  | UnaryOpNode;
