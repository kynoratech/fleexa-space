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
exports.deleteUserFromDatabase = exports.syncUserToDatabase = void 0;
const functions = __importStar(require("firebase-functions"));
const admin = __importStar(require("firebase-admin"));
admin.initializeApp();
/**
 * Cloud Function que se dispara cuando se crea un usuario en Firebase Auth
 * Sincroniza automáticamente el usuario a PostgreSQL en Neon
 */
exports.syncUserToDatabase = functions.auth.user().onCreate(async (user) => {
    try {
        console.log(`📝 Nuevo usuario registrado: ${user.uid}`);
        // URL de tu aplicación Next.js
        const API_URL = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
        const ENDPOINT = `${API_URL}/api/auth/sync-user`;
        // Datos del usuario
        const userData = {
            firebaseUid: user.uid,
            email: user.email || "",
            name: user.displayName || "",
            photoURL: user.photoURL || "",
        };
        console.log(`🔄 Sincronizando con: ${ENDPOINT}`);
        // Llamar a la ruta API de Next.js
        const response = await fetch(ENDPOINT, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "User-Agent": "Firebase-CloudFunction",
            },
            body: JSON.stringify(userData),
        });
        if (!response.ok) {
            throw new Error(`API retornó ${response.status}: ${await response.text()}`);
        }
        const result = await response.json();
        console.log(`✅ Usuario sincronizado:`, result);
        return result;
    }
    catch (error) {
        console.error(`❌ Error sincronizando usuario ${user.uid}:`, error);
        // No lanzar error para no fallar el registro en Firebase
        return null;
    }
});
/**
 * Cloud Function que se dispara cuando se elimina un usuario
 * (Opcional: puedes implementar eliminación en cascada)
 */
exports.deleteUserFromDatabase = functions.auth.user().onDelete(async (user) => {
    try {
        console.log(`🗑️ Usuario eliminado: ${user.uid}`);
        // Aquí puedes agregar lógica para eliminar el usuario de PostgreSQL si lo deseas
        return null;
    }
    catch (error) {
        console.error(`❌ Error eliminando usuario ${user.uid}:`, error);
        return null;
    }
});
//# sourceMappingURL=index.js.map