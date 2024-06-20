import React, { useState } from "react";

const NewTable = () => {

    const [tableName, setTableName] = useState("")
    const [capacity, setCapacity] = useState("")
    const [error, setError] = useState(null)

    const handleSubmit = (e) => {
        e.preventDefault();
          console.log({
            tableName,
            capacity,
          });
        }
      ;
    

      const handleCancel = () => {
        setTableName("");
        setCapacity("");
        setError(null);
      };

  return (
    <div>
    <div>
        <h2>Table assignment </h2>
    </div>
    <div>
        <form onSubmit={handleSubmit}>
        <div>
            <label htmlFor="table_name">Table name</label>
            <input
              type="text"
              id="table_name"
              name="table_name"
              value={tableName}
              onChange={(e) => setTableName(e.target.value)}
              required
              className="form-control"
            />
          </div>
          <div>
            <label htmlFor="capacity">Capacity</label>
            <input
              type="number"
              id="capacity"
              name="capacity"
              value={capacity}
              onChange={(e) => setCapacity(e.target.value)}
              required
              className="form-control"
              min="1"
            />
          </div>
          <button type="submit">Submit</button>
          <button type="button" onClick={handleCancel}>
            Cancel
          </button>
        </form>
    </div>
    </div>
  )
}

export default NewTable