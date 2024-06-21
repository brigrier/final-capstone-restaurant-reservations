import React, { useEffect, useState } from "react";
import { listReservations } from "../utils/api";
import ErrorAlert from "../layout/ErrorAlert";
import { today, next, previous } from "../utils/date-time";

/**
 * Defines the dashboard page.
 * @param date
 *  the date for which the user wants to view reservations.
 * @returns {JSX.Element}
 */
function Dashboard({ initialDate }) {
  const [date, setDate] = useState(initialDate || today());
  const [reservations, setReservations] = useState([]);
  const [reservationsError, setReservationsError] = useState(null);

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

  const reservationsTableRows = reservations.map((reservation, index) => (
    <tr key={index}>
      <th scope="row">{index + 1}</th>
      <td>{`${reservation.first_name} ${reservation.last_name}`}</td>
      <td>{reservation.people}</td>
      <td>
        <button href={`/reservations/${reservation.reservation_id}/seat`}>
          Seat
        </button>
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
      <div>
        <table className="table">
          <thead>
            <tr>
              <th scope="col">#</th>
              <th scope="col">Name</th>
              <th scope="col">Party Number</th>
              <th scope="col">Ready to Seat</th>
            </tr>
          </thead>
          <tbody>{reservationsTableRows}</tbody>
        </table>
      </div>
    </main>
  );
}

export default Dashboard;
