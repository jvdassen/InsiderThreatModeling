import React, {useEffect, useRef, useState} from 'react';
import Modeler from "bpmn-js/lib/Modeler";
import diagramXML from './resources/newDiagram.bpmn';
import './BpmnModelViewer.css';
import {database} from "./models/database";

const BpmnModelViewer = (selectedPrinciples) => {
    const [isDiagramLoaded, setDiagramLoaded] = useState(false);
    const [allThreatsFound, setAllThreatsFound] = useState([]);
    const canvas = document.getElementById("js-canvas");
    const modelerRef = useRef(null);

                                
    useEffect(() => {
        const container = document.getElementById('js-drop-zone');

        modelerRef.current  = new Modeler({
            container: canvas,
            keyboard: {
                bindTo: document,
            },
          /*
          //would help to get rid of sidebar
          additionalModules: [
                {
                    palette: ["value", {}],
                    paletteProvider: ["value", {}]
                }
            ]*/
        });
        function createNewDiagram() {
            openDiagram(diagramXML);
        }

        async function openDiagram(xml) {
            try {
                await modelerRef.current.importXML(xml);
                container.classList.remove('with-error');
                container.classList.add('with-diagram');
                setDiagramLoaded(true);
            } catch (err) {
                container.classList.remove('with-diagram');
                container.classList.add('with-error');
                console.error(err);
            }
        }

        function registerFileDrop(callback) {
            function handleFileSelect(e) {
                e.stopPropagation();
                e.preventDefault();

                const files = e.dataTransfer.files;
                const file = files[0];

                const reader = new FileReader();

                reader.onload = function (e) {
                    const xml = e.target.result;
                    callback(xml);
                };

                reader.readAsText(file);
            }
            function handleDragOver(e) {
                e.stopPropagation();
                e.preventDefault();
                e.dataTransfer.dropEffect = 'copy';
            }

            container.addEventListener('dragover', handleDragOver, false);
            container.addEventListener('drop', handleFileSelect, false);
        }

        if (!window.FileList || !window.FileReader) {
            window.alert('Looks like you use an older browser that does not support drag and drop. ' +
                'Try using Chrome, Firefox, or the Internet Explorer > 10.');
        } else {
            registerFileDrop(openDiagram);
        }

        document.addEventListener('DOMContentLoaded', function () {
            document.getElementById('js-create-diagram').addEventListener('click', function (e) {
                e.stopPropagation();
                e.preventDefault();
                createNewDiagram();
            });

            const downloadLink = document.getElementById('js-download-diagram');
            const downloadSvgLink = document.getElementById('js-download-svg');

            function setEncoded(link, name, data) {
                const encodedData = encodeURIComponent(data);
                console.log(encodedData);

                if (data) {
                    link.classList.add('active');
                    link.href = `data:application/bpmn20-xml;charset=UTF-8,${encodedData}`;
                    link.download = name;
                } else {
                    link.classList.remove('active');
                }
            }

            const exportArtifacts = debounce(async function () {
                try {
                    const { svg } = await modelerRef.current.saveSVG();
                    setEncoded(downloadSvgLink, 'diagram.svg', svg);
                } catch (err) {
                    console.error('Error happened saving svg: ', err);
                    setEncoded(downloadSvgLink, 'diagram.svg', null);
                }

                try {
                    const { xml } = await modelerRef.current.saveXML({ format: true });
                    setEncoded(downloadLink, 'diagram.bpmn', xml);
                } catch (err) {
                    console.error('Error happened saving XML: ', err);
                    setEncoded(downloadLink, 'diagram.bpmn', null);
                }
            }, 500);

            modelerRef.current.on('commandStack.changed', exportArtifacts);
        });
        function debounce(fn, timeout) {
            let timer;

            return function () {
                if (timer) {
                    clearTimeout(timer);
                }

                timer = setTimeout(fn, timeout);
            };
        }
    }, [isDiagramLoaded, canvas]);

    const colorModel = (elements, color) => {
        const modeling = modelerRef.current.get('modeling');
        modeling.setColor(elements, { stroke: color });
    }
    function handleSubmission() {
        console.log("Security Principles:", selectedPrinciples.selectedPrinciples);
        const elementRegistry = modelerRef.current.get('elementRegistry');
        console.log('elementRegistry', elementRegistry);

        //get all elements in the model to reset color first
        const elements = Object.values(elementRegistry._elements).map(entry => entry.element);
        console.log("elements",elements )
        colorModel(elements, '#000000')

        const colors = ['#ff2600','#ff9300', '#9437ff'];
        let elementsToColor = [];
        selectedPrinciples.selectedPrinciples.map(principle => {
            console.log("what")
            const e = visualizeThreats(principle, elementRegistry);
            console.log(e)
            elementsToColor.push(...e);
           // modeling.setColor(e, { stroke: colors[0] });
        })

        console.log("elementsToColor", elementsToColor);
        colorModel(elementsToColor,'#ff2600');
    }

    async function getModel() {
        try {
            const { xml } = await modelerRef.current.saveXML({ format: true });
            return xml;
        } catch (err) {
            console.error('Error happened saving XML: ', err);
        }
    }

    //show all elements of threats that belong to one security principle
    const visualizeThreats = (securityPrinciple, elementRegistry) => {
        console.log(securityPrinciple);

        //filters out all threats of the principle
        const entry = database.find(e => e.principle === securityPrinciple);
        const threats = entry.threats;

        let threatsFound = [];
        let elementsToColor = [];
        threats.map(threat => {
            console.log("threat", threat);
            //elements that are applicable to threat
            if(threat.elements){
                //all bpmn element types that belong to the threat type
                const bpmnElements = threat.elements;

                let elements = [];
                bpmnElements.map(bpmnElement => {
                    console.log(bpmnElement)
                    if (bpmnElement === 'IntermediateCatchEvent' || bpmnElement === "StartEvent") {
                        elements = elementRegistry.filter(e => {
                            if (e.type === 'bpmn:IntermediateCatchEvent' || e.type === 'bpmn:StartEvent') {
                                return e.businessObject.eventDefinitions.some(
                                    (eventDefinition) => eventDefinition.$type === 'bpmn:MessageEventDefinition'
                                );
                            }
                            return false;
                        });
                    } else {
                        //filters out all elements of the same type (e.g. UserTask) in the provided bpmn model
                        elements = elementRegistry.filter(e => e.type === 'bpmn:' + bpmnElement);
                    }
                    elementsToColor.push(...elements)
                });
                if(elementsToColor.length > 0){
                    threatsFound.push(threat.threat);
                }
            }
        });

        //add only threats that were actually found in diagram
        setAllThreatsFound((prevThreats) => [...prevThreats, {
            principle: securityPrinciple,
            threats: threatsFound
        }])
        console.log("THREATS FOUND:: ", threatsFound);
        return elementsToColor;

    }


    //show all elements of one threat
    const showElementsOfThreat = (securityPrinciple, t) => {
        const elementRegistry = modelerRef.current.get('elementRegistry');
        const elements = Object.values(elementRegistry._elements).map(entry => entry.element);
        colorModel(elements, '#000000');

        console.log("ElementsRegistry", elementRegistry);

        const p = database.find(entry => entry.principle === securityPrinciple);
        console.log("P", p)
        //needed to find threat with elements
        const threat = p.threats.find(e => e.threat === t);
        console.log("threat", threat);


        let elementsToColor = [];
            //elements that are applicable to threat
            if(threat.elements){
                const bpmnElements = threat.elements;
                console.log("bpmnElements", bpmnElements)
                let elements = [];
                bpmnElements.map(bpmnElement => {
                    console.log(bpmnElement)
                    if (bpmnElement === 'IntermediateCatchEvent' || bpmnElement === "StartEvent") {
                        elements = elementRegistry.filter(e => {
                            if (e.type === 'bpmn:IntermediateCatchEvent' || e.type === 'bpmn:StartEvent') {
                                return e.businessObject.eventDefinitions.some(
                                    (eventDefinition) => eventDefinition.$type === 'bpmn:MessageEventDefinition'
                                );
                            }
                            return false;
                        });
                    } else {
                        //filters out all elements of the same type (e.g. UserTask) in the provided bpmn model
                        elements = elementRegistry.filter(e => e.type === 'bpmn:' + bpmnElement);
                    }
                    elementsToColor.push(...elements)
                });

            }
        colorModel(elementsToColor, '#9437ff');
    }

    return (
        <>
            <div className="content" id="js-drop-zone">
                <div className="message intro">
                    <div className="note">
                        Drop BPMN diagram from your desktop
                        {/*or <a id="js-create-diagram" href>create a new diagram</a>*/} to get started.
                    </div>
                </div>
                <div className="message error">
                    <div className="note">
                        <p>Ooops, we could not display the BPMN 2.0 diagram.</p>

                        <div className="details">
                            <span>cause of the problem</span>
                            <pre></pre>
                        </div>
                    </div>
                </div>
                <div className="canvas" id="js-canvas"></div>
            </div>
            <button className={"submit"} onClick={() => handleSubmission()}>
                Show Threats
            </button>
            <h1>
                Threats found:
            </h1>
            {allThreatsFound.map(p => (
                <div key={p.principle}>
                <h2>
                    {Object.values(p.principle)}
                </h2>
                    {p.threats.map(t => (
                        <button key={t.toString()} onClick={() => showElementsOfThreat(p.principle, t)}>
                            {t}
                        </button>
                        ))}

                </div>
            ))}

           {/*  <ul className="buttons">
                <li>download</li>
                <li>
                    <a id="js-download-diagram" href title="download BPMN diagram">
                        BPMN diagram
                    </a>
                </li>
                <li>
                    <a id="js-download-svg" href title="download as SVG image">
                        SVG image
                    </a>
                </li>

             </ul>*/}
        </>
    );
};

export default BpmnModelViewer;
