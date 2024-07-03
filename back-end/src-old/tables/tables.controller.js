const service = require("./tables.service");
const reservationsService = require("../reservations/reservations.service");

// VALIDATION
const validProperties = ["table_name", "capacity"];

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

function isValidNumber(value) {
  return !isNaN(value) && typeof value === "number";
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

        if (property === "table_name" && data[property].length < 2) {
          const error = new Error(`'table_name' must be at least 2 characters long.`);
          error.status = 400;
          throw error;
        }

        if (property === "capacity" && !isValidNumber(data[property])) {
          const error = new Error(`'capacity' must be a valid number.`);
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

// Middleware to check if the table exists
async function tableExists(req, res, next) {
  const { tableId } = req.params;
  const table = await service.read(tableId);
  if (table) {
    res.locals.table = table;
    return next();
  }
  next({ status: 404, message: `${tableId}` });
}

// Middleware to check if reservation data is provided and valid
function reservationDataProvided(req, res, next) {
  const { reservation_id } = req.body.data || {};
  if (!reservation_id) {
    return next({ status: 400, message: "reservation_id is required" });
  }
  next();
}

// Middleware to check if the reservation exists
async function reservationExists(req, res, next) {
  const { reservation_id } = req.body.data;
  const reservation = await reservationsService.read(reservation_id);
  if (reservation) {
    res.locals.reservation = reservation;
    return next();
  }
  next({ status: 404, message: `Reservation ${reservation_id} cannot be found.` });
}

// Middleware to check if the table has sufficient capacity and is not already occupied
function tableHasCapacityAndIsAvailable(req, res, next) {
  const table = res.locals.table;
  const reservation = res.locals.reservation;

  if (table.capacity < reservation.people) {
    return next({ status: 400, message: "Table does not have sufficient capacity." });
  }

  if (table.status === "occupied") {
    return next({ status: 400, message: "Table is occupied." });
  }

  next();
}

// Middleware to check if the reservation is already seated
function reservationIsNotSeated(req, res, next) {
  const reservation = res.locals.reservation;

  if (reservation.status === "seated") {
    return next({ status: 400, message: "Reservation is already seated." });
  }

  next();
}

// Controller function to update the table with the reservation
async function seatReservation(req, res, next) {
  const { table } = res.locals;
  const { reservation_id } = req.body.data;

  const updatedTable = {
    ...table,
    reservation_id,
    status: "occupied",
  };

  const updatedReservation = {
    ...res.locals.reservation,
    status: "seated",
  };

  try {
    await service.update(updatedTable);
    await reservationsService.update(updatedReservation);
    res.status(200).json({ data: updatedTable });
  } catch (error) {
    next(error);
  }
}



// Middleware to check if the table is occupied
async function tableIsOccupied(req, res, next) {
  const table = res.locals.table;

  if (!table.reservation_id) {
    return next({ status: 400, message: "Table is not occupied." });
  }
  next();
}

// Controller function to remove the table assignment
async function unseatReservation(req, res, next) {
  const { table } = res.locals;
  const reservation_id = table.reservation_id;

  if (!reservation_id) {
    return next({ status: 400, message: "Table is not occupied." });
  }


  try {
    await service.unseat(table.table_id, table.reservation_id);
    res.status(200).json({});
  } catch (error) {
    next(error);
  }
}




// GET
async function list(req, res) {
  const data = await service.list();
  res.json({ data });
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

// PUT
async function update(req, res, next) {
  const updatedTable = {
    ...res.locals.table,
    ...req.body.data,
    table_id: res.locals.table.table_id,
  };

  try {
    await service.update(updatedTable);
    res.json({ data: updatedTable });
  } catch (error) {
    next(error);
  }
}

// DELETE
async function destroy(req, res, next) {
  try {
    await service.destroy(res.locals.table.table_id);
    res.status(200).end();
  } catch (error) {
    next(error);
  }
}

module.exports = {
  list,
  create: [hasProperties("table_name", "capacity"), hasValidProps, create],
  update: [tableExists, hasProperties("reservation_id"), update],
  seatReservation: [
    tableExists,
    reservationDataProvided,
    reservationExists,
    reservationIsNotSeated,
    tableHasCapacityAndIsAvailable,
    seatReservation,
  ],
  unseatReservation: [tableExists, tableIsOccupied, unseatReservation],
  delete: [tableExists, destroy],
};

