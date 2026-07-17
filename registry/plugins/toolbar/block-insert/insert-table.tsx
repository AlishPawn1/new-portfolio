import { TableIcon } from "lucide-react";
import { INSERT_TABLE_COMMAND } from "@lexical/table";

import { useToolbarContext } from "../../../context/toolbar-context";
import { DropdownMenuItem } from "@/components/ui/dropdown-menu";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function InsertTable() {
  const { activeEditor } = useToolbarContext();
  const [showGrid, setShowGrid] = useState(false);
  const [hoveredCell, setHoveredCell] = useState({ rows: 0, cols: 0 });

  const handleInsert = (rows: number, cols: number) => {
    activeEditor.dispatchCommand(INSERT_TABLE_COMMAND, { columns: cols, rows });
    setShowGrid(false);
  };

  return (
    <DropdownMenuItem
      onClick={() => setShowGrid(!showGrid)}
    >
      <div className="flex items-center gap-1">
        <TableIcon className="size-4" />
        <span>Table</span>
      </div>
      {showGrid && (
        <div className="absolute left-full top-0 ml-1 bg-popover border rounded-md p-2 shadow-md z-50" onClick={(e) => e.stopPropagation()}>
          <div className="grid grid-cols-5 gap-0.5">
            {Array.from({ length: 5 }).map((_, row) =>
              Array.from({ length: 5 }).map((_, col) => (
                <button
                  key={`${row}-${col}`}
                  className={`w-5 h-5 border rounded-sm transition-colors ${
                    row <= hoveredCell.rows && col <= hoveredCell.cols
                      ? "bg-primary"
                      : "bg-background"
                  }`}
                  onMouseEnter={() => setHoveredCell({ rows: row, cols: col })}
                  onClick={() => handleInsert(row + 1, col + 1)}
                />
              ))
            )}
          </div>
          <p className="text-xs text-muted-foreground mt-1 text-center">
            {hoveredCell.rows > 0 ? `${hoveredCell.rows + 1} x ${hoveredCell.cols + 1}` : "Select size"}
          </p>
        </div>
      )}
    </DropdownMenuItem>
  );
}
