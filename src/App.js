import './app.css';

// Components
import Navbar from './components/Navbar/Navbar';
import Homepage from './components/Home/Homepage';
import Footer from './components/Footer/Footer';
import Education from './components/Education/Education';
import Projects from "./components/Projects/Project";
import AboutMe from "./components/About Me/AboutMe";
import { useSelector } from "react-redux";
import Mode from './theme/mode';

const App = () => {
    const theme = useSelector(state => state.theme);

    return (
        <div className="App" style={theme}>
            <Navbar />
            <Homepage />
            <Education />
            <Projects />
            <AboutMe />
            <Footer />
            <Mode />
        </div>
    );
};

export default App;