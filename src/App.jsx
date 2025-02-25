import "./App.css";
// import Header from "./components/Headers";
// import Sidebar from "./components/Sidebar";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import Layout from "./components/Layout";
import CreateTest from "./pages/CreateTest";
import Users from "./pages/Users";
import Reports from "./pages/Reports";
import NewTest from "./NewTest/components/NewTest"

function App() {
  return (
    <>
      <Router>
        <Layout>
          <Routes>
            <Route path="/createTest" element={<CreateTest />} />
            <Route path="/users" element={<Users />} />
            <Route path="/reports" element={<Reports />} />
            <Route path="*" element={<CreateTest />} />
            <Route path="newtest" element={<NewTest/>}/>
          </Routes>
        </Layout>
      </Router>
    </>
  );
}

export default App;
