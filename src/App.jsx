import "./App.css";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import Layout from "./layout/index";
import CreateTest from "./pages/CreateTest";
import Users from "./pages/Users";
import Reports from "./pages/Reports";
import HelpAndSupport from "./pages/HelpAndSupport";
import TestCreationForm from "./pages/TestCreationForm"
import TableList from "./pages/TableList";

function App() {
  return (
    <>
      <Router>
        <Routes>
          {/* All routes are nested under the Layout */}
          <Route path="/" element={<Layout />}>
            {/* Default Route (renders CreateTest by default) */}
            <Route index element={<TableList />} />

            {/* Nested Routes within Layout */}
            <Route path="/allTest" element={<TableList />} />
            <Route path="/users" element={<Users />} />
            <Route path="/reports" element={<Reports />} />
            <Route path="/testCreationForm" element={<TestCreationForm/>} />
            <Route path="/edit/testCreation/:Id" element={<TestCreationForm/>} />
            <Route path="/help" element={<HelpAndSupport />} />

            {/* Fallback Route */}
            <Route path="*" element={<Users />} />
          </Route>
        </Routes>
      </Router>
    </>
  );
}

export default App;
