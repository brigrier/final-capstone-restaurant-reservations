import React, { useEffect, useState, useCallback } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  listReservations,
  listTables,
  updateReservationStatus,
  finishTable as apiFinishTable,
} from "../utils/api";
import ErrorAlert from "../layout/ErrorAlert";
import { today, next, previous } from "../utils/date-time";
import dayjs from "dayjs";

function Dashboard({ initialDate }) {
  const location = useLocation();
  const navigate = useNavigate();
  const queryParams = new URLSearchParams(location.search);
  const dateFromParams = queryParams.get("date");

  const [date, setDate] = useState(dateFromParams || initialDate || today());
  const [reservations, setReservations] = useState([]);
  const [reservationsError, setReservationsError] = useState(null);
  const [tables, setTables] = useState([]);
  const [tablesError, setTablesError] = useState(null);

  const formatDate = (date) => dayjs(date).format('YYYY-MM-DD');

  const loadReservations = useCallback(() => {
    console.log("Loading reservations for date:", date);
    const abortController = new AbortController();
    setReservationsError(null);
    listReservations({ date: formatDate(date) }, abortController.signal)
      .then((data) => {
        console.log("Fetched reservations:", data);
        setReservations(data);
      })
      .catch((error) => {
        console.error("Error fetching reservations:", error);
        setReservationsError(error);
      });
    return () => abortController.abort();
  }, [date]);

  const loadTables = useCallback(() => {
    const abortController = new AbortController();
    setTablesError(null);
    listTables({}, abortController.signal)
      .then((data) => {
        console.log("Fetched tables:", data);
        setTables(data);
      })
      .catch((error) => {
        console.error("Error fetching tables:", error);
        setTablesError(error);
      });
    return () => abortController.abort();
  }, []);

  useEffect(() => {
    if (dateFromParams !== date) {
      navigate(`?date=${date}`);
    }
    loadReservations();
    loadTables();
  }, [date, loadReservations, loadTables]);

  const handlePreviousDay = () => {
    const newDate = previous(date);
    console.log("Previous day:", newDate);
    setDate(newDate);
  };

  const handleNextDay = () => {
    const newDate = next(date);
    console.log("Next day:", newDate);
    setDate(newDate);
  };

  const handleToday = () => {
    const newDate = today();
    console.log("Today:", newDate);
    setDate(newDate);
  };

  const finishTable = async (tableId) => {
    const confirmed = window.confirm(
      "Is this table ready to seat new guests? This cannot be undone."
    );
    if (confirmed) {
      try {
        const abortController = new AbortController();
        await apiFinishTable(tableId, abortController.signal);
        loadTables();
      } catch (error) {
        console.error("Error finishing table:", error);
        setTablesError(error);
      }
    }
  };

  const handleCancel = async (reservationId) => {
    const confirmed = window.confirm(
      "Do you want to cancel this reservation? This cannot be undone."
    );
    if (confirmed) {
      try {
        const abortController = new AbortController();
        await updateReservationStatus(
          reservationId,
          "cancelled",
          abortController.signal
        );
        loadReservations();
      } catch (error) {
        setReservationsError(error);
      }
    }
  };

  const reservationsTableRows = reservations.map((reservation, index) => (
    <tr key={index}>
      <th scope="row">{index + 1}</th>
      <td>{`${reservation.first_name} ${reservation.last_name}`}</td>
      <td>{reservation.people}</td>
      <td>
        {reservation.status === "booked" && (
          <a
            href={`/reservations/${reservation.reservation_id}/seat`}
            className="btn btn-primary"
          >
            Seat
          </a>
        )}
      </td>

      <td data-reservation-id-status={reservation.reservation_id}>
        {reservation.status}
      </td>
      <td>
        <a
          href={`/reservations/${reservation.reservation_id}/edit`}
          className="btn btn-primary"
        >
          Edit
        </a>
      </td>
      <td>
        <button
          data-reservation-id-cancel={reservation.reservation_id}
          onClick={() => handleCancel(reservation.reservation_id)}
        >
          Cancel
        </button>
      </td>
    </tr>
  ));

  const tablesRows = tables.map((table, index) => (
    <tr key={index}>
      <th scope="row">{index + 1}</th>
      <td>{table.table_name}</td>
      <td>{table.capacity}</td>
      <td data-table-id-status={table.table_id}>
        {table.reservation_id ? "Occupied" : "Free"}
      </td>
      {table.reservation_id && (
        <td className="text-center">
          <button
            className="btn btn-sm btn-primary"
            data-table-id-finish={table.table_id}
            onClick={() => finishTable(table.table_id)}
            type="button"
          >
            Finish
          </button>
        </td>
      )}
    </tr>
  ));

  return (
    <main>
      <h1>Dashboard</h1>
      <div className=" mb-3">
        <h4 style={{ textAlign: "center", fontSize: "25px" }} className="mb-0">
          Reservations for {formatDate(date)}
        </h4>
      </div>
      <div className="day-buttons">
        <button onClick={handlePreviousDay}>Previous Day</button>
        <button style={{ marginLeft: "10px", marginRight: "10px" }} onClick={handleToday}>Today</button>
        <button onClick={handleNextDay}>Next Day</button>
      </div>
      <ErrorAlert error={reservationsError} />
      <ErrorAlert error={tablesError} />

      <div>
        <h4>Reservations</h4>
        <table className="table table-bordered">
          <thead>
            <tr>
              <th scope="col">#</th>
              <th scope="col">Name</th>
              <th scope="col">People In Party</th>
              <th scope="col">Ready to Seat?</th>
              <th scope="col" colSpan="3">
                Status
              </th>
            </tr>
          </thead>
          <tbody>{reservationsTableRows}</tbody>
        </table>
        {reservations.length === 0 && (
          <p>No reservations found for the given date.</p>
        )}
      </div>

      <br></br>

      <div style={{ marginBottom: "142px" }}>
        <h4>Tables</h4>
        <table className="table table-bordered">
          <thead>
            <tr>
              <th scope="col">#</th>
              <th scope="col">Table Name</th>
              <th scope="col">Capacity</th>
              <th scope="col">Availability</th>
              <th scope="col">Finish Table?</th>
            </tr>
          </thead>
          <tbody>{tablesRows}</tbody>
        </table>
      </div>
    </main>
  );
}

export default Dashboard;
