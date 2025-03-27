import "./App.css";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import Layout from "./layout/index"; 
import Users from "./pages/Users";
import Reports from "./pages/Reports";
import HelpAndSupport from "./pages/HelpAndSupport";
import TestCreationForm from "./pages/TestCreationForm"
import TableList from "./pages/TableList";
import Schools from "./pages/Schools";
import PageNotFound from "./pages/PageNotFound";
import BulkUploadSchools from "./components/BulkUpload";
import AddSchool from "./components/AddSchool";
import UserCreationForm from "./components/UserCreationForm";

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
            <Route path="/users/userCreationForm" element={<UserCreationForm />} />
            <Route path="/reports" element={<Reports />} />
            <Route path="/schools" element={<Schools />} />
            <Route path="/schools/add-school" element={<AddSchool />} />
            <Route path="/schools/upload" element={<BulkUploadSchools />} />
            <Route path="/testCreationForm" element={<TestCreationForm/>} />
            <Route path="/edit/testCreation/:Id" element={<TestCreationForm/>} />
            <Route path="/help" element={<HelpAndSupport />} />

            {/* Fallback Route */}
            <Route path="*" element={<PageNotFound />} />
          </Route>
        </Routes>
      </Router>
    </>
  );
}

export default App;
