import React from "react";
import classes from "./certifications.module.css";
import CreateCertificate from "./CreateCertificate";
import { useSelector } from "react-redux";

const Certifications = ({ content }) => {
    const nonThemeColor = useSelector((state) => state.nonThemeColor);

    // Parse the markdown content into a list of certifications
    const parseCertifications = (content) => {
        const certifications = [];
        const lines = content.split("\n");

        let currentCert = null;

        lines.forEach((line) => {
            if (line.startsWith("- **Title**:")) {
                if (currentCert) {
                    certifications.push(currentCert);
                }
                currentCert = { title: line.replace("- **Title**:", "").trim() };
            } else if (line.startsWith("- **Instructor**:")) {
                currentCert.instructor = line.replace("- **Instructor**:", "").trim();
            } else if (line.startsWith("- **Link**:")) {
                currentCert.link = line.replace("- **Link**:", "").trim();
            } else if (line.startsWith("- **Platform**:")) {
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