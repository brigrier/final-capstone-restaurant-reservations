import React, { useState } from "react";
import { listReservations, updateReservationStatus } from "../utils/api";
import ErrorAlert from "../layout/ErrorAlert";

const Search = () => {
  const [mobileNumber, setMobileNumber] = useState("");
  const [reservations, setReservations] = useState([]);
  const [reservationsError, setReservationsError] = useState(null);

  const handleFindReservations = async () => {
    try {
      const abortController = new AbortController();
      setReservationsError(null);
      const data = await listReservations({ mobile_number: mobileNumber }, abortController.signal);
      setReservations(data);
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
      <td data-reservation-id-status={reservation.reservation_id}>{reservation.status}</td>
      <td>
      <a href={`/reservations/${reservation.reservation_id}/edit`} className="btn btn-primary">Edit</a>
      </td>
      <td>
        <button data-reservation-id-cancel={reservation.reservation_id} onClick={() => handleCancel(reservation.reservation_id)}>Cancel</button>
      </td>
    </tr>
  ));

  return (
    <div className="center-search" style={{marginBottom: "600px"}}>
      <div >
        <h2 style={{textAlign: "center"}}>Search for a reservation: </h2>
      </div>
      <div className="input-group">
        <input
          type="search"
          name="mobile_number"
          className="form-control rounded"
          placeholder="Enter a customer's phone number"
          aria-label="Search"
          aria-describedby="search-addon"
          value={mobileNumber}
          onChange={(e) => setMobileNumber(e.target.value)}
        />
        <button
          type="submit"
          className="btn btn-outline-primary"
          style={{marginLeft: "10px"}}
          onClick={handleFindReservations}
          data-mdb-ripple-init
        >
          Find
        </button>
      </div>

      <ErrorAlert error={reservationsError} />
      <br />

      <div>
        <table className="table table-bordered">
          <thead>
            <tr>
              <th scope="col">#</th>
              <th scope="col">Name</th>
              <th scope="col">People In Party</th>
              <th scope="col" colSpan="3">Status</th>
            </tr>
          </thead>
          <tbody>{reservationsTableRows}</tbody>
        </table>
        {reservations.length === 0 && (
          <p style={{textAlign: "center"}}>No reservations found for the given phone number.</p>
        )}
      </div>
    </div>
  );
};

export default Search;

