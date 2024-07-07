import React, { useState, useEffect } from "react";
import { readReservation, updateReservation } from "../utils/api";
import { useParams, useNavigate } from "react-router-dom";
import { useFormData } from "../new-reservation/FormDataContext";
import moment from "moment";

const Edit = () => {
  const { formData, updateFormData } = useFormData();
  const [error, setError] = useState(null);
  const [reservationDate, ] = useState("");
  const [reservationTime, ] = useState("");
  const { reservationId } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchReservation = async () => {
      try {
        const reservation = await readReservation(reservationId); // Corrected function name
        updateFormData({
          firstName: reservation.first_name,
          lastName: reservation.last_name,
          mobileNumber: reservation.mobile_number,
          reservationDate: reservation.reservation_date,
          reservationTime: reservation.reservation_time,
          people: reservation.people,
        });
      } catch (error) {
        console.error("Error fetching reservation:", error);
        setError(error.message);
      }
    };

    fetchReservation();
  }, [reservationId, updateFormData]);

  const validateForm = () => {
    const reservationDateTime = moment(
      `${reservationDate} ${reservationTime}`,
      "YYYY-MM-DD HH:mm"
    );
    const now = moment();

    if (reservationDateTime.day() === 2) {
      return "The restaurant is closed on Tuesdays. Please choose another date.";
    }
    if (reservationDateTime.isBefore(now)) {
      return "Reservations cannot be made in the past. Please choose a future date and time.";
    }
    const openingTime = moment(`${reservationDate} 10:30`, "YYYY-MM-DD HH:mm");
    const closingTime = moment(`${reservationDate} 21:30`, "YYYY-MM-DD HH:mm");

    if (reservationDateTime.isBefore(openingTime)) {
      return "Reservations cannot be made before 10:30 AM. Please choose a later time.";
    }
    if (reservationDateTime.isAfter(closingTime)) {
      return "Reservations cannot be made after 9:30 PM. Please choose an earlier time.";
    }
    return null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const newError = validateForm();
    if (newError) {
      setError(newError);
    } else {
      setError(null);
      try {
        await updateReservation(reservationId, formData);
        navigate(-1);
      } catch (err) {
        setError(err.message);
      }
    }
  };

  const handleCancel = () => {
    navigate(-1);
  };

  return (
    <div>
      <h2>Edit Reservation</h2>
      {error && <div className="alert alert-danger">{error}</div>}
      <form onSubmit={handleSubmit}>
        <div>
          <label htmlFor="first_name">First name</label>
          <input
            type="text"
            id="first_name"
            name="first_name"
            value={formData.firstName}
            onChange={(e) =>
              updateFormData({ ...formData, firstName: e.target.value })
            }
            required
            className="form-control"
          />
        </div>
        <div>
          <label htmlFor="last_name">Last name</label>
          <input
            type="text"
            id="last_name"
            name="last_name"
            value={formData.lastName}
            onChange={(e) =>
                updateFormData({ ...formData, lastName: e.target.value })
              }
            required
            className="form-control"
          />
        </div>
        <div>
          <label htmlFor="mobile_number">Mobile Number</label>
          <input
            type="text"
            id="mobile_number"
            name="mobile_number"
            value={formData.mobileNumber}
            onChange={(e) =>
                updateFormData({ ...formData, mobileNumber: e.target.value })
              }
            placeholder="XXX-XXX-XXXX"
            required
            className="form-control"
          />
        </div>
        <div>
          <label htmlFor="reservation_date">Date of reservation</label>
          <input
            type="date"
            id="reservation_date"
            name="reservation_date"
            value={formData.reservationDate}
            onChange={(e) =>
                updateFormData({ ...formData, reservationDate: e.target.value })
              }
            required
            placeholder="YYYY-MM-DD"
            pattern="\d{4}-\d{2}-\d{2}"
            className="form-control"
          />
        </div>
        <div>
          <label htmlFor="reservation_time">Time of reservation</label>
          <input
            type="time"
            id="reservation_time"
            name="reservation_time"
            value={formData.reservationTime}
            onChange={(e) =>
                updateFormData({ ...formData, reservationTime: e.target.value })
              }
            required
            placeholder="HH:MM"
            pattern="[0-9]{2}:[0-9]{2}"
            className="form-control"
          />
        </div>
        <div>
          <label htmlFor="people">Number of people in party</label>
          <input
            type="number"
            id="people"
            name="people"
            value={formData.people}
            onChange={(e) =>
                updateFormData({ ...formData, people: e.target.value })
              }
            required
            className="form-control"
            min="1"
          />
        </div>
        <button type="submit">Submit</button>
        <button type="button" onClick={handleCancel}>
          Cancel
        </button>
      </form>
    </div>
  );
};

export default Edit;

