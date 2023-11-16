import {SecurityPrinciples} from "./securityPrinciples";
import {InsiderThreatGroups} from "./insiderThreatGroups";
import {BpmnElements} from "./bpmnElements";

export const database = [
    {
        principle: SecurityPrinciples.confidentiality,
        threats: [
            {
                threat: InsiderThreatGroups.confidentialDataAcquisition,
                elements: [BpmnElements.dataObject, BpmnElements.dataStore]
            },
            {
                threat: InsiderThreatGroups.confidentialDataView,
                elements: [BpmnElements.dataObject, BpmnElements.dataStore, BpmnElements.receiveTask, BpmnElements.intermediateCatchEvent, BpmnElements.startEvent]
            },
            {
                threat: InsiderThreatGroups.confidentialDataTransfer,
                elements: [BpmnElements.dataObject, BpmnElements.sendTask, BpmnElements.messageEventDefinition]
            },
            {
                threat: InsiderThreatGroups.unauthorizedAccessToCredentials,
                elements: [BpmnElements.dataObject, BpmnElements.dataStore]
            }

        ]
    },
    {
        principle: SecurityPrinciples.integrity,
        threats: [
            {
                threat: InsiderThreatGroups.dataCorruption,
                elements: [BpmnElements.manualTask, BpmnElements.userTask, BpmnElements.serviceTask, BpmnElements.dataObject, BpmnElements.dataStore, BpmnElements.sendTask, BpmnElements.messageEventDefinition]
            },
            {
                threat: InsiderThreatGroups.maliciousCodeModification,
                elements: [BpmnElements.serviceTask]
            },
            {
                threat: InsiderThreatGroups.malwareInstallation,
                elements: [BpmnElements.dataObject, BpmnElements.receiveTask, BpmnElements.sendTask, BpmnElements.intermediateCatchEvent, BpmnElements.startEvent,BpmnElements.messageEventDefinition ]
            },
            {
                threat: InsiderThreatGroups.systemControlManipulation,
                elements: [BpmnElements.userTask]
            }
            ]
    },
    {
        principle: SecurityPrinciples.availability,
        threats: [
            {
                threat: InsiderThreatGroups.hardwareAttack,
                elements: [BpmnElements.manualTask]
            },
            {
                threat: InsiderThreatGroups.resourceExhaustionAttack,
                elements: [BpmnElements.serviceTask]
            },
            {
                threat: InsiderThreatGroups.networkExhaustionAttack,
                elements: [BpmnElements.serviceTask, BpmnElements.dataObject, BpmnElements.sendTask, BpmnElements.messageEventDefinition]
            },
            {
                threat: InsiderThreatGroups.dataDeletion,
                elements: [BpmnElements.userTask, BpmnElements.serviceTask, BpmnElements.dataObject, BpmnElements.dataStore]
            }
        ]
    },
    {
        principle: SecurityPrinciples.accountability,
        threats: [
            {
                threat: InsiderThreatGroups.systemControlCircumvention,
                elements: [BpmnElements.userTask]
            },
            {
                threat: InsiderThreatGroups.unauthorizedPrivilegeElevation,
                elements: [BpmnElements.manualTask, BpmnElements.userTask]
            },
            {
                threat: InsiderThreatGroups.misuseOfPivileges,
                elements: [BpmnElements.userTask]
            }
        ]
    },
    {
        principle: SecurityPrinciples.authenticity,
        threats: [
            {
                threat: InsiderThreatGroups.socialEngineeringAttack,
                elements: [BpmnElements.sendTask]
            },
            {
                threat: InsiderThreatGroups.impersonationAttack,
                elements: [BpmnElements.userTask, BpmnElements.receiveTask, BpmnElements.sendTask, BpmnElements.intermediateCatchEvent, BpmnElements.startEvent, BpmnElements.messageEventDefinition]
            },
            {
                threat: InsiderThreatGroups.manInTheMiddleAttack,
                elements: [BpmnElements.receiveTask, BpmnElements.sendTask, BpmnElements.intermediateCatchEvent, BpmnElements.startEvent, BpmnElements.messageEventDefinition]
            }
        ]
    },
]