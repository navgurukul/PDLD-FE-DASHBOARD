import Sidebar from "../components/Sidebar";
import Header from "../components/Headers";
import { Outlet } from "react-router-dom";

// App shell: the left bar runs the full height (a bottom bar on phones); the header sits over the
// page beside it and carries the page's breadcrumb, so pages no longer show one of their own
const Layout = () => {
  return (
    <div className="flex h-[100dvh] w-full overflow-hidden">
      <Sidebar />
      <div className="flex min-w-0 flex-1 flex-col">
        <Header />
        <div id="page-scroll" className="min-h-0 flex-1 overflow-y-auto pb-16 md:pb-0">
          <Outlet />
        </div>
      </div>
    </div>
  );
};

export default Layout;
