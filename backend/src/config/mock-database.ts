import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DATA_DIR = path.resolve(__dirname, "../../../data");

const snakeToCamel = (str: string) => str.replace(/_([a-z])/g, (_, c) => c.toUpperCase());

interface QueryResult {
  rows: any[];
  rowCount: number | null;
}

class MockPool {
  private tables: Map<string, any[]> = new Map();

  constructor() {
    this.loadAll();
  }

  private loadAll() {
    const files = [
      "users", "departments", "employees", "positions",
      "projects", "project_logs", "project_employees",
      "project_departments", "project_comments",
    ];
    for (const name of files) {
      const filePath = path.join(DATA_DIR, `${name}.json`);
      if (fs.existsSync(filePath)) {
        const raw = fs.readFileSync(filePath, "utf-8");
        this.tables.set(name, JSON.parse(raw));
      } else {
        this.tables.set(name, []);
      }
    }
  }

  private saveTable(table: string) {
    const filePath = path.join(DATA_DIR, `${table}.json`);
    fs.writeFileSync(filePath, JSON.stringify(this.tables.get(table) || [], null, 2), "utf-8");
  }

  private getTable(sql: string): string | null {
    const match = sql.match(/\bFROM\s+(\w+)/i) || sql.match(/\bINTO\s+(\w+)/i);
    return match ? match[1] : null;
  }

  private getReturningColumns(sql: string): string[] | null {
    const match = sql.match(/RETURNING\s+(.+)/i);
    if (!match) return null;
    return match[1].split(",").map((c) => c.trim());
  }

  private getWhereConditions(sql: string): { col: string; paramIdx: number }[] {
    const whereMatch = sql.match(/WHERE\s+(.+?)(?:ORDER BY|RETURNING|$)/i);
    if (!whereMatch) return [];

    const conditions: { col: string; paramIdx: number }[] = [];
    const parts = whereMatch[1].split(/\s+AND\s+/i);
    let idx = 1;
    for (const part of parts) {
      const m = part.match(/(\w+)\s*=\s*\$(\d+)/);
      if (m) {
        conditions.push({ col: snakeToCamel(m[1]), paramIdx: parseInt(m[2]) });
      }
    }
    return conditions;
  }

  private getOrderBy(sql: string): { col: string; dir: string } | null {
    const match = sql.match(/ORDER BY\s+(\w+)\s*(DESC|ASC)?/i);
    if (!match) return null;
    return { col: snakeToCamel(match[1]), dir: (match[2] || "ASC").toUpperCase() };
  }

  private selectAll(table: string, columns: string[], orderBy: { col: string; dir: string } | null): any[] {
    let rows = this.tables.get(table) || [];
    if (orderBy) {
      rows = [...rows].sort((a, b) => {
        const valA = a[orderBy.col] ?? "";
        const valB = b[orderBy.col] ?? "";
        const cmp = typeof valA === "string" ? valA.localeCompare(valB) : valA - valB;
        return orderBy.dir === "DESC" ? -cmp : cmp;
      });
    }
    if (columns.length > 0) {
      rows = rows.map((row) => {
        const obj: any = {};
        for (const col of columns) obj[col] = row[col];
        return obj;
      });
    }
    return rows;
  }

  private selectWhere(
    table: string,
    columns: string[],
    conditions: { col: string; paramIdx: number }[],
    params: any[],
    orderBy: { col: string; dir: string } | null,
    sql: string
  ): any[] {
    let rows = this.tables.get(table) || [];

    // Handle soft delete: if WHERE contains deleted_at IS NULL
    if (sql.includes("deleted_at IS NULL")) {
      rows = rows.filter((r) => r.deletedAt === null || r.deletedAt === undefined);
    }

    // Normal WHERE conditions
    for (const cond of conditions) {
      const paramValue = params[cond.paramIdx - 1];
      rows = rows.filter((r) => r[cond.col] === paramValue);
    }

    if (orderBy) {
      rows = [...rows].sort((a, b) => {
        const valA = a[orderBy.col] ?? "";
        const valB = b[orderBy.col] ?? "";
        const cmp = typeof valA === "string" ? valA.localeCompare(valB) : valA - valB;
        return orderBy.dir === "DESC" ? -cmp : cmp;
      });
    }

    if (columns.length > 0) {
      rows = rows.map((row) => {
        const obj: any = {};
        for (const col of columns) obj[col] = row[col];
        return obj;
      });
    }
    return rows;
  }

  private insertReturning(table: string, sql: string, params: any[]): any[] {
    const colsMatch = sql.match(/INSERT\s+INTO\s+\w+\s*\(([^)]+)\)/i);
    if (!colsMatch) return [];
    const sqlCols = colsMatch[1].split(",").map((c) => c.trim());

    const returning = this.getReturningColumns(sql);
    const camelCols = sqlCols.map(snakeToCamel);

    const now = new Date().toISOString();
    const newRow: any = { id: `${table}_${Date.now()}_${Math.random().toString(36).slice(2, 6)}` };

    for (let i = 0; i < camelCols.length; i++) {
      newRow[camelCols[i]] = params[i] ?? null;
    }

    // Add timestamps if they exist in the table schema
    if (camelCols.includes("createdAt") === false && this.tables.get(table)?.[0]?.createdAt !== undefined) {
      newRow.createdAt = now;
    }
    if (camelCols.includes("updatedAt") === false && this.tables.get(table)?.[0]?.updatedAt !== undefined) {
      newRow.updatedAt = now;
    }
    if (table === "project_departments") {
      newRow.assignedAt = now;
    }
    if (table === "project_employees") {
      newRow.assignedAt = now;
    }
    if (table === "employees") {
      newRow.deletedAt = null;
    }

    const rows = this.tables.get(table) || [];
    rows.push(newRow);
    this.tables.set(table, rows);
    this.saveTable(table);

    return returning
      ? [returning.reduce((obj: any, col: string) => { obj[snakeToCamel(col)] = newRow[snakeToCamel(col)]; return obj; }, {})]
      : [newRow];
  }

  private updateReturning(table: string, sql: string, params: any[]): any[] {
    const setMatch = sql.match(/SET\s+(.+?)(?:WHERE|RETURNING)/i);
    if (!setMatch) return [];

    const setClauses = setMatch[1].split(",").map((s) => s.trim());
    const cols: { col: string; paramIdx: number }[] = [];
    for (const clause of setClauses) {
      const m = clause.match(/(\w+)\s*=\s*\$(\d+)/);
      if (m) {
        cols.push({ col: snakeToCamel(m[1]), paramIdx: parseInt(m[2]) });
      }
    }

    const conditions = this.getWhereConditions(sql);
    const returning = this.getReturningColumns(sql);

    let rows = this.tables.get(table) || [];
    const targetIdx = rows.findIndex((r) => {
      for (const cond of conditions) {
        if (r[cond.col] !== params[cond.paramIdx - 1]) return false;
      }
      return true;
    });

    if (targetIdx === -1) return [];

    const updated = { ...rows[targetIdx] };
    for (const c of cols) {
      updated[c.col] = params[c.paramIdx - 1];
    }
    updated.updatedAt = new Date().toISOString();

    rows[targetIdx] = updated;
    this.tables.set(table, rows);
    this.saveTable(table);

    return returning
      ? [returning.reduce((obj: any, col: string) => { obj[snakeToCamel(col)] = updated[snakeToCamel(col)]; return obj; }, {})]
      : [updated];
  }

  private deleteReturning(table: string, sql: string, params: any[]): any[] {
    const conditions = this.getWhereConditions(sql);
    const returning = this.getReturningColumns(sql);

    let rows = this.tables.get(table) || [];
    const targetIdx = rows.findIndex((r) => {
      for (const cond of conditions) {
        if (r[cond.col] !== params[cond.paramIdx - 1]) return false;
      }
      return true;
    });

    if (targetIdx === -1) return [];

    const deleted = rows[targetIdx];
    rows.splice(targetIdx, 1);
    this.tables.set(table, rows);
    this.saveTable(table);

    return returning
      ? [returning.reduce((obj: any, col: string) => { obj[snakeToCamel(col)] = deleted[snakeToCamel(col)]; return obj; }, {})]
      : [deleted];
  }

  async query<T = any>(text: string, params?: any[]): Promise<QueryResult> {
    const sql = text.trim();
    const table = this.getTable(sql);
    if (!table) {
      // Handle SELECT 1 (connection test)
      if (/^SELECT\s+1/i.test(sql)) return { rows: [{}], rowCount: 1 };
      return { rows: [], rowCount: 0 };
    }

    const normalizedTable = table;

    // Ensure table exists
    if (!this.tables.has(normalizedTable)) {
      this.tables.set(normalizedTable, []);
    }

    // SELECT
    if (/^SELECT/i.test(sql)) {
      const columns: string[] = [];
      const colsMatch = sql.match(/SELECT\s+(.+?)\s+FROM/i);
      if (colsMatch) {
        const colStr = colsMatch[1].trim();
        if (colStr !== "*" && !colStr.includes(",")) {
          columns.push(snakeToCamel(colStr));
        } else if (colStr.includes(",")) {
          columns.push(...colStr.split(",").map((c) => snakeToCamel(c.trim())));
        }
      }

      const orderBy = this.getOrderBy(sql);
      const conditions = this.getWhereConditions(sql);

      let rows: any[];
      if (conditions.length > 0 || sql.includes("deleted_at IS NULL")) {
        rows = this.selectWhere(normalizedTable, columns, conditions, params || [], orderBy, sql);
      } else {
        rows = this.selectAll(normalizedTable, columns, orderBy);
      }

      return { rows, rowCount: rows.length };
    }

    // INSERT
    if (/^INSERT/i.test(sql)) {
      const rows = this.insertReturning(normalizedTable, sql, params || []);
      return { rows, rowCount: rows.length };
    }

    // UPDATE
    if (/^UPDATE/i.test(sql)) {
      const rows = this.updateReturning(normalizedTable, sql, params || []);
      return { rows, rowCount: rows.length };
    }

    // DELETE
    if (/^DELETE/i.test(sql)) {
      const rows = this.deleteReturning(normalizedTable, sql, params || []);
      return { rows, rowCount: rows.length };
    }

    return { rows: [], rowCount: 0 };
  }

  on(_event: string, _callback: (err: Error) => void) {
    // no-op for mock
  }

  connect() {
    return Promise.resolve({
      query: (text: string, params?: any[]) => this.query(text, params),
      release: () => {},
    });
  }

  end() {
    return Promise.resolve();
  }
}

export default MockPool;
