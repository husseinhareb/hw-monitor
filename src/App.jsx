import { useState } from "react";
import reactLogo from "./assets/react.svg";
import "./App.css";
import "./components/Proc";
import Proc from "./components/Proc";
function App() {
  const [greetMsg, setGreetMsg] = useState("");


  return (
    <div className="container">
      <Proc />
    </div>
  );
}

export default App;
