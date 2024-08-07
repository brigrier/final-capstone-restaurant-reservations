const moment = require("moment");
const service = require("./reservations.service");
const asyncErrorBoundary = require("../errors/asyncErrorBoundary")

// VALIDATION
const validProperties = [
  "first_name",
  "last_name",
  "mobile_number",
  "reservation_date",
  "reservation_time",
  "people",
  "status",
];

function hasValidProps(req, res, next) {
  const { data = {} } = req.body;
  const invalidFields = Object.keys(data).filter(
    (field) => !validProperties.includes(field)
  );

  if (invalidFields.length) {
    return next({
      status: 400,
      message: `Invalid field(s): ${invalidFields.join(", ")}`,
    });
  }
  next();
}

function isValidDate(date) {
  const dateFormat = /^\d{4}-\d{2}-\d{2}$/;
  if (dateFormat.test(date)) {
    return moment(date, "YYYY-MM-DD", true).isValid();
  }
  return false;
}

function isValidTime(time) {
  const timeFormat = /^\d{2}:\d{2}$/;
  if (timeFormat.test(time)) {
    return moment(time, "HH:mm", true).isValid();
  }
  return false;
}

function isValidNumber(value) {
  return !isNaN(value) && typeof value === "number";
}

function isValidPhone(value) {
  const phoneRegex = /^[\d-]+$/;
  if (phoneRegex.test(value)) {
    return true;
  }
  return false;
}

async function isValidStatus(req, res, next) {
  const { status } = req.body.data || {};
  if (!status) {
    return next({ status: 400, message: "Status required." });
  }
  const validStatuses = ["booked", "seated", "finished", "cancelled"];
  if (!validStatuses.includes(status)) {
    return next({ status: 400, message: `Invalid status: ${status}` });
  }
  next();
}

async function isReservationFinished(req, res, next) {
  const { reservationId } = req.params;
  const reservation = await service.read(reservationId);
  if (reservation) {
    res.locals.reservation = reservation;
  }
  if (reservation.status === "finished") {
    return next({ status: 400, message: "Cannot update finished reservation" });
  }
  next();
}

function validateReservationDate(reservationDate) {
  const date = moment(reservationDate, "YYYY-MM-DD", true);
  if (!date.isValid() || date.day() === 2) {
    const error = new Error(`'reservation_date' restaurant closed, must be a valid date and not a Tuesday.`);
    error.status = 400;
    throw error;
  }
}

function validateReservationTime(reservationDate, reservationTime) {
  const now = moment();
  const reservationDateTime = moment(`${reservationDate} ${reservationTime}`, "YYYY-MM-DD HH:mm");
  const openingTime = moment(`${reservationDate} 10:30`, "YYYY-MM-DD HH:mm");
  const closingTime = moment(`${reservationDate} 21:30`, "YYYY-MM-DD HH:mm");

  console.log(`Validating reservation time:
    Now: ${now.format()}
    Reservation DateTime: ${reservationDateTime.format()}
    Opening Time: ${openingTime.format()}
    Closing Time: ${closingTime.format()}`);

  if (!moment(reservationTime.substring(0, 5), "HH:mm", true).isValid()) {
    const error = new Error(`'reservation_time' must be a valid time.`);
    error.status = 400;
    throw error;
  }

  if (reservationDateTime.isBefore(now)) {
    const error = new Error(`'reservation_time' must not be in the past or future.`);
    error.status = 400;
    throw error;
  }

  if (reservationDateTime.isBefore(openingTime) || reservationDateTime.isAfter(closingTime)) {
    const error = new Error(`'reservation_time' must be within business hours (10:30 AM to 9:30 PM).`);
    error.status = 400;
    throw error;
  }
}

function hasProperties(...properties) {
  return function (req, res, next) {
    const { data = {} } = req.body;

    try {
      properties.forEach((property) => {
        if (!data[property]) {
          const error = new Error(`A '${property}' property is required.`);
          error.status = 400;
          throw error;
        }

        if (property === "reservation_date") {
          validateReservationDate(data[property]);
        }

        if (property === "reservation_time") {
          validateReservationTime(data["reservation_date"], data[property]);
        }

        if (property === "people" && !isValidNumber(data[property])) {
          const error = new Error(`'people' must be a valid number.`);
          error.status = 400;
          throw error;
        }

        if (property === "mobile_number" && !isValidPhone(data[property])) {
          const error = new Error(`'mobile_number' must be a valid phone number.`);
          error.status = 400;
          throw error;
        }
      });

      next();
    } catch (error) {
      next(error);
    }
  };
}

async function reservationExists(req, res, next) {
  const { reservationId } = req.params;
  const reservation = await service.read(reservationId);
  if (reservation) {
    res.locals.reservation = reservation;
    return next();
  } else {
    return next({ status: 404, message: `Reservation ${reservationId} not found` });
  }
}

async function isValidResStatus(req, res, next) {
  const { status = {} } = req.body.data
  if (!status) {
    return next({ status: 400, message: "Status required." });
  }
  if (["seated", "finished"].includes(status)) {
    return next({ status: 400, message: `${req.body.data.status}` });
  }
  next();
}

async function updateStatus(req, res, next) {
  const { status } = req.body.data;
  const validStatuses = ["booked", "seated", "finished", "cancelled"];

  if (!validStatuses.includes(status)) {
    return next({
      status: 400,
      message: `Invalid status: ${status}`,
    });
  }

  const updatedReservation = {
    ...res.locals.reservation,
    status,
  };

  try {
    await service.update(updatedReservation);
    res.json({ data: updatedReservation });
  } catch (error) {
    next(error);
  }
}

// GET reservations
async function list(req, res, next) {
  const { date, mobile_number } = req.query;
  try {
    let data;
    if (mobile_number) {
      data = await service.search(mobile_number);
    } else if (date) {
      data = await service.list(date);
    } else {
      data = await service.list();
    }
    res.json({ data });
  } catch (error) {
    next(error);
  }
}

async function search(req, res, next) {
  const { mobileNumber } = req.params;
  
  try {
    const reservations = await service.search(mobileNumber);
    res.json(reservations);
  } catch (error) {
    next(error);
  }
}

// POST
async function create(req, res, next) {
  req.body.data.status = "booked";
  try {
    const data = await service.create(req.body.data);
    res.status(201).json({ data });
  } catch (error) {
    next(error);
  }
}

// READ
async function read(req, res) {
  const { reservation: data } = res.locals;
  res.json({ data });
}

// PUT
async function update(req, res, next) {
  const updatedReservation = {
    ...res.locals.reservation,
    ...req.body.data,
    reservation_id: res.locals.reservation.reservation_id,
  };

  try {
    await service.update(updatedReservation);
    res.json({ data: updatedReservation });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  list: asyncErrorBoundary(list),
  search: asyncErrorBoundary(search),
  create: [
    asyncErrorBoundary(hasValidProps),
    asyncErrorBoundary(hasProperties(
      "first_name",
      "last_name",
      "mobile_number",
      "reservation_date",
      "reservation_time",
      "people"
    )),
    asyncErrorBoundary(isValidResStatus),
    asyncErrorBoundary(create),
  ],
  read: [asyncErrorBoundary(reservationExists), asyncErrorBoundary(read)],
  update: [
    asyncErrorBoundary(reservationExists),
    asyncErrorBoundary(hasProperties(
      "first_name",
      "last_name",
      "mobile_number",
      "reservation_date",
      "reservation_time",
      "people"
    )),
    asyncErrorBoundary(isReservationFinished),
    asyncErrorBoundary(update)
  ],
  updateStatus: [
    asyncErrorBoundary(reservationExists),
    asyncErrorBoundary(isReservationFinished),
    asyncErrorBoundary(updateStatus)
  ],
};
