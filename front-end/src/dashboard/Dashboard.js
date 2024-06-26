import React, { useEffect, useState, useCallback } from "react";
import { listReservations, listTables, updateReservationStatus, finishTable as apiFinishTable } from "../utils/api"; // Assuming you have this function in your API utils
import ErrorAlert from "../layout/ErrorAlert";
import { today, next, previous } from "../utils/date-time";
import { Link } from "react-router-dom"


function Dashboard({ initialDate }) {
  const [date, setDate] = useState(initialDate || today());
  const [reservations, setReservations] = useState([]);
  const [reservationsError, setReservationsError] = useState(null);
  const [tables, setTables] = useState([]);
  const [tablesError, setTablesError] = useState(null);


  const formatDate = (date) => {
    const d = new Date(date);
    let month = '' + (d.getMonth() + 1);
    let day = '' + d.getDate();
    const year = d.getFullYear();

    if (month.length < 2) month = '0' + month;
    if (day.length < 2) day = '0' + day;

    return [year, month, day].join('-');
  };

  const loadDashboard = useCallback(() => {
    console.log("Loading dashboard for date:", date);
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

  useEffect(() => {
    loadDashboard();
  }, [date, loadDashboard]);

  useEffect(() => {
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
        loadDashboard();
      } catch (error) {
        setTablesError(error);
      }
    }
  };

  const handleSeatReservation = async (reservationId) => {
    try {
      const abortController = new AbortController();
      await updateReservationStatus(reservationId, "seated", abortController.signal);
      loadDashboard();
    } catch (error) {
      setReservationsError(error);
    }
  };

  const handleCancel = async (reservationId) => {
    const confirmed = window.confirm(
      "Do you want to cancel this reservation? This cannot be undone."
    );
    if (confirmed) {
      try {
        const abortController = new AbortController();
        await updateReservationStatus(reservationId, "cancelled", abortController.signal);
        loadDashboard();
      } catch (error) {
        setReservationsError(error);
      }
    }
  }

  const reservationsTableRows = reservations.map((reservation, index) => (
    <tr key={index}>
      <th scope="row">{index + 1}</th>
      <td>{`${reservation.first_name} ${reservation.last_name}`}</td>
      <td>{reservation.people}</td>
      <td>
        {reservation.status === "booked" && (
          <Link to={`/reservations/${reservation.reservation_id}/seat`}>
          <button type="button" className="btn btn-success ">
            Seat
          </button>
        </Link>
        )}
      </td>
      <td data-reservation-id-status={reservation.reservation_id}>{reservation.status}</td>
      <td>
      <a href={`/reservations/${reservation.reservation_id}/edit`} className="btn btn-primary">Edit</a>
      </td>
      <td>
        <button data-reservation-id-cancel={reservation.reservation_id} onClick={() => handleCancel(reservation.reservation_id)}>Cancel</button>
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
        <h4 className="mb-0">Reservations for {formatDate(date)}</h4>
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
              <th scope="col" colSpan="3">Status</th>
            </tr>
          </thead>
          <tbody>{reservationsTableRows}</tbody>
        </table>
        {reservations.length === 0 && (
          <p>No reservations found for the given date.</p>
        )}
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

