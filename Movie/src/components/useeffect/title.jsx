import React, { useEffect } from "react";

const Title = ({ count }) => {
  console.log("render");
  useEffect(() => {
    document.title = `CLicked ${count} times`;
  }, [count]);
  return (
    <>
      <h1>Counter : {count}</h1>
    </>
  );
};

export default Title;
