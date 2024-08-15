import './App.css';
import Canvas from './components/Canvas';
import VideoCapture from './components/VIdeoCapture';
import {
  BrowserRouter as Router,
  Route,
  Routes,
} from 'react-router-dom';

function App() {
  return(
    <Router>
      <Routes>
        <Route path="/" element={<Canvas />} />
        <Route path="/video" element={<VideoCapture />} />
      </Routes>
    </Router>
  );
}

export default App;
