import React, {useEffect, useState} from "react";
import BpmnModelViewer from "./BpmnModelViewer";
import Modeler from "bpmn-js/lib/Modeler";
import "bpmn-js/dist/assets/diagram-js.css";
import "bpmn-js/dist/assets/bpmn-font/css/bpmn-embedded.css";
import './App.css';
import ErrorBoundary from './ErrorBoundary';
import {SecurityPrinciples} from "./models/securityPrinciples";



function App() {
   const [selectedPrinciples, setSelectedPrinciples] = useState([]);
   const [selectionComplete, setSelectionComplete] = useState(false);

   const handleSubmit = () => {
        console.log(selectedPrinciples);
        setSelectionComplete(true);
   };

    return (

        <div className="App" >
           <header className="App-header">
            <h1>
                Insider Threat Modeler in BPMN 2.0
            </h1>
           </header>
            {selectionComplete ?
                ( <ErrorBoundary>
                    <BpmnModelViewer selectedPrinciples={selectedPrinciples}/>
                </ErrorBoundary>
                ) : (
                    <div className="text">
                        <h1>
                            Security Principle Selection
                        </h1>
                        <div>
                            Please select the security principles that are the most important ones for the process you would like to
                        </div>
                        <div className="select-box">
                        <div className="flex-column">
                            <div className="spacer"/>
                            <div className="spacer"/>
                            <button onClick={() => {
                                if(!selectedPrinciples.includes(SecurityPrinciples.confidentiality)){
                                    setSelectedPrinciples([...selectedPrinciples, SecurityPrinciples.confidentiality]);}}}>
                                {SecurityPrinciples.confidentiality}
                            </button>
                            <div className="spacer"/>
                            <button onClick={() => {
                                if(!selectedPrinciples.includes(SecurityPrinciples.integrity)){
                                    setSelectedPrinciples([...selectedPrinciples, SecurityPrinciples.integrity]);}}}>
                                {SecurityPrinciples.integrity}
                            </button>
                            <div className="spacer"/>
                            <button onClick={() => {
                                if(!selectedPrinciples.includes(SecurityPrinciples.availability)){
                                    setSelectedPrinciples([...selectedPrinciples, SecurityPrinciples.availability])
                                }}}>
                                {SecurityPrinciples.availability}
                            </button>
                            <div className="spacer"/>
                            <button onClick={() => {
                                if(!selectedPrinciples.includes(SecurityPrinciples.accountability)){
                                    setSelectedPrinciples([...selectedPrinciples, SecurityPrinciples.accountability])
                                }}}>
                                {SecurityPrinciples.accountability}
                            </button>
                            <div className="spacer"/>
                            <button onClick={() => {
                                if(!selectedPrinciples.includes(SecurityPrinciples.authenticity)){
                                    setSelectedPrinciples([...selectedPrinciples, SecurityPrinciples.authenticity])
                                }}}>
                                {SecurityPrinciples.authenticity}
                            </button>
                            <div className="spacer"/>
                            <div className="spacer"/>
                        </div>
                        </div>
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