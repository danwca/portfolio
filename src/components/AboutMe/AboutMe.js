import React, { Fragment } from 'react';

import classes from './aboutMe.module.css';
//import PersonalData from '../Data/PersonalData';
import SocialLinks from '../SocialLinks/SocialLinks';
import Button from "../UI/Button";
import GetInTouch from '../Get In Touch/GetInTouch';
import { useSelector } from 'react-redux';

import ImageUrl from "./dp.jpeg";

const AboutMe = ({ content, params }) => {
    const data = {};
    content.split('\n').forEach((line) => {
        const [key, value] = line.split(':').map((part) => part.trim());
        if (key && value) {
            data[key] = value.replace(/^"|"$/g, ''); // 去除引号
        }
    });
	
    const uiColor=useSelector(state=>state.uiColor);
    
	return (
        <Fragment>
            <div className={classes.contactMe} id='getInTouch'>
                <div className={classes.avatar}>
                    <img src={ImageUrl} alt="Loading ..." style={{borderColor:uiColor}} />
                </div>
                <div className={classes.contactCard}>
                    <h1 style={{color:uiColor}}>About Me</h1>
                    <div>
                        {data.aboutMe}
                    </div>
                    <div className={classes.contactLinks}>
                        <SocialLinks className={classes.links} />
                    </div>
                    <a href={data.resumeLink} target='_blank noreferrer'>
                        <Button className={classes.resumeBtn}>See My Resume</Button>
                    </a>
                </div>
            </div>
        </Fragment>
    )
};
export default AboutMe;