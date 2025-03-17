const page = ({ content, pageParams }) => {
    // Parse the content to update pageParams
    const newParams = JSON.parse(content);
    Object.assign(pageParams, newParams);

    // Return the rendered content and updated pageParams
    return (
            <div>

            </div>
    )
};

export default page;