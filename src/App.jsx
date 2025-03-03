import "./App.css";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import Layout from "./layout/index";
import CreateTest from "./pages/CreateTest";
import Users from "./pages/Users";
import Reports from "./pages/Reports";
<<<<<<< HEAD
import NewTest from "./NewTest/components/NewTest"
=======
import HelpAndSupport from "./pages/HelpAndSupport";
>>>>>>> 52d50c77b0a24084894a82eef2583ede10752d75

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
<<<<<<< HEAD
            <Route path="*" element={<CreateTest />} />
            <Route path="newtest" element={<NewTest/>}/>
          </Routes>
        </Layout>
=======
            <Route path="/help" element={<HelpAndSupport />} />

            {/* Fallback Route */}
            <Route path="*" element={<Users />} />
          </Route>
        </Routes>
>>>>>>> 52d50c77b0a24084894a82eef2583ede10752d75
      </Router>
    </>
  );
}

export default App;
