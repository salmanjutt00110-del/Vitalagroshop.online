import { auth as localAuth } from './api';

// Adapter wrapper to map legacy base44 db.auth calls to the local Flask/Emulated API client
globalThis.__B44_DB__ = {
  auth: {
    isAuthenticated: async () => {
      const { data } = await localAuth.getUser();
      return !!data.user;
    },
    me: async () => {
      const { data } = await localAuth.getUser();
      return data.user;
    },
    loginViaEmailPassword: async (email, password) => {
      const result = await localAuth.signInWithPassword({ email, password });
      if (result.error) {
        throw new Error(result.error.message);
      }
      return result.data;
    },
    register: async ({ email, password }) => {
      const result = await localAuth.signUp({ email, password });
      if (result.error) {
        throw new Error(result.error.message);
      }
      return result.data;
    },
    verifyOtp: async ({ email, otpCode }) => {
      // Flask backend register endpoint registers user immediately without OTP code confirmation.
      // So verifyOtp can resolve immediately to auto-log in.
      return { access_token: 'mock-local-token' };
    },
    resendOtp: async (email) => {
      return { success: true };
    },
    resetPasswordRequest: async (email) => {
      return { success: true };
    },
    resetPassword: async ({ resetToken, newPassword }) => {
      return { success: true };
    },
    loginWithProvider: (provider, redirectUrl) => {
      console.warn(`OAuth with ${provider} initiated`);
      window.location.href = redirectUrl || '/';
    },
    loginViaOtp: async (email) => {
      // Mock OTP login
      return { access_token: 'mock-local-token' };
    },
    logout: async () => {
      await localAuth.signOut();
    }
  },
  entities: new Proxy({}, {
    get: () => ({
      filter: async () => [],
      get: async () => null,
      create: async () => ({}),
      update: async () => ({}),
      delete: async () => ({})
    })
  }),
  integrations: {
    Core: {
      UploadFile: async () => ({ file_url: '' })
    }
  }
};
