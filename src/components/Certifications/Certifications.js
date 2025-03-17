import React from "react";
import classes from "./certifications.module.css";
import CreateCertificate from "./CreateCertificate";
import { useSelector } from "react-redux";

const Certifications = ({ content, params }) => {
    const nonThemeColor = useSelector((state) => state.nonThemeColor);

    // Parse the markdown content into a list of certifications
    const parseCertifications = (content) => {
        const certifications = [];
        const lines = content.split("\n");

        let currentCert = null;

        lines.forEach((line) => {
			if (line.startsWith('## ')) 
			{
				if (currentCert) {
					certifications.push(currentCert);
				}
				currentCert = { title: line.replace('## ', '').trim(), instructor: '', link: '' , platform:''};
			}
            else if (currentCert && line.startsWith("- **Title**:")) {
                currentCert.title = line.replace("- **Title**:", "").trim();
            } else if (currentCert && line.startsWith("- **Instructor**:")) {
                currentCert.instructor = line.replace("- **Instructor**:", "").trim();
            } else if (currentCert && line.startsWith("- **Link**:")) {
                currentCert.link = line.replace("- **Link**:", "").trim();
            } else if (currentCert && line.startsWith("- **Platform**:")) {
                currentCert.platform = line.replace("- **Platform**:", "").trim();
            }
        });

        if (currentCert) {
            certifications.push(currentCert);
        }

        return certifications;
    };

    const certificationsList = parseCertifications(content);

    return (
        <React.Fragment>
            <h1 style={{ color: nonThemeColor }}>Certifications</h1>
            <div className={classes.certificateCard}>
                {certificationsList.map((item, index) => (
                    <CreateCertificate key={index} item={item} />
                ))}
            </div>
        </React.Fragment>
    );
};

export default Certifications;