import React, { createContext, useContext, useState } from 'react';

const FormDataContext = createContext();

export const useFormData = () => useContext(FormDataContext);

export const FormDataProvider = ({ children }) => {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    mobileNumber: '',
    reservationDate: '',
    reservationTime: '',
    people: '',
  });

  const updateFormData = (newFormData) => {
    setFormData(newFormData);
  };

  return (
    <FormDataContext.Provider value={{ formData, updateFormData }}>
      {children}
    </FormDataContext.Provider>
  );
};