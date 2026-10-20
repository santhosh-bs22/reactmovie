import React, { useState } from "react";

const Form = () => {
  const [form, setform] = useState({
    firstName: "",
    email: "",
    age: "",
  });

  const formChange = (e) => {
    const { name, value } = e.target;
    setform((prev) => ({ ...prev, [name]: value }));
  };
  return (
    <>
      <h2>User Form</h2>

      <label>Name : </label>
      <input
        type="text"
        name="firstName"
        value={form.firstName}
        onChange={formChange}
      />
      <br />
      <label>Email : </label>

      <input
        type="email"
        name="email"
        value={form.email}
        onChange={formChange}
      />
      <br />

      <label>Age : </label>

      <input
        type="number"
        name="age"
        placeholder="Enter your age"
        value={form.age}
        onChange={formChange}
      />
      <br />

      <button>Submit</button>

      <p>{form.firstName}</p>
      <p>{form.email}</p>
      <p>{form.age}</p>
    </>
  );
};

export default Form;
