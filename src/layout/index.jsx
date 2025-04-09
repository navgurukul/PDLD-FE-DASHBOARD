import Sidebar from "../components/Sidebar";
import Header from "../components/Headers";
import { Outlet } from "react-router-dom";
import Breadcrumb from "../components/Breadcrumb";

const Layout = () => {
  return (
    <div className="">
      <Header />
      <div className="flex w-full pt-18 h-[100vh] ">
        <Sidebar />
        <div className="w-full overflow-y-auto">
          <Breadcrumb />
          <Outlet />
        </div>
      </div>
    </div>
  );
};

export default Layout;
