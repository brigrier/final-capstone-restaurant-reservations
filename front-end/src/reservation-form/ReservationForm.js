import React from "react";

const ReservationForm = ({ formData, handleChange, handleSubmit, handleCancel, error }) => {
  return (
    <div style={{ marginBottom: "250px" }}>
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
            onChange={handleChange}
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
            onChange={handleChange}
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
            onChange={handleChange}
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
            onChange={handleChange}
            required
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
            onChange={handleChange}
            required
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
            onChange={handleChange}
            required
            className="form-control"
            min="1"
          />
        </div>
        <div style={{ marginTop: "15px" }}>
          <button className="btn btn-success" style={{ marginRight: "10px" }} type="submit">Submit</button>
          <button className="btn btn-dark" type="button" onClick={handleCancel}>
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
};

export default ReservationForm;
