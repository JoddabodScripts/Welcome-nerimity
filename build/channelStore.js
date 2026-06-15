"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.getWelcomeChannel = getWelcomeChannel;
exports.isChannelLocked = isChannelLocked;
exports.setWelcomeChannel = setWelcomeChannel;
exports.lockWelcomeChannel = lockWelcomeChannel;
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
const STORE_PATH = path.resolve(__dirname, "..", "welcome-channels.json");
function load() {
    try {
        const raw = fs.readFileSync(STORE_PATH, "utf-8");
        const data = JSON.parse(raw);
        // Migrate old format (string) to new format (object with locked flag)
        const migrated = {};
        for (const [serverId, value] of Object.entries(data)) {
            if (typeof value === "string") {
                migrated[serverId] = { channelId: value, locked: false };
            }
            else {
                migrated[serverId] = value;
            }
        }
        return migrated;
    }
    catch {
        return {};
    }
}
function save(data) {
    fs.writeFileSync(STORE_PATH, JSON.stringify(data, null, 2));
}
let store = load();
function getWelcomeChannel(serverId) {
    return store[serverId]?.channelId;
}
function isChannelLocked(serverId) {
    return store[serverId]?.locked ?? false;
}
function setWelcomeChannel(serverId, channelId, locked = false) {
    const current = store[serverId];
    // Only update if different or lock status changed
    if (!current || current.channelId !== channelId || current.locked !== locked) {
        store[serverId] = { channelId, locked };
        save(store);
    }
}
function lockWelcomeChannel(serverId, channelId) {
    store[serverId] = { channelId, locked: true };
    save(store);
}
//# sourceMappingURL=channelStore.js.map