import axios from "axios";
import Warehouse from "./components/Warehouse";

const App = async () => {
  const data = { username: "admin", password: "123456" };
  const response = await axios.post(
    "http://localhost:3000/api/auth/login",
    data
  );
  const result = await response.data;
  console.log(result);
  return <></>;
};

export default App;
