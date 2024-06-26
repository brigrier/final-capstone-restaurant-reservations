const service = require("./tables.service");

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
          const error = new Error(`''capacity' must be a valid number.`);
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

// Middleware to check if the table exists
async function tableExists(req, res, next) {
  const table = await service.read(req.params.tableId);
  if (table) {
    res.locals.table = table;
    return next();
  }
  next({ status: 404, message: "Table cannot be found." });
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

module.exports = {
  list,
  create: [hasProperties("table_name", "capacity"), hasValidProps, create],
  update: [tableExists, hasProperties("reservation_id"), update],
};
