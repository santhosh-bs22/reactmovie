import React, { useEffect, useState } from "react";
import Image from "../../assets/index.jsx";
import Button from "../ui/Button/index.jsx";
import "./card.css";

const Card = () => {
  const [count, setCount] = useState(0);
  return (
    <>
      <h1>Welcome to my webiste!</h1>
      <img className="profile" src={Image.profile} alt="Profile" />
      <p className="name">This is my profile</p>
      <Button
        name="Click Alert "
        onClick={() => {
          alert("Alert Button");
          console.log("Button was clicked");
        }}
      />
      <h1>Counter: {count}</h1>
      <Button
        name={"Increment"}
        onClick={() => {
          setCount(count + 1);
        }}
      />
      <Button
        name={"Decrement"}
        onClick={() => {
          setCount(count - 1);
        }}
      />
      <Button
        name={"Reset"}
        onClick={() => {
          setCount(0);
        }}
      />
    </>
  );
};

export default Card;
