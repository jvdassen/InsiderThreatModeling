import React, {useEffect, useRef, useState} from 'react';
import Modeler from "bpmn-js/lib/Modeler";
import diagramXML from './resources/newDiagram.bpmn';
import { Mapping } from './models/bpmnElementMappingToThreats';
import { BpmnElements } from './models/bpmnElements';
import { SecurityPrinciples } from './models/securityPrinciples';
import './BpmnModelViewer.css';

const BpmnModelViewer = (selectedPrinciples) => {
    const [isDiagramLoaded, setDiagramLoaded] = useState(false);
    const canvas = document.getElementById("js-canvas");
    const modelerRef = useRef(null);

                                
    useEffect(() => {
        const container = document.getElementById('js-drop-zone');

        modelerRef.current  = new Modeler({
            container: canvas,
            keyboard: {
                bindTo: document,
            },
          /* additionalModules: [
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
    function handleSubmission() {
        console.log("Security Principles:", selectedPrinciples.selectedPrinciples);
        console.log("Security Principles Length:", selectedPrinciples.selectedPrinciples.length);
        const modeling = modelerRef.current.get('modeling');
        console.log("modeling", modeling);
        const elementRegistry = modelerRef.current.get('elementRegistry');
        console.log('elementRegistry', elementRegistry);
        const elements = Object.values(elementRegistry._elements).map(entry => entry.element);
        console.log("elements",elements )
        modeling.setColor(elements, { stroke: '#000000' });

        const colors = ['#ff2600','#ff9300', '#9437ff'];
        let elementsToColor = [];
        for(let i = 0; i < selectedPrinciples.selectedPrinciples.length; i++){
            console.log("what")
            const e = showThreats(selectedPrinciples.selectedPrinciples[i], elementRegistry);
            console.log(e)
            elementsToColor.push(...e);
            modeling.setColor(e, { stroke: colors[i] });
        }

        console.log("elementsToColor", elementsToColor);
       // modeling.setColor(elementsToColor, { stroke: '#ff2600' });
    }

    async function getModel() {
        try {
            const { xml } = await modelerRef.current.saveXML({ format: true });
            return xml;
        } catch (err) {
            console.error('Error happened saving XML: ', err);
        }
    }

    function showThreats(securityPrinciple, elementRegistry){
        //Create list of all defined bpmn elements
        const bpmnElements = Object.values(BpmnElements);

        console.log(securityPrinciple);

        let elementsToColor = [];

        for (let i = 0; i < bpmnElements.length; i++) {

            let elements;
            //only for message events -> not timers etc.
            if (bpmnElements[i] === 'IntermediateCatchEvent' || bpmnElements[i] === "StartEvent") {
                elements = elementRegistry.filter(e => {
                    if (e.type === 'bpmn:IntermediateCatchEvent' || e.type === 'bpmn:StartEvent') {
                        return e.businessObject.eventDefinitions.some(
                            (eventDefinition) => eventDefinition.$type === 'bpmn:MessageEventDefinition'
                        );
                    }
                    return false;
                });
            } else {
                elements = elementRegistry.filter(e => e.type === 'bpmn:' + bpmnElements[i]);
            }

            if (elements.length >= 1) {
                const element = Mapping.filter(e => e.element === bpmnElements[i]);
                const threats = element[0].threats;
                const threatsWithPrinciple = threats.filter(t => t.securityPrinciple === securityPrinciple);
                if (threatsWithPrinciple.length >= 1) {
                    console.log(element[0].element)
                }
                let j;
                for (j = 0; j < threatsWithPrinciple.length; j++) {
                    console.log("Threat " + (j + 1) + " " + threatsWithPrinciple[j].threat);
                }
                if (threatsWithPrinciple.length >= 1) {
                    for (let j = 0; j < elements.length; j++) {
                        elementsToColor.push(elements[j]);
                    }
                }
            }
        }

        return elementsToColor;

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
