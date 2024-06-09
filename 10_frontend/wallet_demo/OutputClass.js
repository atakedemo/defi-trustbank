"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.redText = exports.purpleText = exports.greenText = exports.Title = exports.Output = exports.Color = void 0;
var Color;
(function (Color) {
    Color["Green"] = "\u001B[32m";
    Color["Red"] = "\u001B[31m";
    Color["Purple"] = "\u001B[35m";
    Color["Reset"] = "\u001B[0m";
})(Color || (exports.Color = Color = {}));
var Output;
(function (Output) {
    Output["NoConnectionRecordFromOutOfBand"] = "\nNo connectionRecord has been created from invitation\n";
    Output["ConnectionEstablished"] = "\nConnection established!";
    Output["MissingConnectionRecord"] = "\nNo connectionRecord ID has been set yet\n";
    Output["ConnectionLink"] = "\nRun 'Receive connection invitation' in Alice and paste this invitation link:\n\n";
    Output["Exit"] = "Shutting down agent...\nExiting...";
})(Output || (exports.Output = Output = {}));
var Title;
(function (Title) {
    Title["OptionsTitle"] = "\nOptions:";
    Title["InvitationTitle"] = "\n\nPaste the invitation url here:";
    Title["MessageTitle"] = "\n\nWrite your message here:\n(Press enter to send or press q to exit)\n";
    Title["ConfirmTitle"] = "\n\nAre you sure?";
    Title["CredentialOfferTitle"] = "\n\nCredential offer received, do you want to accept it?";
    Title["ProofRequestTitle"] = "\n\nProof request received, do you want to accept it?";
})(Title || (exports.Title = Title = {}));
var greenText = function (text, reset) {
    if (reset)
        return Color.Green + text + Color.Reset;
    return Color.Green + text;
};
exports.greenText = greenText;
var purpleText = function (text, reset) {
    if (reset)
        return Color.Purple + text + Color.Reset;
    return Color.Purple + text;
};
exports.purpleText = purpleText;
var redText = function (text, reset) {
    if (reset)
        return Color.Red + text + Color.Reset;
    return Color.Red + text;
};
exports.redText = redText;
