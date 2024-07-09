import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import dayjs from "dayjs";
import { createReservation } from "../utils/api";
import ReservationForm from "../reservation-form/ReservationForm";

const NewReservation = () => {
  const [formData, setFormData] = useState({
    first_name: "",
    last_name: "",
    mobile_number: "",
    reservation_date: "",
    reservation_time: "",
    people: "",
  });
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const validateForm = () => {
    const reservationDateTime = dayjs(`${formData.reservation_date} ${formData.reservation_time}`, "YYYY-MM-DD HH:mm");
    const now = dayjs();

    if (reservationDateTime.day() === 2) {
      return "The restaurant is closed on Tuesdays. Please choose another date.";
    }
    if (reservationDateTime.isBefore(now)) {
      return "Reservations cannot be made in the past. Please choose a future date and time.";
    }
    const openingTime = dayjs(`${formData.reservation_date} 10:30`, "YYYY-MM-DD HH:mm");
    const closingTime = dayjs(`${formData.reservation_date} 21:30`, "YYYY-MM-DD HH:mm");

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
      const reservation = {
        ...formData,
        people: Number(formData.people),
      };

      try {
        await createReservation(reservation);
        navigate(`/dashboard?date=${formData.reservation_date}`);
      } catch (err) {
        setError(err.message);
      }
    }
  };

  const handleCancel = () => {
    setFormData({
      first_name: "",
      last_name: "",
      mobile_number: "",
      reservation_date: "",
      reservation_time: "",
      people: "",
    });
    setError(null);
    navigate(-1);
  };

  return (
    <ReservationForm
      formData={formData}
      handleChange={handleChange}
      handleSubmit={handleSubmit}
      handleCancel={handleCancel}
      error={error}
    />
  );
};

export default NewReservation;
