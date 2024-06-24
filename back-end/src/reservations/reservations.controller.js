const { isDate } = require("moment");
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

        if (property === "reservation_date" && !isValidDate(data[property])) {
          const error = new Error(`'reservation_date' must be a valid date.`);
          error.status = 400;
          throw error;
        }

        if (property === "reservation_time" && !isValidTime(data[property])) {
          const error = new Error(`'reservation_time' must be a valid time.`);
          error.status = 400;
          throw error;
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

const dateFormat = /\d\d\d\d-\d\d-\d\d/;
const timeFormat = /\d\d:\d\d/;

function isValidDate(dateString) {
  if (!dateFormat.test(dateString)) {
    const error = new Error(`reservation_date`);
    error.status = 400;
    throw error
  }
  return !isNaN(Date.parse(dateString));
}

function isValidTime(timeString) {
  if (!timeFormat.test(timeString)) {
    const error = new Error("reservation_time");
    error.status = 400;
    throw error
  }
  return /^([01]\d|2[0-3]):([0-5]\d)$/.test(timeString);
}

function isValidNumber(value) {
  if (isNaN(value) ) {
    const error = new Error(`people`);
    error.status = 400;
    throw error
  }

  return !isNaN(value) && typeof value === "number";
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

// POST
async function create(req, res, next) {
  try {
    const data = await service.create(req.body.data);
    res.status(201).json({ data });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  list,
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
};
