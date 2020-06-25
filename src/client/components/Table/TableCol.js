import * as React from "react";
import cn from "classnames";

function TableCol({
  className,
  children,
  alignContent = "",
  colSpan,
}) {
  const classes = cn({ [`text-${alignContent}`]: alignContent }, className);
  return (
    <td className={classes} colSpan={colSpan}>
      {children}
    </td>
  );
}

TableCol.displayName = "Table.Col";

export default TableCol;
