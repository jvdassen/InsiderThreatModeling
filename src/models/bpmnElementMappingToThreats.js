import {BpmnElements} from "./bpmnElements";
import {SecurityPrinciples} from "./securityPrinciples";
import {InsiderThreatGroups} from "./insiderThreatGroups";

export const Mapping = [
    {
        element: BpmnElements.manualTask,
        threats: [
            {
                threat: InsiderThreatGroups.hardwareAttack,
                securityPrinciple: SecurityPrinciples.availability
            },
            {
                threat: InsiderThreatGroups.dataCorruption,
                securityPrinciple: SecurityPrinciples.availability
            },
            {
                threat: InsiderThreatGroups.unauthorizedPrivilegeElevation,
                securityPrinciple: SecurityPrinciples.accountability
            },
        ]
    },
    {
        element: BpmnElements.userTask,
        threats: [
            {
                threat: InsiderThreatGroups.dataCorruption,
                securityPrinciple: SecurityPrinciples.integrity
            },
            {
                threat: InsiderThreatGroups.systemControlManipulation,
                securityPrinciple: SecurityPrinciples.integrity
            },
            {
                threat: InsiderThreatGroups.dataDeletion,
                securityPrinciple: SecurityPrinciples.availability
            },
            {
                threat: InsiderThreatGroups.systemControlCircumvention,
                securityPrinciple: SecurityPrinciples.accountability
            },
            {
                threat: InsiderThreatGroups.unauthorizedPrivilegeElevation,
                securityPrinciple: SecurityPrinciples.accountability
            },
            {
                threat: InsiderThreatGroups.misuseOfPivileges,
                securityPrinciple: SecurityPrinciples.accountability
            },
            {
                threat: InsiderThreatGroups.impersonationAttack,
                securityPrinciple: SecurityPrinciples.authenticity
            }
        ]
    },
    {
        element: BpmnElements.serviceTask,
        threats: [
            {
                threat: InsiderThreatGroups.dataCorruption,
                securityPrinciple: SecurityPrinciples.integrity
            },
            {
                threat: InsiderThreatGroups.maliciousCodeModification,
                securityPrinciple: SecurityPrinciples.integrity
            },
            {
                threat: InsiderThreatGroups.resourceExhaustionAttack,
                securityPrinciple: SecurityPrinciples.availability
            },
            {
                threat: InsiderThreatGroups.networkExhaustionAttack,
                securityPrinciple: SecurityPrinciples.availability
            },
            {
                threat: InsiderThreatGroups.dataDeletion,
                securityPrinciple: SecurityPrinciples.availability
            },
        ]
    },
    {
        element: BpmnElements.dataObject,
        threats: [
            {
                threat: InsiderThreatGroups.confidentialDataAcquisition,
                securityPrinciple: SecurityPrinciples.confidentiality
            },
            {
                threat: InsiderThreatGroups.confidentialDataView,
                securityPrinciple: SecurityPrinciples.confidentiality
            },
            {
                threat: InsiderThreatGroups.confidentialDataTransfer,
                securityPrinciple: SecurityPrinciples.confidentiality
            },
            {
                threat: InsiderThreatGroups.unauthorizedAccessToCredentials,
                securityPrinciple: SecurityPrinciples.confidentiality
            },
            {
                threat: InsiderThreatGroups.dataCorruption,
                securityPrinciple: SecurityPrinciples.integrity
            },
            {
                threat: InsiderThreatGroups.malwareInstallation,
                securityPrinciple: SecurityPrinciples.integrity
            },
            {
                threat: InsiderThreatGroups.dataDeletion,
                securityPrinciple: SecurityPrinciples.availability
            },
            {
                threat: InsiderThreatGroups.networkExhaustionAttack,
                securityPrinciple: SecurityPrinciples.availability
            }
        ]},
    {
        element: BpmnElements.dataStore,
        threats: [
            {
                threat: InsiderThreatGroups.confidentialDataAcquisition,
                securityPrinciple: SecurityPrinciples.confidentiality
            },
            {
                threat: InsiderThreatGroups.confidentialDataView,
                securityPrinciple: SecurityPrinciples.confidentiality
            },
            {
                threat: InsiderThreatGroups.unauthorizedAccessToCredentials,
                securityPrinciple: SecurityPrinciples.confidentiality
            },
            {
                threat: InsiderThreatGroups.dataCorruption,
                securityPrinciple: SecurityPrinciples.integrity
            },
            {
                threat: InsiderThreatGroups.dataDeletion,
                securityPrinciple: SecurityPrinciples.availability
            }
        ]
    },
    {
        element: BpmnElements.receiveTask,
        threats: [
            {
                threat: InsiderThreatGroups.confidentialDataView,
                securityPrinciple: SecurityPrinciples.confidentiality
            },
            {
                threat: InsiderThreatGroups.malwareInstallation,
                securityPrinciple: SecurityPrinciples.integrity
            },
            {
                threat: InsiderThreatGroups.impersonationAttack,
                securityPrinciple: SecurityPrinciples.authenticity
            },
            {
                threat: InsiderThreatGroups.manInTheMiddleAttack,
                securityPrinciple: SecurityPrinciples.authenticity
            }
        ]
    },
    {
        element: BpmnElements.sendTask,
        threats: [
            {
                threat: InsiderThreatGroups.confidentialDataTransfer,
                securityPrinciple: SecurityPrinciples.confidentiality
            },
            {
                threat: InsiderThreatGroups.dataCorruption,
                securityPrinciple: SecurityPrinciples.integrity
            },
            {
                threat: InsiderThreatGroups.malwareInstallation,
                securityPrinciple: SecurityPrinciples.integrity
            },
            {
                threat: InsiderThreatGroups.networkExhaustionAttack,
                securityPrinciple: SecurityPrinciples.availability
            },
            {
                threat: InsiderThreatGroups.socialEngineeringAttack,
                securityPrinciple: SecurityPrinciples.authenticity
            },
            {
                threat: InsiderThreatGroups.impersonationAttack,
                securityPrinciple: SecurityPrinciples.authenticity
            },
            {
                threat: InsiderThreatGroups.manInTheMiddleAttack,
                securityPrinciple: SecurityPrinciples.authenticity
            }
        ]
    },
    {
    //same as receive task
        element: BpmnElements.intermediateCatchEvent,
        threats: [
            {
                threat: InsiderThreatGroups.confidentialDataView,
                securityPrinciple: SecurityPrinciples.confidentiality
            },
            {
                threat: InsiderThreatGroups.malwareInstallation,
                securityPrinciple: SecurityPrinciples.integrity
            },
            {
                threat: InsiderThreatGroups.impersonationAttack,
                securityPrinciple: SecurityPrinciples.authenticity
            },
            {
                threat: InsiderThreatGroups.manInTheMiddleAttack,
                securityPrinciple: SecurityPrinciples.authenticity
            }
        ]
    },
    {
        element: BpmnElements.startEvent,
        threats: [
            {
                threat: InsiderThreatGroups.confidentialDataView,
                securityPrinciple: SecurityPrinciples.confidentiality
            },
            {
                threat: InsiderThreatGroups.malwareInstallation,
                securityPrinciple: SecurityPrinciples.integrity
            },
            {
                threat: InsiderThreatGroups.impersonationAttack,
                securityPrinciple: SecurityPrinciples.authenticity
            },
            {
                threat: InsiderThreatGroups.manInTheMiddleAttack,
                securityPrinciple: SecurityPrinciples.authenticity
            }
        ]
    },
    {
        //same as send task
        element: BpmnElements.messageEventDefinition,
        threats: [
            {
                threat: InsiderThreatGroups.confidentialDataTransfer,
                securityPrinciple: SecurityPrinciples.confidentiality
            },
            {
                threat: InsiderThreatGroups.dataCorruption,
                securityPrinciple: SecurityPrinciples.integrity
            },
            {
                threat: InsiderThreatGroups.malwareInstallation,
                securityPrinciple: SecurityPrinciples.integrity
            },
            {
                threat: InsiderThreatGroups.networkExhaustionAttack,
                securityPrinciple: SecurityPrinciples.availability
            },
            {
                threat: InsiderThreatGroups.impersonationAttack,
                securityPrinciple: SecurityPrinciples.authenticity
            },
            {
                threat: InsiderThreatGroups.impersonationAttack,
                securityPrinciple: SecurityPrinciples.authenticity
            },
            {
                threat: InsiderThreatGroups.manInTheMiddleAttack,
                securityPrinciple: SecurityPrinciples.authenticity
            }
        ]
    }
]