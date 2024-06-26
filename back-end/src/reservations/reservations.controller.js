const moment = require("moment");
const service = require("./reservations.service");

// VALIDATION
const validProperties = [
  "first_name",
  "last_name",
  "mobile_number",
  "reservation_date",
  "reservation_time",
  "people",
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

async function isValidStatus(req, res, next) {
  if (!req.body.data.status) {
    return next({ status: 400, message: "Status required" });
  }
  if (
    !["booked", "seated", "finished", "cancelled"].includes(
      req.body.data.status
    )
  ) {
    return next({ status: 400, message: "unknown" });
  }
  next()
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

function hasProperties(...properties) {
  return function (req, res, next) {
    const { data = {} } = req.body;
    const reservationDateTime = moment(
      `${data.reservation_date} ${data.reservation_time}`,
      "YYYY-MM-DD HH:mm"
    );
    const now = moment();
    const openingTime = moment(
      data.reservation_date + " 10:30",
      "YYYY-MM-DD HH:mm"
    );
    const closingTime = moment(
      data.reservation_date + " 21:30",
      "YYYY-MM-DD HH:mm"
    );

    try {
      properties.forEach((property) => {
        if (!data[property]) {
          const error = new Error(`A '${property}' property is required.`);
          error.status = 400;
          throw error;
        }

        if (property === "reservation_date") {
          const reservationDate = moment(data[property], "YYYY-MM-DD", true);
          if (!isValidDate(data[property]) || reservationDate.day() === 2) {
            const error = new Error(
              `'reservation_date' must be a valid date and not a Tuesday.`
            );
            error.status = 400;
            throw error;
          }
        }

        if (property === "reservation_time") {
          const reservationTime = moment(data[property], "HH:mm", true);
          if (
            !isValidTime(data[property]) ||
            reservationDateTime.isBefore(now) ||
            reservationDateTime.isBefore(openingTime) ||
            reservationDateTime.isAfter(closingTime)
          ) {
            const error = new Error(
              `'reservation_time' must be a valid time, not in the past, and within business hours (10:30 AM to 9:30 PM).`
            );
            error.status = 400;
            throw error;
          }
        }

        if (property === "people" && !isValidNumber(data[property])) {
          const error = new Error(`'people' must be a valid number.`);
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
    next({ status: 404, message: `Reservation ${reservationId} not found` });
  }
}

// GET reservations
async function list(req, res, next) {
  const { date } = req.query;
  if (!date) {
    return next({ status: 400, message: "Date query parameter is required" });
  }

  try {
    const data = await service.list(date);
    if (data.length > 0) {
      res.json({ data });
    } else {
      next({
        status: 400,
        message: "No reservations found for the given date",
      });
    }
  } catch (error) {
    next({ status: 500, message: error.message });
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

//  READ
async function read(req, res) {
  const { reservation: data } = res.locals;
  res.json({ data });
}

//PUT
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
  list,
  search,
  create: [
    hasValidProps,
    hasProperties(
      "first_name",
      "last_name",
      "mobile_number",
      "reservation_date",
      "reservation_time",
      "people"
    ),
    create,
  ],
  read: [reservationExists, read],
  update: [reservationExists, isValidStatus, isReservationFinished, update],
};
