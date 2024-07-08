import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import dayjs from "dayjs";
import { createReservation } from "../utils/api";

const NewReservation = () => {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [mobileNumber, setMobileNumber] = useState("");
  const [reservationDate, setReservationDate] = useState("");
  const [reservationTime, setReservationTime] = useState("");
  const [people, setPeople] = useState("");
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    const newError = validateForm();
    if (newError) {
      setError(newError);
    } else {
      setError(null);

      const reservation = {
        first_name: firstName,
        last_name: lastName,
        mobile_number: mobileNumber,
        reservation_date: reservationDate,
        reservation_time: reservationTime,
        people: Number(people),
      };

      try {
        await createReservation(reservation);
        navigate(`/dashboard?date=${reservationDate}`);
      } catch (err) {
        setError(err.message);
      }
    }
  };

  const validateForm = () => {
    const reservationDateTime = dayjs(
      `${reservationDate} ${reservationTime}`,
      "YYYY-MM-DD HH:mm"
    );
    const now = dayjs();

    if (reservationDateTime.day() === 2) {
      return "The restaurant is closed on Tuesdays. Please choose another date.";
    }
    if (reservationDateTime.isBefore(now)) {
      return "Reservations cannot be made in the past. Please choose a future date and time.";
    }
    const openingTime = dayjs(`${reservationDate} 10:30`, "YYYY-MM-DD HH:mm");
    const closingTime = dayjs(`${reservationDate} 21:30`, "YYYY-MM-DD HH:mm");

    if (reservationDateTime.isBefore(openingTime)) {
      return "Reservations cannot be made before 10:30 AM. Please choose a later time.";
    }
    if (reservationDateTime.isAfter(closingTime)) {
      return "Reservations cannot be made after 9:30 PM. Please choose an earlier time.";
    }
    return null;
  };

  const handleCancel = () => {
    setFirstName("");
    setLastName("");
    setMobileNumber("");
    setReservationDate("");
    setReservationTime("");
    setPeople("");
    setError(null);
    navigate(-1);
  };

  return (
    <div style={{marginBottom: "215px"}}>
      <h2>Enter a new reservation: </h2>
      {error && <div className="alert alert-danger">{error}</div>}
      <form onSubmit={handleSubmit}>
        <div className="form-in">
          <label htmlFor="first_name" >First name</label>
          <input
            type="text"
            id="first_name"
            name="first_name"
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
            required
            className="form-control"
          />
        </div>
        <div className="form-in">
          <label htmlFor="last_name">Last name</label>
          <input
            type="text"
            id="last_name"
            name="last_name"
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
            required
            className="form-control"
          />
        </div>
        <div className="form-in">
          <label htmlFor="mobile_number">Mobile Number</label>
          <input
            type="text"
            id="mobile_number"
            name="mobile_number"
            value={mobileNumber}
            onChange={(e) => setMobileNumber(e.target.value)}
            placeholder="XXX-XXX-XXXX"
            required
            className="form-control"
          />
        </div>
        <div className="form-in">
          <label htmlFor="reservation_date">Date of reservation</label>
          <input
            type="date"
            id="reservation_date"
            name="reservation_date"
            value={reservationDate}
            onChange={(e) => setReservationDate(e.target.value)}
            required
            placeholder="YYYY-MM-DD"
            pattern="\d{4}-\d{2}-\d{2}"
            className="form-control"
          />
        </div>
        <div className="form-in">
          <label htmlFor="reservation_time">Time of reservation</label>
          <input
            type="time"
            id="reservation_time"
            name="reservation_time"
            value={reservationTime}
            onChange={(e) => setReservationTime(e.target.value)}
            required
            placeholder="HH:MM"
            pattern="[0-9]{2}:[0-9]{2}"
            className="form-control"
          />
        </div>
        <div className="form-in">
          <label htmlFor="people">Number of people in party</label>
          <input
            type="number"
            id="people"
            name="people"
            value={people}
            onChange={(e) => setPeople(e.target.value)}
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

export default NewReservation;
