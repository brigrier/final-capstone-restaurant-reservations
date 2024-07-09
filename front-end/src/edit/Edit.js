import React, { useState, useEffect } from "react";
import { readReservation, updateReservation } from "../utils/api";
import { useParams, useNavigate } from "react-router-dom";
import { useFormData } from "../new-reservation/FormDataContext";
import moment from "moment";
import ReservationForm from "../reservation-form/ReservationForm";

const Edit = () => {
  const { formData, updateFormData } = useFormData();
  const [error, setError] = useState(null);
  const { reservation_id } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchReservation = async () => {
      try {
        const reservation = await readReservation(reservation_id);
        updateFormData({
          first_name: reservation.first_name,
          last_name: reservation.last_name,
          mobile_number: reservation.mobile_number,
          reservation_date: moment(reservation.reservation_date).format("YYYY-MM-DD"),
          reservation_time: reservation.reservation_time,
          people: reservation.people,
        });
      } catch (error) {
        console.error("Error fetching reservation:", error);
        setError(error.message);
      }
    };

    fetchReservation();
  }, [reservation_id]);

  const validateForm = () => {
    const reservationDateTime = moment(`${formData.reservation_date} ${formData.reservation_time}`, "YYYY-MM-DD HH:mm");
    const now = moment();

    if (reservationDateTime.day() === 2) {
      return "The restaurant is closed on Tuesdays. Please choose another date.";
    }
    if (reservationDateTime.isBefore(now)) {
      return "Reservations cannot be made in the past. Please choose a future date and time.";
    }
    const openingTime = moment(`${formData.reservation_date} 10:30`, "YYYY-MM-DD HH:mm");
    const closingTime = moment(`${formData.reservation_date} 21:30`, "YYYY-MM-DD HH:mm");

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
        await updateReservation({ ...formData, reservation_id });
        navigate(`/dashboard?date=${formData.reservation_date}`);
      } catch (err) {
        setError(err.message);
      }
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    updateFormData({ ...formData, [name]: value });
  };

  const handleCancel = () => {
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

export default Edit;
