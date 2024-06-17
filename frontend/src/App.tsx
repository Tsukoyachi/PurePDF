import { BrowserRouter, Routes, Route } from "react-router-dom";
import './App.css';
import Header from './components/Header';
import Home from './components/Home';
import Compress from "./components/Compress";
import Organize from "./components/Organize";
import Merge from "./components/Merge";

function App() {
  return (
    <div className="container mx-auto mb-8 px-8">
      <Header />
      <BrowserRouter>
      <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/compress" element={<Compress />} />
          <Route path="/organize" element={<Organize />} />
          <Route path="/merge" element={<Merge />} />
      </Routes>
    </BrowserRouter>
    </div>
  );
}

export default App;
