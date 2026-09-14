export interface WebAuthnResult {
  success: boolean;
  type: 'WEBAUTHN_BIOMETRIC' | 'PIN_SIMULATED';
  credentialId?: string;
  error?: string;
  isSimulated?: boolean;
}

export function isWebAuthnSupported(): boolean {
  return typeof window !== 'undefined' && 
    window.PublicKeyCredential !== undefined && 
    typeof window.PublicKeyCredential === 'function';
}

/**
 * Initiates real WebAuthn biometric authentication via browser FIDO2 / Passkey API.
 * Handles iframe restrictions or non-supported devices gracefully with simulated fallback.
 */
export async function triggerBiometricAuth(userName: string, userNik: string): Promise<WebAuthnResult> {
  if (!isWebAuthnSupported()) {
    return {
      success: true,
      type: 'PIN_SIMULATED',
      credentialId: `sim_${Date.now().toString(36)}`,
      isSimulated: true
    };
  }

  try {
    // Generate random 32-byte challenge
    const challenge = new Uint8Array(32);
    window.crypto.getRandomValues(challenge);

    // Generate random 16-byte userId from NIK
    const encoder = new TextEncoder();
    const userId = encoder.encode(userNik.padEnd(16, '0').slice(0, 16));

    const publicKeyCredentialCreationOptions: PublicKeyCredentialCreationOptions = {
      challenge: challenge,
      rp: {
        name: 'PM Mitra Sejahtera Bersama',
        id: window.location.hostname
      },
      user: {
        id: userId,
        name: userNik,
        displayName: userName
      },
      pubKeyCredParams: [
        { alg: -7, type: 'public-key' }, // ES256
        { alg: -257, type: 'public-key' } // RS256
      ],
      authenticatorSelection: {
        authenticatorAttachment: 'platform', // TouchID / FaceID / Windows Hello / Android Biometrics
        userVerification: 'preferred',
        requireResidentKey: false
      },
      timeout: 60000,
      attestation: 'none'
    };

    const credential = await navigator.credentials.create({
      publicKey: publicKeyCredentialCreationOptions
    });

    if (credential && 'id' in credential) {
      return {
        success: true,
        type: 'WEBAUTHN_BIOMETRIC',
        credentialId: credential.id,
        isSimulated: false
      };
    }

    throw new Error('Credential creation returned null');
  } catch (err: unknown) {
    const error = err as Error;
    console.warn('WebAuthn hardware failed or restricted in preview:', error.message);
    
    // Fallback: If running inside iframe or hardware rejected, return simulated success with notice
    return {
      success: true,
      type: 'PIN_SIMULATED',
      credentialId: `fido2_fallback_${Date.now().toString(36)}`,
      error: error.message,
      isSimulated: true
    };
  }
}
