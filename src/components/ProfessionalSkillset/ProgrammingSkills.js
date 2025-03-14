import classes from "./programmingSkills.module.css";
import { useSelector } from "react-redux";
import config from '/config.json';


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

		// Construct the absolute URL for the SVG files
		const { githubaccount, repository } = config; // Assuming config is imported
		const getAbsoluteSvgPath = (relativePath) => {
			return `https://raw.githubusercontent.com/${githubaccount}/${repository}/main/docs/${relativePath}`;
		};

		
    return (
        <div className={classes.mainCard}>
            <h1 style={{ color: nonThemeColor }}>Programming <span style={{ color: uiColor }}>SkillSet</span></h1>
            <div className={classes.skillSetCard} style={{ color: nonThemeColor }}>
                {skillItems.map((item, index) => (
                    <div className={classes.skillItem} style={{ borderColor: uiColor }} key={index}>
                        <img src={getAbsoluteSvgPath(item.svgPath)} alt={item.skillName} />
                        <span className={classes.skillName}>{item.skillName}</span>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default ProgrammingSkills;