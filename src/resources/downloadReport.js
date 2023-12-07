import {SecurityPrinciples} from "../models/securityPrinciples";
import {Document, Page, StyleSheet, Text, View} from "@react-pdf/renderer";
import {database} from "../models/database";

const styles = StyleSheet.create({
    body: {
        paddingTop: 32,
        paddingBottom: 64,
        paddingHorizontal: 64,
    },
    documentTitle: {
        fontFamily: "Helvetica",
        fontSize: 32,
        color: "white",
        backgroundColor: "#172554",
        height: 80,
        textAlign: "center",
        paddingTop: 24,
        fontWeight: 700,
    },
    title: {
        marginHorizontal: 24,
        marginBottom: 24,
        fontSize: 24,
        textAlign: "center",
        fontFamily: "Helvetica",
    },
    text: {
        marginLeft: 12,
        marginRight: 12,
        fontSize: 12,
        textAlign: "justify",
        fontFamily: "Helvetica",

    },
    principle: {
        margin: 12,
        fontSize: 18,
        fontFamily: "Helvetica",
    },
    threat: {
        margin: 12,
        fontSize: 16,
        fontFamily: "Helvetica",
        fontWeight: 700,
    },
    subtitle: {
        marginLeft: 12,
        marginRight: 12,
        marginBottom: 6,
        fontSize: 14,
        fontFamily: "Helvetica",
    }

});

export const DownloadReport = (data) => {
    const securityPrinciples = Object.values(SecurityPrinciples);

    return (
        <Document>
            <Page size="A4">
                <Text style={styles.documentTitle}>
                    Insider Threat Report
                </Text>
                <View style={styles.body}>
                    <Text style={styles.title}>Identified Elements</Text>
                    <Text style={styles.text}>
                        The most vulnerable BPMN elements are listed here ordered according to the
                        number the user has depicted the element as a potential attack target.
                    </Text>
                    {data.elements.map((element, index) => (
                        <View>
                            <Text style={styles.threat}>
                                {(index + 1) + ". " + element.element + " (" + element.count + ")"}
                            </Text>
                            <Text style={styles.subtitle}>Threats identified</Text>
                            {element.threats.map((threat) => (
                                <Text style={styles.text}>{threat}</Text>
                            ))}

                        </View>
                    ))
                    }
                </View>
            </Page>
            <Page size="A4">
                <Text style={styles.documentTitle}>
                    Insider Threat Report
                </Text>
                <View style={styles.body}>
                    <Text style={styles.title}>Identified Threats</Text>
                    <Text style={styles.text}>
                        In the part below you find a description for each threat that was found by the Insider Threat
                        Modeler. As this prototype does not include any suggestions for controls or
                        countermeasures, please discuss with a cyber security expert to decide if further measures are
                        needed to mitigate the threats.
                    </Text>
                    {securityPrinciples.map((securityPrinciple) => {
                        const threats = data.data.filter(entry => entry.principle === securityPrinciple);
                        const threatsInDatabase = database.find(p => p.principle === securityPrinciple).threats;
                        if (threats.length > 0) {
                            return (
                                <View>
                                    <Text style={styles.principle}>{securityPrinciple}</Text>
                                    {threats.map(threat => (
                                        threat.elements.length > 0 ?
                                            <>
                                                <Text style={styles.threat}>{threat.threat}</Text>
                                                <Text
                                                    style={styles.text}>{threatsInDatabase.find(t => t.threat === threat.threat).description}</Text>
                                            </>
                                            : null
                                    ))}
                                </View>
                            );
                        }
                    })
                    }
                </View>
            </Page>
        </Document>
    )
}