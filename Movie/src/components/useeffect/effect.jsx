import React, { useState } from "react";
import Title from "./title";

const Effect = () => {
  const [count, setcount] = useState(0);
  return (
    <>
      <Title count={count} />
      <button
        onClick={() => {
          setcount(count + 1);
        }}
      >
        Click me
      </button>
    </>
  );
};

export default Effect;
