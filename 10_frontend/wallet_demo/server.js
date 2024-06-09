"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Agent = void 0;
var Holder_1 = require("./Holder");
var OutputClass_1 = require("./OutputClass");
var figlet_1 = require("figlet");
var express_1 = require("express");
var body_parser_1 = require("body-parser");
var path = require("path");
//************
var port = 8800;
var wallet;
//*************
var app = (0, express_1.default)();
app.use('/', express_1.default.static(path.join(process.cwd(), 'views')));
app.use(body_parser_1.default.json());
app.listen(port, function () { return __awaiter(void 0, void 0, void 0, function () {
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                console.log((0, figlet_1.textSync)('Holder', { horizontalLayout: 'full' }));
                return [4 /*yield*/, Agent.build()];
            case 1:
                wallet = _a.sent();
                console.log("\n web page start: listening on port ".concat(port));
                return [2 /*return*/];
        }
    });
}); });
app.post('/.*', function (req, res) {
    return __awaiter(this, void 0, void 0, function () {
        var ret, cmd, cred;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    console.log("\n====POST====");
                    console.log("cmd:" + JSON.stringify(req.params));
                    console.log("query:" + JSON.stringify(req.query));
                    console.log("headers:" + JSON.stringify(req.headers));
                    console.log(req.body);
                    console.log("====POST====");
                    ret = "";
                    cmd = req.params[0].split('/');
                    if (!(cmd[0] == "issuer_init")) return [3 /*break*/, 2];
                    console.log("init");
                    return [4 /*yield*/, getCredential(req.body.qr)];
                case 1:
                    cred = _a.sent();
                    res.send(cred);
                    _a.label = 2;
                case 2: return [2 /*return*/];
            }
        });
    });
});
function getCredential(_initiationURI) {
    return __awaiter(this, void 0, void 0, function () {
        var initiationURI, resolvedCredentialOffer, credentials, decoded;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    initiationURI = _initiationURI.replace("OpenBadgeCredential", "OpenBadgeCredentialJwt");
                    return [4 /*yield*/, wallet.holder.resolveCredentialOffer(initiationURI)];
                case 1:
                    resolvedCredentialOffer = _a.sent();
                    console.log((0, OutputClass_1.greenText)("Received credential offer for the following credentials."));
                    console.log((0, OutputClass_1.greenText)(resolvedCredentialOffer.offeredCredentials.map(function (credential) { return credential.id; }).join('\n')));
                    return [4 /*yield*/, wallet.holder.requestAndStoreCredentials(resolvedCredentialOffer, resolvedCredentialOffer.offeredCredentials.map(function (o) { return o.id; }))];
                case 2:
                    credentials = _a.sent();
                    console.log(credentials);
                    decoded = {};
                    if (credentials[0].type === 'W3cCredentialRecord') {
                        console.log((0, OutputClass_1.greenText)("W3cCredentialRecord with claim format ".concat(credentials[0].credential.claimFormat), true));
                        console.log(JSON.stringify(credentials[0].credential.jsonCredential, null, 2));
                        decoded = credentials[0].credential.jsonCredential;
                    }
                    return [2 /*return*/, { result: true, detail: credentials, decode: decoded }];
            }
        });
    });
}
var Agent = /** @class */ (function () {
    function Agent(holder) {
        this.holder = holder;
    }
    Agent.build = function () {
        return __awaiter(this, void 0, void 0, function () {
            var holder;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, Holder_1.Holder.build()];
                    case 1:
                        holder = _a.sent();
                        return [2 /*return*/, new Agent(holder)];
                }
            });
        });
    };
    return Agent;
}());
exports.Agent = Agent;
