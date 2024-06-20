import React from "react";
import Menu from "./Menu";
import AppRoutes from "./Routes";

import "./Layout.css";

/**
 * Defines the main layout of the application.
 *
 * @returns {JSX.Element}
 */
function Layout() {
  return (
    <div className="container-fluid">
      <div className="row h-100">
        <div className="col-md-2 side-bar">
          <Menu />
        </div>
        <div className="col">
          <AppRoutes />
        </div>
      </div>
    </div>
  );
}

export default Layout;

