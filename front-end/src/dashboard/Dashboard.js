import React, { useEffect, useState } from "react";
//import { useNavigate } from "react-router-dom";
import { listReservations, listTables, finishTable as apiFinishTable } from "../utils/api";
import ErrorAlert from "../layout/ErrorAlert";
import { today, next, previous } from "../utils/date-time";

function Dashboard({ initialDate }) {
  const [date, setDate] = useState(initialDate || today());
  const [reservations, setReservations] = useState([]);
  const [reservationsError, setReservationsError] = useState(null);
  const [tables, setTables] = useState([]);
  const [tablesError, setTablesError] = useState(null);
 // const navigate = useNavigate();

  useEffect(loadDashboard, [date]);

  function loadDashboard() {
    const abortController = new AbortController();
    setReservationsError(null);
    listReservations({ date }, abortController.signal)
      .then(setReservations)
      .catch(setReservationsError);
    return () => abortController.abort();
  }

  const handlePreviousDay = () => setDate(previous(date));
  const handleNextDay = () => setDate(next(date));
  const handleToday = () => setDate(today());

  useEffect(() => {
    const abortController = new AbortController();
    setTablesError(null);
    listTables({}, abortController.signal)
      .then(setTables)
      .catch(setTablesError);
    return () => abortController.abort();
  }, []);

  const finishTable = async (tableId) => {
    const confirmed = window.confirm(
      "Is this table ready to seat new guests? This cannot be undone."
    );
    if (confirmed) {
      try {
        const abortController = new AbortController();
        await apiFinishTable(tableId, abortController.signal);
        loadDashboard();
      } catch (error) {
        setTablesError(error);
      }
    }
  };

  const reservationsTableRows = reservations.map((reservation, index) => (
    <tr key={index}>
      <th scope="row">{index + 1}</th>
      <td>{`${reservation.first_name} ${reservation.last_name}`}</td>
      <td>{reservation.people}</td>
      <td>
        <a href={`/reservations/${reservation.reservation_id}/seat`}>
          <button>Seat</button>
        </a>
      </td>
    </tr>
  ));

  const tablesRows = tables.map((table, index) => (
    <tr key={index}>
      <th scope="row">{index + 1}</th>
      <td>{table.table_name}</td>
      <td>{table.capacity}</td>
      <td data-table-id-status={table.table_id}>
        {table.reservation_id ? (
          <>
            Occupied
            <button
              onClick={() => finishTable(table.table_id)}
              data-table-id-finish={table.table_id}
            >
              Finish
            </button>
          </>
        ) : (
          "Free"
        )}
      </td>
    </tr>
  ));

  return (
    <main>
      <h1>Dashboard</h1>
      <div className="d-md-flex mb-3">
        <h4 className="mb-0">Reservations for {date}</h4>
      </div>
      <div>
        <button onClick={handlePreviousDay}>Previous Day</button>
        <button onClick={handleToday}>Today</button>
        <button onClick={handleNextDay}>Next Day</button>
      </div>
      <ErrorAlert error={reservationsError} />
      <ErrorAlert error={tablesError} />

      <div>
        <h4>Reservations</h4>
        <table className="table">
          <thead>
            <tr>
              <th scope="col">#</th>
              <th scope="col">Name</th>
              <th scope="col">People In Party</th>
              <th scope="col">Ready to Seat</th>
            </tr>
          </thead>
          <tbody>{reservationsTableRows}</tbody>
        </table>
      </div>
      <div>
        <h4>Tables</h4>
        <table className="table">
          <thead>
            <tr>
              <th scope="col">#</th>
              <th scope="col">Table Name</th>
              <th scope="col">Capacity</th>
              <th scope="col">Availability</th>
            </tr>
          </thead>
          <tbody>{tablesRows}</tbody>
        </table>
      </div>
    </main>
  );
}

export default Dashboard;
