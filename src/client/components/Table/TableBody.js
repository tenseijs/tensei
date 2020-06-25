import cn from "classnames";
import * as React from "react";

function TableBody({ className, children, ...props }) {
  const classes = cn(className);
  return (
    <tbody className={classes} {...props}>
      {children}
    </tbody>
  );
}

TableBody.displayName = "Table.Body";

export default TableBody;
