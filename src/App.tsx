import Sidebar from "./components/Sidebar";
import Chat from "./pages/Chat";

const App = () => {
  return (
    <div className="w-[100vw] h-screen max-h-screen flex base">
      <nav className="w-[30%] max-w-[260px] h-full sidebar z-4">
        <Sidebar />
      </nav>
      <main className="w-full h-screen z-4">
        <Chat />
      </main>
    </div>
  );
}
 
export default App;