import React, { useState } from "react";
import { listReservations } from "../utils/api";
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

  const reservationsTableRows = reservations.map((reservation, index) => (
    <tr key={index}>
      <th scope="row">{index + 1}</th>
      <td>{`${reservation.first_name} ${reservation.last_name}`}</td>
      <td>{reservation.people}</td>
      <td data-reservation-id-status={reservation.reservation_id}>{reservation.status}</td>
    </tr>
  ));

  return (
    <div>
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
          type="button"
          className="btn btn-outline-primary"
          onClick={handleFindReservations}
          data-mdb-ripple-init
        >
          Find
        </button>
      </div>

      <ErrorAlert error={reservationsError} />
      <br />

      <div>
        <table className="table">
          <thead>
            <tr>
              <th scope="col">#</th>
              <th scope="col">Name</th>
              <th scope="col">People In Party</th>
              <th scope="col">Status</th>
            </tr>
          </thead>
          <tbody>{reservationsTableRows}</tbody>
        </table>
        {reservations.length === 0 && (
          <p>No reservations found for the given phone number.</p>
        )}
      </div>
    </div>
  );
};

export default Search;

