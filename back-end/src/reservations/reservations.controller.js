const service = require("./reservations.service")

//GET reservations
async function list(req, res, next) {
    const { date } = req.query;
    if (date) {
        try {
            const data = await service.list(date);
            if (data.length > 0) {
                res.json({ data });
            } else {
                next({ status: 400, message: "No reservations found for the given date" });
            }
        } catch (error) {
            next({ status: 500, message: error.message });
        }
    } else {
        next({ status: 400, message: "Date query parameter is required" });
    }
}

module.exports = {
    list,
};

