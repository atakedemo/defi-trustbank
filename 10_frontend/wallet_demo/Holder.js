"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        if (typeof b !== "function" && b !== null)
            throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
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
exports.Holder = void 0;
var askar_1 = require("@credo-ts/askar");
var core_1 = require("@credo-ts/core");
var openid4vc_1 = require("@credo-ts/openid4vc");
var aries_askar_nodejs_1 = require("@hyperledger/aries-askar-nodejs");
var BaseAgent_1 = require("./BaseAgent");
var OutputClass_1 = require("./OutputClass");
function getOpenIdHolderModules() {
    return {
        askar: new askar_1.AskarModule({ ariesAskar: aries_askar_nodejs_1.ariesAskar }),
        openId4VcHolder: new openid4vc_1.OpenId4VcHolderModule(),
    };
}
var Holder = /** @class */ (function (_super) {
    __extends(Holder, _super);
    function Holder(port, name) {
        return _super.call(this, { port: port, name: name, modules: getOpenIdHolderModules() }) || this;
    }
    Holder.build = function () {
        return __awaiter(this, void 0, void 0, function () {
            var holder;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        holder = new Holder(3000, 'OpenId4VcHolder ' + Math.random().toString());
                        return [4 /*yield*/, holder.initializeAgent('96213c3d7fc8d4d6754c7a0fd969598e')];
                    case 1:
                        _a.sent();
                        return [2 /*return*/, holder];
                }
            });
        });
    };
    Holder.prototype.resolveCredentialOffer = function (credentialOffer) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.agent.modules.openId4VcHolder.resolveCredentialOffer(credentialOffer)];
                    case 1: return [2 /*return*/, _a.sent()];
                }
            });
        });
    };
    Holder.prototype.requestAndStoreCredentials = function (resolvedCredentialOffer, credentialsToRequest) {
        return __awaiter(this, void 0, void 0, function () {
            var credentials, storedCredentials;
            var _this = this;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.agent.modules.openId4VcHolder.acceptCredentialOfferUsingPreAuthorizedCode(resolvedCredentialOffer, {
                            credentialsToRequest: credentialsToRequest,
                            // TODO: add jwk support for holder binding
                            credentialBindingResolver: function () { return __awaiter(_this, void 0, void 0, function () {
                                return __generator(this, function (_a) {
                                    return [2 /*return*/, ({
                                            method: 'did',
                                            didUrl: this.verificationMethod.id,
                                        })];
                                });
                            }); },
                        })];
                    case 1:
                        credentials = _a.sent();
                        return [4 /*yield*/, Promise.all(credentials.map(function (credential) {
                                if (credential instanceof core_1.W3cJwtVerifiableCredential || credential instanceof core_1.W3cJsonLdVerifiableCredential) {
                                    return _this.agent.w3cCredentials.storeCredential({ credential: credential });
                                }
                                else {
                                    return _this.agent.sdJwtVc.store(credential.compact);
                                }
                            }))];
                    case 2:
                        storedCredentials = _a.sent();
                        return [2 /*return*/, storedCredentials];
                }
            });
        });
    };
    Holder.prototype.resolveProofRequest = function (proofRequest) {
        return __awaiter(this, void 0, void 0, function () {
            var resolvedProofRequest;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.agent.modules.openId4VcHolder.resolveSiopAuthorizationRequest(proofRequest)];
                    case 1:
                        resolvedProofRequest = _a.sent();
                        return [2 /*return*/, resolvedProofRequest];
                }
            });
        });
    };
    Holder.prototype.acceptPresentationRequest = function (resolvedPresentationRequest) {
        return __awaiter(this, void 0, void 0, function () {
            var presentationExchangeService, submissionResult;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        presentationExchangeService = this.agent.dependencyManager.resolve(core_1.DifPresentationExchangeService);
                        if (!resolvedPresentationRequest.presentationExchange) {
                            throw new Error('Missing presentation exchange on resolved authorization request');
                        }
                        return [4 /*yield*/, this.agent.modules.openId4VcHolder.acceptSiopAuthorizationRequest({
                                authorizationRequest: resolvedPresentationRequest.authorizationRequest,
                                presentationExchange: {
                                    credentials: presentationExchangeService.selectCredentialsForRequest(resolvedPresentationRequest.presentationExchange.credentialsForRequest),
                                },
                            })];
                    case 1:
                        submissionResult = _a.sent();
                        return [2 /*return*/, submissionResult.serverResponse];
                }
            });
        });
    };
    Holder.prototype.exit = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        console.log(OutputClass_1.Output.Exit);
                        return [4 /*yield*/, this.agent.shutdown()];
                    case 1:
                        _a.sent();
                        process.exit(0);
                        return [2 /*return*/];
                }
            });
        });
    };
    Holder.prototype.restart = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.agent.shutdown()];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    return Holder;
}(BaseAgent_1.BaseAgent));
exports.Holder = Holder;
