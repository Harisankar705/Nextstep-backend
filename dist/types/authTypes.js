"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.EmployerDocumentType = exports.notificationTypes = exports.ConnectionStatus = void 0;
var ConnectionStatus;
(function (ConnectionStatus) {
    ConnectionStatus["FOLLOWBACK"] = "followback";
    ConnectionStatus["REJECTED"] = "rejected";
    ConnectionStatus["NOTFOLLOWINGBACK"] = "notfollowingback";
})(ConnectionStatus || (exports.ConnectionStatus = ConnectionStatus = {}));
;
exports.notificationTypes = {
    LIKE_POST: 'like_post',
    COMMENT_POST: 'comment_post',
    FOLLOW_USER: 'follow_user',
};
var EmployerDocumentType;
(function (EmployerDocumentType) {
    EmployerDocumentType["GST"] = "GST";
    EmployerDocumentType["PAN"] = "PAN";
    EmployerDocumentType["INCORPORATION"] = "INCORPORATION";
    EmployerDocumentType["OTHER"] = "OTHER";
})(EmployerDocumentType || (exports.EmployerDocumentType = EmployerDocumentType = {}));
