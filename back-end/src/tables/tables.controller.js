const service = require("./tables.service");

//GET
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

//READ
async function tableExists(req, res, next) {
  const table = await service.read(req.params.tableId);
  if (table) {
    res.locals.table = table;
    return next();
  }
  next({ status: 404, message: "Table cannot be found." });
}


//PUT
async function update(req, res) {
  const updatedTable = {
    ...res.locals.table,
    ...req.body.data,
    table_id: res.locals.table.table_id,
  };
  await service.update(updatedTable);
  res.json({ data: updatedTable });
}


module.exports = {
  list,
  create,
  update
};
