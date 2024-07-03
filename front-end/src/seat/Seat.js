import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { listTables, readReservation, seatReservation } from "../utils/api";
import ErrorAlert from "../layout/ErrorAlert";

const Seat = () => {
  const [selectedTable, setSelectedTable] = useState("");
  const [tables, setTables] = useState([]);
  const [tablesError, setTablesError] = useState(null);
  const [reservation, setReservation] = useState(null);
  const [reservationError, setReservationError] = useState(null);
  const navigate = useNavigate();
  const { reservation_id } = useParams();

  useEffect(() => {
    const abortController = new AbortController();
    setTablesError(null);
    listTables({}, abortController.signal)
      .then(setTables)
      .catch(setTablesError);
    return () => abortController.abort();
  }, []);

  useEffect(() => {
    const abortController = new AbortController();
    setReservationError(null);
    readReservation(reservation_id, abortController.signal)
      .then(setReservation)
      .catch(setReservationError);
    return () => abortController.abort();
  }, [reservation_id]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const table = tables.find((table) => table.table_id === parseInt(selectedTable));
    if (table && reservation && table.capacity >= reservation.people) {
      try {
        await seatReservation(table.table_id, reservation_id);
        navigate("/dashboard");
      } catch (error) {
        setReservationError(error);
      }
    } else {
      setReservationError({ message: "Selected table cannot accommodate the reservation." });
    }
  };

  const handleCancel = () => {
    navigate(-1);
  };

  return (
    <div>
      <h3>Which table would you like to seat?</h3>
      {reservationError && <ErrorAlert error={reservationError} />}
      {tablesError && <ErrorAlert error={tablesError} />}
      <form onSubmit={handleSubmit}>
        <div>
          <label htmlFor="table_id">Table number</label>
          <select
            name="table_id"
            id="table_id"
            value={selectedTable}
            onChange={(e) => setSelectedTable(e.target.value)}
            required
          >
            <option value="">Select a table</option>
            {tables.map((table) => (
              <option key={table.table_id} value={table.table_id}>
                {table.table_name} - {table.capacity}
              </option>
            ))}
          </select>
        </div>
        <button type="submit">Submit</button>
        <button type="button" onClick={handleCancel}>
          Cancel
        </button>
      </form>
    </div>
  );
};

export default Seat;

