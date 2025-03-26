import React from 'react';
import './default/app.css';
import store from '../store/theme'; // 确保已经创建了 Redux Store
import { useSelector, Provider } from 'react-redux';
import Navbar from '../components/Navbar/Navbar';
import Pagination from '../components/system/Pagination';

const DefaultTemplate = ({ children, variables }) => {
    // 打印传入的参数
    //console.log('Template Variables:', variables);
    const theme = useSelector((state) => {
        //console.log('Redux State:', state);
        return state;
    });

	const {currentPageId, totalPages} = variables; 
	
    return (
        <div className="App" style={theme.theme}>
		<Navbar content="" params={variables}/>
        {/* Title directly below navbar */}
        <div className="document-title-container">
            <h1>{variables.title}</h1>
        </div>

            <div>
                {children}
            </div>
            <footer>
				<Pagination 
					content={null} // or any relevant content if needed
					variables={{
						currentPageId: currentPageId,
						totalPages: totalPages
					}}
					/>

                <p>Default Footer Content</p>
            </footer>
        </div>
    );
};

export default DefaultTemplate;