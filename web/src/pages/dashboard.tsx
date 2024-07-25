import { Outlet } from 'react-router-dom';
import Footer from '../components/footer';
import SideBar from '../components/sideBar';
import TopBar from '../components/topBar';

// CSS used from - https://play.tailwindcss.com/uOnWQzR9tl
// overflow-y-auto

export default function Dashboard() {
  return (
    <main className="flex flex-col h-screen">
      <div className="flex flex-1 overflow-hidden">
        <div className="flex bg-gray-100 w-22 p-4 justify-center gap-4">
          <SideBar />
        </div>
        <div className="flex flex-1 flex-col">
          <div className="flex h-12 p-4 justify-end border-b items-center">
            <TopBar />
          </div>
          <div className="flex flex-1 p-4">
            <Outlet />
          </div>
          <div className="flex p-3 justify-center">
            <Footer />
          </div>
        </div>
      </div>
    </main>
  );
}
