import "./App.css";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import Layout from "./layout/index";
import CreateTest from "./pages/CreateTest";
import Users from "./pages/Users";
import Reports from "./pages/Reports";
import HelpAndSupport from "./pages/HelpAndSupport";
import NewTest from "./NewTest/components/NewTest"


function App() {
  return (
    <>
      <Router>
        <Routes>
          {/* All routes are nested under the Layout */}
          <Route path="/" element={<Layout />}>
            {/* Default Route (renders CreateTest by default) */}
            <Route index element={<CreateTest />} />

            {/* Nested Routes within Layout */}
            <Route path="/createTest" element={<CreateTest />} />
            <Route path="/users" element={<Users />} />
            <Route path="/reports" element={<Reports />} />
            <Route path="/help" element={<HelpAndSupport />} />
            <Route path="newtest" element={<NewTest/>}/>

            {/* Fallback Route */}
            <Route path="*" element={<Users />} />
          </Route>
        </Routes>
      </Router>
    </>
  );
}

export default App;
