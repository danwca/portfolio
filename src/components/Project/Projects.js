import React from "react";

import styles from "./project.module.css";
import projectCoverImg from "../asset/project-cover10.png";
import ProjectItem from "./ProjectItem";
import ProjectsData from "../Data/ProjectsData";
import SocialData from "../Data/SocialData";
import Button from "../UI/Button";

import ProgrammingSkills from "../Professional Skillset/ProgrammingSkills";
import { useSelector } from "react-redux";

const Projects = ({ content }) => {
    const nonThemeColor = useSelector(state => state.nonThemeColor);
    const uiColor = useSelector(state => state.uiColor);

    const lines = content.split('\n');
    let currentProject = null;
    const projects = [];
    console.log(content);
    lines.forEach((line) => {
        if (line.startsWith('## ')) 
		{
            if (currentProject) {
                projects.push(currentProject);
            }
            currentProject = { title: line.replace('## ', '').trim(), description: '', link: '' };
        } else if (line.startsWith('- **Title**:')) {
            //currentProject.title = line.replace('- **Title**:', '').trim();
        } else if (line.startsWith('- **Description**:')) {
            currentProject.description = line.replace('- **Description**:', '').trim();
        } else if (line.startsWith('- **Link**:')) {
            currentProject.link = line.replace('- **Link**:', '').trim();
        }
    });
	
    // 循环结束后，检查是否还有未添加的项目
    if (currentProject) {
        projects.push(currentProject);
    }	
	console.log(projects);
    return (
        <div id="projects">
            <div className={styles.projects}>
                <section className={styles.projectImg}>
                    <img src={projectCoverImg} alt="" />
                </section>
                <section className={styles.projectHeader}>
                    <h1><span style={{ color: nonThemeColor }}>My Recent </span><span style={{ color: uiColor }}>Works</span></h1>
                    <div>My works makes use of vast variety of latest technology tools. My best experience is to create React projects and deploy them to web applications using Github Pages.</div>
                </section>
            </div>
\
            <h1 className={styles.projectHeading} style={{ color: nonThemeColor }}>My Projects</h1>
            <div className={styles.projectList}>
                {projects.map((item, index) => {
                    return <ProjectItem key={index} project={item} />
                })}
            </div>
            <div className={styles.moreProject}>
                <a target="_blank" rel="noreferrer" href={`${SocialData.githubLink}?tab=repositories`}>
                    <Button className={styles.moreProjectBtn}>More Projects</Button>
                </a>
            </div>
        </div>
    )
};

export default Projects;