import {SecurityPrinciples} from "../models/securityPrinciples";
import {database} from "../models/database";

export const Report = (data) => {
    const securityPrinciples = Object.values(SecurityPrinciples);
    return (
        <div className="select-elements">
            <div className="spacer"/>
            {securityPrinciples.map(securityPrinciple => {
                const threats = data.data.filter(entry => entry.principle === securityPrinciple);
                const threatsInDatabase = database.find(p => p.principle === securityPrinciple).threats;
                if (threats.length > 0) {
                    return (
                        <div className="report">
                            <h1>Identified Threats</h1>
                            <div>
                                In the part below you find all the threats that were found by the Insider Threat
                                Modeler. As this prototype does not include any suggestions for controls or
                                countermeasures, please find a cyber security expert to decide if further measures are
                                needed to mitigate the threats.
                            </div>
                            <div className="spacer"/>
                            <h2>{securityPrinciple}</h2>
                            {threats.map(threat => (
                                threat.elements.length > 0 ?
                                    <>
                                        <div className="spacer"/>
                                        <h3>{threat.threat}</h3>

                                        <div>{threatsInDatabase.find(t => t.threat === threat.threat).description}</div>
                                        <h4>Elements identified</h4>
                                        {threat.elements.map(element => (
                                                <div>{element.businessObject.name ? element.businessObject.name : element.id}</div>
                                            )
                                        )}
                                        <div className="spacer"/>
                                        <div className="spacer"/>
                                    </>
                                    : null
                            ))}
                        </div>
                    );
                }
            })
            }
        </div>
    )
}