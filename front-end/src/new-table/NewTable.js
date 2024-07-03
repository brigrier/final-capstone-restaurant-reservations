import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { createTable } from "../utils/api";

const NewTable = () => {
  const [tableName, setTableName] = useState("");
  const [capacity, setCapacity] = useState(1);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    const table = { table_name: tableName, capacity: Number(capacity) };

    try {
      await createTable(table);
      navigate("/dashboard");
    } catch (error) {
      setError(error);
    }
  };

  const handleCancel = () => {
    navigate(-1);
  };

  return (
    <div>
      <h2>New Table</h2>
      {error && <div className="alert alert-danger">{error.message}</div>}
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
            minLength={2}
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
            min="1"
            className="form-control"
          />
        </div>
        <button type="submit">Submit</button>
        <button type="button" onClick={handleCancel}>
          Cancel
        </button>
      </form>
    </div>
  );
};

export default NewTable;
