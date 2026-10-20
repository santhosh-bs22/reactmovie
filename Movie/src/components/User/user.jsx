import React, { useEffect, useState } from "react";
import Image from "../../assets/index.jsx";
import Button from "../ui/Button/index.jsx";
import "./user.css";

const User = () => {
  const [data, setdata] = useState([]);
  useEffect(() => {
    const fetchData = async () => {
      const res = await fetch("https://jsonplaceholder.typicode.com/users");
      const data = await res.json();
      setdata(data);
    };
    fetchData();
  }, []);
  console.log(data, "data");

  return (
    <>
      <div className="user-box">
        {data?.map((item, key) => {
          return (
            <div key={key} className="User">
              <h2>{item.name}</h2>

              <p>
                <strong>ID:</strong> {item.id}
              </p>
              <p>
                <strong>Username:</strong> {item.username}
              </p>
              <p>
                <strong>Email:</strong> {item.email}
              </p>
              <p>
                <strong>Phone:</strong> {item.phone}
              </p>
              <p>
                <strong>Website:</strong> {item.website}
              </p>

              <h3>Address</h3>
              <p>Street: {item.address.street}</p>
              <p>Suite: {item.address.suite}</p>
              <p>City: {item.address.city}</p>
              <p>Zipcode: {item.address.zipcode}</p>
              <p>
                Geo: Latitude {item.address.geo.lat}, Longitude{" "}
                {item.address.geo.lng}
              </p>

              <h3>Company</h3>
              <p>Name: {item.company.name}</p>
              <p>Catch Phrase: {item.company.catchPhrase}</p>
              <p>Business: {item.company.bs}</p>
            </div>
          );
        })}
      </div>
    </>
  );
};

export default User;
