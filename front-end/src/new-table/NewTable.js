import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { createTable } from "../utils/api";

const NewTable = () => {
  const [tableName, setTableName] = useState("");
  const [capacity, setCapacity] = useState("");
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!tableName || !capacity) {
      setError(new Error("Both table name and capacity are required."));
      return;
    }

    if (capacity <= 0) {
      setError(new Error("Capacity must be at least 1."));
      return;
    }

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
    <div style={{marginBottom: "538px"}}>
      <h2>Enter a new Table: </h2>
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
        <div style={{marginTop: "15px"}}>
        <button style={{marginRight: "10px"}} type="submit">Submit</button>
        <button type="button" onClick={handleCancel}>
          Cancel
        </button>
        </div>
      </form>
    </div>
  );
};

export default NewTable;

