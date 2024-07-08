import formatReservationDate from "./format-reservation-date";
import formatReservationTime from "./format-reservation-date";

const API_BASE_URL =
  process.env.REACT_APP_API_BASE_URL || "http://localhost:5001";

/**
 * Defines the default headers for these functions to work with `json-server`
 */
const headers = new Headers();
headers.append("Content-Type", "application/json");

/**
 * Fetch `json` from the specified URL and handle error status codes and ignore `AbortError`s
 *
 * This function is NOT exported because it is not needed outside of this file.
 *
 * @param url
 *  the url for the request.
 * @param options
 *  any options for fetch
 * @param onCancel
 *  value to return if fetch call is aborted. Default value is undefined.
 * @returns {Promise<Error|any>}
 *  a promise that resolves to the `json` data or an error.
 *  If the response is not in the 200 - 399 range the promise is rejected.
 */
async function fetchJson(url, options, onCancel) {
  try {
    const response = await fetch(url, options);

    if (response.status === 204) {
      return null;
    }

    const payload = await response.json();

    if (payload.error) {
      return Promise.reject({ message: payload.error });
    }
    return payload.data;
  } catch (error) {
    if (error.name !== "AbortError") {
      console.error(error.stack);
      throw error;
    }
    return Promise.resolve(onCancel);
  }
}

/**
 * Retrieves all existing reservations.
 * @param params
 *  parameters to filter the reservations.
 * @param signal
 *  optional AbortController signal.
 * @returns {Promise<[reservation]>}
 *  a promise that resolves to a possibly empty array of reservations saved in the database.
 */
export async function listReservations(params, signal) {
  const url = new URL(`${API_BASE_URL}/reservations`);
  Object.entries(params).forEach(([key, value]) =>
    url.searchParams.append(key, value.toString())
  );
  return await fetchJson(url, { headers, signal }, [])
    .then(formatReservationDate)
    .then(formatReservationTime);
}

/**
 * Creates a new reservation.
 * @param reservation
 *  the reservation object to create.
 * @param signal
 *  optional AbortController signal.
 * @returns {Promise<reservation>}
 *  a promise that resolves to the created reservation object.
 */
export async function createReservation(reservation, signal) {
  const url = `${API_BASE_URL}/reservations`;
  const options = {
    method: "POST",
    headers,
    body: JSON.stringify({ data: reservation }),
    signal,
  };

  const response = await fetch(url, options);
  const responseBody = await response.json();

  if (!response.ok) {
    throw new Error(
      responseBody.error ||
        "An error occurred while creating the reservation."
    );
  }

  return responseBody.data;
}

/**
 * Updates the status of a reservation.
 * @param reservationId
 *  the ID of the reservation to update.
 * @param status
 *  the new status of the reservation.
 * @param signal
 *  optional AbortController signal.
 * @returns {Promise<reservation>}
 *  a promise that resolves to the updated reservation object.
 */
export async function updateReservationStatus(reservationId, status, signal) {
  const url = `${API_BASE_URL}/reservations/${reservationId}/status`;
  const options = {
    method: "PUT",
    headers,
    body: JSON.stringify({ data: { status } }),
    signal,
  };
  return await fetchJson(url, options, {});
}

/**
 * Updates  a reservation.
 * @param updatedReservation
 *  the ID of the reservation to update.
 * @param reservationId
 *  the new status of the reservation.
 * @param signal
 *  optional AbortController signal.
 * @returns {Promise<reservation>}
 *  a promise that resolves to the updated reservation object.
 */
export async function updateReservation(updatedReservation, signal) {
  console.log(updatedReservation)
  const url = `${API_BASE_URL}/reservations/${updatedReservation.reservation_id}`;
  const options = {
    method: "PUT",
    headers,
    body: JSON.stringify({ data: { ...updatedReservation } }),
    signal,
  };
  return await fetchJson(url, options, updatedReservation);
}



/**
 * Retrieves all existing tables.
 * @param params
 *  parameters to filter the tables.
 * @param signal
 *  optional AbortController signal.
 * @returns {Promise<[table]>}
 *  a promise that resolves to a possibly empty array of tables saved in the database.
 */
export async function listTables(params, signal) {
  const url = new URL(`${API_BASE_URL}/tables`);
  Object.entries(params).forEach(([key, value]) =>
    url.searchParams.append(key, value.toString())
  );
  return await fetchJson(url, { headers, signal }, []);
}

/**
 * Creates a new table.
 * @param table
 *  the table object to create.
 * @param signal
 *  optional AbortController signal.
 * @returns {Promise<table>}
 *  a promise that resolves to the created table object.
 */
export async function createTable(table, signal) {
  const url = `${API_BASE_URL}/tables`;
  const options = {
    method: "POST",
    headers,
    body: JSON.stringify({ data: table }),
    signal,
  };

  const response = await fetch(url, options);
  const responseBody = await response.json();

  if (!response.ok) {
    throw new Error(
      responseBody.error || "An error occurred while creating the table."
    );
  }

  return responseBody.data;
}

/**
 * Seats a reservation at a specified table.
 * @param table_id
 *  the ID of the table to seat the reservation at.
 * @param reservation_id
 *  the ID of the reservation to seat.
 * @param signal
 *  optional AbortController signal.
 * @returns {Promise<void>}
 *  a promise that resolves when the reservation is successfully seated.
 */
export async function seatReservation(table_id, reservation_id, signal) {
  const url = `${API_BASE_URL}/tables/${table_id}/seat`;
  const options = {
    method: "PUT",
    headers,
    body: JSON.stringify({ data: { reservation_id } }),
    signal,
  };

  const response = await fetch(url, options);
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message);
  }
}

/**
 * Reads a reservation with the specified reservation_id.
 * @param reservation_id
 *  the ID of the reservation to read.
 * @param signal
 *  optional AbortController signal.
 * @returns {Promise<reservation>}
 *  a promise that resolves to the reservation object.
 */
export async function readReservation(reservation_id, signal) {
  const url = `${API_BASE_URL}/reservations/${reservation_id}`;
  return await fetchJson(url, { headers, signal }, {});
}

/**
 * Finishes a table with the specified table_id.
 * @param table_id
 *  the ID of the table to finish.
 * @param signal
 *  optional AbortController signal.
 * @returns {Promise<void>}
 *  a promise that resolves when the table is successfully finished.
 */
export async function finishTable(tableId, signal) {
  const url = new URL(`${API_BASE_URL}/tables/${tableId}/seat`);
  const options = {
    method: "DELETE",
    headers: { "Content-Type": "application/json" },
    signal,
  };
  return await fetchJson(url, options, {});
}

// Add other utility functions as needed
