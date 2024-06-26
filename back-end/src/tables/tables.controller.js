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

module.exports = {
  list,
  create
};
