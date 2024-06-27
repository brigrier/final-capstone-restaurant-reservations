import React, { useState } from "react";

const Search = () => {
  return (
    <div class="input-group">
      <input
        type="search"
        name="mobile_number"
        class="form-control rounded"
        placeholder="Enter a customer's phone number"
        aria-label="Search"
        aria-describedby="search-addon"
      />
      <button
        type="button"
        class="btn btn-outline-primary"
        data-mdb-ripple-init
      >
        Find
      </button>
    </div>
  );
};

export default Search;
