import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import Dashboard from "../dashboard/Dashboard";
import NotFound from "./NotFound";
import { today } from "../utils/date-time";
import NewReservation from "../new-reservation/NewReservation";
import NewTable from "../new-table/NewTable";

/**
 * Defines all the routes for the application.
 *
 * @returns {JSX.Element}
 */
function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/dashboard" />} />
      <Route path="/reservations" element={<Navigate to="/dashboard" />} />
      <Route path="/dashboard" element={<Dashboard date={today()} />} />
      <Route path="/reservations/new" element={<NewReservation />} />
      <Route path="/tables"/>
      <Route path="/tables/new" element={<NewTable />} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

export default AppRoutes;



