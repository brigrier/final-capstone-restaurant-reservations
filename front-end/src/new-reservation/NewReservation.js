import React, { useState } from "react";

const NewReservation = () => {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [mobileNumber, setMobileNumber] = useState("");
  const [reservationDate, setReservationDate] = useState("");
  const [reservationTime, setReservationTime] = useState("");
  const [people, setPeople] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    // Add form submission logic here
    console.log({
      firstName,
      lastName,
      mobileNumber,
      reservationDate,
      reservationTime,
      people,
    });
  };

  const handleCancel = () => {
    // Add cancel logic here
    setFirstName("");
    setLastName("");
    setMobileNumber("");
    setReservationDate("");
    setReservationTime("");
    setPeople("");
  };

  return (
    <div>
      <h2>Enter new reservation</h2>
      <div>
        <form onSubmit={handleSubmit}>
          <div>
            <label htmlFor="first_name">First name</label>
            <input
              type="text"
              id="first_name"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              required
              className="form-control"
            />
          </div>
          <div>
            <label htmlFor="last_name">Last name</label>
            <input
              type="text"
              id="last_name"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              required
              className="form-control"
            />
          </div>
          <div>
            <label htmlFor="mobile_number">Mobile Number</label>
            <input
              type="text"
              id="mobile_number"
              value={mobileNumber}
              onChange={(e) => setMobileNumber(e.target.value)}
              placeholder="(XXX)-XXX-XXXX"
              required
              className="form-control"
            />
          </div>
          <div>
            <label htmlFor="reservation_date">Date of reservation</label>
            <input
              type="text"
              id="reservation_date"
              value={reservationDate}
              onChange={(e) => setReservationDate(e.target.value)}
              placeholder="Name of the deck"
              required
              className="form-control"
            />
          </div>
          <div>
            <label htmlFor="reservation_time">Time of reservation</label>
            <input
              type="text"
              id="reservation_time"
              value={reservationTime}
              onChange={(e) => setReservationTime(e.target.value)}
              required
              className="form-control"
            />
          </div>
          <div>
            <label htmlFor="people">Number of people in party</label>
            <input
              type="number"
              id="people"
              value={people}
              onChange={(e) => setPeople(e.target.value)}
              required
              className="form-control"
            />
          </div>
          <button type="submit">Submit</button>
          <button type="button" onClick={handleCancel}>Cancel</button>
        </form>
      </div>
    </div>
  );
};

export default NewReservation;

