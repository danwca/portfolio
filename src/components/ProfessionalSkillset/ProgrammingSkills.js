import classes from "./programmingSkills.module.css";
import { useSelector } from "react-redux";
import React, { useEffect, useState } from "react";
import config from '../../config.json';
import axios from 'axios';

const ProgrammingSkills = ({ content }) => {
    const uiColor = useSelector(state => state.uiColor);
    const nonThemeColor = useSelector(state => state.nonThemeColor);

    // Parse the markdown content to extract skill names and SVG file paths
    const skillItems = content.split('\n')
        .filter(line => line.startsWith('*'))
        .map(line => {
            const [skillName, svgPath] = line.split(', ');
            return {
                skillName: skillName.replace('* ', ''),
                svgPath: svgPath.match(/!\[.*\]\((.*)\)/)[1],
            };
        });

    // State to store SVG content for each skill
    const [svgContents, setSvgContents] = useState({});

    // Fetch SVG content for each skill
    useEffect(() => {
        const fetchSvgContent = async () => {
            const { githubaccount, repository } = config;

            const svgPromises = skillItems.map(async (item) => {
                const svgUrl = `https://raw.githubusercontent.com/${githubaccount}/${repository}/main/docs/${item.svgPath}`;
                try {
                    const response = await axios.get(svgUrl);
                    return { [item.svgPath]: response.data };
                } catch (error) {
                    console.error(`Error loading SVG file: ${item.svgPath}`, error);
                    return { [item.svgPath]: null };
                }
            });

            const svgResults = await Promise.all(svgPromises);
            const svgContentMap = svgResults.reduce((acc, result) => ({ ...acc, ...result }), {});
            setSvgContents(svgContentMap);
        };

        fetchSvgContent();
    }, [skillItems]);

    return (
        <div className={classes.mainCard}>
            <h1 style={{ color: nonThemeColor }}>Programming <span style={{ color: uiColor }}>SkillSet</span></h1>
            <div className={classes.skillSetCard} style={{ color: nonThemeColor }}>
                {skillItems.map((item, index) => (
                    <div className={classes.skillItem} style={{ borderColor: uiColor }} key={index}>
                        {/* Render SVG content directly */}
                        <div
                            className={classes.svgContainer}
                            dangerouslySetInnerHTML={{ __html: svgContents[item.svgPath] }}
                        />
                        <span className={classes.skillName}>{item.skillName}</span>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default ProgrammingSkills;