import './App.css';
import HomePage from './page/Home';
import Order from './page/Order';
import DashBoard from './page/DashBoard';

import Header from './components/Header';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
// import { BrowserRouter as Route, Routes } from 'react-router-dom';
// import { HashRouter as Router } from 'react-router-dom';
import Bill from './page/Bill';
import AllProducts from './page/AllProducts';
import AllBill from './page/AllBill';

function App() {
  return (
    <Router>
      <div className="App">
        <Header />
        <Routes>
          <Route path="/" exact element={<HomePage />} />
          <Route path="/order" element={<Order />} />
          <Route path="/dashboard" element={<DashBoard />} />
          <Route path="/bill" element={<Bill />} />
          <Route path='/all-products' element={<AllProducts />} />
          <Route path='/all-bill' element={<AllBill/>} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
