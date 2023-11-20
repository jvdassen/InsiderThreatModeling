import React, {useState} from "react";
import BpmnModelViewer from "./BpmnModelViewer";
import "bpmn-js/dist/assets/diagram-js.css";
import "bpmn-js/dist/assets/bpmn-font/css/bpmn-embedded.css";
import './App.css';
import ErrorBoundary from './ErrorBoundary';
import {SecurityPrinciples} from "./models/securityPrinciples";


function App() {
    const [selectedPrinciples, setSelectedPrinciples] = useState([]);
    const [isConfidentialitySelected, setIsConfidentialitySelected] = useState(false);
    const [isIntegritySelected, setIsIntegritySelected] = useState(false);
    const [isAvailabilitySelected, setIsAvailabilitySelected] = useState(false);
    const [isAccountabilitySelected, setIsAccountabilitySelected] = useState(false);
    const [isAuthenticitySelected, setIsAuthenticitySelected] = useState(false);

    const handleSubmit = () => {
        console.log(isConfidentialitySelected, isIntegritySelected, isAvailabilitySelected, isAccountabilitySelected, isAuthenticitySelected)

        let updatedPrinciples = [];
        if (isConfidentialitySelected) updatedPrinciples.push(SecurityPrinciples.confidentiality);
        if (isIntegritySelected) updatedPrinciples.push(SecurityPrinciples.integrity);
        if (isAvailabilitySelected) updatedPrinciples.push(SecurityPrinciples.availability);
        if (isAccountabilitySelected) updatedPrinciples.push(SecurityPrinciples.accountability);
        if (isAuthenticitySelected) updatedPrinciples.push(SecurityPrinciples.authenticity);

        setSelectedPrinciples(updatedPrinciples)
    };

    return (

        <div className="App">
            <header className="App-header">
                <h1>
                    Insider Threat Modeler in BPMN 2.0
                </h1>
            </header>
            {selectedPrinciples.length > 0 ?
                (<ErrorBoundary>
                        <BpmnModelViewer selectedPrinciples={selectedPrinciples}/>
                    </ErrorBoundary>
                ) : (
                    <div className="text">
                        <h1>
                            Security Principle Selection
                        </h1>
                        <div>
                            Please select the security principles that are the most important ones for the process you
                            would like to
                        </div>
                        <div className="spacer"/>
                        <div className="select-box">
                            <div className="flex-column">
                                <button style={{
                                    backgroundColor: isConfidentialitySelected ? '#709eff' : null,
                                    margin: "8px"
                                }}
                                        onClick={() => {
                                            setIsConfidentialitySelected(!isConfidentialitySelected)
                                        }}>
                                    {SecurityPrinciples.confidentiality}
                                </button>
                                <button style={{
                                    backgroundColor: isIntegritySelected ? '#709eff' : null,
                                    margin: "8px"
                                }}
                                        onClick={() => {
                                            setIsIntegritySelected(!isIntegritySelected)
                                        }}>
                                    {SecurityPrinciples.integrity}
                                </button>
                                <button style={{
                                    backgroundColor: isAvailabilitySelected ? '#709eff' : null,
                                    margin: "8px"
                                }}
                                        onClick={() => {
                                            setIsAvailabilitySelected(!isAvailabilitySelected)
                                        }}>
                                    {SecurityPrinciples.availability}
                                </button>
                                <button style={{
                                    backgroundColor: isAccountabilitySelected ? '#709eff' : null,
                                    margin: "8px"
                                }}
                                        onClick={() => {
                                            setIsAccountabilitySelected(!isAccountabilitySelected)
                                        }}>
                                    {SecurityPrinciples.accountability}
                                </button>
                                <button
                                    style={{backgroundColor: isAuthenticitySelected ? '#709eff' : null, margin: "10px"}}
                                    onClick={() => {
                                        setIsAuthenticitySelected(!isAuthenticitySelected)
                                    }}>
                                    {SecurityPrinciples.authenticity}
                                </button>
                            </div>
                        </div>
                        <div className="spacer"/>
                        <button className={"submit"} onClick={handleSubmit}>
                            Submit
                        </button>
                    </div>
                )
            }
        </div>

    );


}

export default App;