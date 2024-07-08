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
  const { reservation_id } = useParams();
  const navigate = useNavigate();
console.log(reservation_id)
  useEffect(() => {
    const fetchReservation = async () => {
      try {
        const reservation = await readReservation(reservation_id); // Corrected function name
        updateFormData({
          first_name: reservation.first_name,
          last_name: reservation.last_name,
          mobile_number: reservation.mobile_number,
          reservation_date: moment(reservation.reservation_date).format(
            "YYYY-MM-DD"
            ),
          reservation_time: reservation.reservation_time,
          people: reservation.people,
        });
      } catch (error) {
        console.error("Error fetching reservation:", error);
        setError(error.message);
      }
    };

    fetchReservation();
  }, []);

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
    const abortController = new AbortController()
    e.preventDefault();
    const newError = validateForm();
    if (newError) {
      setError(newError);
    } else {
      setError(null);
      try {

        console.log(reservation_id)
        await updateReservation({...formData, reservation_id}, abortController.signal);
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
    <div style={{marginBottom: "250px"}}>
      <h2>Edit Reservation</h2>
      {error && <div className="alert alert-danger">{error}</div>}
      <form onSubmit={handleSubmit}>
        <div>
          <label htmlFor="first_name">First name</label>
          <input
            type="text"
            id="first_name"
            name="first_name"
            value={formData.first_name}
            onChange={(e) =>
              updateFormData({ ...formData, first_name: e.target.value })
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
            value={formData.last_name}
            onChange={(e) =>
                updateFormData({ ...formData, last_name: e.target.value })
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
            value={formData.mobile_number}
            onChange={(e) =>
                updateFormData({ ...formData, mobile_number: e.target.value })
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
            value={formData.reservation_date}
           // defaultValue={formData.reservationDate}
            onChange={(e) =>
                updateFormData({ ...formData, reservation_date: e.target.value })
              }
            required
           // placeholder="YYYY-MM-DD"
           // pattern="\d{4}-\d{2}-\d{2}"
            className="form-control"
          />
        </div>
        <div>
          <label htmlFor="reservation_time">Time of reservation</label>
          <input
            type="time"
            id="reservation_time"
            name="reservation_time"
            value={formData.reservation_time}
            onChange={(e) =>
                updateFormData({ ...formData, reservation_time: e.target.value })
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
        <div style={{marginTop: "15px"}}>
        <button className="btn btn-success" style={{marginRight: "10px"}} type="submit">Submit</button>
        <button className="btn btn-dark" type="button" onClick={handleCancel}>
          Cancel
        </button>
        </div>
      </form>
    </div>
  );
};

export default Edit;

