from __future__ import annotations

import pathlib
import sys

from sqlalchemy.dialects import postgresql
from sqlalchemy.schema import CreateTable
from sqlalchemy.sql.sqltypes import Enum as SAEnum

sys.path.append(str(pathlib.Path(__file__).resolve().parents[1]))

import models  # noqa: E402


def _pg_ident(name: str) -> str:
    # Most enum names here are safe identifiers like tipo_pago_enum.
    # Quote defensively if it contains unusual chars.
    if name.replace("_", "").isalnum() and not name[0].isdigit():
        return name
    return '"' + name.replace('"', '""') + '"'


def _quote_literal(value: str) -> str:
    return "'" + value.replace("'", "''") + "'"


def _collect_enum_types() -> dict[str, list[str]]:
    enums: dict[str, list[str]] = {}
    for table in models.Base.metadata.sorted_tables:
        for col in table.columns:
            col_type = getattr(col, "type", None)
            if isinstance(col_type, SAEnum) and col_type.name and col_type.enums:
                # Preserve first-seen order
                if col_type.name not in enums:
                    enums[col_type.name] = list(col_type.enums)
    return enums


def main() -> None:
    dialect = postgresql.dialect()
    out_path = pathlib.Path(__file__).resolve().parents[1] / "supabase_schema.sql"

    lines: list[str] = []
    lines.append("-- Auto-generated schema from SQLAlchemy models")
    lines.append("-- Target: Supabase Postgres")
    lines.append("-- How to use: open Supabase SQL Editor and run this file")
    lines.append("")

    # Optional extensions (safe even if already present)
    lines.append('CREATE EXTENSION IF NOT EXISTS "pgcrypto";')
    lines.append("")

    # Ensure custom enum types exist before creating tables.
    enum_types = _collect_enum_types()
    if enum_types:
        lines.append("-- Enum types")
        for enum_name, values in enum_types.items():
            ident = _pg_ident(enum_name)
            values_sql = ", ".join(_quote_literal(v) for v in values)
            # Postgres does not support CREATE TYPE IF NOT EXISTS, so we use a DO block.
            lines.append("DO $$")
            lines.append("BEGIN")
            lines.append(
                f"  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = {_quote_literal(enum_name)}) THEN"
            )
            lines.append(f"    CREATE TYPE {ident} AS ENUM ({values_sql});")
            lines.append("  END IF;")
            lines.append("END$$;")
            lines.append("")

    for table in models.Base.metadata.sorted_tables:
        lines.append(str(CreateTable(table).compile(dialect=dialect)).rstrip() + ";")
        lines.append("")

    out_path.write_text("\n".join(lines), encoding="utf-8")
    print(f"Wrote: {out_path}")


if __name__ == "__main__":
    main()
