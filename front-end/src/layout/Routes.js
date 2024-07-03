import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import Dashboard from "../dashboard/Dashboard";
import NotFound from "./NotFound";
import { today } from "../utils/date-time";
import NewReservation from "../new-reservation/NewReservation";
import NewTable from "../new-table/NewTable";
import Seat from "../seat/Seat";
import Search from "../search/Search";
import Edit from "../edit/Edit";
import { FormDataProvider } from "../new-reservation/FormDataContext";

/**
 * Defines all the routes for the application.
 *
 * @returns {JSX.Element}
 */
function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/dashboard" />} />
      <Route path="/reservations/*" element={<Navigate to="/dashboard" />} />
      <Route path="/dashboard" element={<Dashboard initialDate={today()} />} />

      <Route path="/reservations/new" element={<FormDataProvider><NewReservation /></FormDataProvider>} />
      <Route path="/reservations/:reservation_id/edit" element={<FormDataProvider><Edit /></FormDataProvider>} />

      <Route path="/reservations/:reservation_id/seat" element={<Seat />} />
      <Route path="/tables" element={<div>Tables Page</div>} />
      <Route path="/tables/new" element={<NewTable />} />
      <Route path="/search" element={<Search />} />

      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

export default AppRoutes;
