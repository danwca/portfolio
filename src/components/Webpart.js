import React, { Fragment, useState, useEffect } from "react";

const path = require('path');


const Webpart = (props) => {
    //const [packagePath, setPackagePath] = useState('');
    const [error, setError] = useState(null);
    //const [renderedHtml, setRenderedHtml] = useState('');
    const { name, parameters } = props;

    // Detect the component's directory path
    const sectionPath = '/sections/';
    //let prevPath = packagePath;

    let packagePath = "";
    let renderedHtml ="";
    const webServerRoot =path.join( "public");
    useEffect(() => { 
        const findPackagePath = async (name, parameters, sectionPath) => {
            const possiblePaths = [
                    // Path to the component's main JavaScript file in the 'dist' directory
                    path.join(sectionPath, name, 'dist', `${name}.js`),
                    // Path to the component's main JavaScript file
                    path.join(sectionPath, name, `${name}.js`),
                    // Path to the component's bundled JavaScript file
                    path.join(sectionPath, name, 'bundle.js'),
                    // Path to the component's main JavaScript file in the 'build' directory
                    path.join(sectionPath, name, 'build', `${name}.js`),
                    // Path to the component's bundled JavaScript file in the 'dist' directory
                    path.join(sectionPath, name, 'dist', `bundle.js`),
            ];

            const paths = possiblePaths.toString();
            try {
                let foundPath = false;
                for (const p of possiblePaths) {
                    //if (checkFileExists(p)) {
                    if (await checkFileExists(p)) {
                        packagePath =p;
                        foundPath = true; 
                        break;
                    }

                }
                    
                if (!foundPath) {
                    setError(`Package ${packagePath} not found for "${paths}"`);
                } else {
                    // Dynamically import the webpack package based on the packagePath
                    const packageModule = require( packagePath);

                    // Call the render function from the package with parameters
                    renderedHtml = packageModule.greet(name);
                    //setRenderedHtml(renderedHtml);
                }
            } catch (err) {
                //setPackagePath(prevPath=>"something");
                setError(`Error rendering "${name}" web part: ${err.message} : ${packagePath} ----- ${webServerRoot}`);
            }
        };

        findPackagePath(name, parameters, sectionPath);
    }, [error]);

    if (error) {
        return (
            <Fragment>
                <div>Error: {error}</div>
            </Fragment>
        );
    }

    return (
        <Fragment>
            <div>--- {renderedHtml} ---</div>
        </Fragment>
    );
};

// Function to check if a file exists
async function checkFileExists(filePath) {

    return false;
}

export default Webpart;
