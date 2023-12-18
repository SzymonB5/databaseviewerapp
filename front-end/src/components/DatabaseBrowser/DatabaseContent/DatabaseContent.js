import React, { useState } from 'react';
import './DatabaseContent.css';
import './QueryTool';
import QueryTool from "./QueryTool";



const Component = ( {name} ) => {
    return <div style={{ marginLeft: '20px' }}>{name}</div>;
}


const DatabaseContent = () => {
    const [activeButton, setActiveButton] = useState(null);


    const handleButtonClick = (buttonIndex) => {
        setActiveButton(buttonIndex);
        return <Component name={'test no. ' + buttonIndex}/>;
    };

    const renderButtonContent = () => {
        switch (activeButton) {
            case 1:
                return <Component name={"TODO"}/>;
            case 2:
                return <Component name={"TODO"}/>;
            case 3:
                return <QueryTool />;
            default:
                return null;
        }
    }


    return (
        <div>
            <div className="header">
                <div className="button-container">
                    <div
                        className={`wcPanelTab ${activeButton === 1 ? 'active' : ''}`}
                        onClick={() => handleButtonClick(1)}
                    >
                        Button 1
                    </div>
                    <div
                        className={`wcPanelTab ${activeButton === 2 ? 'active' : ''}`}
                        onClick={() => handleButtonClick(2)}
                    >
                        Button 2
                    </div>
                    <div
                        className={`wcPanelTab ${activeButton === 3 ? 'active' : ''}`}
                        onClick={() => handleButtonClick(3)}
                    >
                        Browse content
                    </div>

                </div>
            </div>
            {renderButtonContent()}
        </div>
    );
};

export default DatabaseContent;
