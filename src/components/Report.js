import {SecurityPrinciples} from "../models/securityPrinciples";
import {database} from "../models/database";

export const Report = (data) => {
    const securityPrinciples = Object.values(SecurityPrinciples);
    return (
        <div className="select-elements">
            <h1>Identified Threats</h1>
            <div className="report">
                In the part below each threat that was found by the Insider Threat
                Modeler with its corresponding description ist listed. As this prototype does not include any
                suggestions for controls or countermeasures, please find a cyber security expert to decide if further
                measures are needed to mitigate the threats.
            </div>
            <div className="spacer"/>
            {securityPrinciples.map(securityPrinciple => {
                const threats = data.data.filter(entry => entry.principle === securityPrinciple);
                const threatsInDatabase = database.find(p => p.principle === securityPrinciple).threats;
                if (threats.length > 0) {
                    return (
                        <div className="report">
                            <h2>{securityPrinciple}</h2>
                            {threats.map(threat => (
                                threat.elements.length > 0 ?
                                    <>
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