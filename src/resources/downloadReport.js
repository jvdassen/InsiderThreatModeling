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
        margin: 12,
        fontSize: 14,
        fontFamily: "Helvetica",
    }

});

export const DownloadReport = (data) => {
    const securityPrinciples = Object.values(SecurityPrinciples);
    console.log("SVG", data.svg)

    //TODO: decide if svg should be part of report
    const Diagram = data.svg;


    return (
        <Document>
            {/*
            <Page size="A4">
                <Text style={styles.documentTitle}>
                    Insider Threat Report
                </Text>
                 <Image src={Diagram}/>
            </Page>
            */}
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
                            <Text
                                style={styles.subtitle}> {(index + 1) + ". " + element.element + " (" + element.count + ")"}</Text>
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
                        In the part below you find all the threats that were found by the Insider Threat
                        Modeler. As this prototype does not include any suggestions for controls or
                        countermeasures, please find a cyber security expert to decide if further measures are
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
                                                <Text style={styles.subtitle}>Elements identified</Text>
                                                {threat.elements.map(element => (
                                                        <Text
                                                            style={styles.text}>{element.businessObject.name ? element.businessObject.name : element.id}</Text>
                                                    )
                                                )}
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