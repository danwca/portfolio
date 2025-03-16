import React from "react";

import CopyrightIcon from '@mui/icons-material/Copyright';
import "./footer.css";
import { useSelector } from "react-redux";

function Footer({ content }){
    const nonThemeColor=useSelector(state=>state.nonThemeColor);
    let currentYear=new Date().getFullYear();
	
    const data = {};
    content.split('\n').forEach((line) => {
        const [key, value] = line.split(':').map((part) => part.trim());
        if (key && value) {
            data[key] = value.replace(/^"|"$/g, ''); // 去除引号
        }
    });
	
	
    return(
        <footer className="centered" style={{color:nonThemeColor}}>
            <CopyrightIcon/>
            &nbsp;{currentYear}
            &nbsp;Coded By&nbsp;<span style={{fontWeight:"800"}}> {data.firstName}&nbsp;{data.lastName}</span>
        </footer>
    )
}
export default Footer;